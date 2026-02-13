/**
 * @fileoverview 管理員後台型別定義
 *
 * 定義管理員後台相關的資料結構，包含：
 * - 全域排除名單
 * - 用戶管理
 * - 地點審核
 * - 公告管理
 *
 * @module types/admin
 */

import { UserRole } from './common';

// ============ 全域排除 ============

/**
 * 全域排除項目
 *
 * 被標記為不適合出現在扭蛋池的地點
 */
export interface GlobalExclusion {
  id: number;          // 排除項目 ID
  userId: null;        // 用戶 ID（全域排除時為 null）
  placeName: string;   // 地點名稱
  district: string;    // 區域
  city: string;        // 城市
  penaltyScore: number; // 扣分分數
  createdAt: string;   // 建立時間（ISO 8601）
}

// ============ 用戶管理 ============

/**
 * 管理員用戶列表項目
 *
 * 用於後台用戶管理介面
 */
export interface AdminUser {
  id: string;          // 用戶 ID
  email: string | null; // 電子郵件
  name?: string;       // 名稱
  role: UserRole;      // 用戶角色
  isApproved: boolean; // 是否已審核
  createdAt: string;   // 註冊時間（ISO 8601）
}

// ============ 地點審核 ============

/**
 * 地點草稿
 *
 * 用戶提交待審核的地點
 */
export interface PlaceDraft {
  id: number;                                      // 草稿 ID
  placeName: string;                               // 地點名稱
  district?: string;                               // 區域
  city?: string;                                   // 城市
  category?: string;                               // 分類
  submittedBy?: string;                            // 提交者 ID
  status: 'pending' | 'approved' | 'rejected';     // 審核狀態
  createdAt: string;                               // 提交時間（ISO 8601）
}

// ============ 公告管理 ============

/**
 * 公告類型
 * - announcement: 一般公告
 * - flash_event: 快閃活動
 * - holiday_event: 節慶活動
 */
export type AnnouncementType = 'announcement' | 'flash_event' | 'holiday_event';

/**
 * 公告
 *
 * 系統公告資料
 */
export interface Announcement {
  id: number;             // 公告 ID
  type: AnnouncementType; // 公告類型
  title: string;          // 標題
  content: string;        // 內容
  imageUrl?: string;      // 圖片 URL
  linkUrl?: string;       // 連結 URL
  startDate?: string;     // 開始日期
  endDate?: string;       // 結束日期
  isActive: boolean;      // 是否啟用
  priority: number;       // 優先順序（數字越大越優先）
  createdAt: string;      // 建立時間（ISO 8601）
  updatedAt: string;      // 更新時間（ISO 8601）
}

/**
 * 公告列表回應
 * GET /api/admin/announcements
 */
export interface AnnouncementsResponse {
  announcements: Announcement[];  // 公告列表
}

/**
 * 建立公告參數
 * POST /api/admin/announcements
 */
export interface CreateAnnouncementParams {
  type: AnnouncementType;  // 公告類型
  title: string;           // 標題
  content: string;         // 內容
  imageUrl?: string;       // 圖片 URL
  linkUrl?: string;        // 連結 URL
  startDate?: string;      // 開始日期
  endDate?: string;        // 結束日期
  isActive?: boolean;      // 是否啟用
  priority?: number;       // 優先順序
}

/**
 * 更新公告參數
 * PUT /api/admin/announcements/:id
 */
export interface UpdateAnnouncementParams {
  type?: AnnouncementType; // 公告類型
  title?: string;          // 標題
  content?: string;        // 內容
  imageUrl?: string;       // 圖片 URL
  linkUrl?: string;        // 連結 URL
  startDate?: string;      // 開始日期
  endDate?: string;        // 結束日期
  isActive?: boolean;      // 是否啟用
  priority?: number;       // 優先順序
}

// ============ #047 獎勵發送 ============

/** 獎勵項目（發送用） */
export interface RewardItem {
  type: 'coins' | 'shop_item' | 'inventory_coupon' | 'place_pack' | 'perk';
  amount?: number;       // coins 類型時必填
  itemCode?: string;     // shop_item / inventory_coupon 類型時必填
  quantity?: number;
  perkType?: 'daily_pulls' | 'inventory_slots'; // perk 類型時必填
  value?: number;        // perk 類型時必填
}

/** 發送獎勵參數 — 全體發送 */
export interface SendRewardAllParams {
  target: 'all';
  title: string;
  message?: string;
  rewards: RewardItem[];
  expiresInDays?: number;
}

/** 發送獎勵參數 — 指定用戶 */
export interface SendRewardUsersParams {
  target: 'users';
  userIds: string[];
  title: string;
  message?: string;
  rewards: RewardItem[];
  expiresInDays?: number;
}

/** 發送獎勵參數（聯合型別） */
export type SendRewardParams = SendRewardAllParams | SendRewardUsersParams;

/** 發送獎勵回應 */
export interface SendRewardResponse {
  success: boolean;
  target: 'all' | 'users';
  totalUsers: number;
  sent: number;
  batches: number;
  mailboxItemIds: string[];
}

// ============ #048 商城道具管理 ============

/** 商城商品分類 */
export type ShopItemCategory = 'gacha_ticket' | 'inventory_expand' | 'cosmetic' | 'boost' | 'bundle' | 'other';

/** 商城商品 */
export interface ShopItem {
  id: number;
  code: string;                    // 唯一代碼（建立後不可修改）
  category: ShopItemCategory;
  nameZh: string;                  // 中文名稱
  nameEn?: string;                 // 英文名稱
  descriptionZh?: string;          // 中文說明
  descriptionEn?: string;          // 英文說明
  priceCoins: number;              // 金幣售價
  imageUrl?: string;               // 商品圖片
  maxPerUser?: number;             // 每人限購數量
  isActive: boolean;               // 是否上架
  sortOrder: number;               // 排序
  createdAt: string;
  updatedAt: string;
}

/** 商品列表回應 */
export interface ShopItemsResponse {
  items: ShopItem[];
  total: number;
  page: number;
  limit: number;
}

/** 建立商品參數 */
export interface CreateShopItemParams {
  code: string;
  category: ShopItemCategory;
  nameZh: string;
  nameEn?: string;
  descriptionZh?: string;
  descriptionEn?: string;
  priceCoins: number;
  imageUrl?: string;
  maxPerUser?: number;
  isActive?: boolean;
  sortOrder?: number;
}

/** 更新商品參數（code 不可修改） */
export interface UpdateShopItemParams {
  category?: ShopItemCategory;
  nameZh?: string;
  nameEn?: string;
  descriptionZh?: string;
  descriptionEn?: string;
  priceCoins?: number;
  imageUrl?: string;
  maxPerUser?: number;
  isActive?: boolean;
  sortOrder?: number;
}
