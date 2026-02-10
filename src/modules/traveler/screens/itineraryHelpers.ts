/**
 * ============================================================
 * 行程畫面輔助函數 (itineraryHelpers.ts)
 * ============================================================
 * 從 ItineraryScreenV2.tsx 拆出的工具函數。
 *
 * 主要功能：
 * - 景點座標/名稱/描述/分類的取得（支援新舊 API 結構）
 * - Google Maps 導航
 *
 * 更新日期：2026-02-10（從主檔拆出）
 */
import { Linking } from 'react-native';
import type { ItineraryPlaceItem } from '../../../types/itinerary';

/**
 * 在 Google Maps 中查看景點
 * 用名稱搜尋，如果有經緯度會加上座標讓搜尋更精確
 * @param name 景點名稱
 * @param lat 緯度（可選）
 * @param lng 經度（可選）
 */
export const openInGoogleMaps = (name: string, lat?: number | null, lng?: number | null) => {
  let url: string;
  if (lat && lng) {
    // 有經緯度：用名稱 + 座標搜尋，精確定位到該地點
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}+${lat},${lng}`;
  } else {
    // 沒有經緯度：只用名稱搜尋
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
  }
  Linking.openURL(url).catch(err => console.warn('無法開啟 Google Maps:', err));
};

/**
 * 取得景點的座標
 * 支援新舊 API 回應結構
 */
export const getPlaceCoords = (place: ItineraryPlaceItem) => {
  const lat = place.locationLat ?? place.place?.locationLat;
  const lng = place.locationLng ?? place.place?.locationLng;
  return { lat, lng };
};

/**
 * 取得景點的描述
 * 支援新舊 API 回應結構
 */
export const getPlaceDescription = (place: ItineraryPlaceItem) => {
  return place.description ?? place.place?.description;
};

/**
 * 取得景點的名稱
 * 支援新舊 API 回應結構
 */
export const getPlaceName = (place: ItineraryPlaceItem, fallback = '') => {
  return place.name ?? place.place?.name ?? fallback;
};

/**
 * 取得景點的分類（支援新舊結構）
 */
export const getPlaceCategory = (place: ItineraryPlaceItem) => {
  return place.category ?? place.place?.category ?? 'other';
};

/** Mini AI 助手頭像 URL（Cloudinary 託管） */
export const MINI_AVATAR_URL = 'https://res.cloudinary.com/dgts6a89y/image/upload/f_auto,q_auto,w_128/v1770652592/mibu/ai-chat/mini-avatar.png';
