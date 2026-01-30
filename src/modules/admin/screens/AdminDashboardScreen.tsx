/**
 * @fileoverview 管理員儀表板畫面
 *
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
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { AdminUser, PlaceDraft, GlobalExclusion } from '../../../types';

// ============ 型別定義 ============

/** 分頁類型：待審核 | 用戶 | 草稿 | 排除 | 公告 */
type Tab = 'pending' | 'users' | 'drafts' | 'exclusions' | 'announcements';

// ============ 主元件 ============

/**
 * 管理員儀表板畫面元件
 * 提供管理員進行用戶審核、草稿管理、排除名單管理等功能
 */
export function AdminDashboardScreen() {
  // ============ Hooks & Context ============
  const { state, getToken, setUser } = useApp();
  const router = useRouter();

  // ============ 狀態管理 ============

  /** 當前選中的分頁 */
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  /** 待審核用戶列表 */
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);

  /** 所有用戶列表 */
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);

  /** 景點草稿列表 */
  const [drafts, setDrafts] = useState<PlaceDraft[]>([]);

  /** 全域排除名單 */
  const [exclusions, setExclusions] = useState<GlobalExclusion[]>([]);

  /** 資料載入中狀態 */
  const [loading, setLoading] = useState(true);

  /** 下拉刷新中狀態 */
  const [refreshing, setRefreshing] = useState(false);

  /** 操作進行中的項目 ID（用於顯示該項目的 loading） */
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ============ 多國語系 ============

  /** 判斷是否為繁體中文 */
  const isZh = state.language === 'zh-TW';

  /** 翻譯文字對照表 */
  const translations = {
    title: isZh ? '管理後台' : 'Admin Dashboard',
    pendingTab: isZh ? '待審核' : 'Pending',
    usersTab: isZh ? '用戶' : 'Users',
    draftsTab: isZh ? '草稿' : 'Drafts',
    exclusionsTab: isZh ? '排除' : 'Exclusions',
    announcementsTab: isZh ? '公告' : 'Announcements',
    approve: isZh ? '核准' : 'Approve',
    reject: isZh ? '拒絕' : 'Reject',
    publish: isZh ? '發布' : 'Publish',
    delete: isZh ? '刪除' : 'Delete',
    loading: isZh ? '載入中...' : 'Loading...',
    noData: isZh ? '沒有資料' : 'No data',
    noPending: isZh ? '沒有待審核用戶' : 'No pending users',
    merchant: isZh ? '商家' : 'Merchant',
    specialist: isZh ? '專員' : 'Specialist',
    traveler: isZh ? '旅客' : 'Traveler',
    admin: isZh ? '管理員' : 'Admin',
    approved: isZh ? '已核准' : 'Approved',
    pending: isZh ? '待審核' : 'Pending',
    confirmApprove: isZh ? '確定要核准這位用戶嗎？' : 'Approve this user?',
    confirmReject: isZh ? '確定要拒絕這位用戶嗎？' : 'Reject this user?',
    confirmPublish: isZh ? '確定要發布這個草稿嗎？' : 'Publish this draft?',
    confirmDelete: isZh ? '確定要刪除嗎？' : 'Delete this item?',
    logout: isZh ? '登出' : 'Logout',
  };

  // ============ 事件處理函數 ============

  /**
   * 處理登出
   * 清除用戶狀態並導向登入頁
   */
  const handleLogout = async () => {
    setUser(null);
    router.replace('/login');
  };

  /** 角色名稱對照表 */
  const roleLabels: Record<string, string> = {
    merchant: translations.merchant,
    specialist: translations.specialist,
    traveler: translations.traveler,
    admin: translations.admin,
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

  // ============ 副作用 ============

  /** 當分頁切換時重新載入資料 */
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // ============ 資料載入函數 ============

  /**
   * 根據當前分頁載入對應資料
   * 會根據 activeTab 呼叫不同的 API
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      switch (activeTab) {
        case 'pending':
          // 載入待審核用戶
          const pendingData = await apiService.getAdminPendingUsers(token);
          setPendingUsers(pendingData.users || []);
          break;
        case 'users':
          // 載入所有用戶
          const usersData = await apiService.getAdminUsers(token);
          setAllUsers(usersData.users || []);
          break;
        case 'drafts':
          // 載入景點草稿
          const draftsData = await apiService.getPlaceDrafts(token);
          setDrafts(draftsData.drafts || []);
          break;
        case 'exclusions':
          // 載入全域排除名單
          const exclusionsData = await apiService.getGlobalExclusions(token);
          setExclusions(exclusionsData || []);
          break;
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * 處理下拉刷新
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ============ 用戶審核操作 ============

  /**
   * 處理核准或拒絕用戶
   * @param userId - 用戶 ID
   * @param approve - true 為核准，false 為拒絕
   */
  const handleApproveUser = async (userId: string, approve: boolean) => {
    Alert.alert(
      approve ? translations.approve : translations.reject,
      approve ? translations.confirmApprove : translations.confirmReject,
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '確定' : 'Confirm',
          style: approve ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setActionLoading(userId);
              const token = await getToken();
              if (!token) return;
              await apiService.approveUser(token, userId, approve);
              loadData(); // 重新載入資料
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
    Alert.alert(translations.publish, translations.confirmPublish, [
      { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
      {
        text: isZh ? '確定' : 'Confirm',
        onPress: async () => {
          try {
            setActionLoading(`draft-${draftId}`);
            const token = await getToken();
            if (!token) return;
            await apiService.publishPlaceDraft(token, draftId);
            loadData(); // 重新載入資料
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
    Alert.alert(translations.delete, translations.confirmDelete, [
      { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
      {
        text: isZh ? '確定' : 'Confirm',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(`draft-${draftId}`);
            const token = await getToken();
            if (!token) return;
            await apiService.deletePlaceDraft(token, draftId);
            loadData(); // 重新載入資料
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
    Alert.alert(translations.delete, translations.confirmDelete, [
      { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
      {
        text: isZh ? '確定' : 'Confirm',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(`exclusion-${exclusionId}`);
            const token = await getToken();
            if (!token) return;
            await apiService.removeGlobalExclusion(token, exclusionId);
            loadData(); // 重新載入資料
          } catch (error) {
            console.error('Failed to delete exclusion:', error);
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  // ============ 工具函數 ============

  /**
   * 格式化日期字串
   * @param dateStr - ISO 日期字串
   * @returns 格式化後的日期（如：Jan 1, 2024）
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isZh ? 'zh-TW' : 'en-US', {
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
    <View style={styles.tabsContainer}>
      {(['pending', 'users', 'drafts', 'exclusions', 'announcements'] as Tab[]).map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {translations[`${tab}Tab` as keyof typeof translations]}
            {/* 待審核分頁顯示待處理數量 */}
            {tab === 'pending' && pendingUsers.length > 0 && (
              <Text style={styles.badgeText}> ({pendingUsers.length})</Text>
            )}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
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
          <Ionicons name="checkmark-circle-outline" size={48} color="#22c55e" />
          <Text style={styles.emptyText}>{translations.noPending}</Text>
        </View>
      ) : (
        // 用戶卡片列表
        pendingUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            {/* 用戶資訊區塊 */}
            <View style={styles.userInfo}>
              {/* 用戶頭像 */}
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color="#ffffff" />
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
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                )}
              </TouchableOpacity>
              {/* 拒絕按鈕 */}
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleApproveUser(user.id, false)}
                disabled={actionLoading === user.id}
              >
                <Ionicons name="close" size={18} color="#ffffff" />
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
          <Ionicons name="people-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>{translations.noData}</Text>
        </View>
      ) : (
        // 用戶卡片列表
        allUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            {/* 用戶資訊區塊 */}
            <View style={styles.userInfo}>
              {/* 用戶頭像 */}
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color="#ffffff" />
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
                      {user.isApproved ? translations.approved : translations.pending}
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
          <Ionicons name="document-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>{translations.noData}</Text>
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
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="cloud-upload" size={18} color="#ffffff" />
                )}
              </TouchableOpacity>
              {/* 刪除按鈕 */}
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteDraft(draft.id)}
                disabled={actionLoading === `draft-${draft.id}`}
              >
                <Ionicons name="trash" size={18} color="#ffffff" />
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
          <Ionicons name="ban-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>{translations.noData}</Text>
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
                {isZh ? '扣分' : 'Penalty'}: {exclusion.penaltyScore}
              </Text>
            </View>
            {/* 刪除按鈕 */}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteExclusion(exclusion.id)}
              disabled={actionLoading === `exclusion-${exclusion.id}`}
            >
              {actionLoading === `exclusion-${exclusion.id}` ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="trash" size={18} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
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
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>{translations.loading}</Text>
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
        // 公告分頁：顯示前往公告管理的按鈕
        return (
          <View style={styles.listContainer}>
            <TouchableOpacity
              style={{
                backgroundColor: '#7A5230',
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onPress={() => router.push('/announcement-manage' as any)}
            >
              <Ionicons name="megaphone-outline" size={20} color="#FFFEFA" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFEFA' }}>
                {isZh ? '前往公告管理' : 'Go to Announcement Manager'}
              </Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  // ============ 主渲染 ============

  return (
    <View style={styles.container}>
      {/* 頂部標題列 */}
      <View style={styles.header}>
        <Text style={styles.title}>{translations.title}</Text>
        {/* 登出按鈕 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>{translations.logout}</Text>
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
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 容器樣式
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // 頂部標題列樣式
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },

  // 分頁標籤樣式
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
  badgeText: {
    color: '#ef4444',
    fontWeight: '700',
  },

  // 滾動區域樣式
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },

  // 列表容器樣式
  listContainer: {
    gap: 12,
  },

  // 空狀態卡片樣式
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },

  // 用戶卡片樣式
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userDate: {
    fontSize: 12,
    color: '#94a3b8',
  },

  // 角色標籤樣式
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleTraveler: {
    backgroundColor: '#dbeafe',
  },
  roleMerchant: {
    backgroundColor: '#fef3c7',
  },
  roleSpecialist: {
    backgroundColor: '#d1fae5',
  },
  roleAdmin: {
    backgroundColor: '#fce7f3',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // 狀態標籤樣式
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // 操作按鈕樣式
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#22c55e',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  publishButton: {
    backgroundColor: '#6366f1',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },

  // 草稿卡片樣式
  draftCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  draftInfo: {
    flex: 1,
  },
  draftName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  draftLocation: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  draftActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // 排除項目卡片樣式
  exclusionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
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
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  exclusionLocation: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  exclusionScore: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
});
