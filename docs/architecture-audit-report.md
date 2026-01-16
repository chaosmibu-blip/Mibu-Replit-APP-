# Mibu App 架構審計報告

**審計日期**: 2026-01-16
**審計範圍**: 前端 (Mibu-Replit-APP-) 與後端 (MIBU_REPLIT) 架構一致性
**審計目標**: 優化 App 且與後端保持一致性

---

## 一、整體架構概覽

### 後端架構 (MIBU_REPLIT)
```
server/
├── routes/              # API 路由
│   ├── admin/          # 管理員 (8 個子模組)
│   ├── gacha/          # 扭蛋 (5 個檔案)
│   ├── merchant/       # 商家 (9 個檔案)
│   ├── auth.ts         # 認證
│   ├── collections.ts  # 圖鑑
│   ├── inventory.ts    # 道具箱
│   ├── specialist.ts   # 專員
│   └── ...
├── services/           # 業務邏輯
├── lib/                # 工具函式
└── middleware/         # 中間件
shared/
├── schema.ts           # Drizzle ORM Schema
└── errors.ts           # 錯誤定義
modules/
├── admin/
├── travel-gacha/
└── trip-planner/
```

### 前端架構 (Mibu-Replit-APP-)
```
src/
├── modules/            # 模組化架構
│   ├── traveler/      # 7 screens, 2 components
│   ├── merchant/      # 13 screens, 1 component
│   ├── specialist/    # 5 screens
│   ├── admin/         # 4 screens
│   └── shared/        # 8 screens, 10 components
├── services/          # API 服務 (12 個模組)
├── types/             # TypeScript 型別 (14 個檔案)
└── context/           # 全局狀態管理
```

---

## 二、發現的不一致問題

### 2.1 API 路徑不一致

| 模組 | 前端路徑 | 後端路徑 | 問題說明 |
|------|----------|----------|----------|
| Collection | `/api/collection/with-promo` | 不存在 | 前端調用的 API 後端沒有 |
| Collection | `/api/collection/auto-save` | 不存在 | 前端調用的 API 後端沒有 |
| Collection | 混用 `/api/collection/` 和 `/api/collections/` | `/api/collections/` | 命名不一致 |
| Inventory | `/api/inventory/config` | 不存在 | 前端期望的配置 API 不存在 |
| Inventory | `/api/rarity-config` | 不存在 | 稀有度配置 API 不存在 |
| Inventory | `/api/inventory/:id/read` | 自動標記 | 後端在 GET 時自動標記已讀 |
| Specialist | `/api/specialist/travelers` | 不存在 | 前端調用但後端沒有 |
| Specialist | `/api/specialist/availability` | `/api/specialist/toggle-online` | 行為不同 |
| Gacha | `/api/gacha/pool` | 不確定 | 需確認是否存在 |
| Gacha | `/api/gacha/pull` | `/api/gacha/pull/v3` | 版本路徑不一致 |

### 2.2 HTTP 方法不一致

| API | 前端方法 | 後端方法 | 建議 |
|-----|----------|----------|------|
| 更新優惠券 | `PUT /api/merchant/coupons/:id` | `PATCH /:id` | 統一使用 PATCH |
| 更新 Profile | `PATCH /api/profile` | `PATCH/PUT /api/profile` | 後端支援兩者，前端用 PATCH 即可 |

### 2.3 型別定義缺失

#### 前端缺少的欄位 (對比後端 schema.ts)

**MerchantCoupon**:
```typescript
// 後端有，前端沒有
inventoryImageUrl?: string;
backgroundImageUrl?: string;
```

**User Profile**:
```typescript
// 後端有更完整的 authIdentities 支援
authIdentities: {
  provider: 'google' | 'apple' | 'email' | 'replit' | 'guest';
  providerUserId: string;
}[]
```

**Places**:
```typescript
// 後端 placeCache 有更多欄位
rarity: 'N' | 'R' | 'SR' | 'SSR' | 'SP';
tier: 'free' | 'pro' | 'premium';
```

### 2.4 功能不對齊

| 功能 | 前端狀態 | 後端狀態 | 說明 |
|------|----------|----------|------|
| 專員旅客追蹤 | 有 UI | 缺少 API | `getSpecialistTravelers` 沒有對應後端 |
| 可用性切換 | `PATCH /availability` | `POST /toggle-online` | 語義不同 |
| 道具箱配置 | 有 API 調用 | 無 endpoint | 配置應該由前端本地管理？ |

---

## 三、架構優化建議

### 3.1 短期修復 (High Priority)

