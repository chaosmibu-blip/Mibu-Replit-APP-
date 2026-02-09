/**
 * ============================================================
 * 素材資源型別定義 (asset.ts)
 * ============================================================
 * 對應後端 GET /api/assets?category=xxx
 * 用於頭像預設、成就圖片等 Cloudinary 託管素材
 */

/**
 * 後端素材資源
 * 對應 GET /api/assets?category=avatar_preset 回傳格式
 */
export interface AssetItem {
  id: number;
  code: string;       // 'avatar-chef', 'avatar-artist' 等
  name: string;       // '主廚', '藝術家' 等
  url: string;        // Cloudinary URL
  category?: string;
}

/**
 * 前端頭像選項（統一版）
 * 取代原本各畫面各自定義的 AvatarPreset
 */
export interface AvatarPreset {
  id: string;         // 前端短 ID（'chef'），對應 AsyncStorage 存的值
  code: string;       // 後端 code（'avatar-chef'），用於 API 比對
  name: string;       // 顯示名稱
  imageUrl: string;   // Cloudinary URL
  color: string;      // 背景色
}
