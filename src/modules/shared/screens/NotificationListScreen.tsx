/**
 * ============================================================
 * 通知歷史列表頁面 (NotificationListScreen.tsx)
 * ============================================================
 * 此模組提供: 推播通知歷史記錄列表
 *
 * 主要功能:
 * - 分頁載入通知歷史
 * - 點擊通知 → 標記已讀 + 導航到對應頁面
 * - 全部標記已讀
 * - 下拉重新整理
 * - 空狀態顯示
 *
 * 串接 API:
 * - GET /api/notifications/list?page=1&pageSize=20
 * - POST /api/notifications/read/:id
 * - POST /api/notifications/read-all
 *
 * 更新日期：2026-02-12（Phase 3 遷移至 React Query）
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useI18n, useGacha } from '../../../context/AppContext';
import {
  useNotificationList,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../../../hooks/useNotificationQueries';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import type {
  NotificationItem,
  NotificationType,
  NotificationScreen,
} from '../../../types/notifications';

// ============ 通知類型對照 ============

/** 通知類型 → icon + 顏色 */
const TYPE_CONFIG: Record<NotificationType, { icon: string; iconBg: string; iconColor: string; labelKey: string }> = {
  achievement_unlocked: {
    icon: 'trophy',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
    labelKey: 'notifList_achievementUnlocked',
  },
  daily_task_completed: {
    icon: 'checkbox',
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    labelKey: 'notifList_dailyTaskCompleted',
  },
  new_coupon: {
    icon: 'ticket',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    labelKey: 'notifList_newCoupon',
  },
  announcement: {
    icon: 'megaphone',
    iconBg: '#FDF2F8',
    iconColor: '#DB2777',
    labelKey: 'notifList_announcementLabel',
  },
};

/** Deep Link screen → 路由 */
const SCREEN_ROUTE_MAP: Record<NotificationScreen, string> = {
  Achievements: '/economy',
  DailyTasks: '/economy',
  CouponDetail: '/economy',
  Announcements: '/(tabs)',
};

// ============ 元件 ============

export function NotificationListScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { refreshUnreadCount } = useGacha();
  const queryClient = useQueryClient();

  // ========== React Query 資料查詢 ==========

  const listQuery = useNotificationList();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  // 樂觀已讀 ID 集合（本地追蹤，避免等 refetch）
  const [optimisticReadIds, setOptimisticReadIds] = useState<Set<number>>(new Set());

  // 衍生狀態
  const notifications: NotificationItem[] =
    listQuery.data?.pages.flatMap((page: any) => page.notifications) ?? [];
  const loading = listQuery.isLoading;
  const refreshing = listQuery.isFetching && !listQuery.isLoading && !listQuery.isFetchingNextPage;
  const loadingMore = listQuery.isFetchingNextPage;

  // ========== 下拉重新整理 ==========

  const handleRefresh = useCallback(() => {
    setOptimisticReadIds(new Set());
    queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
  }, [queryClient]);

  // ========== 載入更多 ==========

  const handleLoadMore = useCallback(() => {
    if (listQuery.hasNextPage && !loadingMore) {
      listQuery.fetchNextPage();
    }
  }, [listQuery, loadingMore]);

  // ========== 點擊通知 → 標記已讀 + 導航 ==========

  const handleNotificationPress = useCallback((item: NotificationItem) => {
    // 標記已讀（樂觀更新）
    if (!item.isRead && !optimisticReadIds.has(item.id)) {
      setOptimisticReadIds(prev => new Set(prev).add(item.id));
      markReadMutation.mutate(item.id);
      refreshUnreadCount();
    }

    // 導航到對應頁面
    if (item.data?.screen) {
      const route = SCREEN_ROUTE_MAP[item.data.screen];
      if (route) {
        router.push(route as any);
      }
    }
  }, [optimisticReadIds, markReadMutation, refreshUnreadCount, router]);

  // ========== 全部已讀 ==========

  const handleMarkAllRead = useCallback(() => {
    // 樂觀更新：把所有通知 ID 加入已讀集合
    setOptimisticReadIds(new Set(notifications.map(n => n.id)));

    markAllReadMutation.mutate(undefined, {
      onSuccess: () => {
        refreshUnreadCount();
        queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      },
      onError: () => {
        setOptimisticReadIds(new Set());
        queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      },
    });
  }, [notifications, markAllReadMutation, refreshUnreadCount, queryClient]);

  // ========== 時間格式化 ==========

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return '剛剛';
    if (diffMin < 60) return `${diffMin} 分鐘前`;
    if (diffHour < 24) return `${diffHour} 小時前`;
    if (diffDay < 7) return `${diffDay} 天前`;
    return date.toLocaleDateString();
  };

  // ========== 渲染通知項目 ==========

  const renderItem = useCallback(({ item }: { item: NotificationItem }) => {
    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.announcement;
    const isRead = item.isRead || optimisticReadIds.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.notifCard, !isRead && styles.notifCardUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        {/* 未讀圓點 */}
        {!isRead && <View style={styles.unreadDot} />}

        {/* 圖示 */}
        <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
          <Ionicons name={config.icon as any} size={22} color={config.iconColor} />
        </View>

        {/* 內容 */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.typeLabel}>{t[config.labelKey]}</Text>
            <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          {item.body && (
            <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
          )}
        </View>

        {/* 箭頭（有導航目標時顯示） */}
        {item.data?.screen && (
          <Ionicons name="chevron-forward" size={16} color={UIColors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  }, [t, handleNotificationPress, optimisticReadIds]);

  // ========== 空狀態 ==========

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={64} color={MibuBrand.tanLight} />
        <Text style={styles.emptyTitle}>{t.notifList_empty}</Text>
        <Text style={styles.emptyDesc}>{t.notifList_emptyDesc}</Text>
      </View>
    );
  };

  // ========== 載入更多指示器 ==========

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={MibuBrand.brown} />
      </View>
    );
  };

  // ========== 主渲染 ==========

  const hasUnread = notifications.some(n => !n.isRead && !optimisticReadIds.has(n.id));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.notifList_title}</Text>
        {/* 全部已讀按鈕 */}
        {hasUnread ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>{t.notifList_markAllRead}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* 列表 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MibuBrand.brown} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={MibuBrand.brown}
              colors={[MibuBrand.brown]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ============ 樣式 ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Platform.OS === 'android' ? Spacing.xl : Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  markAllButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  markAllText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },

  // 通知卡片
  notifCard: {
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
  notifCardUnread: {
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
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: MibuBrand.copper,
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: FontSize.xs,
    color: UIColors.textSecondary,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  cardBody: {
    fontSize: FontSize.sm,
    color: UIColors.textSecondary,
    lineHeight: 18,
  },

  // 空狀態
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  },

  // 載入更多
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
