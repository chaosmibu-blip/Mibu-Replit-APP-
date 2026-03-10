# 計劃：#074 商家後台完整重做

> 建立日期：2026-03-10
> 狀態：確認待執行
> 契約版本：APP.md v4.1.0（2026-03-10 拉取，含完整 checkout/cancel 規格）

## 背景

APP 端目前的商家後台呼叫了多個不存在或路徑錯誤的端點，導致全面性故障。
需丟掉現有商家後台的所有實作，完全依照後端 #074 規格重做。

## 影響範圍

- 型別定義：`src/types/merchant.ts`（完全重寫）
- API 服務：`src/services/merchantApi.ts`（完全重寫）
- React Query Hooks：`src/hooks/useMerchantQueries.ts`（完全重寫）
- 畫面：重寫 6 個（Dashboard、Apply、Analytics、Places、Coupons、Profile）
- 畫面：刪除 3 個（Products、Transactions、Verify）
- 子畫面：重寫 3 個（ClaimPlace、NewPlace、PlaceEdit）+ 重寫 1 個（CouponForm）
- 路由：清理 `app/merchant/` 目錄 + 根層路由
- 翻譯：4 語系更新
- 模組索引：`src/modules/merchant/index.ts`

## 契約來源

- **API 規格**：`APP.md` v4.1.0（23 個端點，全部有完整 Request/Response 型別）
- **UI 規格**：`sync-app.md` #074（6 個畫面 wireframe + 初始化流程 + 錯誤處理規則）
- **商家狀態**：pending / approved / rejected
- **方案等級**：free / pro / premium

---

## Phase 0：基礎建設（型別 + API + Hooks）

> 不改不行的，後續所有畫面都依賴這些

### 0-1. 重寫 `src/types/merchant.ts`

**刪除**（不存在的功能）：
- `MerchantCredits`（點數制不存在）
- `MerchantProduct`（商品管理不存在）
- `MerchantTransaction`（交易記錄不存在）

**新增/修正的型別**（對齊 APP.md）：

| 型別名稱 | 對應 API | 說明 |
|---------|---------|------|
| `MerchantMe` | GET /me | 修正 businessName（非 name） |
| `MerchantApplyRequest` | POST /apply | 含 surveyResponses JSONB + 店家綁定三模式 |
| `MerchantApplyResponse` | POST /apply | `{ success, application }` |
| `MerchantApplicationStatus` | GET /application-status | `{ status, application, merchantTier? }` |
| `MerchantPermissions` | GET /permissions | 含 permissions 詳細欄位 + allTierPermissions |
| `MerchantDailyCode` | GET /daily-code | `{ seedCode, updatedAt, expiresAt }` |
| `MerchantAnalytics` | GET /analytics | overview + trend + topCoupons + placeBreakdown |
| `MerchantAnalyticsSummary` | GET /analytics/summary | 4 個摘要數字 |
| `MerchantPlace` | GET /places | 含 linkId、status、cardLevel、promo 欄位 |
| `ClaimPlaceRequest` | POST /places/claim | placeName/district/city/country + optional ids |
| `NewPlaceRequest` | POST /places/new | 完整景點資料 |
| `UpdatePlaceRequest` | PUT /places/:linkId | description/promo/openingHours |
| `ResolveUrlRequest/Response` | POST /places/resolve-url | Google Maps 連結解析 |
| `PlaceSearchResponse` | GET /places/search | `{ places: Array<...> }` |
| `MerchantCoupon` | GET /coupons/merchant/:id | 含 rarity、archived、remainingQuantity |
| `CreateCouponRequest` | POST /coupons | code/title/terms/merchantId/placeId/rarity |
| `UpdateCouponRequest` | PATCH /coupons/:id | title/terms/isActive/remainingQuantity |
| `RedemptionHistory` | GET /redemption-history | 分頁列表 + total/hasMore |
| `RedemptionStats` | GET /redemption-history/stats | today/week/month/total |
| `MerchantSubscription` | GET /subscription | merchantLevel + limits + subscription |
| `CheckoutRequest` | POST /subscription/checkout | type/tier/placeId/provider/urls |
| `CheckoutResponse` | POST /subscription/checkout | Stripe: url+sessionId / Recur: productId+publishableKey |
| `CancelSubscriptionRequest` | POST /subscription/cancel | subscriptionId |
| `DeleteAccountRequest` | DELETE /account | reason? |

