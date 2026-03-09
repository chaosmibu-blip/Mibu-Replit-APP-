/**
 * 動畫時間常數
 *
 * 統一管理全專案的動畫時間和自動消失延遲
 *
 * 更新日期：2026-03-09
 */

/** 轉場動畫時間（毫秒） */
export const AnimationTiming = {
  /** 快速轉場（按鈕回饋、選取效果） */
  quick: 200,
  /** 標準轉場（淡入淡出、Toast 動畫） */
  standard: 300,
  /** 較長動畫（骨架屏脈衝） */
  long: 600,
  /** 骨架屏脈衝循環 */
  skeletonPulse: 800,
} as const;

/** 自動消失延遲（毫秒） */
export const AutoDismiss = {
  /** Toast / Banner 自動消失（3 秒） */
  toast: 3000,
  /** 成功提示快速消失（2 秒） */
  quick: 2000,
  /** 較長提示（5 秒） */
  long: 5000,
} as const;
