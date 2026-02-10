/**
 * ============================================================
 * Cloudinary URL 工具函數 (cloudinary.ts)
 * ============================================================
 * 此模組提供: Cloudinary URL 的 transformation 參數注入
 *
 * 主要功能:
 * - 自動加入 w_{width},f_auto,q_auto 參數
 * - 非 Cloudinary URL 原樣回傳（安全）
 *
 * 更新日期：2026-02-10（初版，解決原圖載入浪費頻寬問題）
 */

/**
 * 為 Cloudinary URL 加入 transformation 參數（寬度 + 自動格式 + 自動品質）
 * - f_auto：自動選擇最佳格式（WebP/AVIF）
 * - q_auto：自動品質調整（省 30-50% 體積）
 * - w_{width}：指定寬度，高度等比例縮放
 *
 * @param url - 圖片 URL（Cloudinary 或其他）
 * @param width - 目標寬度（像素），不傳則只加 f_auto,q_auto
 * @returns 帶 transformation 的 URL，非 Cloudinary URL 原樣回傳
 */
export function cloudinaryUrl(url: string, width?: number): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  // 避免重複加 transformation（已經有 f_auto 就跳過）
  if (url.includes('/f_auto')) return url;

  const transform = width ? `w_${width},f_auto,q_auto` : 'f_auto,q_auto';
  return url.replace('/upload/', `/upload/${transform}/`);
}
