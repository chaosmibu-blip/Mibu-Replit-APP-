/**
 * ============================================================
 * useGuestUpgradePrompt — 訪客升級提示 Hook（#051）
 * ============================================================
 * 管理訪客在關鍵時刻的升級提示邏輯：
 * - 收集第 10 個景點
 * - 首次 AI 對話
 * - 連續登入 3 天
 *
 * 每個提示最多顯示一次，用 AsyncStorage 追蹤。
 * 非 guest 用戶所有 check 函數為 no-op。
 *
 * 更新日期：2026-02-15（#051 訪客升級提醒）
 */

import { useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { STORAGE_KEYS } from '../constants/storageKeys';

// ============ 型別 ============

export type GuestPromptType = 'collection' | 'ai_chat' | 'login_streak';

interface UseGuestUpgradePromptReturn {
  /** 收集 ≥ 10 個景點時呼叫 */
  checkCollectionMilestone: (newTotal: number) => void;
  /** 首次 AI 對話後呼叫 */
  checkFirstAiChat: () => void;
  /** 連續登入 ≥ 3 天時呼叫 */
  checkLoginStreak: (streak: number) => void;
  /** 當前顯示的提示類型（null = 無） */
  activePrompt: GuestPromptType | null;
  /** 當前提示的訊息文字 */
  promptMessage: string;
  /** CTA 按鈕文字 */
  promptActionLabel: string;
  /** 關閉提示 */
  dismissPrompt: () => void;
  /** 點擊 CTA：登出回登入頁綁定帳號 */
  handlePromptAction: () => void;
}

// ============ 常數 ============

const COLLECTION_MILESTONE = 10;
const LOGIN_STREAK_MILESTONE = 3;

/** 提示類型對應的 storage key */
const PROMPT_KEYS: Record<GuestPromptType, string> = {
  collection: STORAGE_KEYS.GUEST_PROMPT_COLLECTION,
  ai_chat: STORAGE_KEYS.GUEST_PROMPT_AI_CHAT,
  login_streak: STORAGE_KEYS.GUEST_PROMPT_LOGIN_STREAK,
};

// ============ Hook ============

export function useGuestUpgradePrompt(): UseGuestUpgradePromptReturn {
  const { user, setUser } = useAuth();
  const { t } = useI18n();
  const [activePrompt, setActivePrompt] = useState<GuestPromptType | null>(null);
  // 防止同時觸發多個提示的鎖
  const checkingRef = useRef(false);

  const isGuest = user?.provider === 'guest';

  /** 通用檢查邏輯：確認是 guest + 未顯示過 + 無其他提示正在顯示 */
  const tryShowPrompt = useCallback(async (type: GuestPromptType): Promise<boolean> => {
    if (!isGuest || checkingRef.current || activePrompt !== null) return false;

    checkingRef.current = true;
    try {
      const key = PROMPT_KEYS[type];
      const shown = await AsyncStorage.getItem(key);
      if (shown) return false;

      // 標記已顯示 + 顯示提示
      await AsyncStorage.setItem(key, 'true');
      setActivePrompt(type);
      return true;
    } catch {
      return false;
    } finally {
      checkingRef.current = false;
    }
  }, [isGuest, activePrompt]);

  // ========== 三個觸發點 ==========

  const checkCollectionMilestone = useCallback((newTotal: number) => {
    if (newTotal >= COLLECTION_MILESTONE) {
      tryShowPrompt('collection');
    }
  }, [tryShowPrompt]);

  const checkFirstAiChat = useCallback(() => {
    tryShowPrompt('ai_chat');
  }, [tryShowPrompt]);

  const checkLoginStreak = useCallback((streak: number) => {
    if (streak >= LOGIN_STREAK_MILESTONE) {
      tryShowPrompt('login_streak');
    }
  }, [tryShowPrompt]);

  // ========== 提示訊息（依當前語言） ==========

  const promptMessage = (() => {
    switch (activePrompt) {
      case 'collection': return t.guestPrompt_collectionMilestone || '';
      case 'ai_chat': return t.guestPrompt_aiChat || '';
      case 'login_streak': return t.guestPrompt_loginStreak || '';
      default: return '';
    }
  })();

  const promptActionLabel = t.guestPrompt_bindAccount || '';

  // ========== 動作 ==========

  const dismissPrompt = useCallback(() => {
    setActivePrompt(null);
  }, []);

  /** 登出回登入頁，讓用戶綁定 Google/Apple 帳號 */
  const handlePromptAction = useCallback(async () => {
    setActivePrompt(null);
    await setUser(null);
  }, [setUser]);

  return {
    checkCollectionMilestone,
    checkFirstAiChat,
    checkLoginStreak,
    activePrompt,
    promptMessage,
    promptActionLabel,
    dismissPrompt,
    handlePromptAction,
  };
}
