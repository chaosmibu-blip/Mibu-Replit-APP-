# 🔄 後端同步回報

> APP 完成後端同步指令後，在此記錄狀態

---

## 最新回報

### 2026-01-28 🐛 BUG：行程「選擇景點」顯示空（圖鑑有資料）

| 項目 | 內容 |
|------|------|
| 來源 | APP 端發現 |
| 狀態 | 🔴 待後端修復 |
| 嚴重度 | 高（影響核心功能） |

**問題描述**
- 用戶圖鑑有 1023 個景點（11 個城市）
- 但在行程「選擇景點」頁面顯示「圖鑑是空的」

**問題根源**
後端 `GET /api/itinerary/:id/available-places` 使用城市名稱**精確比較**：
```typescript
const cityCondition = eq(collections.city, itinerary.city as string);
```

但 `collections.city`（來自 `places.city`）和 `itinerary.city`（來自 `regions.nameZh`）格式可能不一致：
- 例如：`places.city = "台北"` vs `itinerary.city = "台北市"`

**後端診斷日誌**
後端已有診斷日誌，可查看 server logs 確認問題：
```
[available-places] 行程 city: "XXX", district: "XXX"
[available-places] 用戶圖鑑城市分布: ...
```

**建議修復方案**

方案 A（推薦）：直接返回用戶所有圖鑑收藏，不做城市篩選
```typescript
// 移除城市條件，讓用戶可以從所有圖鑑收藏中選擇
const availablePlaces = await db
  .select(...)
  .from(collections)
  .where(and(
    eq(collections.userId, userId),
    or(eq(collections.isCoupon, false), isNull(collections.isCoupon))
  ));
```

方案 B：標準化城市名稱
- 在存入 `collections` 時，統一使用 `regions.nameZh` 格式
- 或在查詢時做模糊比較

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
| BUG | 01-28 | 行程「選擇景點」顯示空 | 🔴 待後端修復 |
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
