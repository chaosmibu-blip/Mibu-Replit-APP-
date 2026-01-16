# Mibu 前端 API 端點清單

> 產生時間：2025-12-22
> 用途：供後端比對確認所有端點是否對齊

## Base URL
```
https://gacha-travel--s8869420.replit.app
```

## 認證方式
```
Authorization: Bearer ${token}
```

---

## 認證相關

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| POST | `/api/auth/register` | 用戶註冊 | ❌ | |
| POST | `/api/auth/login` | 用戶登入 | ❌ | |
| GET | `/api/auth/user` | 取得當前用戶資訊 | ✅ | |
| POST | `/api/auth/switch-role` | 切換角色 | ✅ | |

### Request/Response Types

```typescript
// POST /api/auth/register
interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  role: 'traveler' | 'merchant' | 'specialist' | 'admin';
}

// POST /api/auth/login
interface LoginRequest {
  username: string;
  password: string;
}

// Response for both
interface AuthResponse {
  user: User;
  token: string;
}

interface User {
  id: string;
  name?: string;
  email: string | null;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  profileImageUrl?: string | null;
  role?: UserRole;
  activeRole?: UserRole;
  isApproved?: boolean;
  isSuperAdmin?: boolean;
  accessibleRoles?: string[];
  provider?: string | null;
  providerId?: string | null;
  isMerchant?: boolean;
  token?: string;
}
```

---

## 扭蛋相關

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| POST | `/api/gacha/itinerary/v3` | 生成行程（主要端點） | ✅ | |
| GET | `/api/gacha/pool?city=xxx` | 獎池預覽 | ❌ | |
| POST | `/api/gacha/pull` | 抽卡 | ❌ | |
| GET | `/api/rarity-config` | 取得稀有度機率設定 | ❌ | |

### Request/Response Types

```typescript
// POST /api/gacha/itinerary/v3
interface ItineraryV3Request {
  regionId?: number;
  city?: string;
  itemCount?: number;
  pace?: 'relaxed' | 'moderate' | 'packed';
}

interface ItineraryGenerateResponse {
  success?: boolean;
  itinerary?: ItineraryCard[];
  couponsWon?: CouponWon[];
  themeIntro?: string;
  meta?: ItineraryV3Meta;
  anchorDistrict?: string;
  pace?: string;
  totalPlaces?: number;
  totalCouponsWon?: number;
  categoryDistribution?: Record<string, number>;
  sortingMethod?: string;
  targetDistrict?: string;
  city?: string;
  country?: string;
  districtId?: number;
  error?: string;
  errorCode?: string;
  message?: string;
}

interface CouponWon {
  tier: 'SP' | 'SSR' | 'SR' | 'S' | 'R';
  placeName: string;
  couponName: string;
  inventoryId?: number;
}

// GET /api/rarity-config
interface RarityConfig {
  spRate: number;
  ssrRate: number;
  srRate: number;
  sRate: number;
  rRate: number;
}
```

---

## 地點資料

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| GET | `/api/locations/countries` | 取得國家列表 | ❌ | |
| GET | `/api/locations/regions/:countryId` | 取得區域列表 | ❌ | |
| GET | `/api/locations/districts/:regionId` | 取得地區列表 | ❌ | |

### Response Types

```typescript
interface Country {
  id: number;
  code: string;
  nameEn: string;
  nameZh: string;
  nameJa: string | null;
  nameKo: string | null;
}

interface Region {
  id: number;
  countryId: number;
  name?: string;
  nameEn: string;
  nameZh: string;
  nameJa: string | null;
  nameKo: string | null;
}

// GET /api/locations/countries
{ countries: Country[] }

// GET /api/locations/regions/:countryId
{ regions: Region[] }

// GET /api/locations/districts/:regionId
{ districts: { id: number; name: string; nameZh?: string; nameEn?: string; nameJa?: string; nameKo?: string }[]; count: number }
```

---

## 道具箱（Inventory）

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| GET | `/api/inventory` | 取得道具箱內容 | ✅ | |
| GET | `/api/inventory/:itemId` | 取得單一道具 | ✅ | |
| GET | `/api/inventory/config` | 取得道具箱設定（格數上限） | ❌ | |
| POST | `/api/inventory/:itemId/read` | 標記已讀 | ✅ | |
| DELETE | `/api/inventory/:itemId` | 刪除道具 | ✅ | |

