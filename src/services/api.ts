import { API_BASE_URL } from '../constants/translations';
import { Country, Region, User, GachaItem, Language, GachaPoolResponse, GachaPullPayload, GachaPullResponse, GlobalExclusion, AuthResponse, UserRole, MerchantDailyCode, MerchantCredits, SpecialistInfo, ServiceRelation, MerchantMe, MerchantTransaction, MerchantPlace, MerchantProduct, PlaceSearchResult, AdminUser, PlaceDraft, Announcement, AnnouncementsResponse, CreateAnnouncementParams, UpdateAnnouncementParams, RegionPoolCoupon, InventoryItem, InventoryResponse, InventoryConfig, RarityConfig, RedeemResponse, CollectionWithPromoResponse, AutoSaveCollectionResponse, AdConfig, NotificationStatus, MerchantRedemptionCode, AdPlacement, ItineraryGenerateResponse, UserProfile, UpdateProfileParams, ProfileResponse, SosEligibility, SosSendParams, SosSendResponse, SosAlertsResponse, SosAlert, MerchantApplyParams, MerchantApplyResponse, MerchantAnalytics, MerchantCoupon, MerchantCouponsResponse, CreateMerchantCouponParams, UpdateMerchantCouponParams, AnnouncementType, PrizePoolResponse, UnreadCounts, CollectionItem, CollectionResponse } from '../types';
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
  }, token?: string): Promise<ItineraryGenerateResponse> {
    const url = `${this.baseUrl}/api/gacha/itinerary`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
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

  async switchRole(token: string, role: UserRole): Promise<{ user: User; activeRole: string }> {
    return this.request<{ user: User; activeRole: string }>('/api/auth/switch-role', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
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
      method: 'GET',
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

  async updateSpecialistAvailability(token: string, isAvailable: boolean): Promise<{ specialist: SpecialistInfo }> {
    return this.request<{ specialist: SpecialistInfo }>('/api/specialist/availability', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ isAvailable }),
    });
  }

  async getSpecialistTravelers(token: string): Promise<{ travelers: Array<{ serviceRelation: ServiceRelation; traveler: { id: string; firstName: string; lastName: string } }> }> {
    return this.request('/api/specialist/travelers', {
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

  async getMerchantMe(token: string): Promise<MerchantMe> {
    return this.request<MerchantMe>('/api/merchant/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async registerMerchant(token: string, params: {
    businessName: string;
    contactEmail?: string;
  }): Promise<{ merchant: MerchantMe }> {
    return this.request('/api/merchant/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async verifyMerchantCode(token: string, merchantId: number, code: string): Promise<{ valid: boolean; merchant?: any; error?: string }> {
    return this.request('/api/merchant/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ merchantId, code }),
    });
  }

  async getMerchantTransactions(token: string): Promise<{ transactions: MerchantTransaction[] }> {
    return this.request('/api/merchant/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async searchMerchantPlaces(token: string, query: string): Promise<{ places: PlaceSearchResult[] }> {
    return this.request(`/api/merchant/places/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async claimMerchantPlace(token: string, placeId: string): Promise<{ place: MerchantPlace }> {
    return this.request('/api/merchant/places/claim', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ placeId }),
    });
  }

  async getMerchantPlaces(token: string): Promise<{ places: MerchantPlace[] }> {
    return this.request('/api/merchant/places', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateMerchantPlace(token: string, linkId: string, params: Partial<MerchantPlace>): Promise<{ place: MerchantPlace }> {
    return this.request(`/api/merchant/places/${linkId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async getMerchantProducts(token: string): Promise<{ products: MerchantProduct[] }> {
    return this.request('/api/merchant/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async createMerchantProduct(token: string, params: {
    name: string;
    description?: string;
    price?: number;
    discountPrice?: number;
    placeId?: number;
  }): Promise<{ product: MerchantProduct }> {
    return this.request('/api/merchant/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async updateMerchantProduct(token: string, productId: number, params: Partial<MerchantProduct>): Promise<{ product: MerchantProduct }> {
    return this.request(`/api/merchant/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async deleteMerchantProduct(token: string, productId: number): Promise<{ success: boolean }> {
    return this.request(`/api/merchant/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async registerSpecialist(token: string, params: {
    serviceRegion?: string;
  }): Promise<{ specialist: SpecialistInfo }> {
    return this.request('/api/specialist/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  // Merchant Apply & Analytics
  async applyMerchant(token: string, params: MerchantApplyParams): Promise<MerchantApplyResponse> {
    return this.request('/api/merchant/apply', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async getMerchantAnalytics(token: string): Promise<MerchantAnalytics> {
    return this.request('/api/merchant/analytics', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Merchant Coupons CRUD
  async getMerchantCoupons(token: string): Promise<MerchantCouponsResponse> {
    return this.request('/api/merchant/coupons', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async createMerchantCoupon(token: string, params: CreateMerchantCouponParams): Promise<{ success: boolean; coupon: MerchantCoupon }> {
    return this.request('/api/merchant/coupons', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async updateMerchantCoupon(token: string, couponId: number, params: UpdateMerchantCouponParams): Promise<{ success: boolean; coupon: MerchantCoupon }> {
    return this.request(`/api/merchant/coupons/${couponId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async deleteMerchantCoupon(token: string, couponId: number): Promise<{ success: boolean }> {
    return this.request(`/api/merchant/coupons/${couponId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getAdminUsers(token: string): Promise<{ users: AdminUser[] }> {
    return this.request('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getAdminPendingUsers(token: string): Promise<{ users: AdminUser[] }> {
    return this.request('/api/admin/users/pending', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async approveUser(token: string, userId: string, isApproved: boolean): Promise<{ user: AdminUser }> {
    return this.request(`/api/admin/users/${userId}/approve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ isApproved }),
    });
  }

  async getPlaceDrafts(token: string): Promise<{ drafts: PlaceDraft[] }> {
    return this.request('/api/admin/place-drafts', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async createPlaceDraft(token: string, params: {
    placeName: string;
    district?: string;
    city?: string;
    category?: string;
  }): Promise<{ draft: PlaceDraft }> {
    return this.request('/api/admin/place-drafts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async deletePlaceDraft(token: string, draftId: number): Promise<{ success: boolean }> {
    return this.request(`/api/admin/place-drafts/${draftId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async publishPlaceDraft(token: string, draftId: number): Promise<{ success: boolean }> {
    return this.request(`/api/admin/place-drafts/${draftId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getAnnouncements(): Promise<AnnouncementsResponse> {
    return this.request<AnnouncementsResponse>('/api/announcements');
  }

  async getAdminAnnouncements(token: string): Promise<AnnouncementsResponse> {
    return this.request<AnnouncementsResponse>('/api/admin/announcements', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async createAnnouncement(token: string, params: CreateAnnouncementParams): Promise<{ success: boolean; announcement: Announcement }> {
    return this.request('/api/admin/announcements', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async updateAnnouncement(token: string, id: number, params: UpdateAnnouncementParams): Promise<{ success: boolean; announcement: Announcement }> {
    return this.request(`/api/admin/announcements/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async deleteAnnouncement(token: string, id: number): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getRegionCouponPool(token: string, regionId: number): Promise<RegionPoolCoupon[]> {
    return this.request<RegionPoolCoupon[]>(`/api/coupons/region/${regionId}/pool`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Ads API
  async getAdPlacement(placement: AdPlacement, platform: 'ios' | 'android' | 'web'): Promise<{ ad: AdConfig | null }> {
    return this.request<{ ad: AdConfig | null }>(`/api/ads/placements?placement=${placement}&platform=${platform}`);
  }

  // Notifications API
  async getNotifications(token: string): Promise<{ notifications: NotificationStatus }> {
    return this.request<{ notifications: NotificationStatus }>('/api/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async markNotificationSeen(token: string, type: 'itembox' | 'collection'): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notifications/${type}/seen`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Inventory / Itembox API
  async getInventory(token: string): Promise<InventoryResponse> {
    return this.request<InventoryResponse>('/api/inventory', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getInventoryItem(token: string, itemId: number): Promise<{ item: InventoryItem }> {
    return this.request<{ item: InventoryItem }>(`/api/inventory/${itemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getInventoryConfig(): Promise<InventoryConfig> {
    return this.request<InventoryConfig>('/api/inventory/config');
  }

  async getRarityConfig(): Promise<{ config: RarityConfig }> {
    return this.request<{ config: RarityConfig }>('/api/rarity-config');
  }

  async markInventoryItemRead(token: string, itemId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/inventory/${itemId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async deleteInventoryItem(token: string, itemId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/inventory/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async redeemInventoryItem(token: string, itemId: number, redemptionCode: string): Promise<RedeemResponse> {
    return this.request<RedeemResponse>(`/api/inventory/${itemId}/redeem`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ redemptionCode }),
    });
  }

  // Collection with Promo API
  async getCollectionWithPromo(token: string): Promise<CollectionWithPromoResponse> {
    return this.request<CollectionWithPromoResponse>('/api/collection/with-promo', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async autoSaveToCollection(token: string, params: {
    placeName: string;
    country: string;
    city: string;
    district: string;
    category: string;
    description?: string;
  }): Promise<AutoSaveCollectionResponse> {
    return this.request<AutoSaveCollectionResponse>('/api/collection/auto-save', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  // Merchant Redemption Code API
  async getMerchantRedemptionCode(token: string): Promise<MerchantRedemptionCode> {
    return this.request<MerchantRedemptionCode>('/api/merchant/redemption-code', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Profile APIs
  async getProfile(token: string): Promise<UserProfile> {
    return this.request<UserProfile>('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateProfile(token: string, params: UpdateProfileParams): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('/api/profile', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async logout(token: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // SOS APIs
  async getSosEligibility(token: string): Promise<SosEligibility> {
    return this.request<SosEligibility>('/api/sos/eligibility', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async sendSosAlert(token: string, params: SosSendParams): Promise<SosSendResponse> {
    return this.request<SosSendResponse>('/api/sos/alert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async getSosAlerts(token: string): Promise<SosAlertsResponse> {
    return this.request<SosAlertsResponse>('/api/sos/alerts', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async cancelSosAlert(token: string, alertId: number): Promise<{ success: boolean; alert: SosAlert }> {
    return this.request<{ success: boolean; alert: SosAlert }>(`/api/sos/alerts/${alertId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // ============================================
  // 公告 API
  // ============================================
  async getAnnouncementsByType(type?: AnnouncementType): Promise<AnnouncementsResponse> {
    const url = type ? `/api/announcements?type=${type}` : '/api/announcements';
    return this.request<AnnouncementsResponse>(url);
  }

  // ============================================
  // 獎池 API
  // ============================================
  async getPrizePool(regionId: number): Promise<PrizePoolResponse> {
    return this.request<PrizePoolResponse>(`/api/gacha/prize-pool?regionId=${regionId}`);
  }

  // ============================================
  // 未讀計數 API
  // ============================================
  async getUnreadCounts(token: string): Promise<UnreadCounts> {
    return this.request<UnreadCounts>('/api/user/unread-counts', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const apiService = new ApiService();
