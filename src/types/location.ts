/**
 * @fileoverview 地點/地區型別定義
 *
 * 定義地理位置相關的資料結構，包含：
 * - 國家
 * - 地區/城市
 *
 * @module types/location
 */

// ============ 國家 ============

/**
 * 國家
 *
 * 支援的國家資訊
 */
export interface Country {
  id: number;        // 國家 ID
  code: string;      // 國家代碼（如：TW, JP）
  nameEn: string;    // 英文名稱
  nameZh: string;    // 中文名稱
  nameJa: string;    // 日文名稱
  nameKo: string;    // 韓文名稱
  isActive: boolean; // 是否啟用
}

// ============ 地區 ============

/**
 * 地區
 *
 * 國家下的地區（城市）資訊
 */
export interface Region {
  id: number;        // 地區 ID
  countryId: number; // 所屬國家 ID
  code: string;      // 地區代碼
  nameEn: string;    // 英文名稱
  nameZh: string;    // 中文名稱
  nameJa: string;    // 日文名稱
  nameKo: string;    // 韓文名稱
  isActive: boolean; // 是否啟用
}

// ============ API 回應 ============

/**
 * 國家列表回應
 * GET /api/locations/countries
 */
export interface CountriesResponse {
  countries: Country[];  // 國家列表
}

/**
 * 地區列表回應
 * GET /api/locations/regions
 */
export interface RegionsResponse {
  regions: Region[];  // 地區列表
}
