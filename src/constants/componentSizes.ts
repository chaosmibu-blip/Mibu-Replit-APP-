/**
 * 元件尺寸常數
 *
 * 統一管理全專案的固定元件尺寸
 * 避免魔術數字散落各處
 *
 * 更新日期：2026-03-09
 */

export const ComponentSize = {
  /** 最小觸控區域（Apple HIG / Material Design 標準） */
  touchTarget: 44,
  /** 一般圖示按鈕尺寸 */
  iconButton: 40,
  /** 大圖示 */
  iconLarge: 64,
  /** 輸入框高度 */
  inputHeight: 48,
  /** 頭像尺寸（個人資料頁） */
  avatarLarge: 100,
  /** 頭像尺寸（列表/小圖） */
  avatarSmall: 52,
} as const;
