/**
 * ============================================================
 * 管理員儀表板畫面 (AdminDashboardScreen.tsx)
 * ============================================================
 * 功能說明：
 * - 管理員後台的主控制台，提供五大功能分頁
 * - 待審核用戶管理：核准或拒絕新註冊的用戶
 * - 所有用戶列表：查看系統中的所有用戶
 * - 草稿管理：發布或刪除景點草稿
 * - 排除名單：管理全域排除的景點
 * - 公告管理：前往公告管理頁面
 *
 * 串接的 API：
 * - GET /admin/users/pending - 取得待審核用戶
 * - GET /admin/users - 取得所有用戶
 * - POST /admin/users/:id/approve - 核准/拒絕用戶
 * - GET /places/drafts - 取得景點草稿
 * - POST /places/drafts/:id/publish - 發布草稿
 * - DELETE /places/drafts/:id - 刪除草稿
 * - GET /exclusions - 取得全域排除名單
 * - DELETE /exclusions/:id - 移除排除項目
 *
 * 更新日期：2026-02-12（Phase 3 遷移至 React Query）
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth, useI18n } from '../../../context/AppContext';
import {
  useAdminPendingUsers,
  useAdminUsers,
  usePlaceDrafts,
  useGlobalExclusions,
  useApproveUser,
  usePublishPlaceDraft,
  useDeletePlaceDraft,
  useRemoveGlobalExclusion,
  useSendReward,
  useAdminShopItems,
  useCreateShopItem,
  useUpdateShopItem,
  useDeleteShopItem,
} from '../../../hooks/useAdminQueries';
import { LOCALE_MAP } from '../../../utils/i18n';
import { AdminUser, PlaceDraft, GlobalExclusion, ShopItem, ShopItemCategory, RewardItem, SendRewardParams } from '../../../types';
import { UIColors, MibuBrand } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize, FontWeight, SemanticColors } from '../../../theme/designTokens';

// ============ 型別定義 ============

/** 分頁類型 */
type Tab = 'pending' | 'users' | 'drafts' | 'exclusions' | 'announcements' | 'rewards' | 'shopItems';

/** 商品分類對照表 */
const SHOP_CATEGORIES: ShopItemCategory[] = ['gacha_ticket', 'inventory_expand', 'cosmetic', 'boost', 'bundle', 'other'];

/** 獎勵類型選項 */
const REWARD_TYPES = ['coins', 'shop_item', 'perk'] as const;

// ============ 主元件 ============

/**
 * 管理員儀表板畫面元件
 * 提供管理員進行用戶審核、草稿管理、排除名單管理等功能
 */
