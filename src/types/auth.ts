/**
 * @fileoverview 認證與用戶型別定義
 *
 * 定義認證相關的資料結構，包含：
 * - 用戶基本資訊
 * - 認證回應
 * - 用戶個人資料
 * - 帳號操作
 *
 * @module types/auth
 */

import { Language, UserRole } from './common';

// ============ 用戶權限 ============

/**
 * 用戶特殊權限
 *
 * 用於標記用戶的特殊能力（如管理員無限扭蛋）
 */
export interface UserPrivileges {
  hasUnlimitedGeneration: boolean;  // 是否有無限扭蛋權限（管理員專用）
}

// ============ 用戶資訊 ============

/**
 * 用戶基本資訊
 *
 * 用於顯示用戶資訊、權限判斷
 * 欄位為可選是因為不同 API 回傳的欄位不同
 */
export interface User {
  id: string;                        // 用戶唯一識別碼
  name?: string;                     // 顯示名稱
  email: string | null;              // 電子郵件（訪客可能為 null）
  username?: string;                 // 用戶名稱
  firstName?: string | null;         // 名
  lastName?: string | null;          // 姓
  avatar?: string | null;            // 頭像 URL（舊欄位）
  profileImageUrl?: string | null;   // 頭像 URL（新欄位）
  role?: UserRole;                   // 主要角色
  activeRole?: UserRole;             // 當前啟用的角色（多角色切換）
  isApproved?: boolean;              // 是否已審核通過
  isSuperAdmin?: boolean;            // 是否為超級管理員
  accessibleRoles?: string[];        // 可切換的角色列表
  provider?: string | null;          // OAuth 提供者（google/apple）
  providerId?: string | null;        // OAuth 提供者的用戶 ID
  isMerchant?: boolean;              // 是否為商家
  token?: string;                    // JWT Token（某些情況會包含）
  privileges?: UserPrivileges;       // 特殊權限
}

// ============ 認證回應 ============

/**
 * 認證 API 回應
 *
 * 登入/註冊成功後的回應格式
 */
export interface AuthResponse {
  user: User;    // 用戶資訊
  token: string; // JWT Token
}

// ============ 用戶個人資料 ============

/**
 * 性別選項
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * 用戶完整個人資料
 *
 * 用於個人設定頁面的顯示與編輯
 */
export interface UserProfile {
  id: string;                              // 用戶 ID
  email: string;                           // 電子郵件
  firstName: string | null;                // 名
  lastName: string | null;                 // 姓
  profileImageUrl: string | null;          // 頭像 URL
  role: UserRole;                          // 用戶角色
  gender: Gender | null;                   // 性別
  birthDate: string | null;                // 生日（YYYY-MM-DD）
  phone: string | null;                    // 電話號碼
  dietaryRestrictions: string[];           // 飲食限制（如：素食、過敏原）
  medicalHistory: string[];                // 醫療史（如：慢性病）
  emergencyContactName: string | null;     // 緊急聯絡人姓名
  emergencyContactPhone: string | null;    // 緊急聯絡人電話
  emergencyContactRelation: string | null; // 緊急聯絡人關係
  preferredLanguage: Language;             // 偏好語言
}

/**
 * 更新個人資料參數
 *
 * 所有欄位皆為可選，只傳需要更新的欄位
 */
export interface UpdateProfileParams {
  email?: string;                          // Email（#037 可編輯）
  firstName?: string;                      // 名
  lastName?: string;                       // 姓
  gender?: Gender;                         // 性別
  birthDate?: string;                      // 生日（YYYY-MM-DD）
  phone?: string;                          // 電話號碼
  dietaryRestrictions?: string[];          // 飲食限制
  medicalHistory?: string[];               // 醫療史
  emergencyContactName?: string;           // 緊急聯絡人姓名
  emergencyContactPhone?: string;          // 緊急聯絡人電話
  emergencyContactRelation?: string;       // 緊急聯絡人關係
  preferredLanguage?: Language;            // 偏好語言
}

/**
 * 個人資料 API 回應
 */
export interface ProfileResponse {
  success: boolean;      // 是否成功
  message: string;       // 回應訊息
  profile: UserProfile;  // 用戶資料
}

// ============ 帳號操作 ============

/**
 * 刪除帳號 API 回應
 */
export interface DeleteAccountResponse {
  success: boolean;       // 是否成功
  message?: string;       // 成功訊息
  error?: string;         // 錯誤訊息
  code?: 'UNAUTHORIZED' | 'MERCHANT_ACCOUNT_EXISTS' | 'DELETE_FAILED' | 'SERVER_ERROR'; // 錯誤碼
}