### Response Types

```typescript
interface InventoryItem {
  id: number;
  userId: string;
  itemType: 'coupon' | 'ticket' | 'gift';
  title: string;
  description: string | null;
  merchantId: number | null;
  merchantName?: string;
  isRead: boolean;
  isRedeemed: boolean;
  expiresAt: string | null;
  createdAt: string;
  slotIndex: number;
  tier: 'SP' | 'SSR' | 'SR' | 'S' | 'R';
  status: 'active' | 'expired' | 'redeemed' | 'deleted';
  isExpired: boolean;
  isDeleted: boolean;
}

interface InventoryResponse {
  items: InventoryItem[];
  slotCount: number;
  maxSlots: number;
  isFull: boolean;
}

interface InventoryConfig {
  maxSlots: number;
}
```

---

## 圖鑑（Collection）

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| GET | `/api/collection/with-promo` | 取得圖鑑（含商家優惠狀態） | ✅ | |
| POST | `/api/collections` | 新增收藏 | ✅ | |

### Response Types

```typescript
interface CollectionWithPromo {
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

interface CollectionWithPromoResponse {
  collections: CollectionWithPromo[];
  grouped: Record<string, CollectionWithPromo[]>;
  hasPromoItems: boolean;
}
```

---

## 商家相關

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| GET | `/api/merchant/me` | 取得商家資訊 | ✅ | |
| POST | `/api/merchant/register` | 商家註冊 | ✅ | |
| POST | `/api/merchant/apply` | 商家申請 | ✅ | |
| GET | `/api/merchant/analytics` | 商家分析數據 | ✅ | |
| GET | `/api/merchant/daily-code` | 取得每日驗證碼 | ✅ | |
| POST | `/api/merchant/verify` | 驗證商家碼 | ✅ | |
| GET | `/api/merchant/credits` | 取得餘額 | ✅ | |
| POST | `/api/merchant/credits/purchase` | 購買點數 | ✅ | |
| GET | `/api/merchant/transactions` | 交易紀錄 | ✅ | |
| GET | `/api/merchant/places` | 商家店鋪列表 | ✅ | |
| GET | `/api/merchant/places/search?query=xxx` | 搜尋店鋪 | ✅ | |
| POST | `/api/merchant/places/claim` | 認領店鋪 | ✅ | |
| PUT | `/api/merchant/places/:linkId` | 更新店鋪 | ✅ | |
| GET | `/api/merchant/products` | 商品列表 | ✅ | |
| POST | `/api/merchant/products` | 新增商品 | ✅ | |
| PUT | `/api/merchant/products/:productId` | 更新商品 | ✅ | |
| DELETE | `/api/merchant/products/:productId` | 刪除商品 | ✅ | |
| GET | `/api/merchant/coupons` | 優惠券列表 | ✅ | |
| POST | `/api/merchant/coupons` | 新增優惠券 | ✅ | |
| PUT | `/api/merchant/coupons/:couponId` | 更新優惠券 | ✅ | |
| DELETE | `/api/merchant/coupons/:couponId` | 刪除優惠券 | ✅ | |

### Request/Response Types