### 0-2. 重寫 `src/services/merchantApi.ts`

全部 23 個 API 端點，按分類：

| # | 方法 | 路徑 | 函數名 |
|---|------|------|--------|
| 1 | GET | `/api/merchant/me` | `getMerchantMe()` |
| 2 | POST | `/api/merchant/apply` | `applyMerchant(data)` |
| 3 | GET | `/api/merchant/application-status` | `getApplicationStatus()` |
| 4 | GET | `/api/merchant/permissions` | `getMerchantPermissions()` |
| 5 | DELETE | `/api/merchant/account` | `deleteMerchantAccount(data)` |
| 6 | GET | `/api/merchant/daily-code` | `getDailyCode()` |
| 7 | GET | `/api/merchant/analytics` | `getAnalytics(params)` |
| 8 | GET | `/api/merchant/analytics/summary` | `getAnalyticsSummary()` |
| 9 | GET | `/api/merchant/places/search` | `searchPlaces(params)` |
| 10 | POST | `/api/merchant/places/resolve-url` | `resolveGoogleMapsUrl(data)` |
| 11 | GET | `/api/merchant/places` | `getMerchantPlaces()` |
| 12 | POST | `/api/merchant/places/claim` | `claimPlace(data)` |
| 13 | POST | `/api/merchant/places/new` | `createNewPlace(data)` |
| 14 | PUT | `/api/merchant/places/:linkId` | `updatePlace(linkId, data)` |
| 15 | GET | `/api/coupons/merchant/:merchantId` | `getMerchantCoupons(merchantId)` |
| 16 | POST | `/api/coupons` | `createCoupon(data)` |
| 17 | PATCH | `/api/coupons/:id` | `updateCoupon(id, data)` |
| 18 | DELETE | `/api/coupons/:id` | `deleteCoupon(id)` |
| 19 | GET | `/api/merchant/redemption-history` | `getRedemptionHistory(params)` |
| 20 | GET | `/api/merchant/redemption-history/stats` | `getRedemptionStats()` |
| 21 | GET | `/api/merchant/subscription` | `getSubscription()` |
| 22 | POST | `/api/merchant/subscription/checkout` | `createCheckout(data)` |
| 23 | POST | `/api/merchant/subscription/cancel` | `cancelSubscription(data)` |

⚠️ 注意：#15-#18 優惠券路徑前綴是 `/api/coupons`，不是 `/api/merchant/coupons`

### 0-3. 重寫 `src/hooks/useMerchantQueries.ts`

**Query Hooks**（GET 請求）：

| Hook 名稱 | API | 啟用條件 |
|-----------|-----|---------|
| `useMerchantMe()` | GET /me | 進入商家後台時 |
| `useMerchantApplicationStatus()` | GET /application-status | status !== 'approved' |
| `useMerchantPermissions()` | GET /permissions | status === 'approved' |
| `useMerchantDailyCode()` | GET /daily-code | status === 'approved' |
| `useMerchantAnalytics(period, placeId)` | GET /analytics | approved + Pro+ |
| `useMerchantAnalyticsSummary()` | GET /analytics/summary | approved + Pro+ |
| `useMerchantPlaces()` | GET /places | approved |
| `useMerchantCoupons(merchantId)` | GET /coupons/merchant/:id | approved |
| `useRedemptionHistory(params)` | GET /redemption-history | approved |
| `useRedemptionStats()` | GET /redemption-history/stats | approved |
| `useMerchantSubscription()` | GET /subscription | approved |

**Mutation Hooks**（POST/PUT/PATCH/DELETE）：

