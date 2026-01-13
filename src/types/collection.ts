/**
 * 收藏相關類型
 */

export interface CollectionItem {
  id: number;
  placeName: string;
  category: string;
  district: string;
  city: string;
  country: string;
  hasPromo: boolean;
  promoTitle?: string;
  promoDescription?: string;
  createdAt?: string;
}

export interface CollectionResponse {
  items: CollectionItem[];
  total: number;
}

export interface CollectionWithPromo {
  id: number;
  placeName: string;
  country: string;
  city: string;
  district: string;
  category: string;
  hasPromo: boolean;
  promoTitle: string | null;
  promoDescription: string | null;
}

export interface CollectionWithPromoResponse {
  collections: CollectionWithPromo[];
  grouped: Record<string, CollectionWithPromo[]>;
  hasPromoItems: boolean;
}

export interface AutoSaveCollectionResponse {
  success: boolean;
  isNew: boolean;
  hasPromo: boolean;
  promoTitle: string | null;
}
