/**
 * ============================================================
 * 全域預載入快取服務 (preloadService.ts)
 * ============================================================
 * 用途：在 App 啟動後背景預載入常用資料，避免畫面切換時卡住
 *
 * 主要功能:
 * - 國家列表快取（GachaScreen + ItineraryScreen 共用）
 * - 城市列表快取（依國家 ID 快取）
 * - Promise 去重（同一請求不會重複發送）
 * - 登入後自動預載入
 *
 * 更新日期：2026-02-07（初版建立）
 */

import { apiService } from './api';
import { Country, Region } from '../types/location';
import { avatarService } from './avatarService';

class PreloadService {
  // ========== 快取儲存 ==========
  private countriesCache: Country[] | null = null;
  private regionsCache: Map<number, Region[]> = new Map();

  // ========== 進行中的 Promise（防止重複請求）==========
  private countriesPromise: Promise<Country[]> | null = null;
  private regionsPromises: Map<number, Promise<Region[]>> = new Map();

  // ========== 國家列表 ==========

  /**
   * 取得國家列表（優先使用快取）
   * 如果快取中有資料，立即返回
   * 如果正在載入，返回同一個 Promise（去重）
   * 如果都沒有，發起 API 請求
   */
  async getCountries(): Promise<Country[]> {
    // 快取命中，立即返回
    if (this.countriesCache) return this.countriesCache;

    // 已有進行中的請求，複用
    if (this.countriesPromise) return this.countriesPromise;

    // 發起新請求
    this.countriesPromise = apiService.getCountries()
      .then(data => {
        this.countriesCache = data;
        this.countriesPromise = null;
        return data;
      })
      .catch(error => {
        this.countriesPromise = null;
        throw error;
      });

    return this.countriesPromise;
  }

  // ========== 城市列表 ==========

  /**
   * 取得指定國家的城市列表（優先使用快取）
   * @param countryId - 國家 ID
   */
  async getRegions(countryId: number): Promise<Region[]> {
    // 快取命中
    const cached = this.regionsCache.get(countryId);
    if (cached) return cached;

    // 已有進行中的請求
    const existing = this.regionsPromises.get(countryId);
    if (existing) return existing;

    // 發起新請求
    const promise = apiService.getRegions(countryId)
      .then(data => {
        this.regionsCache.set(countryId, data);
        this.regionsPromises.delete(countryId);
        return data;
      })
      .catch(error => {
        this.regionsPromises.delete(countryId);
        throw error;
      });

    this.regionsPromises.set(countryId, promise);
    return promise;
  }

  // ========== 預載入觸發 ==========

  /**
   * 登入成功後呼叫：背景預載入常用資料
   * 不阻塞 UI，靜默失敗
   */
  preloadAfterAuth(): void {
    // 背景預載入國家列表
    this.getCountries().catch(() => {
      // 靜默失敗，用戶進入畫面時會再試
    });
    // 背景預載入頭像清單（Cloudinary URL）
    avatarService.preload();
  }

  /**
   * 登出時清除所有快取
   */
  clearCache(): void {
    this.countriesCache = null;
    this.regionsCache.clear();
    this.countriesPromise = null;
    this.regionsPromises.clear();
    avatarService.clearCache();
  }

  // ========== 快取狀態查詢 ==========

  /** 國家列表是否已載入 */
  hasCountries(): boolean {
    return this.countriesCache !== null;
  }

  /** 指定國家的城市是否已載入 */
  hasRegions(countryId: number): boolean {
    return this.regionsCache.has(countryId);
  }
}

/** 全域單例 */
export const preloadService = new PreloadService();
