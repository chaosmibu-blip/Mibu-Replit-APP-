/**
 * ============================================================
 * MailboxScreen — 信箱列表頁面 (#045)
 * ============================================================
 * 此模組提供: 統一收件箱，用戶可查看/領取系統獎勵 + 兌換優惠碼
 *
 * 主要功能:
 * - 三個 tab 篩選：未領取 / 已領取 / 已過期
 * - 一鍵全部領取
 * - 優惠碼兌換入口
 * - 下拉重新整理 + 分頁載入
 * - 未讀紅點整合
 *
 * 更新日期：2026-02-10（初版建立）
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../../context/AppContext';
import { mailboxApi } from '../../../services/mailboxApi';
import { ApiError } from '../../../services/base';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import type { MailboxListItem, MailboxStatus } from '../../../types/mailbox';

// ========== 常數 ==========

const PAGE_SIZE = 20;

/** 狀態 tab 定義 */
const STATUS_TABS: { key: MailboxStatus; labelKey: string }[] = [
  { key: 'unclaimed', labelKey: 'mailbox_tabUnclaimed' },
  { key: 'claimed', labelKey: 'mailbox_tabClaimed' },
  { key: 'expired', labelKey: 'mailbox_tabExpired' },
];

/** 來源類型對應翻譯 key */
const SOURCE_LABEL_MAP: Record<string, string> = {
  promo_code: 'mailbox_sourcePromo',
  admin: 'mailbox_sourceAdmin',
  system: 'mailbox_sourceSystem',
  event: 'mailbox_sourceEvent',
};

/** 來源類型對應 icon */
const SOURCE_ICON_MAP: Record<string, string> = {
  promo_code: 'ticket-outline',
  admin: 'megaphone-outline',
  system: 'gift-outline',
  event: 'calendar-outline',
};

// ========== 元件 ==========

