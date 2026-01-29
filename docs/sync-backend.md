# 🔄 後端同步回報

> APP 完成後端同步指令後，在此記錄狀態

---

## 最新回報

### 2026-01-29 #036：帳號合併功能

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #036 |
| 狀態 | ✅ 完成 |

**實作內容**
- [x] `authApi.ts` 新增帳號合併 API
  - `mergeAccount(token, secondaryToken)` - 執行帳號合併
  - `getMergeHistory(token)` - 查詢合併歷史
- [x] 新增型別定義
  - `MergeSummary` - 合併結果摘要
  - `MergeAccountResponse` - 合併回應
  - `MergeHistoryItem` / `MergeHistoryResponse` - 歷史記錄
- [x] `SettingsScreen.tsx` 新增「合併帳號」功能
  - 設定 > 帳號管理 > 合併帳號
  - 四步驟流程：警告 → 登入副帳號 → 處理中 → 結果
  - 顯示合併摘要（圖鑑、行程、成就、經驗值等）
- [x] `AuthScreen.tsx` 支援嵌入模式
  - 新增 `embedded` prop（不顯示 Modal 外殼）
  - 新增 `onLoginSuccess` callback（回傳 token）
  - 新增 `title` prop（自訂標題）

**錯誤碼處理**
| 錯誤碼 | 說明 |
|--------|------|
| E15001 | 副帳號 token 無效 |
| E15002 | 不能合併同一個帳號 |
| E15003 | 副帳號已被合併過 |
| E15004 | 合併過程錯誤 |

---

### 2026-01-29 #034：共用型別套件

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #034 |
| 狀態 | ✅ 完成 |

**實作內容**
- [x] 建立 `shared/` 資料夾（從後端複製）
- [x] `shared/index.ts` - 主入口，匯出所有模組
- [x] `shared/errors.ts` - 100+ 錯誤碼定義 + ErrorMessages + helper functions
- [x] `shared/constants.ts` - 七大分類、扭蛋配額、成就類別等共用常數
- [x] `shared/response.ts` - API 回應格式規範 + `API_RESPONSE_FORMAT` 對照表
- [x] `shared/id-conventions.ts` - ID 命名規範（placeId vs collectionId vs itemId）
- [x] `shared/api-types.ts` - 所有 API 的 Request/Response 型別定義
- [x] 更新 `tsconfig.json` 加入 `@shared/*` 和 `@shared` 路徑映射

**使用方式**
```typescript
import {
  ErrorCode, isAuthError,
  SEVEN_CATEGORIES, GACHA_CONFIG,
  API_RESPONSE_FORMAT, isApiError,
  CollectionId, ItineraryItemId,
  V2GachaPullResponse, ItineraryDetailResponse,
} from '@shared';
```

**型別一致性修正**
- [x] `src/types/common.ts` - re-export from `@shared`，保持向後兼容
- [x] `src/types/itinerary.ts` - `PlaceCategory` 改為使用 `MibuCategory`
- [x] `src/types/errors.ts` - 新增 `@shared` 錯誤碼匯出
- [x] `src/shared/errors.ts` - 完全改為 re-export from `@shared`
- [x] `GachaScreen.tsx` - 修正 `GACHA_DAILY_LIMIT` → `GACHA_RATE_LIMITED`
- [x] 新增 `LEGACY_ERROR_MAPPING` 映射舊英文錯誤碼到新格式
- [x] `isAuthError()` 向後兼容，接受 `string | undefined`

---

### 2026-01-29 🐛 BUG：行程「選擇景點」顯示空（圖鑑有資料）【持續追蹤】

| 項目 | 內容 |
|------|------|
| 來源 | APP 端發現 |
| 狀態 | 🔴 待後端修復 |
| 嚴重度 | **緊急**（核心功能完全失效） |
| 更新 | 2026-01-29 補充技術細節 |

**問題描述**
- 用戶圖鑑有 **1023 個景點**（宜蘭縣 442、台北市 367、高雄市 112、新北市 35...）
- 但在行程「從圖鑑加入景點」Modal 顯示「圖鑑中沒有可加入的景點」

**根本原因（已確認）**

資料流程不一致：
```
places.city (原始資料) → collections.city (抽卡複製)
                              ↓
                         精確比對 eq()
                              ↓
itinerary.city (建立行程) ← regions.nameZh (選擇器)
```

問題出在 `places.city` 和 `regions.nameZh` 是**兩個獨立的資料來源**，格式可能不一致：
- `collections.city`（來自 `places.city`）：可能是 "台北"、"Taipei"、"臺北市"
- `itinerary.city`（來自 `regions.nameZh`）：可能是 "台北市"

後端 `available-places` 使用**精確匹配**：
```typescript
const cityCondition = eq(collections.city, itinerary.city as string);
```

