# 🔄 後端同步回報

> APP 完成後端同步指令後，在此記錄狀態

---

## 最新回報

### 2026-01-19 #019：刪除圖鑑分類篩選

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #019 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目

- [x] 刪除圖鑑頁面（CollectionScreen）的分類篩選按鈕
  - 移除 FilterChips 元件及其 import
  - 移除 `selectedFilter` 狀態和 `FILTER_OPTIONS` 定義
  - 移除 `filteredCollection` 邏輯（直接使用 `collection`）
  - 移除「顯示全部」按鈕區塊

### EconomyScreen 渲染錯誤修復

**問題根因**：
- 後端 API `/api/user/level` 返回的物件結構可能是 `{ level: {...} }` 或直接 `{...}`
- 後端使用 `currentLevel` 欄位名稱，前端期望 `level`
- 直接 `setLevelInfo(levelData)` 導致 `levelInfo?.level` 取得整個物件而非數字

**修復方式**：
- 新增 API 回應格式處理邏輯（判斷是否有包裹層）
- 映射後端 `currentLevel` 到前端 `level`
- 確保所有欄位都有預設值

### 修改的檔案

| 檔案 | 變更 |
|------|------|
| `CollectionScreen.tsx` | 移除分類篩選功能 |
| `EconomyScreen.tsx` | 修復 level API 回應處理邏輯 |
| `HomeScreen.tsx` | 修復 level API 調用（getUserLevel → getLevelInfo）及回應處理 |

### 異常回報
（無）

---

### 2026-01-19 #018：Lovable 設計系統實作

| 項目 | 內容 |
|------|------|
| 來源 | 用戶提供 Lovable 設計稿截圖 (29 張) |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目

**Phase 1：設計規格文件**

- [x] 建立 `docs/design-spec-lovable.md` 完整設計規格
  - 色彩系統（MibuBrand 整合）
  - 間距、圓角、陰影規範
  - 元件庫規格（8 個核心元件）
  - 頁面結構文件（6 個頁面）
  - 商家端元件規格（8 個元件）

**Phase 2：共用元件建立**

- [x] `FilterChips.tsx` - 篩選晶片元件
  - 支援 filled/outline 樣式變體
  - 可選計數徽章
  - 支援水平滾動模式
- [x] `SearchInput.tsx` - 搜尋框元件
  - 左側搜尋圖標
  - 清除按鈕
  - 符合 Lovable 設計
- [x] `CtaButton.tsx` - 行動呼籲按鈕
  - primary/secondary/danger 變體
  - 支援圖標、載入狀態
- [x] `StatCard.tsx` - 統計卡片
  - 圖標、數值、變化量顯示
  - 正/負變化顏色區分

**Phase 3：頁面 UI 更新**

- [x] `EconomyScreen.tsx` - 任務頁面重構
  - 任務分組卡片設計（taskGroup）
  - 今日經驗值摘要列
  - 簡化 header
- [x] `HapticTab.tsx` - Tab Bar 選中狀態
  - 新增圓角背景 for 選中項目
  - 使用 MibuBrand.highlight 色
- [x] `MerchantDashboardScreen.tsx` - 商家後台重構
  - 簡化為 5 個主要功能入口
  - 新增店家選擇器 dropdown
  - 移除 daily code 和 credits 區塊

### 新增的檔案

| 檔案 | 說明 |
|------|------|
| `docs/design-spec-lovable.md` | Lovable 設計規格文件 |
| `FilterChips.tsx` | 篩選晶片元件 |
| `SearchInput.tsx` | 搜尋框元件 |
| `CtaButton.tsx` | CTA 按鈕元件 |
| `StatCard.tsx` | 統計卡片元件 |

### 修改的檔案

| 檔案 | 變更 |
|------|------|
| `EconomyScreen.tsx` | 任務分組、今日 XP、簡化 header |
| `HapticTab.tsx` | 選中狀態圓角背景 |
| `MerchantDashboardScreen.tsx` | 簡化選單、店家選擇器 |
| `shared/components/index.ts` | 匯出新元件 |

### 異常回報
（無）

---

### 2026-01-19 #017：Bug 修復與 UI 更新

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #017 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成（含 Part 4 補齊） |

### 完成項目

**Part 4：圖鑑地圖按鈕更新**（2026-01-19 補齊）

