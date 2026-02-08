/**
 * 多語系工具函數
 *
 * 提供翻譯字串插值、日期格式化、locale 對應等工具
 *
 * @module utils/i18n
 *
 * 更新日期：2026-02-08（初版，配合 isZh → t 遷移）
 */
import { Language } from '../types';

// ============ Locale 對應 ============

/**
 * Language → Intl Locale 對應
 * 用於 toLocaleDateString() / toLocaleString() 等 Intl API
 */
export const LOCALE_MAP: Record<Language, string> = {
  'zh-TW': 'zh-TW',
  'en': 'en-US',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
};

// ============ 字串插值 ============

/**
 * 翻譯字串插值
 *
 * 將翻譯字串中的 {key} 佔位符替換為實際值
 *
 * @param template - 含有 {key} 佔位符的翻譯字串
 * @param params - 鍵值對，key 對應佔位符名稱
 * @returns 替換後的字串
 *
 * @example
 * tFormat('已移除「{name}」', { name: '台北101' })
 * // → '已移除「台北101」'
 *
 * tFormat('Earned {amount} coins', { amount: 50 })
 * // → 'Earned 50 coins'
 */
export function tFormat(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

// ============ 日期格式化 ============

/**
 * 格式化日期（僅日期）
 *
 * @param date - Date 物件或 ISO 字串
 * @param language - 當前語言
 * @param options - 自訂 Intl.DateTimeFormat 選項
 */
export function formatDate(
  date: Date | string,
  language: Language,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE_MAP[language], options);
}

/**
 * 格式化日期時間（日期 + 時間）
 *
 * @param date - Date 物件或 ISO 字串
 * @param language - 當前語言
 * @param options - 自訂 Intl.DateTimeFormat 選項
 */
export function formatDateTime(
  date: Date | string,
  language: Language,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(LOCALE_MAP[language], options);
}