#### 1. 修正 Collection API 路徑
```typescript
// collectionApi.ts - 統一使用 /api/collections/
getCollectionWithPromo → '/api/collections/with-promo' 或 '/api/collections?withPromo=true'
autoSaveToCollection → '/api/collections/auto-save' 或 POST '/api/collections' with auto flag
```

#### 2. 移除不存在的 API 調用
```typescript
// inventoryApi.ts
// 刪除或標記為 deprecated
getInventoryConfig() // 後端沒有這個 API
getRarityConfig()    // 後端沒有這個 API
markInventoryItemRead() // 後端自動處理，不需要這個 API
```

#### 3. 修正 Specialist API
```typescript
// specialistApi.ts
updateSpecialistAvailability → toggleSpecialistOnline
getSpecialistTravelers → 需要後端實作或移除
```

### 3.2 中期改善 (Medium Priority)

#### 1. 建立共享型別定義
建議在後端的 `shared/` 目錄建立可以被前端引用的型別：
```typescript
// shared/types/merchant.ts
export interface MerchantCoupon {
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
  inventoryImageUrl?: string;    // 新增
  backgroundImageUrl?: string;   // 新增
  createdAt: string;
  updatedAt: string;
}
```

#### 2. 統一 HTTP 方法規範
| 操作 | 建議方法 |
|------|----------|
| 完整更新 | PUT |
| 部分更新 | PATCH |
| 切換狀態 | POST (toggle 語義) |

#### 3. API 版本管理
```
/api/v1/gacha/itinerary  → 穩定版本
/api/gacha/itinerary/v3  → 當前版本 (維持)
```

### 3.3 長期優化 (Low Priority)

#### 1. 建立 OpenAPI/Swagger 文件
自動生成前後端共用的 API 規格，確保一致性。

#### 2. 導入 API 合約測試
使用 Pact 或類似工具進行消費者驅動的合約測試。

#### 3. 考慮 tRPC 或 GraphQL
如果團隊規模擴大，考慮使用型別安全的 API 層。

---

## 四、前端架構正面評價

### 4.1 做得好的地方

1. **模組化架構清晰**
   - 按角色分離模組 (traveler/merchant/specialist/admin)
   - 共用元件集中在 shared 模組

2. **API 服務層設計良好**
   - 使用 ApiBase 抽象共用邏輯
   - 模組化的 API 服務方便維護

3. **型別定義完整**
   - 14 個型別檔案覆蓋主要功能
   - 向後相容的匯出機制

4. **向後相容設計**
   - 舊式 import 仍然有效
   - ApiService 聚合類別保持相容

### 4.2 架構亮點

```typescript
// 優秀的向後相容設計
// api.ts
class ApiService {
  getMerchantMe = merchantApi.getMerchantMe.bind(merchantApi);
  // ... 所有方法都委派給模組化 API
}
export const apiService = new ApiService();

// 舊代碼仍可用
import { apiService } from '@/services/api';
apiService.getMerchantMe(token);

// 新代碼更直接
import { merchantApi } from '@/services/merchantApi';
merchantApi.getMerchantMe(token);
```

---

## 五、具體修復清單

### Priority 1: 必須立即修復

- [ ] `collectionApi.ts:19` - `/api/collection/with-promo` 路徑修正
- [ ] `collectionApi.ts:25` - `/api/collection/auto-save` 路徑修正
- [ ] `specialistApi.ts:31` - `updateSpecialistAvailability` 改用 toggle-online
- [ ] `specialistApi.ts:39` - `getSpecialistTravelers` 需確認後端是否支援

### Priority 2: 應該修復

- [ ] `inventoryApi.ts:26` - `getInventoryConfig` 評估是否需要
- [ ] `inventoryApi.ts:30` - `getRarityConfig` 評估是否需要
- [ ] `inventoryApi.ts:34` - `markInventoryItemRead` 評估是否需要
- [ ] `merchantApi.ts:134` - 優惠券更新改用 PATCH

### Priority 3: 建議改善

- [ ] 統一 `/api/collection/` vs `/api/collections/` 命名
- [ ] 補齊 `MerchantCoupon` 型別的圖片欄位
- [ ] 建立 API 版本策略

---

## 六、後續行動

1. **與後端團隊同步**：確認哪些「缺失的 API」是真的缺失，還是命名不同
2. **建立 API 文件**：避免未來再次出現不一致
3. **加入型別共享機制**：考慮用 monorepo 或 npm package 共享型別
4. **設定 CI 檢查**：在 PR 時自動檢查 API 調用是否有對應後端實作

---

*報告結束*