```typescript
interface MerchantMe {
  id: number;
  userId: string;
  name?: string;
  email?: string;
  ownerName?: string;
  businessName?: string;
  taxId?: string;
  businessCategory?: string;
  address?: string;
  phone?: string;
  mobile?: string;
  contactEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  merchantLevel: 'free' | 'pro' | 'premium';
  isApproved: boolean;
  creditBalance: number;
  subscriptionPlan?: string;
  createdAt: string;
}

interface MerchantApplyParams {
  ownerName: string;
  businessName: string;
  taxId?: string;
  businessCategory: string;
  address: string;
  phone?: string;
  mobile: string;
  email: string;
}

interface MerchantAnalytics {
  success: boolean;
  merchant?: MerchantMe;
  analytics: {
    totalItineraryCards: number;
    totalCoupons: number;
    activeCoupons: number;
    couponRedemptions: number;
    dailyCollectionCount: number;
    totalCollectionUsers: number;
    collectionClickCount: number;
    couponUsageCount: number;
    couponUsageRate: number;
    prizePoolViews: number;
  };
  stats?: {
    totalCoupons: number;
    activeCoupons: number;
    redeemedCoupons: number;
    totalRedemptions: number;
    monthlyRedemptions: number;
    viewCount: number;
  };
  placeLinks?: {
    id: number;
    placeName: string;
    district?: string;
    city?: string;
    isVerified: boolean;
  }[];
}

interface MerchantCoupon {
  id: number;
  merchantId: number;
  name: string;
  tier: 'SP' | 'SSR' | 'SR' | 'S' | 'R';
  content: string;
  terms: string | null;
  quantity: number;
  remainingQuantity: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateMerchantCouponParams {
  name: string;
  tier: 'SP' | 'SSR' | 'SR' | 'S' | 'R';
  content: string;
  terms?: string;
  quantity: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}

interface MerchantPlace {
  id: number;
  linkId: string;
  merchantId: number;
  placeName: string;
  district?: string;
  city?: string;
  isVerified: boolean;
  createdAt: string;
}

interface MerchantProduct {
  id: number;
  merchantId: number;
  placeId?: number;
  name: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  isActive: boolean;
  createdAt: string;
}

interface MerchantCredits {
  creditBalance: number;
  merchantId: number;
}

interface MerchantDailyCode {
  code: string;
  expiresAt: string;
}

interface MerchantTransaction {
  id: number;
  merchantId: number;
  amount: number;
  type: 'purchase' | 'usage' | 'refund';
  description?: string;
  createdAt: string;
}
```

---

## 優惠券相關

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| GET | `/api/coupons/region/:regionId/pool` | 區域優惠券獎池 | ✅ | |
| GET | `/api/prize-pool/:regionId` | 獎池預覽 | ❌ | |

### Response Types

```typescript
interface RegionPoolCoupon {
  id: number;
  title: string;
  description: string | null;
  rarity: 'SP' | 'SSR';
  merchantName: string;
  discount: string | null;
  merchantId: number;
}

interface PrizePoolResponse {
  success: boolean;
  coupons: PrizePoolCoupon[];
  region: {
    id: number;
    name: string;
  };
}

interface PrizePoolCoupon {
  id: number;
  title: string;
  rarity: 'SP' | 'SSR';
  merchantId: string;
  placeLinkId: number;
  placeName: string;
}
```

---

## 專員相關

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| GET | `/api/specialist/me` | 取得專員資訊 | ✅ | |
| POST | `/api/specialist/register` | 專員註冊 | ✅ | |
| POST | `/api/specialist/toggle-online` | 切換上線狀態 | ✅ | |
| PATCH | `/api/specialist/availability` | 更新可用狀態 | ✅ | |
| GET | `/api/specialist/travelers` | 取得旅客列表 | ✅ | |
| GET | `/api/specialist/services` | 取得服務關係 | ✅ | |

### Response Types

```typescript
interface SpecialistInfo {
  id: number;
  userId: string;
  name: string;
  isOnline: boolean;
  isAvailable: boolean;
  serviceRegion?: string;
  currentTravelers?: number;
  maxTravelers?: number;
}

interface ServiceRelation {
  id: number;
  travelerId: string;
  specialistId: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  traveler?: {
    id: string;
    name: string;
  };
}
```

---

## 管理員相關

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| GET | `/api/admin/users` | 用戶列表 | ✅ | |
| GET | `/api/admin/users/pending` | 待審核用戶 | ✅ | |
| PATCH | `/api/admin/users/:userId/approve` | 審核用戶 | ✅ | |
| GET | `/api/admin/global-exclusions` | 全域排除列表 | ✅ | |
| POST | `/api/admin/global-exclusions` | 新增排除 | ✅ | |
| DELETE | `/api/admin/global-exclusions/:id` | 刪除排除 | ✅ | |
| GET | `/api/admin/place-drafts` | 店鋪草稿 | ✅ | |
| POST | `/api/admin/place-drafts` | 新增草稿 | ✅ | |
| DELETE | `/api/admin/place-drafts/:draftId` | 刪除草稿 | ✅ | |
| POST | `/api/admin/place-drafts/:draftId/publish` | 發布草稿 | ✅ | |
| GET | `/api/admin/announcements` | 公告列表 | ✅ | |
| POST | `/api/admin/announcements` | 新增公告 | ✅ | |
| PATCH | `/api/admin/announcements/:id` | 更新公告 | ✅ | |
| DELETE | `/api/admin/announcements/:id` | 刪除公告 | ✅ | |