| Hook 名稱 | API | 說明 |
|-----------|-----|------|
| `useApplyMerchant()` | POST /apply | 提交申請 |
| `useSearchPlaces()` | GET /places/search | 搜尋景點（用 mutation 因為是手動觸發） |
| `useResolveGoogleMapsUrl()` | POST /places/resolve-url | 解析連結 |
| `useClaimPlace()` | POST /places/claim | 認領景點 |
| `useCreateNewPlace()` | POST /places/new | 新增景點 |
| `useUpdatePlace()` | PUT /places/:linkId | 更新景點 |
| `useCreateCoupon()` | POST /coupons | 建立優惠券 |
| `useUpdateCoupon()` | PATCH /coupons/:id | 更新優惠券 |
| `useDeleteCoupon()` | DELETE /coupons/:id | 刪除優惠券 |
| `useCreateCheckout()` | POST /subscription/checkout | 建立結帳 |
| `useCancelSubscription()` | POST /subscription/cancel | 取消訂閱 |
| `useDeleteMerchantAccount()` | DELETE /account | 刪除帳號 |

**錯誤處理 Hook**：
- 統一 `useMerchantError()` — 解析 403 回應，區分「審核中」vs「方案限制」vs「數量上限」

### 0-4. 審查 + tsc 驗證

---

## Phase 1：商家首頁 + 初始化流程（畫面 A）

### 初始化流程
```
GET /api/merchant/me
├─ merchant === null → router.push('/merchant-apply')
├─ status === 'pending' → 待審核首頁
├─ status === 'rejected' → 拒絕原因 + 重新申請按鈕
└─ status === 'approved'
    ├─ 快取 merchant.id（優惠券 API 需要）
    ├─ GET /api/merchant/daily-code
    └─ GET /api/merchant/permissions
```

### MerchantDashboardScreen 三態 UI

**pending 狀態：**
- 審核中卡片（申請時間、提示文字）
- 四宮格：數據分析🔒、店家管理🔒、優惠券管理🔒、商家資料✅
- 🔒 項目點擊 → Toast「商家審核通過後即可使用」

**approved 狀態：**
- 核銷碼卡片：seedCode + expiresAt + subscriptionPlan
- 四宮格：全部開放
- 數據分析 → 免費方案點擊顯示升級提示

**rejected 狀態：**
- 拒絕原因卡片：rejectionReason
- 重新申請按鈕 → 導到 merchant-apply

### 審查 + tsc 驗證

---

## Phase 2：商家申請問卷（畫面 F）

### 4 段 12 題分步表單

**第一段：基本資料**
- Q1 您的稱呼（TextInput，預帶 displayName）*必填
- Q2 店家/公司名稱（TextInput）*必填 + 統一編號（TextInput，選填，8 位數）
- Q3 產業類別（單選 RadioGroup）*必填：餐飲美食/住宿旅館/景點遊樂/特色商店/體驗活動/其他
- Q4 店家所在地區（地區選擇器）*必填 + 詳細地址（TextInput，選填）

**第二段：經營現況**
- Q5 客人從哪來（多選 CheckboxGroup）*必填：路過/網路搜尋/社群媒體/旅遊平台/口碑介紹/其他
- Q6 經營挑戰（多選，最多 3 項）*必填：吸引觀光客/線上曝光不足/回頭客經營/同業競爭/行銷費用高/語言障礙/其他
- Q7 每月行銷花費（單選）*必填：幾乎沒有/NT$5,000 以下/NT$5,000–20,000/NT$20,000 以上
- Q8 線上曝光管道（多選）*必填：Google Maps/Facebook/Instagram/LINE 官方帳號/自有官網/目前沒有

**第三段：合作意願**
- Q9 合作最在意效果（單選）*必填：帶來更多觀光客/提升品牌知名度/增加營收/提高回訪率/其他
- Q10 遊戲化行銷看法（單選）*必填：非常有興趣/願意嘗試/需要更多了解/目前沒興趣