- [x] 更新 `CollectionScreen.tsx` 圖鑑詳情彈窗
  - `handleNavigate()` 從 Google Maps 導航改為 Google Search 搜尋
  - 按鈕圖標：`navigate` → `search`
  - 按鈕文字：「在 Google 地圖中查看」→「在 Google 搜尋」
  - 與扭蛋卡片（ItemsScreen）行為一致

**Phase 1：Bug 修復**

- [x] 修復 EconomyScreen/HomeScreen 物件渲染錯誤
  - `HomeScreen.tsx`: 修正 level 資料映射，使用正確屬性名稱
    - `levelData.currentXp` → `levelData.currentExp`
    - `levelData.nextLevelXp` → `levelData.nextLevelExp`
    - `levelData.totalXp` → `levelData.totalExp`
    - `levelData.phase` → `levelData.tier`
  - 新增 `getLevelTitle()` 函數根據等級產生稱號
- [x] 修復用戶名消失問題
  - `ProfileScreen.tsx`: 儲存成功後同步更新 AppContext 的 user 狀態
  - 確保 firstName/lastName 變更即時反映到全域狀態
- [x] 更新 `economy.ts` 型別定義
  - `LevelInfo` 新增 `tier?: number` 和 `loginStreak?: number`

**UI 更新**

- [x] 首頁活動區塊改名
  - 「節慶活動」→「在地活動」
  - 「Festivals」→「Local Activities」
  - 圖標：`gift-outline` → `location-outline`
  - 配色：紅色系 → 藍色系 (`#E0F2FE`, `#0284C7`)

### 修改的檔案

| 檔案 | 變更 |
|------|------|
| `HomeScreen.tsx` | 修正 level 映射、改名活動區塊 |
| `ProfileScreen.tsx` | 新增 user 狀態同步 |
| `economy.ts` | 新增 tier, loginStreak 欄位 |
| `CollectionScreen.tsx` | 圖鑑按鈕改為 Google Search（Part 4 補齊） |

**Phase 2：設計系統標準化**

- [x] 建立 `src/theme/designTokens.ts` 設計常數檔
  - 間距系統：4px 基準（xs:4, sm:8, md:12, lg:16, xl:24, xxl:32, xxxl:48）
  - 圓角系統：xs:4, sm:8, md:12, lg:16, xl:20, xxl:24, full:999
  - 字體大小：xs:10, sm:12, md:14, lg:16, xl:18, xxl:22, xxxl:28
  - 陰影預設：sm/md/lg 三級
- [x] 更新 `constants/Colors.ts` 新增 `SemanticColors`
  - success：綠色系（#DCFCE7, #5D8A66, #16A34A）
  - warning：黃色系（#FEF3C7, #D4A24C, #D97706）
  - error：紅色系（#FEE2E2, #C45C5C, #DC2626）
  - info：藍色系（#E0F2FE, #6B8CAE, #0284C7）
  - starYellow：星級評分（#F59E0B）
- [x] 更新 `HomeScreen.tsx` 移除硬編碼色碼
  - 快閃活動：使用 `SemanticColors.warningLight/Dark`
  - 在地活動：使用 `SemanticColors.infoLight/Dark`

**Phase 2b：全域色碼遷移**

- [x] `GachaScreen.tsx` - 遷移硬編碼色碼
  - 稀有度色碼：使用 `MibuBrand.tierSP/SSR/SR/S/R` 系列
  - 狀態色：`SemanticColors.starYellow` 取代 `#F59E0B`
  - 背景/邊框：`MibuBrand.warmWhite/tanLight` 取代 `#ffffff/#E5D5BC`
- [x] `FavoritesScreen.tsx` - 遷移硬編碼色碼
  - 星級評分：`SemanticColors.starYellow` 取代 `#F59E0B`
  - 錯誤狀態：`SemanticColors.errorMain` 取代 `#EF4444`
- [x] `ItemsScreen.tsx` - 遷移硬編碼色碼
  - N 稀有度色碼：`MibuBrand.brownLight` 取代硬編碼值
- [x] `AnnouncementManageScreen.tsx` - 遷移硬編碼色碼
  - 狀態色：`SemanticColors.successMain/warningMain` 取代硬編碼
  - 按鈕/圖標：`MibuBrand.warmWhite` 取代 `#ffffff`
