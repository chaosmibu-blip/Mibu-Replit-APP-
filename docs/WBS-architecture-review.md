# WBS — Mibu App 架構審查與重構

> **專案期間**：Phase 0 ~ Phase 3（共 11 個 commit）
> **涵蓋範圍**：95 個檔案，+7,283 / -5,343 行

---

## 總覽

| Phase | 名稱 | Commit 數 | 檔案數 | 行數變化 |
|-------|------|-----------|--------|----------|
| 0 | 清理基礎 | 1 | — | 移除死碼 + AppState 修復 + env 整理 |
| 1 | Context 拆分 | 3 | 67+ | AppContext → Auth + I18n + Gacha，67 個消費者遷移 |
| 2 | 畫面瘦身 | 2 | 8+ | Modal 抽離 + StyleSheet 外移 |
| 3 | React Query 統一快取 | 5 | 50+ | 基礎建設 + 31 個畫面遷移 + 14 個 hooks |

---

## Phase 0 — 清理基礎（Clean Foundation）

| # | 工作項目 | 說明 |
|---|---------|------|
| 0.1 | 移除死碼 | 未使用的 import、變數、函數 |
| 0.2 | AppState 事件修復 | 正確處理前後台切換事件 |
| 0.3 | 環境變數整理 | 敏感資訊移至 .env |

**交付物**：`f9b7c5a` — Phase 0 commit

---

## Phase 1 — Context 拆分（Context Splitting）

### 1A — 拆分 Context

| # | 工作項目 | 說明 |
|---|---------|------|
| 1A.1 | 建立 AuthContext | 認證狀態（user、token、login/logout） |
| 1A.2 | 建立 I18nContext | 多語系（t、locale、切換語言） |
| 1A.3 | 建立 GachaProvider | 扭蛋模組專用狀態 |
| 1A.4 | AppContext 保留 | 向下相容 re-export，逐步淘汰 |

**交付物**：`ab724a8` — Phase 1A

### 1C — 消費者遷移

| # | 工作項目 | 說明 |
|---|---------|------|
| 1C.1 | 67 個消費者遷移 | `useApp()` → `useAuth()` / `useI18n()` |
| 1C.2 | 殘留註解更新 | 舊的 useApp 引用改為新 hooks |

**交付物**：`add1303` + `cb01c6f` — Phase 1C

---

## Phase 2 — 畫面瘦身（Screen Slimming）

### 2A — Modal 抽離

| # | 工作項目 | 說明 |
|---|---------|------|
| 2A.1 | CreateItineraryModal | 從 ItineraryScreenV2 抽出建立行程 Modal |
| 2A.2 | AddPlacesModal | 從 ItineraryScreenV2 抽出新增景點 Modal |

**交付物**：`b4f8729` — Phase 2A

### 2B-E — StyleSheet 抽離

| # | 工作項目 | 目標畫面 |
|---|---------|---------|
| 2B | EconomyScreen | styles → EconomyScreen.styles.ts |
| 2C | CollectionScreen | styles → CollectionScreen.styles.ts |
| 2D | HomeScreen | styles → HomeScreen.styles.ts |
| 2E | ReferralScreen | styles → ReferralScreen.styles.ts |

**交付物**：`03fbde4` — Phase 2B-E

---

## Phase 3 — React Query 統一快取策略

### 3.0 — 基礎建設

| # | 工作項目 | 說明 |
|---|---------|------|
| 3.0.1 | 安裝 @tanstack/react-query v5.90 | 核心依賴 |
| 3.0.2 | QueryProvider | 全域 QueryClient 設定 |
| 3.0.3 | useAuthQuery | 自動注入 JWT 的 query wrapper |
| 3.0.4 | useAuthInfiniteQuery | 分頁查詢 wrapper |
| 3.0.5 | useAuthMutation | mutation wrapper |
| 3.0.6 | useReferralQueries | 第一個遷移示範 |

**交付物**：`356a25c` — Phase 3 基礎建設

### 3.1 — 領域 Hooks 建立（14 個檔案）

| # | Hooks 檔案 | 涵蓋領域 |
|---|-----------|---------|
| 3.1.1 | useAuthQuery.ts | 核心基礎（query/mutation/infinite） |
| 3.1.2 | useReferralQueries.ts | 推薦系統 |
| 3.1.3 | useEconomyQueries.ts | 經濟系統（金幣、規則、特權） |
| 3.1.4 | useHomeQueries.ts | 首頁（活動、每日任務） |
| 3.1.5 | useMailboxQueries.ts | 信箱系統（列表、詳情、兌換） |
| 3.1.6 | useCollectionQueries.ts | 圖鑑系統 |
| 3.1.7 | useNotificationQueries.ts | 通知系統（列表、偏好、已讀） |
| 3.1.8 | useCrowdfundingQueries.ts | 募資系統 |
| 3.1.9 | useContributionQueries.ts | 貢獻系統（回報、建議、投票） |
| 3.1.10 | useInventoryQueries.ts | 物品箱 |
| 3.1.11 | useSOSQueries.ts | SOS 緊急求助 |
| 3.1.12 | useAdminQueries.ts | 管理員後台 |
| 3.1.13 | useMerchantQueries.ts | 商家模組 |
| 3.1.14 | useSpecialistQueries.ts | 專家模組 |