**第四段：聯絡方式 + 店家綁定**
- Q11 電話/LINE/IG（TextInput）*必填
- Q12 Email（TextInput，預帶用戶 email）*必填
- 店家綁定（選填）：
  - 模式 1：搜尋系統景點 → GET /places/search → 選擇 → claimedPlaceId
  - 模式 2：貼 Google Maps 連結 → POST /places/resolve-url → claimedGooglePlaceId + claimedGoogleMapsUrl + claimedPlaceName + claimedPlaceData
  - 已選擇顯示：✅ 店名（地區）[✕ 取消選擇]

**送出組裝**：
```typescript
{
  businessName: Q2,
  email: Q12,
  surveyResponses: {
    contactName: Q1,
    taxId: Q2統編,
    industryCategory: Q3,
    region: Q4地區,
    address: Q4地址,
    customerSources: Q5[],
    challenges: Q6[],
    marketingBudget: Q7,
    onlineChannels: Q8[],
    expectedOutcome: Q9,
    gamificationView: Q10,
    contactInfo: Q11,
  },
  // 店家綁定（依模式）
  claimedPlaceId?: number,
  claimedGooglePlaceId?: string,
  claimedGoogleMapsUrl?: string,
  claimedPlaceName?: string,
  claimedPlaceData?: object,
}
```

送出成功 → 導回商家後台首頁（顯示待審核）

### 審查 + tsc 驗證

---

## Phase 3：數據分析（畫面 B）+ 店家管理（畫面 C）

### 畫面 B：MerchantAnalyticsScreen

**進入條件**：approved + Pro 以上（免費方案擋在 Dashboard 層）

**API**：GET /api/merchant/analytics?period=30d

**UI 元素**：
1. 時間篩選器：[7天] [30天] [90天] [全部]
2. 店家篩選：下拉選擇（全部店家 / 特定店家）→ placeId 參數
3. 四格摘要卡片：曝光數 / 收錄人數 / 券發放 / 券核銷（含核銷率%）
4. 趨勢折線圖：`trend[]` → 日期 vs 曝光數
5. 熱門優惠券排行：`topCoupons[]` → 名稱 + 發放/核銷
6. 各店家分佈：`placeBreakdown[]` → 店名 + 收錄次數

**403 處理**：
- 含 `'尚未通過審核'` → 「帳號審核中」
- 含 `'升級至 Pro'` → 升級提示 + 升級按鈕

### 畫面 C：MerchantPlacesScreen

**API**：GET /api/merchant/places

**列表 UI**：
- 每項：店名 + 地區 + 狀態（🟢已審核/🟡待審核/🔴已拒絕）+ 卡片等級
- 空狀態：「您還沒有認領任何店家」+ 引導新增

**[+新增] → 三種模式**（可做成同一頁面內三段）：
- 方式一：搜尋系統景點 → GET /places/search → [認領] → POST /places/claim
- 方式二：貼 Google Maps 連結 → POST /places/resolve-url → 確認 → POST /places/claim
- 方式三：手動新增 → 表單 → POST /places/new

**景點詳情（點進已認領的店家）**：
- 狀態 + 卡片等級 + 地區
- 優惠推廣區塊（promoTitle/promoDescription/isPromoActive）
- 營業時間（openingHours）
- [編輯] → PUT /places/:linkId

### 審查 + tsc 驗證

---

## Phase 4：優惠券管理（畫面 D）+ 商家資料（畫面 E）

### 畫面 D：MerchantCouponsScreen

**API**：GET /api/coupons/merchant/{merchantId}（⚠️ merchantId 從 merchant.id 快取取得）

**列表 UI**：
- 每項：標題 + 稀有度標籤 + 條款 + 剩餘/總數 + 🟢啟用/⚪已停用
- 空狀態：「還沒有優惠券」+ 引導新增

**[+新增] → CouponFormScreen**：
- code（優惠券代碼）、title（名稱）、terms（條款）
- merchantId（自動帶入）、placeId（選擇景點）
- rarity（依方案限制 allowedRarities）
- isActive、remainingQuantity
- POST /api/coupons

**編輯**：PATCH /api/coupons/:id（title/terms/isActive/remainingQuantity）
**刪除**：DELETE /api/coupons/:id（確認對話框）

