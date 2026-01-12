/**
 * 廣告相關類型
 */

export type AdPlacement = 'gacha_start' | 'gacha_result' | 'collection_view' | 'item_use';

export interface AdConfig {
  placementKey: string;
  adUnitIdIos: string;
  adUnitIdAndroid: string;
  adType: string;
  fallbackImageUrl: string | null;
  showFrequency: number;
}
