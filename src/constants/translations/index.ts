/**
 * 多語系翻譯與應用程式配置
 *
 * 定義：
 * - 應用程式常數（等級上限、每日生成次數等）
 * - API 基礎 URL
 * - 分類顏色對應
 * - 四國語系翻譯（繁體中文、英文、日文、韓文）
 *
 * 翻譯字典按語系拆分為獨立檔案，提升可維護性：
 * - zh-TW.ts: 繁體中文
 * - en.ts: 英文
 * - ja.ts: 日文
 * - ko.ts: 韓文
 *
 * 使用方式：
 * import { TRANSLATIONS, getCategoryLabel } from '@/constants/translations';
 *
 * @example
 * const label = TRANSLATIONS['zh-TW'].appTitle; // '行程扭蛋'
 *
 * 更新日期：2026-02-10（從單檔 4,642 行拆分為按語系分檔）
 */

import { Language } from '../../types';
import zhTW from './zh-TW';
import en from './en';
import ja from './ja';
import ko from './ko';

// ========== 應用程式常數 ==========

/** 最高等級上限 */
export const MAX_LEVEL = 12;

/** 預設等級 */
export const DEFAULT_LEVEL = 5;

// #043: 移除 MAX_DAILY_GENERATIONS 常數
// 限額由後端 GET /api/gacha/quota 或 GET /api/user/perks 回傳的 dailyPullLimit 控制
// 限額單位是「卡片張數」（預設 36 張），不是生成次數

/** API 基礎 URL（從環境變數讀取，有預設值） */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://gacha-travel--s8869420.replit.app';

/**
 * 景點分類對應的顏色
 * 用於分類標籤、圖標等 UI 元素
 */
export const CATEGORY_COLORS: Record<string, string> = {
  /** 美食 - 橘色 */
  food: '#ea580c',
  /** 住宿 - 青色 */
  stay: '#0891b2',
  /** 教育 - 紫色 */
  education: '#7c3aed',
  /** 娛樂 - 粉紅色 */
  entertainment: '#db2777',
  /** 景點 - 綠色 */
  scenery: '#10b981',
  /** 購物 - 金色 */
  shopping: '#f59e0b',
  /** 體驗 - 金色 */
  experience: '#f59e0b',
  /** 活動 - 金色 */
  activity: '#f59e0b',
};

/**
 * 多語系翻譯字典
 * 支援語系：繁體中文(zh-TW)、英文(en)、日文(ja)、韓文(ko)
 */
export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  'zh-TW': zhTW,
  'en': en,
  'ja': ja,
  'ko': ko,
};

/**
 * 取得分類的多語系標籤
 *
 * @param category - 分類名稱（如 'food', 'stay' 等）
 * @param language - 目標語系
 * @returns 該分類在指定語系的標籤文字
 *
 * @example
 * getCategoryLabel('food', 'zh-TW'); // '美食'
 * getCategoryLabel('food', 'en');    // 'Food'
 * getCategoryLabel('food', 'ja');    // 'グルメ'
 */
export const getCategoryLabel = (category: string, language: Language): string => {
  const labels: Record<string, Record<Language, string>> = {
    food: { 'zh-TW': '美食', en: 'Food', ja: 'グルメ', ko: '맛집' },
    stay: { 'zh-TW': '住宿', en: 'Stay', ja: '宿泊', ko: '숙박' },
    education: { 'zh-TW': '生態文化', en: 'Culture', ja: '文化', ko: '문화' },
    entertainment: { 'zh-TW': '娛樂', en: 'Fun', ja: '娯楽', ko: '놀이' },
    scenery: { 'zh-TW': '景點', en: 'Scenery', ja: '景色', ko: '명소' },
    shopping: { 'zh-TW': '購物', en: 'Shop', ja: '買物', ko: '쇼핑' },
    activity: { 'zh-TW': '體驗', en: 'Activity', ja: '体験', ko: '체험' },
    experience: { 'zh-TW': '體驗', en: 'Experience', ja: '体験', ko: '체험' },
  };
  const categoryKey = category?.toLowerCase() || '';
  return labels[categoryKey]?.[language] || labels[categoryKey]?.['zh-TW'] || category || '';
};

/**
 * 取得分類的對應顏色
 *
 * @param category - 分類名稱
 * @returns 該分類的 HEX 色碼，若找不到則回傳預設紫色
 *
 * @example
 * getCategoryColor('food'); // '#ea580c'
 */
export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category?.toLowerCase()] || '#6366f1';
};