export function MailboxScreen() {
  const { t, getToken } = useApp();
  const router = useRouter();

  // 狀態
  const [activeTab, setActiveTab] = useState<MailboxStatus>('unclaimed');
  const [items, setItems] = useState<MailboxListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [claimingAll, setClaimingAll] = useState(false);

  // 優惠碼
  const [promoCode, setPromoCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // 防重複觸發（教訓 #006：useState 是異步的，ref 才能即時鎖定）
  const claimingRef = useRef(false);
  const redeemingRef = useRef(false);
  // 跳過首次 focus（useEffect 已處理）
  const hasInitialLoaded = useRef(false);

  // ========== 資料載入 ==========

  const loadData = useCallback(async (pageNum = 1, status = activeTab) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await mailboxApi.getList(token, {
        page: pageNum,
        limit: PAGE_SIZE,
        status,
      });

      if (pageNum === 1) {
        setItems(response.items);
      } else {
        setItems(prev => [...prev, ...response.items]);
      }
      setPage(pageNum);
      setTotalPages(response.pagination.totalPages);
    } catch {
      if (pageNum === 1) {
        Alert.alert(t.mailbox_loadFailed, t.mailbox_loadFailedDesc);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [activeTab, getToken, t]);

  // tab 切換時重新載入
  useEffect(() => {
    setLoading(true);
    setItems([]);
    setPage(1);
    loadData(1, activeTab);
    hasInitialLoaded.current = true;
  }, [activeTab, loadData]);

  // 從詳情頁返回時自動刷新（例如領取獎勵後）
  useFocusEffect(
    useCallback(() => {
      // 跳過首次（useEffect 已處理），避免重複呼叫
      if (!hasInitialLoaded.current) return;
      loadData(1, activeTab);
    }, [loadData, activeTab])
  );

  // 下拉重新整理
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(1, activeTab);
  }, [activeTab, loadData]);

  // 加載更多
  const handleLoadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    loadData(page + 1, activeTab);
  }, [loadingMore, page, totalPages, activeTab, loadData]);

  // ========== 一鍵全部領取 ==========

  const handleClaimAll = useCallback(async () => {
    if (claimingRef.current) return;
    claimingRef.current = true;
    setClaimingAll(true);

    try {
      const token = await getToken();
      if (!token) return;

      const result = await mailboxApi.claimAll(token);
      if (result.failed === 0) {
        Alert.alert(
          t.mailbox_claimSuccess,
          t.mailbox_claimAllSuccess.replace('{count}', String(result.claimed)),
        );
      } else {
        Alert.alert(
          t.mailbox_claimPartial,
          t.mailbox_claimAllFailed
            .replace('{success}', String(result.claimed))
            .replace('{failed}', String(result.failed)),
        );
      }
      // 重新載入
      loadData(1, activeTab);
    } catch {
      Alert.alert(t.mailbox_claimFailed);
    } finally {
      setClaimingAll(false);
      claimingRef.current = false;
    }
  }, [getToken, t, activeTab, loadData]);

  // ========== 優惠碼兌換 ==========

  const handleRedeemPromo = useCallback(async () => {
    // ref lock 防止快速雙擊重複送出（教訓 #006）
    if (redeemingRef.current) return;

    const code = promoCode.trim();
    if (!code) {
      Alert.alert(t.mailbox_promoEmpty);
      return;
    }

    redeemingRef.current = true;
    setRedeeming(true);
    try {
      const token = await getToken();
      if (!token) return;

      await mailboxApi.redeemPromoCode(token, code);
      Alert.alert(t.mailbox_claimSuccess, t.mailbox_promoSuccess);
      setPromoCode('');
      // 重新載入未領取列表
      if (activeTab === 'unclaimed') {
        loadData(1, 'unclaimed');
      }
    } catch (error: unknown) {
      // 優先用 ApiError.serverMessage 顯示後端具體錯誤（如「已兌換過」、「已過期」）
      if (error instanceof ApiError && error.serverMessage) {
        Alert.alert(t.mailbox_promoFailed, error.serverMessage);
      } else {
        Alert.alert(t.mailbox_promoFailed);
      }
    } finally {
      setRedeeming(false);
      redeemingRef.current = false;
    }
  }, [promoCode, getToken, t, activeTab, loadData]);

  // ========== 渲染輔助 ==========

  /** 來源標籤文字 */
  const getSourceLabel = (sourceType: string, sourceLabel: string | null): string => {
    if (sourceLabel) return sourceLabel;
    const key = SOURCE_LABEL_MAP[sourceType];
    return key ? t[key] || sourceType : sourceType;
  };

  /** 獎勵摘要文字 */
  const getRewardSummaryText = (summary: string[]): string => {
    return summary.map(type => {
      const key = `mailbox_reward${type.charAt(0).toUpperCase() + type.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`;
      return t[key] || type;
    }).join('、');
  };

  // ========== 渲染項目 ==========

  const renderItem = ({ item }: { item: MailboxListItem }) => {
    const iconName = SOURCE_ICON_MAP[item.sourceType] || 'mail-outline';
    const isUnclaimed = item.status === 'unclaimed';
    const isExpired = item.status === 'expired';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          !item.isRead && isUnclaimed && styles.cardUnread,
        ]}
        onPress={() => router.push(`/mailbox/${item.id}` as any)}
        activeOpacity={0.7}
      >
        {/* 未讀圓點 */}
        {!item.isRead && isUnclaimed && <View style={styles.unreadDot} />}

        {/* 圖示 */}
        <View style={[
          styles.iconContainer,
          isExpired && styles.iconContainerExpired,
        ]}>
          <Ionicons
            name={iconName as any}
            size={22}
            color={isExpired ? UIColors.textSecondary : MibuBrand.brown}
          />
        </View>

        {/* 內容 */}
        <View style={styles.cardContent}>
          <Text
            style={[styles.cardTitle, isExpired && styles.textExpired]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {item.body && (
            <Text style={styles.cardBody} numberOfLines={2}>
              {item.body}
            </Text>
          )}

          {/* 獎勵摘要 + 來源 */}
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>
              {getSourceLabel(item.sourceType, item.sourceLabel)}
            </Text>
            {item.rewardSummary.length > 0 && (
              <>
                <Text style={styles.metaSep}>·</Text>
                <Text style={styles.metaText} numberOfLines={1}>
                  {getRewardSummaryText(item.rewardSummary)}
                </Text>
              </>
            )}
          </View>

          {/* 到期時間 */}
          {item.expiresAt && isUnclaimed && (
            <Text style={styles.expiresText}>
              {t.mailbox_expiresAt.replace('{date}', new Date(item.expiresAt).toLocaleDateString())}
            </Text>
          )}
        </View>

        {/* 狀態標籤 */}
        {item.status === 'claimed' && (
          <View style={styles.statusBadgeClaimed}>
            <Ionicons name="checkmark-circle" size={14} color={MibuBrand.success} />
          </View>
        )}
        {isExpired && (
          <View style={styles.statusBadgeExpired}>
            <Text style={styles.statusBadgeExpiredText}>{t.mailbox_expired}</Text>
          </View>
        )}
        {isUnclaimed && (
          <Ionicons name="chevron-forward" size={18} color={UIColors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  // ========== 空狀態 ==========

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="mail-open-outline" size={56} color={MibuBrand.copper} />
        <Text style={styles.emptyTitle}>{t.mailbox_empty}</Text>
        <Text style={styles.emptyDesc}>{t.mailbox_emptyDesc}</Text>
      </View>
    );
  };

  // ========== Footer loader ==========

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={MibuBrand.brown} />
      </View>
    );
  };

  // ========== 主畫面 ==========

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={MibuBrand.brown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.mailbox_title}</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 優惠碼兌換區 */}
        <View style={styles.promoSection}>
          <Text style={styles.promoLabel}>{t.mailbox_promoCode}</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder={t.mailbox_promoPlaceholder}
              placeholderTextColor={UIColors.textSecondary}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleRedeemPromo}
            />
            <TouchableOpacity
              style={[styles.promoButton, redeeming && styles.buttonDisabled]}
              onPress={handleRedeemPromo}
              disabled={redeeming}
            >
              {redeeming ? (
                <ActivityIndicator size="small" color={UIColors.white} />
              ) : (
                <Text style={styles.promoButtonText}>{t.mailbox_promoRedeem}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab 切換 */}
        <View style={styles.tabRow}>
          {STATUS_TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}>
                {t[tab.labelKey]}
              </Text>
            </TouchableOpacity>
          ))}

          {/* 全部領取按鈕（只在未領取 tab 顯示） */}
          {activeTab === 'unclaimed' && items.length > 0 && (
            <TouchableOpacity
              style={[styles.claimAllButton, claimingAll && styles.buttonDisabled]}
              onPress={handleClaimAll}
              disabled={claimingAll}
            >
              {claimingAll ? (
                <ActivityIndicator size="small" color={UIColors.white} />
              ) : (
                <Text style={styles.claimAllText}>{t.mailbox_claimAll}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Loading */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={MibuBrand.brown} />
          </View>
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[MibuBrand.brown]}
                tintColor={MibuBrand.brown}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ========== 樣式 ==========

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  flex1: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  headerRight: {
    width: 40,
  },

  // 優惠碼區
  promoSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  promoLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: UIColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  promoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  promoInput: {
    flex: 1,
    height: 44,
    backgroundColor: UIColors.white,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
    borderWidth: 1,
    borderColor: MibuBrand.creamLight,
  },
  promoButton: {
    height: 44,
    paddingHorizontal: Spacing.xl,
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoButtonText: {
    color: UIColors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Tab 切換
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.creamLight,
  },
  tabActive: {
    backgroundColor: MibuBrand.brown,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: UIColors.textSecondary,
  },
  tabTextActive: {
    color: UIColors.white,
  },
  claimAllButton: {
    marginLeft: 'auto',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: MibuBrand.success,
    borderRadius: Radius.full,
  },
  claimAllText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: UIColors.white,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 列表
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },

  // 卡片
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UIColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: MibuBrand.warning,
  },
  unreadDot: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MibuBrand.error,
  },

  // 圖示
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconContainerExpired: {
    backgroundColor: '#F3F4F6',
  },

  // 卡片內容
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  textExpired: {
    color: UIColors.textSecondary,
  },
  cardBody: {
    fontSize: FontSize.sm,
    color: UIColors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: FontSize.xs,
    color: UIColors.textSecondary,
  },
  metaSep: {
    fontSize: FontSize.xs,
    color: UIColors.textSecondary,
    marginHorizontal: Spacing.xs,
  },
  expiresText: {
    fontSize: FontSize.xs,
    color: MibuBrand.warning,
    marginTop: 2,
  },

  // 狀態標籤
  statusBadgeClaimed: {
    marginLeft: Spacing.sm,
  },
  statusBadgeExpired: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    backgroundColor: '#F3F4F6',
  },
  statusBadgeExpiredText: {
    fontSize: FontSize.xs,
    color: UIColors.textSecondary,
  },

  // 空狀態
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginTop: Spacing.lg,
  },
  emptyDesc: {
    fontSize: FontSize.md,
    color: UIColors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
  },

  // Footer
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