- [x] `CrowdfundingDetailScreen.tsx` - 遷移硬編碼色碼
  - 白色文字：`MibuBrand.warmWhite` 取代 `#ffffff`
  - 選中狀態：`MibuBrand.creamLight` 取代 `rgba(255,255,255,0.85)`

### 修改的檔案

| 檔案 | 變更 |
|------|------|
| `HomeScreen.tsx` | 修正 level 映射、改名活動區塊、使用 SemanticColors |
| `ProfileScreen.tsx` | 新增 user 狀態同步 |
| `economy.ts` | 新增 tier, loginStreak 欄位 |
| `Colors.ts` | 新增 SemanticColors |
| `designTokens.ts` | 新建設計系統常數 |
| `GachaScreen.tsx` | 遷移硬編碼色碼至 MibuBrand/SemanticColors |
| `FavoritesScreen.tsx` | 遷移硬編碼色碼至 SemanticColors |
| `ItemsScreen.tsx` | 遷移硬編碼色碼至 MibuBrand |
| `AnnouncementManageScreen.tsx` | 遷移硬編碼色碼至 MibuBrand/SemanticColors |
| `CrowdfundingDetailScreen.tsx` | 遷移硬編碼色碼至 MibuBrand |

### 異常回報
（無）

---

### 2026-01-19 #013：API 補齊與錯誤碼更新

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #013 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目

- [x] `errors.ts` 新增 E10xxx-E13xxx 錯誤碼（26 個）
  - E10xxx: 經濟系統（8 個）：`LEVEL_NOT_FOUND`, `ACHIEVEMENT_NOT_FOUND`, `REWARD_ALREADY_CLAIMED` 等
  - E11xxx: 眾籌系統（5 個）：`CAMPAIGN_NOT_FOUND`, `CAMPAIGN_NOT_ACTIVE`, `IAP_VERIFICATION_FAILED` 等
  - E12xxx: 推薦系統（8 個）：`REFERRAL_CODE_NOT_FOUND`, `REFERRAL_SELF_NOT_ALLOWED`, `WITHDRAW_PENDING` 等
  - E13xxx: 貢獻系統（5 個）：`REPORT_DUPLICATE`, `VOTE_ALREADY_CAST`, `CONTRIBUTION_LIMIT_REACHED` 等
- [x] `couponApi.ts` 新增優惠券驗證 API
  - `verifyCoupon(token, code)` → `GET /api/coupons/verify/:code`
- [x] `commonApi.ts` 新增 SOS 取消 API
  - `cancelSOS(token, params)` → `POST /api/sos/cancel`
  - 保留舊版 `cancelSosAlert` 向後相容（標記 @deprecated）

### 使用的 API

| Endpoint | 功能 |
|----------|------|
| `GET /api/coupons/verify/:code` | 驗證優惠券有效性（商家用） |
| `POST /api/sos/cancel` | 取消 SOS 警報 |

### 異常回報
（無）

---

### 2026-01-19 #012：六層架構一致性比對

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #012 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 比對範圍
- `src/services/*Api.ts` (16 個檔案) vs `docs/contracts/APP.md`
- `src/types/*.ts` (19 個檔案) vs 後端合約
- `src/types/errors.ts` vs `docs/contracts/COMMON.md`

### 比對結果摘要

| 類別 | 數量 | 狀態 |
|------|------|------|
| 完全匹配端點 | 50+ | ✅ |
| 前端缺失端點 | 2 | ⚠️ 需補齊 |
| 前端獨有端點 | 15+ | ❓ 待後端確認 |
| 缺失錯誤碼範圍 | 4 | ⚠️ 需補齊 |

### ✅ 完全匹配的 API 服務

以下服務已完全對齊後端合約：

| 服務檔案 | 端點數量 | 備註 |
|----------|----------|------|
| `economyApi.ts` | 5 | 等級、經驗、成就、每日任務 |
| `crowdfundingApi.ts` | 4 | 募資活動、贊助 |
| `referralApi.ts` | 11 | 推薦碼、排行榜、餘額 |
| `contributionApi.ts` | 11 | 回報、建議、投票 |
| `gachaApi.ts` | 6 | 扭蛋核心功能 |
| `collectionApi.ts` | 6 | 圖鑑、最愛 |
| `inventoryApi.ts` | 4 | 背包系統 |
| `authApi.ts` | 8 | 認證、帳號綁定 |
| `commonApi.ts` | 12 | SOS、通知、設定 |

