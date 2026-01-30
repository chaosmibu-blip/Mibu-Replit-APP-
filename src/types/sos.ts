/**
 * @fileoverview SOS 緊急求救系統型別定義
 *
 * 定義緊急求救相關的資料結構，包含：
 * - SOS 事件
 * - SOS 警報
 * - 緊急聯絡人
 *
 * @module types/sos
 */

// ============ SOS 事件 ============

/**
 * SOS 事件
 *
 * 緊急求救事件記錄
 */
export interface SosEvent {
  id: string;                                              // 事件 ID
  userId: string;                                          // 發起用戶 ID
  status: 'pending' | 'active' | 'resolved' | 'cancelled'; // 事件狀態
  locationLat?: number;                                    // 緯度
  locationLng?: number;                                    // 經度
  createdAt: string;                                       // 建立時間（ISO 8601）
  updatedAt: string;                                       // 更新時間（ISO 8601）
}

// ============ SOS 警報 ============

/**
 * SOS 警報狀態
 * - pending: 待處理
 * - acknowledged: 已確認
 * - resolved: 已解決
 * - cancelled: 已取消
 */
export type SosAlertStatus = 'pending' | 'acknowledged' | 'resolved' | 'cancelled';

/**
 * SOS 警報
 *
 * 緊急求救警報詳情
 */
export interface SosAlert {
  id: number;                      // 警報 ID
  userId: string;                  // 發起用戶 ID
  serviceOrderId: number | null;   // 關聯服務訂單 ID
  plannerId: number | null;        // 關聯策劃師 ID
  location: string | null;         // 位置座標（經緯度字串）
  locationAddress: string | null;  // 位置地址
  message: string | null;          // 求救訊息
  status: SosAlertStatus;          // 警報狀態
  acknowledgedBy: string | null;   // 確認者 ID
  acknowledgedAt: string | null;   // 確認時間（ISO 8601）
  resolvedAt: string | null;       // 解決時間（ISO 8601）
  createdAt: string;               // 建立時間（ISO 8601）
}

// ============ SOS 資格與發送 ============

/**
 * SOS 資格檢查
 *
 * 檢查用戶是否可以發送 SOS
 */
export interface SosEligibility {
  eligible: boolean;      // 是否有資格
  reason: string | null;  // 無資格時的原因
}

/**
 * 發送 SOS 參數
 * POST /api/sos/send
 */
export interface SosSendParams {
  serviceOrderId?: number;   // 關聯服務訂單 ID
  plannerId?: number;        // 關聯策劃師 ID
  location?: string;         // 位置座標
  locationAddress?: string;  // 位置地址
  message?: string;          // 求救訊息
}

/**
 * 發送 SOS 回應
 * POST /api/sos/send
 */
export interface SosSendResponse {
  success: boolean;  // 是否成功
  alertId: number;   // 警報 ID
  message: string;   // 回應訊息
}

/**
 * SOS 警報列表回應
 * GET /api/sos/alerts
 */
export interface SosAlertsResponse {
  alerts: SosAlert[];  // 警報列表
}

// ============ 緊急聯絡人 ============

/**
 * 緊急聯絡人
 *
 * 用戶設定的緊急聯絡人資訊
 */
export interface SOSContact {
  id: number;           // 聯絡人 ID
  name: string;         // 姓名
  phone: string;        // 電話號碼
  relationship?: string; // 關係（如：家人、朋友）
}

/**
 * 建立緊急聯絡人參數
 * POST /api/sos/contacts
 */
export interface CreateSOSContactParams {
  name: string;          // 姓名
  phone: string;         // 電話號碼
  relationship?: string; // 關係
}

/**
 * 更新緊急聯絡人參數
 * PUT /api/sos/contacts/:id
 */
export interface UpdateSOSContactParams {
  name?: string;         // 姓名
  phone?: string;        // 電話號碼
  relationship?: string; // 關係
}

/**
 * 緊急聯絡人列表回應
 * GET /api/sos/contacts
 */
export interface SOSContactsResponse {
  success: boolean;         // 是否成功
  contacts: SOSContact[];   // 聯絡人列表
}

/**
 * 單一緊急聯絡人回應
 */
export interface SOSContactResponse {
  success: boolean;       // 是否成功
  contact: SOSContact;    // 聯絡人資訊
}

/**
 * 刪除緊急聯絡人回應
 * DELETE /api/sos/contacts/:id
 */
export interface DeleteSOSContactResponse {
  success: boolean;  // 是否成功
  message: string;   // 回應訊息
}
