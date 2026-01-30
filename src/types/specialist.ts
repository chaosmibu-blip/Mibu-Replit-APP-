/**
 * @fileoverview 策劃師/專員型別定義
 *
 * 定義專員系統相關的資料結構，包含：
 * - 專員資訊
 * - 服務關係
 * - 服務訂單
 *
 * @module types/specialist
 */

// ============ 專員資訊 ============

/**
 * 專員資訊
 *
 * 用於顯示可用專員及其狀態
 */
export interface SpecialistInfo {
  id: number;                  // 專員 ID
  userId: string;              // 關聯用戶 ID
  name: string;                // 專員名稱
  isOnline: boolean;           // 是否在線
  isAvailable: boolean;        // 是否可接單
  serviceRegion?: string;      // 服務區域
  currentTravelers?: number;   // 當前服務中的旅客數
  maxTravelers?: number;       // 最大服務旅客數
}

// ============ 服務關係 ============

/**
 * 服務關係
 *
 * 旅客與專員之間的服務綁定關係
 */
export interface ServiceRelation {
  id: number;                                   // 關係 ID
  travelerId: string;                           // 旅客 ID
  specialistId: number;                         // 專員 ID
  status: 'active' | 'completed' | 'cancelled'; // 服務狀態
  createdAt: string;                            // 建立時間（ISO 8601）
  traveler?: {                                  // 旅客資訊
    id: string;                                 // 旅客 ID
    name: string;                               // 旅客名稱
  };
}

// ============ 服務訂單 ============

/**
 * 服務訂單
 *
 * 專員服務的訂單記錄
 */
export interface ServiceOrder {
  id: string;                                           // 訂單 ID
  userId: string;                                       // 用戶 ID
  type: string;                                         // 訂單類型
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'; // 訂單狀態
  verificationCode?: string;                            // 驗證碼
  createdAt: string;                                    // 建立時間（ISO 8601）
  updatedAt: string;                                    // 更新時間（ISO 8601）
}
