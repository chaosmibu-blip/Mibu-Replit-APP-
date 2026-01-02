# Memory: API Client (API 串接)

## 後端基本資訊

- **開發環境**: `https://591965a7-25f6-479c-b527-3890b1193c21-00-1m08cwv9a4rev.picard.replit.dev`
- **生產環境**: `https://gacha-travel--s8869420.replit.app`
- **認證方式**: Bearer Token (`Authorization: Bearer ${token}`)
- **Content-Type**: `application/json`

### 環境切換注意事項（2025-01-02 更新）

| 開發方式 | 環境變數來源 | 說明 |
|----------|-------------|------|
| **Expo Go** | 即時讀取 | 每次啟動都會讀取最新的 `EXPO_PUBLIC_API_URL` |
| **Development Build** | 編譯時固定 | 環境變數在 `eas build` 時就被打包，之後不會改變 |
| **Production Build** | 編譯時固定 | 同上 |

**重要**：如果 Development Build 連接到錯誤的環境，需要重新執行 `eas build` 重新編譯。

**用戶偏好**：預設連接開發環境，只有明確指示要打包 App 時才切換到生產環境。

---

## 景點類別定義（七大類）

> ⚠️ 2025-12-30 更新：「活動」類別已移除

```typescript
export const MIBU_CATEGORIES = ['美食', '住宿', '景點', '購物', '娛樂設施', '生態文化教育', '遊程體驗'] as const;
export type MibuCategory = typeof MIBU_CATEGORIES[number];
```

| 中文 | 英文 | 日文 | 韓文 |
|------|------|------|------|
| 美食 | Food | グルメ | 맛집 |
| 住宿 | Stay | 宿泊 | 숙박 |
| 景點 | Scenery | 観光 | 관광 |
| 購物 | Shopping | ショッピング | 쇼핑 |
| 娛樂設施 | Entertainment | エンタメ | 엔터테인먼트 |
| 生態文化教育 | Eco-Culture | エコ文化 | 에코문화 |
| 遊程體驗 | Experience | 体験 | 체험 |

---

## 錯誤處理策略（2025-01-02 更新）

### 靜默處理的錯誤類型
當用戶在 API 請求進行中離開 App，會觸發以下錯誤，應靜默處理不顯示彈窗：

| 錯誤訊息 | 原因 |
|----------|------|
| `Network request failed` | 網路請求被中斷 |
| `AbortError` | 請求被主動取消 |
| `cancelled` | 請求被取消 |

### 實作範例
```typescript
catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isUserAbort = errorMessage.includes('Network request failed') || 
                      errorMessage.includes('AbortError') ||
                      errorMessage.includes('cancelled');
  
  if (isUserAbort) {
    console.log('Request cancelled (user left app)');
    setShowLoadingAd(false);
    return;
  }
  
  // 其他錯誤才顯示彈窗
  Alert.alert(...);
}
```

---

## 廢棄 API（請勿使用）

| 廢棄 API | 替代 API | 原因 |
|----------|----------|------|
| POST /api/generate-itinerary | POST /api/gacha/itinerary/v3 | Legacy 端點 |
| POST /api/gacha/itinerary | POST /api/gacha/itinerary/v3 | V1 舊版 |
| POST /api/gacha/pull | POST /api/gacha/pull/v3 | V1 舊版 |
| POST /api/gacha/pull/v2 | POST /api/gacha/pull/v3 | V2 舊版 |
| GET /api/gacha/pool/:city/:district | GET /api/gacha/pool | 過於細分 |

---

## 重要數值

| 項目 | 值 |
|------|-----|
| 每日抽卡上限 | 36 次 |
| 背包容量 | 30 格 |
| JWT 有效期 | 7 天 |
| 抽卡數量範圍 | 1-15 (預設 7) |

### 優惠券稀有度機率
| 稀有度 | 機率 |
|--------|------|
| R | 32% |
| S | 23% |
| SR | 15% |
| SSR | 8% |
| SP | 2% |

---

## API 端點對應表

### 認證 API
| 方法 | 端點 | 說明 | 需認證 |
|------|------|------|--------|
| POST | `/api/auth/apple` | Apple 登入 | ❌ |
| GET | `/api/auth/user` | 取得當前用戶 | ✅ |
| POST | `/api/auth/logout` | 登出 | ✅ |

### 扭蛋 (Gacha) ⭐ 核心功能
| 方法 | 端點 | 說明 | 需認證 |
|------|------|------|--------|
| POST | `/api/gacha/itinerary/v3` | 抽取行程 | ✅ |
| GET | `/api/gacha/quota` | 查詢每日剩餘額度 | ✅ |

### 背包 (Inventory)
| 方法 | 端點 | 說明 | 需認證 |
|------|------|------|--------|
| GET | `/api/inventory` | 列出背包物品 | ✅ |
| POST | `/api/inventory/add` | 加入物品 | ✅ |
| DELETE | `/api/inventory/:id` | 移除物品 | ✅ |
| GET | `/api/inventory/count` | 物品數量 | ✅ |

### 地區
| 方法 | 端點 | 說明 | 需認證 |
|------|------|------|--------|
| GET | `/api/countries` | 國家列表 | ❌ |
| GET | `/api/regions/:countryId` | 縣市列表 | ❌ |
| GET | `/api/districts/:regionId` | 區域列表 | ❌ |

### 通知
| 方法 | 端點 | 說明 | 需認證 |
|------|------|------|--------|
| GET | `/api/notifications` | 通知列表 | ✅ |
| POST | `/api/notifications/:id/read` | 標記已讀 | ✅ |
| POST | `/api/notifications/read-all` | 全部已讀 | ✅ |