兩邊名稱不一致 → 查詢結果永遠為空

**Schema 確認**
```typescript
// collections 表
city: text("city").notNull(),  // 無外鍵，直接存文字

// places 表
city: text("city").notNull(),  // 無外鍵，直接存文字

// regions 表
nameZh: text("name_zh").notNull(),  // 用於 UI 選擇器
```

三個表的 city 都是獨立的 text 欄位，沒有關聯約束，導致格式不一致。

**建議修復方案**

**方案 A（推薦，最快）**：移除城市篩選
```typescript
// 讓用戶可以從所有圖鑑收藏中選擇，不限城市
const availablePlaces = await db
  .select(...)
  .from(collections)
  .where(and(
    eq(collections.userId, userId),
    or(eq(collections.isCoupon, false), isNull(collections.isCoupon))
  ));
```
理由：用戶可能想把別的城市景點加入行程（例如一日遊跨城市）

**方案 B**：模糊匹配
```typescript
// 使用 LIKE 或 ILIKE 做模糊比對
const cityCondition = sql`${collections.city} ILIKE ${'%' + baseCity + '%'}`;
```

**方案 C（長期）**：資料標準化
- `collections.city` 改為外鍵關聯 `regions.id`
- 或在存入時統一轉換為 `regions.nameZh` 格式

---

### 2026-01-28 #033：行程詳情新增景點座標與描述欄位 + V2 API 串接

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #033 |
| 狀態 | ✅ 完成 |

**#033 實作內容**
- [x] `types/itinerary.ts` 新增 `description`, `locationLat`, `locationLng` 欄位
- [x] 支援後端新結構（`place` 巢狀物件）
- [x] `ItineraryScreenV2.tsx` 新增 `openInMaps()` 函數
- [x] 地圖按鈕：有座標時開啟原生地圖導航（iOS/Android/Web）
- [x] 無座標時按鈕顯示為禁用狀態

**ItineraryScreenV2 完整 API 串接**
- [x] 載入行程列表 `GET /api/itinerary`
- [x] 載入行程詳情 `GET /api/itinerary/:id`
- [x] AI 對話 `POST /api/itinerary/:id/ai-chat`
- [x] 移除景點 `DELETE /api/itinerary/:id/places/:itemId`
- [x] 排序景點 `PUT /api/itinerary/:id/places/reorder`
- [x] 加入景點 `POST /api/itinerary/:id/places`
- [x] 取得可用景點 `GET /api/itinerary/:id/available-places`
- [x] 行程切換（左側邊欄）
- [x] 未登入/載入中/無行程狀態處理
- [x] AI 建議景點顯示
- [x] 多語言支援（中/英）

**新增 UI 功能**
- [x] 上/下箭頭排序景點（右側行程表）
- [x] 從圖鑑加入景點 Modal（多選、分類顯示）

---

### 2026-01-28 #030-#032：API 回應格式修正 + 扭蛋防刷 + 契約對齊

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #030-#032 |
| 狀態 | ✅ 完成 |

**#030 API 回應格式自檢與修正**
- [x] `itineraryApi.ts` - 所有方法已包裝 `success: true/false`
- [x] `collectionApi.ts` - `getFavorites`, `getPromoUpdates` 已包裝
- [x] `inventoryApi.ts` - `getInventory` 已包裝
- [x] `referralApi.ts` - `getLeaderboard` 已包裝
- [x] 確認其他 API（referral, contribution, inventory）類型定義有 `success`

**#031 扭蛋 API 新增 deviceId 參數**
- [x] 安裝 `expo-application` 套件
- [x] `gachaApi.ts` 新增 `getDeviceId()` helper function
- [x] `generateItinerary()` 參數新增 `deviceId`
- [x] `GachaScreen.tsx` 呼叫時帶入 `deviceId`
- [x] 新增 `DEVICE_LIMIT_EXCEEDED` 錯誤處理

**#032 全面契約對齊檢查**
- [x] 系統性驗證 22 個 API 服務檔案
- [x] 端點覆蓋率：100%
- [x] HTTP 方法一致性：99%
- [x] 認證處理：100% 正確
- [x] Success 欄位處理：100%（#030 問題已完全解決）

**#032 發現的輕微問題（不影響功能）**
- 地點促銷 API 端點有兩個版本（`/api/place/promo` vs `/api/collections/place/promo`）
- `PUT /api/itinerary/:id` 回傳格式在契約中未定義（需與後端確認）

---

### 2026-01-26 #026-#029：行程規劃 + AI 助手 + 優惠通知 + 用詞統一

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #026-#029 |
| 狀態 | ✅ 完成 |