**E4010 處理**：優惠券數量已達上限 → 提示升級

### 畫面 E：MerchantProfileScreen

**API**：GET /me + GET /subscription（approved 時）

**UI**：
- 商家名稱（businessName）
- 狀態：已核准 / 待審核
- 聯絡信箱（email）
- 訂閱方案 + [升級] 按鈕 → 導到 checkout 流程
- 加入時間（createdAt 格式化）
- 危險區域：[刪除帳號] → 確認對話框 → DELETE /account

**訂閱升級流程**：
1. POST /subscription/checkout { type: 'merchant', tier: 'pro'/'premium' }
2. 回傳 URL → WebView 開啟結帳頁
3. 結帳完成 → 導回 → 重新拉取 permissions

**取消訂閱**：POST /subscription/cancel { subscriptionId }

### 審查 + tsc 驗證

---

## Phase 5：清理 + 錯誤處理 + 收尾

### 5-1. 刪除多餘檔案

| 檔案 | 原因 |
|------|------|
| `src/modules/merchant/screens/MerchantProductsScreen.tsx` | 商品管理不存在 |
| `app/merchant/products.tsx` | 同上路由 |
| `src/modules/merchant/screens/MerchantTransactionsScreen.tsx` | 交易記錄不存在（點數制） |
| `app/merchant/transactions.tsx` | 同上路由 |
| `src/modules/merchant/screens/MerchantVerifyScreen.tsx` | 舊版核銷，改用 daily-code |
| `app/merchant/verify.tsx` | 同上路由 |
| `app/merchant-register.tsx` | 多餘的註冊路由 |
| `app/register-merchant.tsx` | 同上 |

### 5-2. 統一錯誤處理

| HTTP | 條件 | APP 顯示 |
|------|------|---------|
| 401 | — | 導回登入頁 |
| 403 | 含 `'尚未通過審核'` | 「審核中，通過後即可使用」 |
| 403 | 含 `'升級至 Pro'` | 「此功能需升級至 Pro 方案」+ 升級按鈕 |
| 403 | E4009 | 「景點數量已達上限，請升級方案」 |
| 403 | E4010 | 「優惠券數量已達上限，請升級方案」 |
| 404 | — | 對應的空狀態畫面 |
| 500 | — | 「載入失敗」+ 重試按鈕 |

### 5-3. 更新路由 `app/merchant/_layout.tsx`

移除 products、transactions、verify 路由，確認其餘路由正確。

### 5-4. 更新翻譯（4 語系）

新增/修正商家相關翻譯鍵（zh-TW、en、ja、ko）。

### 5-5. 更新 memory 文件

- `docs/memory-screens.md` — 商家畫面變更
- `docs/memory-components.md` — 如有新元件
- `docs/memory-state.md` — React Query hooks 變更
- `docs/sync-backend.md` — 回報 #074 完成狀態

### 5-6. 更新 WBS + 用戶故事地圖

- `docs/WBS-architecture-review.md`
- `docs/user-story-map.md`

### 5-7. 最終 tsc 驗證 + 全面審查

---

## 禁止實作的功能

| 功能 | 原因 |
|------|------|
| GET /api/merchant/credits | 不存在 |
| POST /api/merchant/credits/purchase | 不存在 |
| GET /api/merchant/transactions | 不存在 |
| 點數/餘額/充值 UI | 專案採訂閱制，無點數概念 |

## Commit 策略

每個 Phase 完成後獨立 commit：
- `feat(merchant): Phase 0 — 重寫型別、API 服務、React Query hooks`
- `feat(merchant): Phase 1 — 商家首頁三態顯示 + 初始化流程`
- `feat(merchant): Phase 2 — 商家申請問卷 4 段 12 題`
- `feat(merchant): Phase 3 — 數據分析 + 店家管理`
- `feat(merchant): Phase 4 — 優惠券管理 + 商家資料`
- `refactor(merchant): Phase 5 — 清理多餘檔案 + 錯誤處理 + 收尾`