### 優惠券
| 方法 | 端點 | 說明 | 需認證 |
|------|------|------|--------|
| GET | `/api/coupons/my` | 我的優惠券 | ✅ |

### 設定 / 機率
| 方法 | 端點 | 說明 | 需認證 |
|------|------|------|--------|
| GET | `/api/rarity-config` | 優惠券稀有度機率設定 (Apple 審核必要) | ❌ |

### 其他設定
| 方法 | 端點 | 說明 | 需認證 |
|------|------|------|--------|
| GET | `/api/config/mapbox` | Mapbox Token | ❌ |

---

## 請求/回應格式

### 扭蛋請求 (POST /api/gacha/itinerary/v3)
```typescript
// Request
{
  regionId: number;       // 縣市 ID (必填)
  itemCount?: number;     // 抽取數量 1-15，預設 7
}

// Response (成功)
{
  success: boolean;
  places: Array<{
    id: number;
    placeName: string;
    city: string;
    district: string;
    category: string;      // 食、遊、購、宿、行
    address?: string;
    locationLat?: number;
    locationLng?: number;
    googleRating?: number;
  }>;
  couponsWon: Array<{
    id: number;
    title: string;
    rarity: 'R' | 'S' | 'SR' | 'SSR' | 'SP';
  }>;
  meta: {
    city: string;
    anchorDistrict: string;
    totalPlaces: number;
    dailyPullCount: number;
    remainingQuota: number;
    requestedCount: number;      // 用戶請求張數（如 12）
    isShortfall: boolean;        // true = 景點不足
    shortfallMessage: string;    // "內湖區目前只有 8 個景點，我們正在努力擴充中！"
  };
}

// Response (錯誤)
{
  success: false;
  error: "今日抽卡次數已達上限，請明天再來！";
  code: "DAILY_LIMIT_EXCEEDED";
  remainingQuota: 0;
}
```

### 每日額度查詢 (GET /api/gacha/quota)
```typescript
// Response
{
  dailyLimit: 36;
  currentCount: 12;
  remainingQuota: 24;
}
```

### 國家/地區回應
```typescript
// GET /api/countries
{
  countries: [{
    id: number;
    code: string;
    nameEn: string;
    nameZh: string;
    nameJa: string;
    nameKo: string;
  }]
}

// GET /api/regions/:countryId
{
  regions: [{
    id: number;
    countryId: number;
    nameEn: string;
    nameZh: string;
    nameJa: string;
    nameKo: string;
  }]
}

// GET /api/districts/:regionId
{
  districts: [{
    id: number;
    regionId: number;
    nameEn: string;
    nameZh: string;
  }]
}
```

---

## TypeScript Interfaces

```typescript
// 用戶
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'merchant' | 'specialist' | 'admin';
  profileImageUrl?: string;
}

// 景點
interface Place {
  id: number;
  placeName: string;
  city: string;
  district?: string;
  category: string;
  subcategory?: string;
  address?: string;
  locationLat?: number;
  locationLng?: number;
  googleRating?: number;
  googlePlaceId?: string;
}

// 優惠券
interface Coupon {
  id: number;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'freebie';
  discountValue: number;
  rarity: 'R' | 'S' | 'SR' | 'SSR' | 'SP';
  validFrom: string;
  validUntil: string;
  code: string;
}

// 背包物品
interface InventoryItem {
  id: number;
  itemType: 'place' | 'coupon';
  itemId: number;
  addedAt: string;
  expiresAt?: string;
  isUsed: boolean;
  place?: Place;
  coupon?: Coupon;
}

// 通知
interface Notification {
  id: number;
  type: 'system' | 'coupon' | 'trip' | 'sos';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

// 地區
interface Country {
  id: number;
  nameZh: string;
  nameEn: string;
  code: string;
}

interface Region {
  id: number;
  countryId: number;
  nameZh: string;
  nameEn: string;
}

interface District {
  id: number;
  regionId: number;
  nameZh: string;
  nameEn: string;
}
```

---

## 錯誤處理

### 錯誤格式
```typescript
interface ApiError {
  error: string;      // 人類可讀訊息
  code?: string;      // 機器可讀代碼
  details?: any;
}
```

### 常見錯誤碼
| HTTP | Code | 說明 | 前端處理 |
|------|------|------|----------|
| 401 | `UNAUTHORIZED` | 未登入或 Token 過期 | 導向登入頁 |
| 403 | `FORBIDDEN` | 無權限 | 顯示提示 |
| 429 | `DAILY_LIMIT_EXCEEDED` | 每日抽卡已達上限 | 顯示明天再來 |
| 400 | `REGION_NOT_FOUND` | 找不到區域 | 重新選擇 |
| 200 | `NO_PLACES_AVAILABLE` | 該區域無景點 | 顯示提示 |

### 錯誤處理範例
```typescript
const handleApiError = (response: Response, data: any) => {
  if (response.status === 401) {
    // Token 過期，重新登入
    logout();
    return;
  }
  
  if (data.code === 'DAILY_LIMIT_EXCEEDED') {
    Alert.alert('今日額度已用完', '請明天再來抽卡！');
    return;
  }
  
  if (data.code === 'NO_PLACES_AVAILABLE') {
    Alert.alert('目前無景點', data.meta?.message || '請選擇其他區域');
    return;
  }
  
  // 通用錯誤
  Alert.alert('發生錯誤', data.error || '請稍後再試');
};
```

---

## 分頁參數

```typescript
// 請求
GET /api/xxx?page=1&limit=20

// 回應
{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

---

## 待補充
- [x] 每日額度 API
- [x] 背包 API
- [x] 通知 API
- [ ] API 速率限制
- [ ] 離線處理