### ⚠️ 前端缺失端點（需補齊）

| 端點 | 功能 | 建議處理 |
|------|------|----------|
| `GET /api/coupons/verify/:code` | 驗證優惠券有效性 | 新增至 `couponApi.ts` |
| `POST /api/sos/cancel` | 取消 SOS 警報 | 新增至 `commonApi.ts` |

### ❓ 前端獨有端點（待後端確認）

以下端點存在於前端但未見於 `contracts/APP.md`，需確認是否為：
1. 後端合約遺漏
2. 已棄用端點
3. 開發中功能

| 端點 | 所在服務 |
|------|----------|
| `GET /api/gacha/pool` | gachaApi.ts |
| `GET /api/gacha/prize-pool` | gachaApi.ts |
| `GET /api/gacha/history` | gachaApi.ts |
| `GET /api/gacha/tiers` | gachaApi.ts |
| `GET /api/sos/eligibility` | commonApi.ts |
| `GET /api/collections/stats` | collectionApi.ts |
| `POST /api/collections/add` | collectionApi.ts (可能與 /api/collections 重複) |
| `GET /api/inventory/stats` | inventoryApi.ts |
| `POST /api/inventory/add` | inventoryApi.ts |
| `GET /api/coupons/my` | couponApi.ts |
| `POST /api/coupons/redeem` | couponApi.ts |
| `GET /api/config/app` | configApi.ts |
| `GET /api/config/mapbox` | configApi.ts |
| `GET /api/merchant/*` | merchantApi.ts (多個端點) |
| `GET /api/specialist/*` | specialistApi.ts (多個端點) |

### ⚠️ 缺失錯誤碼範圍

`src/types/errors.ts` 缺少以下錯誤碼範圍（已在 `COMMON.md` 定義）：

| 範圍 | 類別 | 範例錯誤碼 |
|------|------|-----------|
| E10xxx | 經濟系統 | `INSUFFICIENT_XP`, `ALREADY_CLAIMED` |
| E11xxx | 眾籌系統 | `CAMPAIGN_NOT_ACTIVE`, `ALREADY_CONTRIBUTED` |
| E12xxx | 推薦系統 | `INVALID_REFERRAL_CODE`, `SELF_REFERRAL_NOT_ALLOWED` |
| E13xxx | 貢獻系統 | `ALREADY_VOTED`, `REPORT_NOT_FOUND` |

### 型別定義比對

| 類型檔案 | 狀態 | 備註 |
|----------|------|------|
| `gacha.ts` | ✅ | 完整匹配 |
| `collection.ts` | ✅ | 完整匹配 |
| `inventory.ts` | ✅ | 完整匹配 |
| `economy.ts` | ✅ | 完整匹配 |
| `crowdfunding.ts` | ✅ | 完整匹配 |
| `referral.ts` | ✅ | 完整匹配 |
| `contribution.ts` | ✅ | 完整匹配 |
| `errors.ts` | ⚠️ | 缺少 E10xxx-E13xxx |

### 建議行動項目

1. **立即處理**
   - [ ] 補齊 `couponApi.ts` 的 `verifyCoupon(token, code)` 方法
   - [ ] 補齊 `commonApi.ts` 的 `cancelSOS(token, sosId)` 方法
   - [ ] 更新 `errors.ts` 加入 E10xxx-E13xxx 錯誤碼

2. **待後端確認**
   - [ ] 請後端確認前端獨有端點是否應加入 `contracts/APP.md`
   - [ ] 確認 Merchant/Specialist 端點是否需要獨立合約文件

### 異常回報
（無重大異常，僅有上述需補齊項目）

---

### 2026-01-19 #011：低優先級 API 補齊

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #011 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] `commonApi.ts` 新增 SOS 系統補齊
  - `getSOSStatus(token)` → `GET /api/sos/status`
  - `updateSOSLocation(token, sosId, location)` → `POST /api/sos/location`
- [x] `inventoryApi.ts` 新增背包系統補齊
  - `addInventoryItem(token, params)` → `POST /api/inventory/add`
