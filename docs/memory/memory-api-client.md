# Memory: API Client (API 串接)

## 後端基本資訊

- **Base URL**: `https://gacha-travel--s8869420.replit.app`
- **認證方式**: Bearer Token (`Authorization: Bearer ${token}`)
- **Content-Type**: `application/json`

---

## API 端點對應表

### 認證 API
| 方法 | 端點 | 用途 |
|------|------|------|
| POST | `/api/auth/apple` | Apple 登入 |
| POST | `/api/auth/google` | Google 登入 |
| POST | `/api/auth/email/register` | Email 註冊 |
| POST | `/api/auth/email/login` | Email 登入 |
| GET | `/api/auth/user` | 取得當前使用者 |
| POST | `/api/auth/logout` | 登出 |

### 地點 API
| 方法 | 端點 | 用途 |
|------|------|------|
| GET | `/api/locations/countries` | 取得國家列表 |
| GET | `/api/locations/regions/{countryId}` | 取得城市/地區列表 |
| GET | `/api/locations/districts/{regionId}` | 取得區域列表 |

### 扭蛋 API
| 方法 | 端點 | 用途 |
|------|------|------|
| POST | `/api/gacha/itinerary/v3` | 產生扭蛋行程 |
| GET | `/api/gacha/pool/{city}` | 取得獎池資訊 |
| GET | `/api/gacha/prize-pool/{regionId}` | 取得區域獎池 |

### 收藏 API
| 方法 | 端點 | 用途 |
|------|------|------|
| GET | `/api/collection` | 取得收藏列表 |
| POST | `/api/collection/add` | 新增收藏 |
| DELETE | `/api/collection/{id}` | 刪除收藏 |

### SOS API
| 方法 | 端點 | 用途 |
|------|------|------|
| GET | `/api/sos/eligibility` | 檢查 SOS 資格 |
| POST | `/api/sos/send` | 發送 SOS 警報 |
| GET | `/api/sos/link` | 取得 SOS 連結 |

---

## 請求/回應格式

### 扭蛋請求 (POST /api/gacha/itinerary/v3)
```typescript
// Request
{
  regionId: number;    // 城市 ID
  itemCount: number;   // 抽卡數量 (1-12)
}

// Response (成功)
{
  success: true;
  city: string;
  country: string;
  targetDistrict?: string;
  itinerary: GachaPlace[];
  couponsWon: Coupon[];
  meta: {
    city: string;
    district: string | null;
    sortingMethod?: string;
    categoryDistribution?: Record<string, number>;
  };
}

// Response (無景點)
{
  success: true;
  itinerary: [];
  meta: {
    code: "NO_PLACES_AVAILABLE";
    message: "該區域暫無景點";
  };
}
```

### 國家/地區回應
```typescript
// GET /api/locations/countries
{
  countries: [{
    id: number;
    code: string;
    nameEn: string;
    nameZh: string;
    nameJa: string;
    nameKo: string;
    isActive: boolean;
  }]
}

// GET /api/locations/regions/{countryId}
{
  regions: [{
    id: number;
    countryId: number;
    code: string;
    nameEn: string;
    nameZh: string;
    nameJa: string;
    nameKo: string;
    isActive: boolean;
  }]
}
```

---

## 錯誤處理

### HTTP 狀態碼
| 狀態碼 | 處理方式 |
|--------|----------|
| 200 | 成功處理 |
| 400 | 顯示 Toast 錯誤訊息 |
| 401 | 清除 Token，跳轉登入頁 |
| 403 | 顯示權限不足訊息 |
| 500 | 顯示系統錯誤訊息 |

### 錯誤代碼
| 代碼 | 含義 | 處理 |
|------|------|------|
| `AUTH_REQUIRED` | 需要登入 | 跳轉登入頁 |
| `AUTH_TOKEN_EXPIRED` | Token 過期 | 清除 Token，跳轉登入頁 |
| `GACHA_NO_CREDITS` | 次數不足 | 顯示購買提示 |
| `DAILY_LIMIT_EXCEEDED` | 每日限制 | 顯示限制訊息 |
| `NO_PLACES_AVAILABLE` | 無景點 | 顯示提示訊息 |

---

## 待補充
- [ ] API 速率限制
- [ ] 快取策略
- [ ] 離線處理
