/**
 * ============================================================
 * 頭像預設快取服務 (avatarService.ts)
 * ============================================================
 * 此模組提供: 從後端 API 取得頭像預設清單，並管理三層快取
 *
 * 快取策略（三層 fallback）:
 * 1. 記憶體快取 → 立即回傳（App session 內有效）
 * 2. API 呼叫成功 → 存記憶體 + 存 AsyncStorage
 * 3. API 失敗 → 讀 AsyncStorage 上次成功的清單
 * 4. AsyncStorage 也沒有 → 空陣列（UI 顯示首字母 fallback）
 *
 * 設計模式：跟 preloadService 相同（Promise 去重 + 記憶體快取 + 單例）
 *
 * 更新日期：2026-02-09（初版建立，頭像從本地改為 Cloudinary URL）
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';
import { assetApi } from './assetApi';
import { AvatarPreset, AssetItem } from '../types/asset';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { cloudinaryUrl } from '../utils/cloudinary';

// ========== 工具函數 ==========

/**
 * 後端 code 轉前端短 ID
 * 'avatar-chef' → 'chef'（向後相容 AsyncStorage 存的值）
 */
function codeToShortId(code: string): string {
  return code.startsWith('avatar-') ? code.slice(7) : code;
}

/** 預設背景色 */
const DEFAULT_COLOR = '#F5E6D3';

// ========== 服務類別 ==========

class AvatarService {
  private cache: AvatarPreset[] | null = null;
  private fetchPromise: Promise<AvatarPreset[]> | null = null;

  /**
   * 取得頭像預設列表（優先快取）
   * 如果記憶體有快取，立即返回
   * 如果正在載入，返回同一個 Promise（去重）
   * 如果都沒有，發起 API 請求
   */
  async getPresets(): Promise<AvatarPreset[]> {
    // 記憶體快取命中
    if (this.cache) return this.cache;

    // 已有進行中的請求，複用
    if (this.fetchPromise) return this.fetchPromise;

    // 發起新請求
    this.fetchPromise = this._fetchFromApi();
    return this.fetchPromise;
  }

  /**
   * 從 API 取得頭像清單，失敗時讀 AsyncStorage fallback
   */
  private async _fetchFromApi(): Promise<AvatarPreset[]> {
    try {
      const assets = await assetApi.getAssets('avatar_preset');
      const presets = this._mapToPresets(assets);

      if (presets.length > 0) {
        this.cache = presets;
        // 背景存到 AsyncStorage（下次斷網可用）
        this._saveToStorage(presets);
        // 背景預取圖片到 expo-image 磁碟快取
        this._prefetchImages(presets);
      } else {
        // API 回傳空陣列，嘗試讀本地快取
        this.cache = await this._loadFromStorage();
      }

      this.fetchPromise = null;
      return this.cache;
    } catch {
      // API 失敗，讀 AsyncStorage fallback
      this.cache = await this._loadFromStorage();
      this.fetchPromise = null;
      return this.cache;
    }
  }

  /**
   * 將後端 AssetItem[] 轉換為前端 AvatarPreset[]
   */
  private _mapToPresets(assets: AssetItem[]): AvatarPreset[] {
    return assets.map((a): AvatarPreset => ({
      id: codeToShortId(a.code),
      code: a.code,
      name: a.name,
      imageUrl: cloudinaryUrl(a.url, 512),
      color: DEFAULT_COLOR,
    }));
  }

  // ========== AsyncStorage 快取 ==========

  /** 存頭像清單到 AsyncStorage */
  private _saveToStorage(presets: AvatarPreset[]): void {
    AsyncStorage.setItem(
      STORAGE_KEYS.AVATAR_PRESETS_CACHE,
      JSON.stringify(presets),
    ).catch(() => {});
  }

  /** 從 AsyncStorage 讀取上次成功的清單 */
  private async _loadFromStorage(): Promise<AvatarPreset[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.AVATAR_PRESETS_CACHE);
      if (stored) {
        const presets: AvatarPreset[] = JSON.parse(stored);
        // 有快取就預取圖片
        if (presets.length > 0) this._prefetchImages(presets);
        return presets;
      }
    } catch {
      // 解析失敗，忽略
    }
    return [];
  }

  // ========== 圖片預取 ==========

  /** 用 expo-image 預取所有頭像 URL 到磁碟快取 */
  private _prefetchImages(presets: AvatarPreset[]): void {
    const urls = presets
      .filter(p => p.imageUrl)
      .map(p => p.imageUrl);
    if (urls.length > 0) {
      ExpoImage.prefetch(urls).catch(() => {});
    }
  }

  // ========== 公開方法 ==========

  /** 根據短 ID 找到對應的頭像預設 */
  findById(id: string): AvatarPreset | undefined {
    return this.cache?.find(p => p.id === id);
  }

  /** 預載入觸發（背景，不阻塞） */
  preload(): void {
    this.getPresets().catch(() => {});
  }

  /** 登出時清除快取（記憶體 + AsyncStorage） */
  clearCache(): void {
    this.cache = null;
    this.fetchPromise = null;
    AsyncStorage.removeItem(STORAGE_KEYS.AVATAR_PRESETS_CACHE).catch(() => {});
  }
}

/** 全域單例 */
export const avatarService = new AvatarService();