export function AdminDashboardScreen() {
  // ============ Hooks & Context ============
  const { user, setUser } = useAuth();
  const { t, language } = useI18n();
  const router = useRouter();

  // ============ React Query Hooks ============

  const pendingUsersQuery = useAdminPendingUsers();
  const allUsersQuery = useAdminUsers();
  const draftsQuery = usePlaceDrafts();
  const exclusionsQuery = useGlobalExclusions();

  const approveUserMutation = useApproveUser();
  const publishDraftMutation = usePublishPlaceDraft();
  const deleteDraftMutation = useDeletePlaceDraft();
  const removeExclusionMutation = useRemoveGlobalExclusion();

  // #047 獎勵發送
  const sendRewardMutation = useSendReward();

  // #048 商城道具
  const shopItemsQuery = useAdminShopItems();
  const createShopItemMutation = useCreateShopItem();
  const updateShopItemMutation = useUpdateShopItem();
  const deleteShopItemMutation = useDeleteShopItem();

  // ============ UI 狀態管理 ============

  /** 當前選中的分頁 */
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  /** 操作進行中的項目 ID（用於顯示該項目的 loading） */
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // #047 獎勵發送表單狀態
  const [rewardTarget, setRewardTarget] = useState<'all' | 'users'>('all');
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardMessage, setRewardMessage] = useState('');
  const [rewardUserIds, setRewardUserIds] = useState('');
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([{ type: 'coins', amount: 100 }]);
  const [rewardExpiresInDays, setRewardExpiresInDays] = useState('');

  // #048 商品表單狀態
  const [showShopModal, setShowShopModal] = useState(false);
  const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null);
  const [shopForm, setShopForm] = useState({
    code: '', category: 'other' as ShopItemCategory, nameZh: '', nameEn: '',
    descriptionZh: '', descriptionEn: '', priceCoins: '', imageUrl: '',
    maxPerUser: '', sortOrder: '0', isActive: true,
  });

  // 從查詢結果衍生狀態
  const pendingUsers: AdminUser[] = pendingUsersQuery.data?.users || [];
  const allUsers: AdminUser[] = allUsersQuery.data?.users || [];
  const drafts: PlaceDraft[] = draftsQuery.data?.drafts || [];
  const exclusions: GlobalExclusion[] = exclusionsQuery.data || [];
  const shopItems: ShopItem[] = shopItemsQuery.data?.items || [];

  /** 根據當前分頁取得對應的 loading 狀態 */
  const getActiveQuery = () => {
    switch (activeTab) {
      case 'pending': return pendingUsersQuery;
      case 'users': return allUsersQuery;
      case 'drafts': return draftsQuery;
      case 'exclusions': return exclusionsQuery;
      case 'shopItems': return shopItemsQuery;
      default: return pendingUsersQuery;
    }
  };
  const loading = getActiveQuery().isLoading;
  const refreshing = getActiveQuery().isRefetching;

  // ============ 事件處理函數 ============

  /**
   * 處理登出
   * 清除用戶狀態並導向登入頁
   */
  const handleLogout = async () => {
    await setUser(null);
    router.replace('/login');
  };

  /** 角色名稱對照表 */
  const roleLabels: Record<string, string> = {
    merchant: t.admin_merchant,
    specialist: t.admin_specialist,
    traveler: t.admin_traveler,
    admin: t.admin_admin,
  };

  /**
   * 根據角色取得對應的標籤樣式
   * @param role - 用戶角色
   * @returns 對應的樣式物件
   */
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'merchant': return styles.roleMerchant;
      case 'specialist': return styles.roleSpecialist;
      case 'admin': return styles.roleAdmin;
      default: return styles.roleTraveler;
    }
  };

  /**
   * 處理下拉刷新 — 重新取得當前分頁的資料
   */
  const handleRefresh = () => {
    getActiveQuery().refetch();
  };

  // ============ 用戶審核操作 ============

  /**
   * 處理核准或拒絕用戶
   * @param userId - 用戶 ID
   * @param approve - true 為核准，false 為拒絕
   */
  const handleApproveUser = async (userId: string, approve: boolean) => {
    Alert.alert(
      approve ? t.admin_approve : t.admin_reject,
      approve ? t.admin_confirmApprove : t.admin_confirmReject,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.common_confirm,
          style: approve ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setActionLoading(userId);
              await approveUserMutation.mutateAsync({ userId, isApproved: approve });
            } catch (error) {
              console.error('Failed to update user:', error);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  // ============ 草稿操作 ============

  /**
   * 處理發布草稿
   * @param draftId - 草稿 ID
   */
  const handlePublishDraft = async (draftId: number) => {
    Alert.alert(t.admin_publish, t.admin_confirmPublish, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.common_confirm,
        onPress: async () => {
          try {
            setActionLoading(`draft-${draftId}`);
            await publishDraftMutation.mutateAsync(draftId);
          } catch (error) {
            console.error('Failed to publish draft:', error);
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  /**
   * 處理刪除草稿
   * @param draftId - 草稿 ID
   */
  const handleDeleteDraft = async (draftId: number) => {
    Alert.alert(t.common_delete, t.admin_confirmDelete, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.common_confirm,
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(`draft-${draftId}`);
            await deleteDraftMutation.mutateAsync(draftId);
          } catch (error) {
            console.error('Failed to delete draft:', error);
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  // ============ 排除名單操作 ============

  /**
   * 處理刪除排除項目
   * @param exclusionId - 排除項目 ID
   */
  const handleDeleteExclusion = async (exclusionId: number) => {
    Alert.alert(t.common_delete, t.admin_confirmDelete, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.common_confirm,
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(`exclusion-${exclusionId}`);
            await removeExclusionMutation.mutateAsync(exclusionId);
          } catch (error) {
            console.error('Failed to delete exclusion:', error);
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  // ============ #047 獎勵發送操作 ============

  const handleSendReward = async () => {
    if (!rewardTitle.trim() || rewardItems.length === 0) {
      Alert.alert('', t.admin_rewardFillRequired);
      return;
    }
    if (rewardTarget === 'users') {
      const ids = rewardUserIds.split('\n').map(s => s.trim()).filter(Boolean);
      if (ids.length === 0) {
        Alert.alert('', t.admin_rewardNoUsers);
        return;
      }
    }

    const userIds = rewardUserIds.split('\n').map(s => s.trim()).filter(Boolean);
    const params: SendRewardParams = rewardTarget === 'all'
      ? { target: 'all', title: rewardTitle, message: rewardMessage || undefined, rewards: rewardItems, ...(rewardExpiresInDays ? { expiresInDays: Number(rewardExpiresInDays) } : {}) }
      : { target: 'users', userIds, title: rewardTitle, message: rewardMessage || undefined, rewards: rewardItems, ...(rewardExpiresInDays ? { expiresInDays: Number(rewardExpiresInDays) } : {}) };

    try {
      const result = await sendRewardMutation.mutateAsync(params);
      const stats = (t.admin_rewardSentStats || '')
        .replace('{sent}', String(result.sent))
        .replace('{total}', String(result.totalUsers))
        .replace('{batches}', String(result.batches));
      Alert.alert(t.admin_rewardSuccess, stats);
      // 重設表單
      setRewardTitle('');
      setRewardMessage('');
      setRewardUserIds('');
      setRewardItems([{ type: 'coins', amount: 100 }]);
      setRewardExpiresInDays('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reward');
    }
  };

  const updateRewardItem = (index: number, field: string, value: any) => {
    setRewardItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeRewardItem = (index: number) => {
    setRewardItems(prev => prev.filter((_, i) => i !== index));
  };

  // ============ #048 商城道具操作 ============

  const resetShopForm = () => {
    setShopForm({ code: '', category: 'other', nameZh: '', nameEn: '', descriptionZh: '', descriptionEn: '', priceCoins: '', imageUrl: '', maxPerUser: '', sortOrder: '0', isActive: true });
    setEditingShopItem(null);
  };

  const openCreateShopItem = () => {
    resetShopForm();
    setShowShopModal(true);
  };

  const openEditShopItem = (item: ShopItem) => {
    setEditingShopItem(item);
    setShopForm({
      code: item.code, category: item.category, nameZh: item.nameZh,
      nameEn: item.nameEn || '', descriptionZh: item.descriptionZh || '',
      descriptionEn: item.descriptionEn || '', priceCoins: String(item.priceCoins),
      imageUrl: item.imageUrl || '', maxPerUser: item.maxPerUser ? String(item.maxPerUser) : '',
      sortOrder: String(item.sortOrder), isActive: item.isActive,
    });
    setShowShopModal(true);
  };

  const handleSaveShopItem = async () => {
    if (!shopForm.code.trim() || !shopForm.nameZh.trim() || !shopForm.priceCoins) {
      Alert.alert('', t.admin_shopItemFillRequired);
      return;
    }
    try {
      if (editingShopItem) {
        await updateShopItemMutation.mutateAsync({
          id: editingShopItem.id,
          data: {
            category: shopForm.category, nameZh: shopForm.nameZh,
            nameEn: shopForm.nameEn || undefined, descriptionZh: shopForm.descriptionZh || undefined,
            descriptionEn: shopForm.descriptionEn || undefined, priceCoins: Number(shopForm.priceCoins),
            imageUrl: shopForm.imageUrl || undefined, maxPerUser: shopForm.maxPerUser ? Number(shopForm.maxPerUser) : undefined,
            sortOrder: Number(shopForm.sortOrder), isActive: shopForm.isActive,
          },
        });
      } else {
        await createShopItemMutation.mutateAsync({
          code: shopForm.code, category: shopForm.category, nameZh: shopForm.nameZh,
          nameEn: shopForm.nameEn || undefined, descriptionZh: shopForm.descriptionZh || undefined,
          descriptionEn: shopForm.descriptionEn || undefined, priceCoins: Number(shopForm.priceCoins),
          imageUrl: shopForm.imageUrl || undefined, maxPerUser: shopForm.maxPerUser ? Number(shopForm.maxPerUser) : undefined,
          sortOrder: Number(shopForm.sortOrder), isActive: shopForm.isActive,
        });
      }
      setShowShopModal(false);
      resetShopForm();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save');
    }
  };

  const handleDeleteShopItem = (item: ShopItem) => {
    Alert.alert(t.common_delete, t.admin_shopItemConfirmDelete, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.common_confirm, style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(`shop-${item.id}`);
            await deleteShopItemMutation.mutateAsync(item.id);
          } catch (error) {
            console.error('Failed to delete shop item:', error);
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  /** 商品分類中文 */
  const getCategoryLabel = (cat: ShopItemCategory) => {
    const key = `admin_shopCat${cat.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join('')}` as string;
    return (t as any)[key] || cat;
  };

  // ============ 工具函數 ============

  /**
   * 格式化日期字串
   * @param dateStr - ISO 日期字串
   * @returns 格式化後的日期（如：Jan 1, 2024）
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(LOCALE_MAP[language], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ============ 渲染函數：分頁標籤 ============

  /**
   * 渲染分頁標籤列
   * 包含五個分頁：待審核、用戶、草稿、排除、公告
   */
  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
      {(['pending', 'users', 'drafts', 'exclusions', 'announcements', 'rewards', 'shopItems'] as Tab[]).map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {t[`admin_${tab}Tab`]}
            {tab === 'pending' && pendingUsers.length > 0 && (
              <Text style={styles.badgeText}> ({pendingUsers.length})</Text>
            )}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // ============ 渲染函數：待審核用戶列表 ============

  /**
   * 渲染待審核用戶列表
   * 顯示等待核准的用戶，提供核准/拒絕操作
   */
  const renderPendingUsers = () => (
    <View style={styles.listContainer}>
      {/* 無待審核用戶時顯示空狀態 */}
      {pendingUsers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="checkmark-circle-outline" size={48} color={SemanticColors.success.main} />
          <Text style={styles.emptyText}>{t.admin_noPending}</Text>
        </View>
      ) : (
        // 用戶卡片列表
        pendingUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            {/* 用戶資訊區塊 */}
            <View style={styles.userInfo}>
              {/* 用戶頭像 */}
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color={UIColors.white} />
              </View>
              {/* 用戶詳情 */}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name || user.email || user.id}</Text>
                <View style={styles.userMeta}>
                  {/* 角色標籤 */}
                  <View style={[styles.roleBadge, getRoleBadgeStyle(user.role)]}>
                    <Text style={styles.roleBadgeText}>{roleLabels[user.role] || user.role}</Text>
                  </View>
                  {/* 註冊日期 */}
                  <Text style={styles.userDate}>{formatDate(user.createdAt)}</Text>
                </View>
              </View>
            </View>
            {/* 操作按鈕區塊 */}
            <View style={styles.userActions}>
              {/* 核准按鈕 */}
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApproveUser(user.id, true)}
                disabled={actionLoading === user.id}
              >
                {actionLoading === user.id ? (
                  <ActivityIndicator size="small" color={UIColors.white} />
                ) : (
                  <Ionicons name="checkmark" size={18} color={UIColors.white} />
                )}
              </TouchableOpacity>
              {/* 拒絕按鈕 */}
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleApproveUser(user.id, false)}
                disabled={actionLoading === user.id}
              >
                <Ionicons name="close" size={18} color={UIColors.white} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // ============ 渲染函數：所有用戶列表 ============

  /**
   * 渲染所有用戶列表
   * 顯示系統中的所有用戶及其狀態
   */
  const renderAllUsers = () => (
    <View style={styles.listContainer}>
      {/* 無用戶時顯示空狀態 */}
      {allUsers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="people-outline" size={48} color={UIColors.textSecondary} />
          <Text style={styles.emptyText}>{t.common_noData}</Text>
        </View>
      ) : (
        // 用戶卡片列表
        allUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            {/* 用戶資訊區塊 */}
            <View style={styles.userInfo}>
              {/* 用戶頭像 */}
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color={UIColors.white} />
              </View>
              {/* 用戶詳情 */}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name || user.email || user.id}</Text>
                <View style={styles.userMeta}>
                  {/* 角色標籤 */}
                  <View style={[styles.roleBadge, getRoleBadgeStyle(user.role)]}>
                    <Text style={styles.roleBadgeText}>{roleLabels[user.role] || user.role}</Text>
                  </View>
                  {/* 審核狀態標籤 */}
                  <View style={[styles.statusBadge, user.isApproved ? styles.statusApproved : styles.statusPending]}>
                    <Text style={styles.statusBadgeText}>
                      {user.isApproved ? t.common_approved : t.common_pending}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // ============ 渲染函數：草稿列表 ============

  /**
   * 渲染景點草稿列表
   * 顯示待發布的景點草稿，提供發布/刪除操作
   */
  const renderDrafts = () => (
    <View style={styles.listContainer}>
      {/* 無草稿時顯示空狀態 */}
      {drafts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-outline" size={48} color={UIColors.textSecondary} />
          <Text style={styles.emptyText}>{t.common_noData}</Text>
        </View>
      ) : (
        // 草稿卡片列表
        drafts.map(draft => (
          <View key={draft.id} style={styles.draftCard}>
            {/* 草稿資訊區塊 */}
            <View style={styles.draftInfo}>
              {/* 景點名稱 */}
              <Text style={styles.draftName}>{draft.placeName}</Text>
              {/* 地點（區域、城市） */}
              <Text style={styles.draftLocation}>
                {[draft.district, draft.city].filter(Boolean).join(', ')}
              </Text>
              {/* 分類標籤 */}
              {draft.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{draft.category}</Text>
                </View>
              )}
            </View>
            {/* 操作按鈕區塊 */}
            <View style={styles.draftActions}>
              {/* 發布按鈕 */}
              <TouchableOpacity
                style={[styles.actionButton, styles.publishButton]}
                onPress={() => handlePublishDraft(draft.id)}
                disabled={actionLoading === `draft-${draft.id}`}
              >
                {actionLoading === `draft-${draft.id}` ? (
                  <ActivityIndicator size="small" color={UIColors.white} />
                ) : (
                  <Ionicons name="cloud-upload" size={18} color={UIColors.white} />
                )}
              </TouchableOpacity>
              {/* 刪除按鈕 */}
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteDraft(draft.id)}
                disabled={actionLoading === `draft-${draft.id}`}
              >
                <Ionicons name="trash" size={18} color={UIColors.white} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // ============ 渲染函數：排除名單 ============

  /**
   * 渲染全域排除名單
   * 顯示被排除的景點，提供刪除操作
   */
  const renderExclusions = () => (
    <View style={styles.listContainer}>
      {/* 無排除項目時顯示空狀態 */}
      {exclusions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="ban-outline" size={48} color={UIColors.textSecondary} />
          <Text style={styles.emptyText}>{t.common_noData}</Text>
        </View>
      ) : (
        // 排除項目卡片列表
        exclusions.map(exclusion => (
          <View key={exclusion.id} style={styles.exclusionCard}>
            {/* 排除項目資訊 */}
            <View style={styles.exclusionInfo}>
              {/* 景點名稱 */}
              <Text style={styles.exclusionName}>{exclusion.placeName}</Text>
              {/* 地點（區域、城市） */}
              <Text style={styles.exclusionLocation}>
                {[exclusion.district, exclusion.city].filter(Boolean).join(', ')}
              </Text>
              {/* 扣分值 */}
              <Text style={styles.exclusionScore}>
                {t.admin_penalty}: {exclusion.penaltyScore}
              </Text>
            </View>
            {/* 刪除按鈕 */}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteExclusion(exclusion.id)}
              disabled={actionLoading === `exclusion-${exclusion.id}`}
            >
              {actionLoading === `exclusion-${exclusion.id}` ? (
                <ActivityIndicator size="small" color={UIColors.white} />
              ) : (
                <Ionicons name="trash" size={18} color={UIColors.white} />
              )}
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  // ============ 渲染函數：#047 獎勵發送 ============

  const renderRewards = () => (
    <View style={styles.listContainer}>
      {/* 發送對象選擇 */}
      <View style={styles.formCard}>
        <Text style={styles.formLabel}>{t.admin_rewardTarget}</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {(['all', 'users'] as const).map(target => (
            <TouchableOpacity
              key={target}
              style={[styles.chipButton, rewardTarget === target && styles.chipButtonActive]}
              onPress={() => setRewardTarget(target)}
            >
              <Text style={[styles.chipText, rewardTarget === target && styles.chipTextActive]}>
                {target === 'all' ? t.admin_rewardTargetAll : t.admin_rewardTargetUsers}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 標題 */}
      <View style={styles.formCard}>
        <Text style={styles.formLabel}>{t.admin_rewardTitle}</Text>
        <TextInput style={styles.formInput} value={rewardTitle} onChangeText={setRewardTitle} placeholder={t.admin_rewardTitle} />
      </View>

      {/* 附加訊息 */}
      <View style={styles.formCard}>
        <Text style={styles.formLabel}>{t.admin_rewardMessage}</Text>
        <TextInput style={styles.formInput} value={rewardMessage} onChangeText={setRewardMessage} placeholder={t.admin_rewardMessage} />
      </View>

      {/* 指定用戶 ID 輸入 */}
      {rewardTarget === 'users' && (
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>{t.admin_rewardUserIds}</Text>
          <TextInput
            style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]}
            value={rewardUserIds} onChangeText={setRewardUserIds}
            placeholder={t.admin_rewardUserIds} multiline
          />
        </View>
      )}

      {/* 過期天數 */}
      <View style={styles.formCard}>
        <Text style={styles.formLabel}>{t.admin_expiresInDays}</Text>
        <TextInput style={styles.formInput} value={rewardExpiresInDays} onChangeText={setRewardExpiresInDays} placeholder="30" keyboardType="number-pad" />
      </View>

      {/* 獎勵項目列表 */}
      <View style={styles.formCard}>
        <Text style={styles.formLabel}>{t.admin_rewardType}</Text>
        {rewardItems.map((item, index) => (
          <View key={index} style={{ backgroundColor: MibuBrand.creamLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm }}>
            {/* 類型選擇 */}
            <View style={{ flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm, flexWrap: 'wrap' }}>
              {REWARD_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.chipButton, { paddingVertical: 4, paddingHorizontal: 8 }, item.type === type && styles.chipButtonActive]}
                  onPress={() => updateRewardItem(index, 'type', type)}
                >
                  <Text style={[styles.chipText, { fontSize: 12 }, item.type === type && styles.chipTextActive]}>
                    {type === 'coins' ? t.admin_rewardCoins : type === 'shop_item' ? t.admin_rewardShopItem : t.admin_rewardPerk}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* 數量 / 代碼 */}
            {item.type === 'coins' && (
              <TextInput style={styles.formInput} value={String(item.amount || '')} onChangeText={v => updateRewardItem(index, 'amount', Number(v) || 0)} placeholder={t.admin_rewardAmount} keyboardType="number-pad" />
            )}
            {item.type === 'shop_item' && (
              <View style={{ gap: Spacing.xs }}>
                <TextInput style={styles.formInput} value={item.itemCode || ''} onChangeText={v => updateRewardItem(index, 'itemCode', v)} placeholder={t.admin_rewardItemCode} />
                <TextInput style={styles.formInput} value={String(item.quantity || '')} onChangeText={v => updateRewardItem(index, 'quantity', Number(v) || 1)} placeholder={t.admin_rewardAmount} keyboardType="number-pad" />
              </View>
            )}
            {item.type === 'perk' && (
              <View style={{ gap: Spacing.xs }}>
                <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
                  {(['daily_pulls', 'inventory_slots'] as const).map(pt => (
                    <TouchableOpacity key={pt} style={[styles.chipButton, { paddingVertical: 4, paddingHorizontal: 8 }, item.perkType === pt && styles.chipButtonActive]} onPress={() => updateRewardItem(index, 'perkType', pt)}>
                      <Text style={[styles.chipText, { fontSize: 12 }, item.perkType === pt && styles.chipTextActive]}>{pt === 'daily_pulls' ? 'Daily Pulls' : 'Inventory'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput style={styles.formInput} value={String(item.value || '')} onChangeText={v => updateRewardItem(index, 'value', Number(v) || 0)} placeholder={t.admin_rewardAmount} keyboardType="number-pad" />
              </View>
            )}
            {/* 移除按鈕 */}
            {rewardItems.length > 1 && (
              <TouchableOpacity onPress={() => removeRewardItem(index)} style={{ alignSelf: 'flex-end', marginTop: Spacing.xs }}>
                <Text style={{ color: SemanticColors.error.main, fontSize: FontSize.sm }}>{t.admin_rewardRemoveItem}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={[styles.chipButton, { alignSelf: 'flex-start' }]} onPress={() => setRewardItems(prev => [...prev, { type: 'coins', amount: 100 }])}>
          <Text style={styles.chipText}>+ {t.admin_rewardAddItem}</Text>
        </TouchableOpacity>
      </View>

      {/* 發送按鈕 */}
      <TouchableOpacity
        style={[styles.sendButton, sendRewardMutation.isPending && { opacity: 0.6 }]}
        onPress={handleSendReward}
        disabled={sendRewardMutation.isPending}
      >
        {sendRewardMutation.isPending ? (
          <ActivityIndicator size="small" color="#FFFEFA" />
        ) : (
          <>
            <Ionicons name="send-outline" size={20} color="#FFFEFA" />
            <Text style={styles.sendButtonText}>{t.admin_sendReward}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  // ============ 渲染函數：#048 商城道具 ============

  const renderShopItems = () => (
    <View style={styles.listContainer}>
      {/* 新增按鈕 */}
      <TouchableOpacity style={styles.sendButton} onPress={openCreateShopItem}>
        <Ionicons name="add-circle-outline" size={20} color="#FFFEFA" />
        <Text style={styles.sendButtonText}>{t.admin_shopItemCreate}</Text>
      </TouchableOpacity>

      {/* 商品列表 */}
      {shopItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="cart-outline" size={48} color={UIColors.textSecondary} />
          <Text style={styles.emptyText}>{t.admin_shopItemNoItems}</Text>
        </View>
      ) : (
        shopItems.map(item => (
          <View key={item.id} style={[styles.draftCard, !item.isActive && { opacity: 0.6 }]}>
            <View style={styles.draftInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs }}>
                <Text style={styles.draftName}>{item.nameZh}</Text>
                <View style={[styles.statusBadge, item.isActive ? styles.statusApproved : styles.statusPending]}>
                  <Text style={styles.statusBadgeText}>{item.isActive ? t.admin_shopItemActive : t.admin_shopItemInactive}</Text>
                </View>
              </View>
              <Text style={styles.draftLocation}>{item.code} | {getCategoryLabel(item.category)}</Text>
              <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: MibuBrand.brown }}>
                {item.priceCoins} coins
              </Text>
            </View>
            <View style={styles.draftActions}>
              <TouchableOpacity style={[styles.actionButton, styles.publishButton]} onPress={() => openEditShopItem(item)}>
                <Ionicons name="create" size={18} color={UIColors.white} />
              </TouchableOpacity>
              {item.isActive && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteShopItem(item)}
                  disabled={actionLoading === `shop-${item.id}`}
                >
                  {actionLoading === `shop-${item.id}` ? (
                    <ActivityIndicator size="small" color={UIColors.white} />
                  ) : (
                    <Ionicons name="close-circle" size={18} color={UIColors.white} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  /** 商品編輯 Modal */
  const renderShopModal = () => (
    <Modal visible={showShopModal} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{editingShopItem ? t.admin_shopItemEdit : t.admin_shopItemCreate}</Text>
          <TouchableOpacity onPress={() => { setShowShopModal(false); resetShopForm(); }}>
            <Ionicons name="close" size={24} color={MibuBrand.dark} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}>
          {/* 代碼（編輯時不可修改） */}
          <View>
            <Text style={styles.formLabel}>{t.admin_shopItemCode}</Text>
            <TextInput style={[styles.formInput, editingShopItem && { backgroundColor: MibuBrand.tanLight }]} value={shopForm.code} onChangeText={v => setShopForm(f => ({ ...f, code: v }))} editable={!editingShopItem} />
          </View>
          {/* 名稱 */}
          <View>
            <Text style={styles.formLabel}>{t.admin_shopItemName}</Text>
            <TextInput style={styles.formInput} value={shopForm.nameZh} onChangeText={v => setShopForm(f => ({ ...f, nameZh: v }))} />
          </View>
          <View>
            <Text style={styles.formLabel}>{t.admin_shopItemNameEn}</Text>
            <TextInput style={styles.formInput} value={shopForm.nameEn} onChangeText={v => setShopForm(f => ({ ...f, nameEn: v }))} />
          </View>
          {/* 說明 */}
          <View>
            <Text style={styles.formLabel}>{t.admin_shopItemDesc}</Text>
            <TextInput style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]} value={shopForm.descriptionZh} onChangeText={v => setShopForm(f => ({ ...f, descriptionZh: v }))} multiline />
          </View>
          {/* 分類 */}
          <View>
            <Text style={styles.formLabel}>{t.admin_shopItemCategory}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' }}>
              {SHOP_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chipButton, shopForm.category === cat && styles.chipButtonActive]}
                  onPress={() => setShopForm(f => ({ ...f, category: cat }))}
                >
                  <Text style={[styles.chipText, shopForm.category === cat && styles.chipTextActive]}>{getCategoryLabel(cat)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* 售價 */}
          <View>
            <Text style={styles.formLabel}>{t.admin_shopItemPrice}</Text>
            <TextInput style={styles.formInput} value={shopForm.priceCoins} onChangeText={v => setShopForm(f => ({ ...f, priceCoins: v }))} keyboardType="number-pad" />
          </View>
          {/* 每人限購 */}
          <View>
            <Text style={styles.formLabel}>{t.admin_shopItemMaxPerUser}</Text>
            <TextInput style={styles.formInput} value={shopForm.maxPerUser} onChangeText={v => setShopForm(f => ({ ...f, maxPerUser: v }))} keyboardType="number-pad" />
          </View>
          {/* 排序 */}
          <View>
            <Text style={styles.formLabel}>{t.admin_shopItemSortOrder}</Text>
            <TextInput style={styles.formInput} value={shopForm.sortOrder} onChangeText={v => setShopForm(f => ({ ...f, sortOrder: v }))} keyboardType="number-pad" />
          </View>
          {/* 上架狀態 */}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}
            onPress={() => setShopForm(f => ({ ...f, isActive: !f.isActive }))}
          >
            <Ionicons name={shopForm.isActive ? 'checkbox' : 'square-outline'} size={24} color={MibuBrand.brown} />
            <Text style={{ fontSize: FontSize.md, color: MibuBrand.dark }}>{t.admin_isActiveLabel}</Text>
          </TouchableOpacity>
        </ScrollView>
        {/* 儲存按鈕 */}
        <View style={{ padding: Spacing.lg }}>
          <TouchableOpacity
            style={[styles.sendButton, (createShopItemMutation.isPending || updateShopItemMutation.isPending) && { opacity: 0.6 }]}
            onPress={handleSaveShopItem}
            disabled={createShopItemMutation.isPending || updateShopItemMutation.isPending}
          >
            {(createShopItemMutation.isPending || updateShopItemMutation.isPending) ? (
              <ActivityIndicator size="small" color="#FFFEFA" />
            ) : (
              <Text style={styles.sendButtonText}>{t.common_confirm}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ============ 渲染函數：主內容區 ============

  /**
   * 根據當前分頁渲染對應內容
   * 包含 loading 狀態處理
   */
  const renderContent = () => {
    // 載入中狀態（非下拉刷新時）
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MibuBrand.info} />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      );
    }

    // 根據分頁渲染對應內容
    switch (activeTab) {
      case 'pending':
        return renderPendingUsers();
      case 'users':
        return renderAllUsers();
      case 'drafts':
        return renderDrafts();
      case 'exclusions':
        return renderExclusions();
      case 'announcements':
        return (
          <View style={styles.listContainer}>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => router.push('/announcement-manage' as any)}
            >
              <Ionicons name="megaphone-outline" size={20} color="#FFFEFA" />
              <Text style={styles.sendButtonText}>{t.admin_goToAnnouncement}</Text>
            </TouchableOpacity>
          </View>
        );
      case 'rewards':
        return renderRewards();
      case 'shopItems':
        return renderShopItems();
    }
  };

  // ============ 主渲染 ============

  return (
    <View style={styles.container}>
      {/* 頂部標題列 */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.admin_title}</Text>
        {/* 登出按鈕 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={SemanticColors.error.main} />
          <Text style={styles.logoutText}>{t.common_logout}</Text>
        </TouchableOpacity>
      </View>

      {/* 分頁標籤列 */}
      {renderTabs()}

      {/* 可滾動內容區 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>

      {/* #048 商品編輯 Modal */}
      {renderShopModal()}
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 容器樣式
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },

  // 頂部標題列樣式
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: Spacing.lg,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '900',
    color: MibuBrand.dark,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: SemanticColors.error.light,
    borderRadius: Radius.md,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: SemanticColors.error.main,
  },

  // 分頁標籤樣式
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  tabsContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: MibuBrand.info,
  },
  tabText: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: UIColors.textSecondary,
  },
  activeTabText: {
    color: '#ffffff',
  },
  badgeText: {
    color: SemanticColors.error.main,
    fontWeight: FontWeight.bold,
  },

  // 滾動區域樣式
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },

  // 載入中樣式
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: UIColors.textSecondary,
    fontSize: FontSize.lg,
  },

  // 列表容器樣式
  listContainer: {
    gap: Spacing.md,
  },

  // 空狀態卡片樣式
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: UIColors.textSecondary,
    marginTop: Spacing.md,
  },

  // 用戶卡片樣式
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.xl,
    backgroundColor: MibuBrand.info,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: MibuBrand.dark,
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userDate: {
    fontSize: FontSize.sm,
    color: UIColors.textSecondary,
  },

  // 角色標籤樣式
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleTraveler: {
    backgroundColor: SemanticColors.info.light,
  },
  roleMerchant: {
    backgroundColor: SemanticColors.warning.light,
  },
  roleSpecialist: {
    backgroundColor: SemanticColors.success.light,
  },
  roleAdmin: {
    backgroundColor: '#fce7f3',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: UIColors.textSecondary,
  },

  // 狀態標籤樣式
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: SemanticColors.success.light,
  },
  statusPending: {
    backgroundColor: SemanticColors.warning.light,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: UIColors.textSecondary,
  },

  // 操作按鈕樣式
  userActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: SemanticColors.success.main,
  },
  rejectButton: {
    backgroundColor: SemanticColors.error.main,
  },
  publishButton: {
    backgroundColor: MibuBrand.info,
  },
  deleteButton: {
    backgroundColor: SemanticColors.error.main,
  },

  // 草稿卡片樣式
  draftCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  draftInfo: {
    flex: 1,
  },
  draftName: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: MibuBrand.dark,
    marginBottom: Spacing.xs,
  },
  draftLocation: {
    fontSize: 13,
    color: UIColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: MibuBrand.creamLight,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: UIColors.textSecondary,
  },
  draftActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  // 排除項目卡片樣式
  exclusionCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  exclusionInfo: {
    flex: 1,
  },
  exclusionName: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: MibuBrand.dark,
    marginBottom: Spacing.xs,
  },
  exclusionLocation: {
    fontSize: 13,
    color: UIColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  exclusionScore: {
    fontSize: FontSize.sm,
    color: SemanticColors.error.main,
    fontWeight: FontWeight.semibold,
  },

  // #047/#048 表單樣式
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    gap: Spacing.sm,
  },
  formLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: UIColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  formInput: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.md,
    color: MibuBrand.dark,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  chipButton: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.creamLight,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  chipButtonActive: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: UIColors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFEFA',
  },
  sendButton: {
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  sendButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFEFA',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: MibuBrand.dark,
  },
});