- [x] 端點對齊修正
  - `collectionApi.saveToCollection`: `/api/collections` → `/api/collections/add`
  - `authApi.deleteAccount`: `/api/user/account` → `/api/auth/account`
  - `commonApi.sendSosAlert`: `/api/sos/alert` → `/api/sos/trigger`

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/sos/status` | 查詢 SOS 狀態 |
| `POST /api/sos/location` | 更新 SOS 位置 |
| `POST /api/inventory/add` | 新增物品到背包 |
| `POST /api/collections/add` | 新增收藏項目 |
| `DELETE /api/auth/account` | 刪除用戶帳號 |
| `POST /api/sos/trigger` | 發送緊急求救 |

### 異常回報
（無）

---

### 2026-01-19 #010：中優先級 API 補齊

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #010 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] `commonApi.ts` 新增設定 API
  - `getAppConfig()` → `GET /api/config/app`
  - `getMapboxToken()` → `GET /api/config/mapbox`
- [x] `commonApi.ts` 新增推播通知 API
  - `registerPushToken(token, params)` → `POST /api/notifications/register-token`
  - `markAllNotificationsRead(token)` → `POST /api/notifications/read-all`
  - `markNotificationRead(token, notificationId)` → `PATCH /api/notifications/:id/read`
- [x] `gachaApi.ts` 新增行程提交 API
  - `submitTrip(token, params)` → `POST /api/gacha/submit-trip`
- [x] `locationApi.ts` 端點對齊
  - `/api/locations/countries` → `/api/countries`
  - `/api/locations/regions/:id` → `/api/regions/:countryId`
  - `/api/locations/districts/:id` → `/api/districts/:regionId`
- [x] 新增型別定義
  - `src/types/gacha.ts`: `SubmitTripResponse`
  - `src/services/commonApi.ts`: `AppConfigResponse`

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/config/app` | 取得 App 設定 |
| `GET /api/config/mapbox` | 取得 Mapbox Token |
| `POST /api/notifications/register-token` | 註冊推播 Token |
| `POST /api/notifications/read-all` | 全部標記已讀 |
| `PATCH /api/notifications/:id/read` | 標記單一通知已讀 |
| `POST /api/gacha/submit-trip` | 提交行程至官網 SEO |
| `GET /api/countries` | 取得國家列表 |
| `GET /api/regions/:countryId` | 取得地區列表 |
| `GET /api/districts/:regionId` | 取得區域列表 |

### 異常回報
（無）

---

### 2026-01-19 #009：高優先級 API 補齊

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #009 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] `economyApi.ts` 每日任務 API（已有，確認無誤）
  - `getDailyTasks(token)` → `GET /api/user/daily-tasks`
  - `completeDailyTask(token, taskId)` → `POST /api/user/daily-tasks/:id/complete`
- [x] `collectionApi.ts` 我的最愛 API（已有，確認無誤）
  - `getFavorites(token)` → `GET /api/collections/favorites`
  - `addFavorite(token, placeId)` → `POST /api/collections/:placeId/favorite`
  - `removeFavorite(token, placeId)` → `DELETE /api/collections/:placeId/favorite`
  - `getFavoriteStatus(token, placeId)` → `GET /api/collections/:placeId/favorite/status`
- [x] `gachaApi.ts` 新增扭蛋額度 API
  - `getQuota(token)` → `GET /api/gacha/quota`
- [x] `gachaApi.ts` 端點對齊
  - `pullGacha`: `/api/gacha/pull` → `/api/gacha/pull/v3`