### 3.2 — 畫面遷移（31 個畫面）

#### Shared 模組（6 畫面）

| # | 畫面 | hooks 來源 |
|---|------|-----------|
| 3.2.1 | HomeScreen | useHomeQueries |
| 3.2.2 | NotificationListScreen | useNotificationQueries |
| 3.2.3 | NotificationPreferencesScreen | useNotificationQueries |
| 3.2.4 | SOSScreen | useSOSQueries |
| 3.2.5 | SOSContactsScreen | useSOSQueries |

#### Traveler 模組（10 畫面）

| # | 畫面 | hooks 來源 |
|---|------|-----------|
| 3.2.6 | ReferralScreen | useReferralQueries |
| 3.2.7 | EconomyScreen | useEconomyQueries |
| 3.2.8 | MailboxScreen | useMailboxQueries |
| 3.2.9 | MailboxDetailScreen | useMailboxQueries |
| 3.2.10 | CollectionScreen | useCollectionQueries |
| 3.2.11 | CrowdfundingScreen | useCrowdfundingQueries |
| 3.2.12 | CrowdfundingDetailScreen | useCrowdfundingQueries |
| 3.2.13 | ContributionScreen | useContributionQueries |
| 3.2.14 | FavoritesScreen | useCollectionQueries |
| 3.2.15 | ItemBoxScreen | useInventoryQueries |

#### Admin 模組（4 畫面）

| # | 畫面 | hooks 來源 |
|---|------|-----------|
| 3.2.16 | AdminDashboardScreen | useAdminQueries |
| 3.2.17 | AdminAnnouncementsScreen | useAdminQueries |
| 3.2.18 | AdminExclusionsScreen | useAdminQueries |
| 3.2.19 | AnnouncementManageScreen | useAdminQueries |

#### Merchant 模組（14 畫面）

| # | 畫面 | hooks 來源 |
|---|------|-----------|
| 3.2.20 | MerchantDashboardScreen | useMerchantQueries |
| 3.2.21 | MerchantProfileScreen | useMerchantQueries |
| 3.2.22 | MerchantAnalyticsScreen | useMerchantQueries |
| 3.2.23 | MerchantCouponsScreen | useMerchantQueries |
| 3.2.24 | MerchantTransactionsScreen | useMerchantQueries |
| 3.2.25 | MerchantPlacesScreen | useMerchantQueries |
| 3.2.26 | MerchantProductsScreen | useMerchantQueries |
| 3.2.27 | MerchantVerifyScreen | useMerchantQueries |
| 3.2.28 | ClaimPlaceScreen | useMerchantQueries |
| 3.2.29 | CouponFormScreen | useMerchantQueries |
| 3.2.30 | CouponListScreen | useMerchantQueries |
| 3.2.31 | NewPlaceScreen | useMerchantQueries |
| 3.2.32 | PlaceEditScreen | useMerchantQueries |
| 3.2.33 | PlaceListScreen | useMerchantQueries |

#### Specialist 模組（3 畫面）

| # | 畫面 | hooks 來源 |
|---|------|-----------|
| 3.2.34 | SpecialistDashboardScreen | useSpecialistQueries |
| 3.2.35 | SpecialistProfileScreen | useSpecialistQueries |
| 3.2.36 | SpecialistHistoryScreen | useSpecialistQueries |

### 3.3 — 刻意跳過的畫面（7 個，含原因）

| 畫面 | 跳過原因 |
|------|---------|
| ItineraryScreenV2 | 過於複雜（18+ useState、AI chat、拖放排序、手動快取） |
| GachaScreen | 一次性動作（非快取資料），不適合 query 模式 |
| ItemsScreen | 無 API 呼叫，直接讀 context |
| ChatScreen | Mock 資料，無真實 API |
| LocationScreen | 即時串流，非 RESTful 查詢 |
| SpecialistTrackingScreen | WebSocket 即時追蹤 |
| SettingsScreen | 低價值，一次性操作 |

---

## 遷移模式摘要

| 移除的模式 | 替換為 |
|-----------|--------|
| `useState` (data/loading/refreshing) | `useXxxQuery()` 衍生狀態 |
| `useCallback` + `getToken` + API | React Query 自動快取 |
| `useEffect` 初始載入 | Query 自動 mount fetch |
| 手動 `setRefreshing` | `query.isFetching && !query.isLoading` |
| 手動錯誤處理 | Query `onError` / `isError` |
| `apiService.xxx(token, ...)` | `mutation.mutate(params)` |

---

## 成果數據

| 指標 | 數值 |
|------|------|
| 總修改檔案 | 95 |
| 新增行數 | +7,283 |
| 移除行數 | -5,343 |
| 淨影響 | +1,940（因新增 hooks + styles 檔案） |
| 遷移畫面數 | 31 |
| 新增 hooks 檔案 | 14 |
| Context 拆分 | 1 → 3（Auth + I18n + Gacha） |
| 消費者遷移 | 67 個檔案 |

---

*產出日期：2026-02-13*