**#026 行程安排 API V2 Breaking Change**
- [x] 建立 `src/types/itinerary.ts` - 行程相關型別定義
- [x] 建立 `src/services/itineraryApi.ts` - 行程管理 API 服務
- [x] 更新 `ItineraryScreen.tsx` - 使用 `collectionIds` 而非 `placeIds`
- [x] 刪除/排序使用 `itemId` (itinerary_places.id)

**#027 AI 對話式排程**
- [x] 實作 `POST /api/itinerary/:id/ai-chat` - AI 對話推薦
- [x] 實作 `POST /api/itinerary/:id/ai-add-places` - 加入 AI 建議
- [x] `ItineraryScreen.tsx` 新增 AI 助手對話介面

**#028 圖鑑優惠更新通知**
- [x] 新增 `PromoUpdatesResponse` 型別
- [x] 實作 `GET /api/collections/promo-updates`
- [x] 實作 `PATCH /api/collections/:id/promo-read`
- [x] `CollectionScreen.tsx` 顯示「優惠更新」紅點標籤

**#029 用詞統一**
- [x] `AchievementCategory`: `investor` → `sponsor`
- [x] 註解更新：投資者 → 贊助者

---

### 2026-01-23 #025：APP 改善計劃全面實作

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #025 |
| 狀態 | ✅ 完成 |

**11 個功能全部完成**（多語言切換暫緩除外）

| # | 功能 | 實作位置 |
|---|------|----------|
| 1 | 首頁活動區塊 | `HomeScreen.tsx` 整合 `eventApi` |
| 2 | 成就觸發 | `GachaScreen.tsx` 成就解鎖彈窗 |
| 3 | 扭蛋頁面 UI | 純前端已完成 |
| 4 | 圖鑑未讀 | `collectionApi.ts` `sort=unread` + `markCollectionItemRead` |
| 5 | Profile 更新 | `authApi.ts` `GET/PATCH /api/profile` |
| 6 | 推薦碼 G/A 格式 | `ReferralScreen.tsx` 已使用新格式 |
| 7 | 多語言切換 | ⏸️ 暫緩 |
| 8 | RevenueCat 募資 | `revenueCatService.ts` |
| 9 | 每日任務導航 | `economyApi.ts` |
| 10 | 推播通知 | `pushNotificationService.ts` |
| 11 | 社群貢獻 | `contributionApi.ts` |

---

### 2026-01-21 #024：Google 原生登入

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #024 |
| 狀態 | ✅ 完成 |

**完成項目**
- [x] 安裝 `expo-auth-session`, `expo-crypto`, `expo-web-browser`
- [x] 建立 `hooks/useGoogleAuth.ts` Hook
- [x] 更新 `app/login.tsx`（iOS/Android 原生登入、Web 保留 OAuth）

**注意**：需重新 build APP 才能測試（Expo Go 無法使用原生登入）

---

### 2026-01-21 #023：登入 API 回傳用戶姓名

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #023 |
| 狀態 | ✅ 後端已修復，APP 端已對應 |

**修復內容**
- JWT Token 現包含 `firstName`, `lastName`, `profileImageUrl`
- `app/login.tsx` 已從 `response.user.firstName` 取得姓名

---

### 2026-01-21 #021-022：Push Token API + Profile API

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #021-022 |
| 狀態 | ✅ 完成 |

**完成項目**
- [x] `commonApi.registerPushToken()` → `POST /api/notifications/register-token`
- [x] Profile API 統一為 `GET/PATCH /api/profile`

---

## 歷史回報摘要

