/**
 * 通用基礎類型
 */

export enum Category {
  Food = 'Food',
  Stay = 'Stay',
  Education = 'Education',
  Entertainment = 'Entertainment',
  Scenery = 'Scenery',
  Shopping = 'Shopping',
}

export const MIBU_CATEGORIES = ['美食', '住宿', '景點', '購物', '娛樂設施', '生態文化教育', '遊程體驗'] as const;
export type MibuCategory = typeof MIBU_CATEGORIES[number];

export type Language = 'zh-TW' | 'en' | 'ja' | 'ko';
export type LocalizedContent = string | { [key in Language]?: string };

export type PlanTier = 'free' | 'partner' | 'premium';
export type UserRole = 'traveler' | 'merchant' | 'specialist' | 'admin';

export type CouponTier = 'SP' | 'SSR' | 'SR' | 'S' | 'R';
export type CouponRarity = 'SP' | 'SSR';