- [x] 更新型別定義
  - `src/types/gacha.ts`: 新增 `GachaQuotaResponse`
  - `src/types/economy.ts`: 更新 `DailyTask`, `DailyTasksResponse`, `CompleteDailyTaskResponse` 符合後端規格

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/user/daily-tasks` | 取得每日任務列表 |
| `POST /api/user/daily-tasks/:id/complete` | 領取每日任務獎勵 |
| `GET /api/collections/favorites` | 取得我的最愛列表 |
| `POST /api/collections/:placeId/favorite` | 加入我的最愛 |
| `DELETE /api/collections/:placeId/favorite` | 移除我的最愛 |
| `GET /api/collections/:placeId/favorite/status` | 檢查最愛狀態 |
| `GET /api/gacha/quota` | 取得今日扭蛋額度 |
| `POST /api/gacha/pull/v3` | 扭蛋抽獎 |

### 異常回報
（無）

---

### 2026-01-19 #009-前端審計

| 項目 | 內容 |
|------|------|
| 來源 | 前端 API 審計補齊（此為內部編號，非後端指令） |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] `collectionApi.ts` 新增我的最愛 API（4 個方法）
  - `getFavorites(token)` → `GET /api/collections/favorites`
  - `addFavorite(token, placeId)` → `POST /api/collections/:placeId/favorite`
  - `removeFavorite(token, placeId)` → `DELETE /api/collections/:placeId/favorite`
  - `getFavoriteStatus(token, placeId)` → `GET /api/collections/:placeId/favorite/status`
- [x] 新增 `configApi.ts` 服務（2 個方法）
  - `getAppConfig()` → `GET /api/config/app`
  - `getMapboxConfig(token)` → `GET /api/config/mapbox`
- [x] 新增 `couponApi.ts` 服務（2 個方法）
  - `getMyCoupons(token)` → `GET /api/coupons/my`
  - `redeemCoupon(token, params)` → `POST /api/coupons/redeem`
- [x] 新增型別定義
  - `src/types/collection.ts`: `FavoriteItem`, `FavoritesResponse`, `AddFavoriteResponse`
- [x] 新增 UI 頁面
  - `FavoritesScreen.tsx` - 我的最愛頁面（列表、移除功能）
  - `SOSContactsScreen.tsx` - 緊急聯絡人管理（CRUD 完整功能）
- [x] 新增路由
  - `app/favorites.tsx`
  - `app/sos-contacts.tsx`
- [x] 更新 `SettingsScreen.tsx` 新增導航入口

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/collections/favorites` | 取得我的最愛列表 |
| `POST /api/collections/:placeId/favorite` | 加入我的最愛 |
| `DELETE /api/collections/:placeId/favorite` | 移除我的最愛 |
| `GET /api/collections/:placeId/favorite/status` | 檢查最愛狀態 |
| `GET /api/config/app` | 取得 App 設定 |
| `GET /api/config/mapbox` | 取得 Mapbox Token |
| `GET /api/coupons/my` | 取得我的優惠券 |
| `POST /api/coupons/redeem` | 核銷優惠券 |

### 異常回報
（無）

---

### 2026-01-19 #008

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #008 API 服務層補齊 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] `economyApi.ts` 新增每日任務 API
  - `getDailyTasks(token)` → `GET /api/user/daily-tasks`
  - `completeDailyTask(token, taskId)` → `POST /api/user/daily-tasks/:id/complete`
- [x] `referralApi.ts` 新增排行榜 API
  - `getLeaderboard(token, params)` → `GET /api/referral/leaderboard`
  - `getMyRank(token)` → `GET /api/referral/leaderboard/my-rank`
- [x] `commonApi.ts` 新增緊急聯絡人 CRUD
  - `getSOSContacts(token)` → `GET /api/sos/contacts`
  - `addSOSContact(token, params)` → `POST /api/sos/contacts`
  - `updateSOSContact(token, contactId, params)` → `PUT /api/sos/contacts/:id`
  - `deleteSOSContact(token, contactId)` → `DELETE /api/sos/contacts/:id`
- [x] 新增對應 TypeScript 型別定義
  - `src/types/economy.ts`: `DailyTask`, `DailyTasksResponse`, `CompleteDailyTaskResponse`
  - `src/types/referral.ts`: `LeaderboardEntry`, `LeaderboardResponse`, `MyRankResponse`
  - `src/types/sos.ts`: `SOSContact`, `CreateSOSContactParams`, `UpdateSOSContactParams`
