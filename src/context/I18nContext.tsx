/**
 * ============================================================
 * 語言 Context (I18nContext.tsx)
 * ============================================================
 * 負責多語系相關的全域狀態：
 * - 當前語言設定（language）
 * - 語言切換（setLanguage）
 * - 翻譯字典（t）
 *
 * 從 AppContext 拆分而來，語言變更只觸發真正需要翻譯的元件 re-render
 *
 * 更新日期：2026-02-12（Context 拆分 Phase 1）
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { STORAGE_KEYS } from '../constants/storageKeys';

// ============ 型別定義 ============

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Record<string, string>;
}

// ============ Context ============

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// ============ Provider ============

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh-TW');

  // ========== 初始化：載入語言設定 ==========
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (storedLanguage) {
        setLanguageState(storedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  // ========== Actions ==========

  /** 切換語言並持久化 */
  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  /** 當前語言的翻譯字典 */
  const t = TRANSLATIONS[language];

  // ========== Memoized Value ==========
  const value = useMemo<I18nContextType>(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// ============ Hook ============

/**
 * 取得語言與翻譯的 Hook
 *
 * @example
 * const { t, language, setLanguage } = useI18n();
 * console.log(t.login); // "登入"
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