| # | 日期 | 主題 | 狀態 |
|---|------|------|------|
| 036 | 01-29 | 帳號合併功能 | ✅ |
| 034 | 01-29 | 共用型別套件（@shared 模組） | ✅ |
| BUG | 01-29 | 行程「選擇景點」顯示空（城市名稱不一致） | 🔴 **緊急** |
| 033 | 01-28 | 行程詳情新增景點座標與描述 + V2 完整功能 | ✅ |
| 030-032 | 01-28 | API 回應格式修正 + 扭蛋防刷 + 契約對齊 | ✅ |
| 026-029 | 01-26 | 行程規劃 V2 + AI 助手 + 優惠通知 + 用詞統一 | ✅ |
| 025 | 01-23 | APP 改善計劃全面實作（11 功能） | ✅ |
| 024 | 01-21 | Google 原生登入 | ✅ |
| 023 | 01-21 | 登入 API 回傳用戶姓名 | ✅ |
| 021-022 | 01-21 | Push Token API + Profile API | ✅ |
| 020 | 01-20 | Phase 2 後端完成（推播、圖鑑未讀、成就、RevenueCat） | ✅ |
| 019 | 01-19 | UI 調整（背景/卡片顏色調換、設定頁整理） | ✅ |
| 018 | 01-19 | Lovable 設計系統實作（FilterChips、SearchInput 等 4 元件） | ✅ |
| 017 | 01-19 | Bug 修復（EconomyScreen 渲染、用戶名消失）+ 設計標準化 | ✅ |
| 013 | 01-19 | API 補齊（E10xxx-E13xxx 錯誤碼、優惠券驗證、SOS 取消） | ✅ |
| 012 | 01-19 | 六層架構一致性比對（50+ 端點對齊） | ✅ |
| 011 | 01-19 | 低優先級 API（SOS status/location、背包 add） | ✅ |
| 010 | 01-19 | 中優先級 API（config、推播、行程提交、地區端點對齊） | ✅ |
| 009 | 01-19 | 高優先級 API（每日任務、最愛、扭蛋額度）| ✅ |
| 008 | 01-19 | API 服務層補齊（排行榜、緊急聯絡人 CRUD） | ✅ |
| 007 | 01-18 | UI 風格更新（EconomyScreen、CrowdfundingScreen、ReferralScreen） | ✅ |
| 006 | 01-17 | Phase 2-4 畫面（募資、推薦、貢獻） | ✅ |
| 005 | 01-17 | Phase 1+5 畫面（經濟系統、帳號綁定） | ✅ |
| 004 | 01-17 | CLAUDE.md 更新（Phase 5-6 服務、契約版本） | ✅ |
| 003 | 01-17 | 型別+API 服務建立（economy、crowdfunding、referral、contribution） | ✅ |
| 002 | 01-16 | 記憶庫整理、歸檔舊文件 | ✅ |
| 001 | 01-16 | 建立同步機制、三端協作段落 | ✅ |

---

## 詳細歷史（需要時展開）

<details>
<summary>點擊展開 #020 Phase 2 後端完成</summary>

### 2026-01-20 #020：Phase 2 後端完成

**任務 1：推播通知對接**
- 安裝 `expo-notifications`、`expo-device`
- 建立 `pushNotificationService.ts`
- 登入成功後註冊 Token、登出時取消註冊

**任務 2：圖鑑未讀標記**
- `collectionApi.getCollections()` 新增 `sort` 參數
- 新增 `markCollectionItemRead()` 方法
- 城市卡片顯示未讀計數紅點

**任務 3：推薦碼改版**
- 新增 G/A 格式說明文字

**任務 4：成就追蹤對接**
- `EconomyScreen.tsx` 新增「累計」Tab
- 扭蛋後顯示成就解鎖 Alert

**任務 5：RevenueCat 募資購買**
- 建立 `revenueCatService.ts`

</details>

<details>
<summary>點擊展開 #018 Lovable 設計系統</summary>

### 2026-01-19 #018：Lovable 設計系統實作

**新增元件**
- `FilterChips.tsx` - 篩選晶片
- `SearchInput.tsx` - 搜尋框
- `CtaButton.tsx` - CTA 按鈕
- `StatCard.tsx` - 統計卡片

**頁面更新**
- `EconomyScreen.tsx` - 任務分組卡片
- `HapticTab.tsx` - Tab Bar 選中背景
- `MerchantDashboardScreen.tsx` - 簡化選單

</details>

<details>
<summary>點擊展開 #012 六層架構一致性比對</summary>

### 2026-01-19 #012：六層架構一致性比對

**比對結果**
- 完全匹配端點：50+
- 前端缺失端點：2（已補齊）
- 缺失錯誤碼範圍：4（E10xxx-E13xxx，已補齊）

**完全匹配的服務**
- economyApi.ts (5)、crowdfundingApi.ts (4)、referralApi.ts (11)
- contributionApi.ts (11)、gachaApi.ts (6)、collectionApi.ts (6)
- inventoryApi.ts (4)、authApi.ts (8)、commonApi.ts (12)

</details>

<details>
<summary>點擊展開 #006 Phase 2-4 畫面</summary>

### 2026-01-17 #006：Phase 2-4 畫面

**Phase 2：眾籌**
- `CrowdfundingScreen.tsx` - 活動列表
- `CrowdfundingDetailScreen.tsx` - 活動詳情

**Phase 3：推薦**
- `ReferralScreen.tsx` - 推薦碼、好友列表、餘額

**Phase 4：貢獻**
- `ContributionScreen.tsx` - 回報、建議、投票

</details>

<details>
<summary>點擊展開 #003 型別+API 服務建立</summary>

### 2026-01-17 #003：型別+API 服務建立

**新增檔案**
- `src/types/economy.ts`, `crowdfunding.ts`, `referral.ts`, `contribution.ts`
- `src/services/economyApi.ts` (5 APIs)
- `src/services/crowdfundingApi.ts` (4 APIs)
- `src/services/referralApi.ts` (9 APIs)
- `src/services/contributionApi.ts` (11 APIs)

**總計**：32 個新 API

</details>