- [x] 更新 `ReferralScreen.tsx` 使用真實排行榜 API
  - 移除 MOCK_LEADERBOARD 模擬資料
  - 整合 `getLeaderboard()` 和 `getMyRank()` API
  - 新增空狀態顯示

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/user/daily-tasks` | 取得每日任務列表 |
| `POST /api/user/daily-tasks/:id/complete` | 完成每日任務 |
| `GET /api/referral/leaderboard` | 取得推薦排行榜 |
| `GET /api/referral/leaderboard/my-rank` | 取得我的排名 |
| `GET /api/sos/contacts` | 取得緊急聯絡人 |
| `POST /api/sos/contacts` | 新增緊急聯絡人 |
| `PUT /api/sos/contacts/:id` | 更新緊急聯絡人 |
| `DELETE /api/sos/contacts/:id` | 刪除緊急聯絡人 |

### 異常回報
（無）

---

### 2026-01-18 #007

| 項目 | 內容 |
|------|------|
| 來源 | 用戶指定截圖 UI 風格 |
| 收到時間 | 2026-01-18 |
| 完成時間 | 2026-01-18 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] 更新 `EconomyScreen.tsx` UI 風格
  - 新增用戶頭像 + 等級徽章
  - 新增統計列（已解鎖、等級、連續登入）
  - 新增 4-tab 切換（每日/一次性/累積/等級）
  - 任務列表改為圖標 + 標題 + XP 獎勵格式
- [x] 更新 `CrowdfundingScreen.tsx` → 「全球探索地圖」
  - Header 加入 globe 圖標
  - 統計列（已解鎖國家、募資進行中、即將開放）
  - 國家列表 + 狀態徽章（已解鎖/募資中/即將開放/敬請期待）
  - 募資中國家顯示進度條
  - 底部 CTA：「支持我們的理念」
- [x] 更新 `ReferralScreen.tsx` → 「邀請好友」
  - Hero 區塊（禮物圖標 + 標語）
  - 統計列（已邀請、活躍好友、累計 XP）
  - 推薦碼卡片（複製 + 分享按鈕）
  - 邀請獎勵里程碑（1/3/5/10 人）
  - 邀請紀錄列表

### 異常回報
（無）

---

### 2026-01-17 #006

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md (Phase 2-4) |
| 收到時間 | 2026-01-17 |
| 完成時間 | 2026-01-17 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] Phase 2: 建立 `CrowdfundingScreen.tsx` - 眾籌活動列表
  - 活動列表 (active/upcoming/completed)
  - 進度條、贊助者數量、截止日期
  - 我的贊助記錄
- [x] Phase 2: 建立 `CrowdfundingDetailScreen.tsx` - 眾籌詳情
  - 活動詳情、獎勵階層選擇
  - 更新動態、贊助按鈕
- [x] Phase 3: 建立 `ReferralScreen.tsx` - 推薦系統
  - 推薦碼生成/複製/分享
  - 輸入推薦碼套用
  - 推薦好友列表
  - 餘額查看、交易記錄
- [x] Phase 4: 建立 `ContributionScreen.tsx` - 用戶貢獻
  - 回報歇業/搬遷
  - 建議新景點
  - 社群投票 (排除/保留景點, 審核建議景點)
- [x] 建立路由: `crowdfunding.tsx`, `crowdfunding/[id].tsx`, `referral.tsx`, `contribution.tsx`
- [x] 更新 `SettingsScreen.tsx` 加入社群功能區塊

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/crowdfund/campaigns` | 取得募資活動列表 |
| `GET /api/crowdfund/campaigns/:id` | 取得活動詳情 |
| `POST /api/crowdfund/contribute` | 參與募資 |
| `GET /api/crowdfund/my-contributions` | 個人募資記錄 |
| `GET /api/referral/my-code` | 取得推薦碼 |
| `POST /api/referral/generate-code` | 生成推薦碼 |
| `GET /api/referral/validate/:code` | 驗證推薦碼 |
| `POST /api/referral/apply` | 套用推薦碼 |
| `GET /api/referral/my-referrals` | 推薦人列表 |
| `GET /api/referral/balance` | 餘額查詢 |
| `GET /api/referral/transactions` | 交易記錄 |
| `GET /api/contribution/my-reports` | 我的回報 |
| `GET /api/contribution/my-suggestions` | 我的建議 |
| `GET /api/contribution/pending-votes` | 待投票景點 |
| `GET /api/contribution/pending-suggestions` | 待審核建議 |
| `POST /api/contribution/vote/:placeId` | 投票排除/保留 |
| `POST /api/contribution/vote-suggestion/:id` | 建議投票 |

### 異常回報
（無）

---

### 2026-01-17 #005

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md (Phase 1 + Phase 5) |
| 收到時間 | 2026-01-17 |
| 完成時間 | 2026-01-17 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] 建立 `src/modules/traveler/screens/EconomyScreen.tsx` - 經濟系統畫面
  - 用戶等級和 XP 進度條 (via `GET /api/user/level`)
  - 成就徽章 grid (via `GET /api/user/achievements`)
  - 領取獎勵功能 (via `POST /api/user/achievements/:id/claim`)
  - 近期經驗歷史顯示
  - 類別篩選 (collector, investor, promoter, business, specialist)
  - 等級徽章樣式 (bronze, silver, gold, platinum)
