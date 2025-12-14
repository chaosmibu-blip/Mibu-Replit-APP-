import { API_BASE_URL } from '../constants/translations';
import { Country, Region, User, GachaItem, Language } from '../types';
import { Platform } from 'react-native';

class ApiService {
  private baseUrl = API_BASE_URL;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async getCountries(): Promise<Country[]> {
    const data = await this.request<{ countries: Country[] }>('/api/locations/countries');
    return data.countries || [];
  }

  async getRegions(countryId: number): Promise<Region[]> {
    const data = await this.request<{ regions: Region[] }>(`/api/locations/regions/${countryId}`);
    return data.regions || [];
  }

  async getDistricts(regionId: number): Promise<{ count: number }> {
    const data = await this.request<{ districts: any[]; count?: number }>(`/api/locations/districts/${regionId}`);
    return { count: data.districts?.length || data.count || 0 };
  }

  async generateItinerary(params: {
    countryId: number;
    regionId: number;
    language: Language;
    itemCount: number;
  }): Promise<{ itinerary: any }> {
    return this.request('/api/gacha/itinerary', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await this.request<User>('/api/auth/user');
      return data;
    } catch {
      return null;
    }
  }

  async saveToCollection(item: Partial<GachaItem>): Promise<void> {
    await this.request('/api/collections', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async excludePlace(params: {
    placeName: string;
    district: string;
    city: string;
    placeCacheId?: string | null;
  }): Promise<void> {
    await this.request('/api/feedback/exclude', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getPlacePromo(params: {
    placeId?: string;
    placeName?: string;
    district?: string;
    city?: string;
  }): Promise<{ promo: any | null }> {
    const queryParams = new URLSearchParams();
    if (params.placeId) queryParams.append('placeId', params.placeId);
    if (params.placeName) queryParams.append('placeName', params.placeName);
    if (params.district) queryParams.append('district', params.district);
    if (params.city) queryParams.append('city', params.city);
    
    return this.request(`/api/place/promo?${queryParams}`);
  }

  async searchPlaces(query: string): Promise<{ places: PlaceSearchResult[] }> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    return this.request(`/api/places/search?${queryParams}`);
  }

  async claimPlace(params: {
    placeId: string;
    placeName: string;
    address: string;
    category?: string;
  }): Promise<{ success: boolean; claimId: string }> {
    const response = await fetch(`${this.baseUrl}/api/merchant/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (response.status === 409) {
      const error = new Error('Place already claimed') as any;
      error.status = 409;
      throw error;
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async disputeClaim(params: {
    placeId: string;
    placeName: string;
    reason?: string;
  }): Promise<{ success: boolean; disputeId: string }> {
    return this.request('/api/merchant/claim/dispute', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getCategories(): Promise<{ categories: CategoryItem[] }> {
    return this.request('/api/categories');
  }

  async createManualPlace(params: {
    name: string;
    address: string;
    category: string;
  }): Promise<{ success: boolean; placeId: string }> {
    return this.request('/api/merchant/places', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  types: string[];
  primaryType?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  nameZh?: string;
  nameEn?: string;
  nameJa?: string;
  nameKo?: string;
}

export const apiService = new ApiService();