### Response Types

```typescript
interface AdminUser {
  id: string;
  email: string | null;
  name?: string;
  role: UserRole;
  isApproved: boolean;
  createdAt: string;
}

interface GlobalExclusion {
  id: number;
  userId: null;
  placeName: string;
  district: string;
  city: string;
  penaltyScore: number;
  createdAt: string;
}

interface PlaceDraft {
  id: number;
  placeName: string;
  district?: string;
  city?: string;
  category?: string;
  submittedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

type AnnouncementType = 'announcement' | 'flash_event' | 'holiday_event';

interface Announcement {
  id: number;
  type: AnnouncementType;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateAnnouncementParams {
  type: AnnouncementType;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  priority?: number;
}
```

---

## SOS / 位置相關

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| GET | `/api/user/sos-link` | 取得 SOS 連結 | ✅ | |
| GET | `/api/sos/trigger?key=xxx` | 觸發 SOS | ❌ | |
| POST | `/api/location/update` | 更新位置 | ✅ | |

### Response Types

```typescript
type SosAlertStatus = 'pending' | 'acknowledged' | 'resolved' | 'cancelled';

interface SosAlert {
  id: number;
  userId: string;
  serviceOrderId: number | null;
  plannerId: number | null;
  location: string | null;
  locationAddress: string | null;
  message: string | null;
  status: SosAlertStatus;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

interface SosEligibility {
  eligible: boolean;
  reason: string | null;
}

interface SosSendParams {
  serviceOrderId?: number;
  plannerId?: number;
  location?: string;
  locationAddress?: string;
  message?: string;
}

interface SosSendResponse {
  success: boolean;
  alertId: number;
  message: string;
}
```

---

## 用戶個人資料

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| GET | `/api/user/profile` | 取得個人資料 | ✅ | |
| PATCH | `/api/user/profile` | 更新個人資料 | ✅ | |

### Response Types

```typescript
type Gender = 'male' | 'female' | 'other';
type Language = 'zh-TW' | 'en' | 'ja' | 'ko';

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: UserRole;
  gender: Gender | null;
  birthDate: string | null;
  phone: string | null;
  dietaryRestrictions: string[];
  medicalHistory: string[];
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  preferredLanguage: Language;
}

interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  birthDate?: string;
  phone?: string;
  dietaryRestrictions?: string[];
  medicalHistory?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  preferredLanguage?: Language;
}
```

---

## 其他端點

| 方法 | 端點 | 說明 | 認證 | 狀態 |
|------|------|------|------|------|
| GET | `/api/announcements` | 公告列表（公開） | ❌ | |
| GET | `/api/place/promo?xxx` | 店鋪優惠資訊 | ❌ | |
| POST | `/api/feedback/exclude` | 排除地點 | ❌ | |
| GET | `/api/chat/token` | 聊天 Token | ✅ | |
| GET | `/api/notifications` | 通知狀態 | ✅ | |
| POST | `/api/notifications/:type/seen` | 標記已讀 | ✅ | |
| GET | `/api/ads/placements?placement=xxx&platform=xxx` | 廣告位置 | ❌ | |

### Response Types

```typescript
interface NotificationStatus {
  itembox: number;
  collection: number;
}

type AdPlacement = 'gacha_start' | 'gacha_result' | 'collection_view' | 'item_use';

interface AdConfig {
  placementKey: string;
  adUnitIdIos: string;
  adUnitIdAndroid: string;
  adType: string;
  fallbackImageUrl: string | null;
  showFrequency: number;
}
```

---

## 統一錯誤處理

| 狀態碼 | 處理方式 |
|--------|----------|
| 401 | 執行登出並導向登入頁 |
| 400 | 顯示 Toast 錯誤訊息 |
| 500 | 顯示「系統錯誤，請稍後再試」|

---

## 比對說明

請後端在「狀態」欄位標記：
- ✅ 已對齊
- ❌ 需修改（請附註問題）
- 🆕 前端需要新增
- 🗑️ 已棄用

完成後請回傳給前端同步。