- [x] 建立 `src/modules/shared/screens/AccountScreen.tsx` - 帳號綁定畫面
  - 顯示已連結帳號 (Apple/Google)
  - OAuth 綁定按鈕 (Apple Sign In 已實作)
  - 解除綁定功能
  - 主要帳號標示
- [x] 建立路由 `app/economy.tsx` 和 `app/account.tsx`
- [x] 更新 `src/modules/traveler/index.ts` 匯出 EconomyScreen
- [x] 更新 `src/modules/shared/index.ts` 匯出 AccountScreen
- [x] 更新 `SettingsScreen.tsx` 加入新畫面入口

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/user/level` | 取得等級資訊 |
| `GET /api/user/achievements` | 取得成就列表 |
| `POST /api/user/achievements/:id/claim` | 領取成就獎勵 |
| `GET /api/auth/identities` | 取得綁定身份列表 |
| `POST /api/auth/bind` | 綁定新身份 |
| `DELETE /api/auth/identities/:id` | 解除綁定 |

### 異常回報
（無）

---

### 2026-01-17 #004

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #004 |
| 收到時間 | 2026-01-17 |
| 完成時間 | 2026-01-17 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] 檢查 CLAUDE.md 是否引用後端資料
- [x] 更新 `src/services/` 描述：加入 Phase 5-6 新增的 4 個 API 服務
- [x] 更新 `src/types/` 檔案數量：15 → 19
- [x] 更新 Backend Contract Reference：
  - 加入契約版本號 v1.2.0
  - 加入後端資料規模參考（82 表、22 記憶庫）

### 異常回報
（無）

---

### 2026-01-17 #003

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #003 |
| 收到時間 | 2026-01-17 |
| 完成時間 | 2026-01-17 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] 建立 `src/types/economy.ts` - 等級、經驗、成就類型
- [x] 建立 `src/types/crowdfunding.ts` - 募資系統類型
- [x] 建立 `src/types/referral.ts` - 推薦系統類型
- [x] 建立 `src/types/contribution.ts` - 用戶貢獻類型
- [x] 建立 `src/services/economyApi.ts` - 5 APIs (等級、經驗、成就、策劃師申請)
- [x] 建立 `src/services/crowdfundingApi.ts` - 4 APIs (募資活動、贊助)
- [x] 建立 `src/services/referralApi.ts` - 9 APIs (推薦碼、餘額、提現)
- [x] 建立 `src/services/contributionApi.ts` - 11 APIs (回報、建議、黑名單、投票)
- [x] 更新 `src/services/authApi.ts` - 新增帳號綁定 3 APIs
- [x] 更新 `src/types/index.ts` - 匯出新類型
- [x] 更新 `src/services/api.ts` - 整合新 API 服務

### 實作統計
| 模組 | API 數量 |
|------|----------|
| Economy | 5 |
| Crowdfunding | 4 |
| Referral | 9 |
| Contribution | 11 |
| Auth (帳號綁定) | 3 |
| **總計** | **32** |

### 異常回報
（無）

---

### 2026-01-16 #002

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #002 |
| 收到時間 | 2026-01-16 |
| 完成時間 | 2026-01-16 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] 檢查 docs/ 目錄
- [x] 檢查記憶庫大小（都 < 30KB）
- [x] 建立 docs/archive/ 目錄
- [x] 歸檔 `API_FRONTEND_ENDPOINTS.md`（2025-12-22 舊文件，後端已有 contracts/APP.md）

### 保留的文件
- `APP_STORE_REVIEW_CHECKLIST.md` - 持續使用的文件
- `architecture-audit-report.md` - 今天的審計報告，有參考價值

### 異常回報
（無）

---

## 歷史回報

### 2026-01-16 #001

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #001 |
| 完成時間 | 2026-01-16 |
| 狀態 | ✅ 完成 |

完成項目：
- [x] 建立 docs/sync-backend.md
- [x] 更新 CLAUDE.md 加入「三端協作」段落
- [x] 在記憶庫加入「跨端對應」標註
