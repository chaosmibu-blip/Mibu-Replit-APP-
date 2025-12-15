import { API_BASE_URL } from '../constants/translations';
import { Country, Region, User, GachaItem, Language, GachaPoolResponse, GachaPullPayload, GachaPullResponse, GlobalExclusion, AuthResponse, UserRole, MerchantDailyCode, MerchantCredits, SpecialistInfo, ServiceRelation } from '../types';
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

  async getDistricts(regionId: number): Promise<{ count: number; districts: { id: number; name: string; nameZh?: string; nameEn?: string; nameJa?: string; nameKo?: string }[] }> {
    const data = await this.request<{ districts: any[]; count?: number }>(`/api/locations/districts/${regionId}`);
    return { 
      count: data.districts?.length || data.count || 0,
      districts: data.districts || []
    };
  }

  async generateItinerary(params: {
    countryId: number;
    regionId: number;
    language: Language;
    itemCount: number;
  }): Promise<{ itinerary?: any; meta?: { code?: string }; error?: string; success?: boolean }> {
    const url = `${this.baseUrl}/api/gacha/itinerary`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    const data = await response.json();
    return data;
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

  async getGachaPool(city: string, district?: string): Promise<GachaPoolResponse> {
    try {
      const path = district 
        ? `/api/gacha/pool/${encodeURIComponent(city)}/${encodeURIComponent(district)}`
        : `/api/gacha/pool/${encodeURIComponent(city)}`;
      const data = await this.request<GachaPoolResponse>(path);
      return data;
    } catch (error) {
      console.error('Failed to get gacha pool:', error);
      throw error;
    }
  }

  async pullGacha(payload: GachaPullPayload): Promise<GachaPullResponse> {
    try {
      const data = await this.request<GachaPullResponse>('/api/gacha/pull', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      console.error('Failed to pull gacha:', error);
      throw error;
    }
  }

  async getGlobalExclusions(token: string): Promise<GlobalExclusion[]> {
    try {
      const data = await this.request<{ exclusions: GlobalExclusion[] }>('/api/admin/global-exclusions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return data.exclusions || [];
    } catch (error) {
      console.error('Failed to get global exclusions:', error);
      throw error;
    }
  }

  async addGlobalExclusion(token: string, params: {
    placeName: string;
    district: string;
    city: string;
  }): Promise<GlobalExclusion> {
    const data = await this.request<{ success: boolean; exclusion: GlobalExclusion }>('/api/admin/global-exclusions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    return data.exclusion;
  }

  async removeGlobalExclusion(token: string, id: number): Promise<void> {
    await this.request(`/api/admin/global-exclusions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async register(params: {
    username: string;
    password: string;
    name: string;
    role: UserRole;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getUserWithToken(token: string): Promise<User> {
    return this.request<User>('/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getMerchantDailyCode(token: string): Promise<MerchantDailyCode> {
    return this.request<MerchantDailyCode>('/api/merchant/daily-code', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getMerchantCredits(token: string): Promise<MerchantCredits> {
    return this.request<MerchantCredits>('/api/merchant/credits', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async purchaseCredits(token: string, amount: number, provider: 'stripe' | 'recur' = 'stripe'): Promise<{ 
    transactionId: number;
    amount: number;
    provider: 'stripe' | 'recur';
    checkoutUrl: string | null;
    status: string;
    message: string;
  }> {
    return this.request('/api/merchant/credits/purchase', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, provider }),
    });
  }

  async getChatToken(token: string): Promise<{ token: string; identity: string }> {
    return this.request<{ token: string; identity: string }>('/api/chat/token', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getSpecialistMe(token: string): Promise<SpecialistInfo> {
    return this.request<SpecialistInfo>('/api/specialist/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async toggleSpecialistOnline(token: string): Promise<{ specialist: SpecialistInfo }> {
    return this.request<{ specialist: SpecialistInfo }>('/api/specialist/toggle-online', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getSpecialistServices(token: string): Promise<{ relations: ServiceRelation[] }> {
    return this.request<{ relations: ServiceRelation[] }>('/api/specialist/services', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const apiService = new ApiService();
