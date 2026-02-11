/**
 * ============================================================
 * 全域推播通知處理器 (useNotificationHandler.ts)
 * ============================================================
 * 此模組提供: 推播通知的全域監聽與 Deep Link 導航
 *
 * 主要功能:
 * - 前景通知接收 → 自動刷新紅點狀態
 * - 用戶點擊通知 → 根據 data.screen 導航到對應頁面
 * - App 啟動時檢查是否由通知開啟（冷啟動導航）
 *
 * 掛載位置: app/_layout.tsx（根層級，登入後生效）
 *
 * Deep Link screen 對照表：
 * - Achievements → /economy（成就頁）
 * - DailyTasks → /economy（每日任務頁）
 * - CouponDetail → /economy（優惠券詳情）
 * - Announcements → /(tabs)（公告頁，首頁）
 *
 * 更新日期：2026-02-11（#042 通知系統全面翻新）
 *
 * @module hooks/useNotificationHandler
 */
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { pushNotificationService } from '../src/services/pushNotificationService';
import { useApp } from '../src/context/AppContext';
import type { NotificationScreen, NotificationData } from '../src/types/notifications';

// ============ Deep Link 路由對照 ============

/**
 * 推播 screen 值 → App 路由對照
 *
 * 後端 data.screen 對應前端 expo-router 路由
 * 注意：itembox 和 collection 不走推播導航
 */
const SCREEN_ROUTE_MAP: Record<NotificationScreen, string> = {
  Achievements: '/economy',
  DailyTasks: '/economy',
  CouponDetail: '/economy',
  Announcements: '/(tabs)',
};

// ============ Hook ============

/**
 * 全域推播通知處理器
 *
 * 在根層級掛載，負責：
 * 1. 監聽前景通知 → 刷新紅點
 * 2. 監聽通知點擊 → Deep Link 導航
 * 3. 冷啟動通知檢查
 *
 * @example
 * // 在 app/_layout.tsx 的 AppProvider 內部使用
 * function NotificationHandler() {
 *   useNotificationHandler();
 *   return null;
 * }
 */
export function useNotificationHandler() {
  const { state, refreshUnreadCount } = useApp();
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    // 未登入不監聽
    if (!state.isAuthenticated) return;

    // 1. 監聽前景通知（App 開啟時收到推播）
    const receivedSubscription = pushNotificationService.addNotificationReceivedListener(
      () => {
        // 收到通知 → 重新拉取紅點狀態
        refreshUnreadCount();
      }
    );

    // 2. 監聯用戶點擊通知 → Deep Link 導航
    const responseSubscription = pushNotificationService.addNotificationResponseReceivedListener(
      (response: any) => {
        // 防止重複導航
        if (isNavigatingRef.current) return;
        isNavigatingRef.current = true;

        try {
          const data = response?.notification?.request?.content?.data as NotificationData | undefined;
          if (data?.screen) {
            handleNotificationNavigation(data);
          }
        } catch (error) {
          console.error('[NotificationHandler] 導航失敗:', error);
        } finally {
          // 延遲解鎖，避免快速重複觸發
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 1000);
        }

        // 點擊通知後刷新紅點
        refreshUnreadCount();
      }
    );

    // 清理監聽器
    return () => {
      receivedSubscription?.remove();
      responseSubscription?.remove();
    };
  }, [state.isAuthenticated, refreshUnreadCount]);
}

// ============ 導航處理 ============

/**
 * 根據通知 data 導航到對應頁面
 *
 * @param data - 通知附帶的導航資料
 */
function handleNotificationNavigation(data: NotificationData) {
  const route = SCREEN_ROUTE_MAP[data.screen];

  if (!route) {
    console.warn('[NotificationHandler] 未知的 screen 值:', data.screen);
    return;
  }

  // 使用 router.push 導航，保留返回堆疊
  router.push(route as any);
}
