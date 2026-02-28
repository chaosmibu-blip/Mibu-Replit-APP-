# WBS — Mibu App 工作分解結構

> **專案名稱**：Mibu — 遊戲化旅遊安全平台
> **技術棧**：React Native + Expo + TypeScript + React Query v5 + Expo Router
> **四大角色**：旅人 (Traveler) / 商家 (Merchant) / 專家 (Specialist) / 管理員 (Admin)
> **最後更新**：2026-02-28
> **資料來源**：以實際程式碼為準，非規劃文件

---

## 總覽

| WBS | 模組 | 畫面數 | 說明 |
|-----|------|--------|------|
| 1 | 基礎建設 | — | 認證、導航、狀態管理、主題、i18n、API 層、元件庫、基礎服務 |
| 2 | 旅人核心 | 21 | 扭蛋、圖鑑、行程、經濟、信箱、物品箱、社群互動、MINI 夥伴 |
| 3 | 商家系統 | 16 | 入駐申請、店面、優惠券、產品、分析、核銷 |
| 4 | 專家系統 | 6 | 入駐申請、儀表板、資料、追蹤、歷史 |
| 5 | 管理員系統 | 4 | 儀表板、公告、審核、排除 |
| 6 | 共用功能 | 13 | 通知、SOS、個人檔案、設定、訪客升級 |
| 7 | 架構重構 | — | Context 拆分、React Query 遷移（已完成） |
| **合計** | | **60** | |

---

## 1. 基礎建設（Foundation）

### 1.1 認證系統

| # | 工作項目 | 說明 | 關鍵檔案 |
|---|---------|------|---------|
| 1.1.1 | Apple Sign In | OAuth 登入（iOS 優先） | `app/login.tsx` |
| 1.1.2 | Google Sign In | OAuth 登入（規劃中） | — |
| 1.1.3 | JWT Token 管理 | 7 天過期、自動 refresh、跨平台儲存 | `src/context/tokenUtils.ts` |
| 1.1.4 | Token 安全儲存 | iOS: SecureStore / Web: AsyncStorage | `src/context/AuthContext.tsx` |
| 1.1.5 | 401 自動攔截 | Token 過期自動登出 + 導向登入頁 | `src/services/base.ts` |
| 1.1.6 | 角色權限控制 | user / merchant / specialist / admin | `src/context/AuthContext.tsx` |
| 1.1.7 | 帳號合併 | 同 email 不同 provider 合併 | `src/services/authApi.ts` |

### 1.2 導航系統

| # | 工作項目 | 說明 | 關鍵檔案 |
|---|---------|------|---------|
| 1.2.1 | Expo Router 檔案路由 | 73 個路由檔案 | `app/` |
| 1.2.2 | Tab Navigator | 4 顯示 + 2 隱藏（見下方） | `app/(tabs)/_layout.tsx` |
| 1.2.3 | Stack Navigator | 角色子頁面、Modal | `app/_layout.tsx` |
| 1.2.4 | Auth Guard | 未登入導向 login、角色導向 dashboard | `app/_layout.tsx` |
| 1.2.5 | Deep Link | 推播點擊 → 對應畫面 | `app/_layout.tsx` |
| 1.2.6 | 404 處理 | 找不到路由的 fallback | `app/+not-found.tsx` |
| 1.2.7 | Error Boundary | 全域錯誤攔截 | `app/error.tsx` |

**Tab 結構（實際）**：

| Tab | 名稱 | 顯示 | 說明 |
|-----|------|------|------|
| 1 | 首頁 | ✅ 顯示 | Home |
| 2 | 扭蛋 | ✅ 顯示 | Gacha（含 badge） |
| 3 | 行程 | ✅ 顯示 | Itinerary |
| 4 | 設定 | ✅ 顯示 | Settings |
| — | 規劃 | 🔗 隱藏 | Planner（SegmentedControl：定位/行程/AI 對話） |
| — | 圖鑑 | 🔗 隱藏 | Collection |

### 1.3 狀態管理

| # | 工作項目 | 說明 | 關鍵檔案 |
|---|---------|------|---------|
| 1.3.1 | AuthContext | 用戶狀態 + JWT + login/logout | `src/context/AuthContext.tsx` |
| 1.3.2 | I18nContext | 多語系 + locale 切換 | `src/context/I18nContext.tsx` |
| 1.3.3 | AppContext（舊） | 向下相容 re-export，逐步淘汰 | `src/context/AppContext.tsx` |
| 1.3.4 | QueryProvider | React Query v5 全域設定 | `src/context/QueryProvider.tsx` |
| 1.3.5 | AsyncStorage 持久化 | 語言、快取、偏好 | `src/constants/storageKeys.ts` |

### 1.4 主題與設計系統

| # | 工作項目 | 說明 | 關鍵檔案 |
|---|---------|------|---------|
| 1.4.1 | 品牌色彩（MibuBrand） | 主色 brown、輔色 copper、背景 warmWhite | `constants/Colors.ts` |
| 1.4.2 | 語意色彩 | success / warning / error / info（含 light/main/dark） | `constants/Colors.ts` |
| 1.4.3 | 角色色彩 | merchant / specialist / admin | `constants/Colors.ts` |
| 1.4.4 | 稀有度色彩 | N / R / SR / SSR / SP | `constants/Colors.ts` |
| 1.4.5 | Design Token | Spacing、Radius、FontSize、Shadow | `src/theme/designTokens.ts` |
| 1.4.6 | Paper Theme | React Native Paper 主題配置 | `src/theme/paperTheme.ts` |
| 1.4.7 | 稀有度樣式 | 各 tier 的背景/文字/邊框 | `src/constants/tierStyles.ts` |

### 1.5 多語系（i18n）

| # | 工作項目 | 說明 | 關鍵檔案 |
|---|---------|------|---------|
| 1.5.1 | 繁體中文 (zh-TW) | 主要語系 | `src/constants/translations/zh-TW.ts` |
| 1.5.2 | English (en) | 英文 | `src/constants/translations/en.ts` |
| 1.5.3 | 日本語 (ja) | 日文 | `src/constants/translations/ja.ts` |
| 1.5.4 | 한국어 (ko) | 韓文 | `src/constants/translations/ko.ts` |
| 1.5.5 | 動態切換 | 不須重啟 App，持久化至 AsyncStorage | `src/utils/i18n.ts` |

### 1.6 API 基礎層

| # | 工作項目 | 說明 | 關鍵檔案 |
|---|---------|------|---------|
| 1.6.1 | Axios 基礎配置 | baseURL、interceptors、timeout | `src/services/base.ts` |
| 1.6.2 | Token 自動注入 | useAuthQuery wrapper 自動帶 JWT | `src/hooks/useAuthQuery.ts` |
| 1.6.3 | 錯誤碼體系 | E1xxx 認證 / E2xxx 扭蛋 / E4xxx 商家 / E5xxx 驗證 | `src/types/errors.ts` |
| 1.6.4 | 共用型別套件 | `@chaosmibu-blip/mibu-shared` 同步後端型別 | `package.json` |

### 1.7 共用 UI 元件庫

**src/modules/shared/components/**：

| # | 元件 | 說明 |
|---|------|------|
| 1.7.1 | AiDisclosureModal | AI 資料揭露同意彈窗 |
| 1.7.2 | CtaButton | Call-to-action 按鈕 |
| 1.7.3 | FilterChips | 篩選晶片（多選） |
| 1.7.4 | InfoToast | 通知 Toast |
| 1.7.5 | LoadingAdScreen | 載入等待畫面 |
| 1.7.6 | ModuleNav (GachaTopNav) | 模組導航 |
| 1.7.7 | RoleSwitcher | 角色切換（SuperAdmin） |
| 1.7.8 | SearchInput | 搜尋輸入框 |
| 1.7.9 | SurveyFields | 問卷欄位 |
| 1.7.10 | TagInput | 標籤輸入 |
| 1.7.11 | TierBadge | 稀有度等級徽章 |
| 1.7.12 | TutorialOverlay | 新手教學覆蓋層 |
| 1.7.13 | UpgradePromptToast | 訪客升級提示 |

**src/modules/shared/components/ui/**：

| # | 元件 | 說明 |
|---|------|------|
| 1.7.14 | Button | 基礎按鈕 |
| 1.7.15 | Card | 卡片容器 |
| 1.7.16 | CoinReward | 金幣 icon + 數量 |
| 1.7.17 | EmptyState | 空資料提示 |
| 1.7.18 | ErrorState | 錯誤顯示 + 重試 |
| 1.7.19 | LoadingSkeleton | 載入骨架屏 |
| 1.7.20 | NetworkBanner | 網路狀態橫幅 |
| 1.7.21 | SectionHeader | 區塊標題 |
| 1.7.22 | SegmentedControl | 分段控制切換 |
| 1.7.23 | Select | 下拉選單 |
| 1.7.24 | StatCard | 統計卡片 |

**模組專用元件**：

| 元件 | 模組 | 說明 |
|------|------|------|
| MerchantRegistrationForm | merchant | 商家註冊表單 |
| CouponPreviewCard | traveler | 優惠券預覽卡片 |
| CouponWinAnimation | traveler | 優惠券贏取動畫 |

**根目錄 components/**：

| 元件 | 說明 |
|------|------|
| HapticTab | Tab Bar 觸覺回饋（iOS） |
| ThemedText | 主題化文字 |
| ThemedView | 主題化容器 |

### 1.8 基礎服務

| # | 工作項目 | 說明 | 關鍵檔案 |
|---|---------|------|---------|
| 1.8.1 | 預載服務 | 登入後預載頭像 + 素材 | `src/services/preloadService.ts` |
| 1.8.2 | 頭像快取服務 | 三層快取（記憶體 → AsyncStorage → 首字母） | `src/services/avatarService.ts` |
| 1.8.3 | 素材 API | `GET /api/assets?category=xxx` | `src/services/assetApi.ts` |
| 1.8.4 | Cloudinary 圖片優化 | URL builder、resize、format | `src/utils/cloudinary.ts` |
| 1.8.5 | 表單驗證 | email、phone、password | `src/utils/validation.ts` |
| 1.8.6 | RevenueCat IAP | 內購整合（眾籌解鎖） | `src/services/revenueCatService.ts` |
| 1.8.7 | WebSocket | 專家即時追蹤 | `src/services/socket.ts` |

---

## 2. 旅人核心（Traveler Core）— 21 畫面

### 2.1 註冊 / 登入流程

| # | 畫面 | 路由 | 狀態 |
|---|------|------|------|
| 2.1.1 | LoginScreen | `/login` | ✅ |
| 2.1.2 | RegisterScreen | `/register` | ✅ |
| 2.1.3 | RegisterSuccessScreen | `/register-success` | ✅ |
| 2.1.4 | AuthCallbackScreen | `/auth/callback` | ✅ |
| 2.1.5 | PendingApprovalScreen | `/pending-approval` | ✅ |

### 2.2 首頁

| # | 工作項目 | hooks | 狀態 |
|---|---------|-------|------|
| 2.2.1 | 問候區（嗨，旅行者！+ 頭像） | — | ✅ |
| 2.2.2 | 等級卡片（Lv、稱號、連續登入、XP 進度條） | useHomeQueries | ✅ RQ |
| 2.2.3 | 每日任務卡（完成數/總數、已獲 XP） | useHomeQueries | ✅ RQ |
| 2.2.4 | 活動 Tab（公告 / 全台活動 / 限時活動） | useHomeQueries | ✅ RQ |

**畫面**：HomeScreen — `src/modules/shared/screens/HomeScreen.tsx`
**路由**：`/`（Tab 1）

### 2.3 AI 扭蛋系統

| # | 工作項目 | 狀態 |
|---|---------|------|
| 2.3.1 | 國家/城市選擇（下拉選單，API 載入） | ✅ |
| 2.3.2 | 抽取張數調整（Slider 5~12 張） | ✅ |
| 2.3.3 | 道具箱容量檢查（滿了不能抽） | ✅ |
| 2.3.4 | AI 行程生成（呼叫後端 AI，等 1-2 分鐘） | ✅ |
| 2.3.5 | 扭蛋動畫（CouponWinAnimation） | ✅ |
| 2.3.6 | 獎池預覽（SP/SSR 優惠券列表 Modal） | ✅ |
| 2.3.7 | 載入等待畫面（LoadingAdScreen） | ✅ |
| 2.3.8 | 新手教學（TutorialOverlay 引導操作） | ✅ |
| 2.3.9 | 扭蛋結果展示（ItemsScreen 景點卡片瀏覽） | ✅ |
| 2.3.10 | 429 頻率限制（每日 36 抽上限） | ✅ |
| 2.3.11 | 機率說明（稀有度機率 Modal） | ⏸ 等商家端開放 |

**畫面**：GachaScreen / GachaModuleScreen / ItemsScreen
**路由**：`/gacha`、`/gacha/items`（Tab 2）

### 2.4 收藏圖鑑

| # | 工作項目 | hooks | 狀態 |
|---|---------|-------|------|
| 2.4.1 | 景點卡片網格（橫版/直版、稀有度標示） | useCollectionQueries | ✅ RQ |
| 2.4.2 | 篩選（城市/稀有度 FilterChips 多選） | useCollectionQueries | ✅ RQ |
| 2.4.3 | 搜尋（景點名稱關鍵字） | useCollectionQueries | ✅ RQ |
| 2.4.4 | 投票（景點投票互動） | useCollectionQueries | ✅ RQ |

**畫面**：CollectionScreen — `src/modules/traveler/screens/CollectionScreen.tsx`
**路由**：`/collection`（隱藏 Tab）

### 2.5 行程規劃

| # | 工作項目 | 狀態 |
|---|---------|------|
| 2.5.1 | 規劃器主頁（SegmentedControl：定位/行程/AI 對話） | ✅ |
| 2.5.2 | 建立行程（CreateItineraryModal 月曆選擇） | ✅ |
| 2.5.3 | 新增景點（AddPlacesModal 搜尋加入） | ✅ |
| 2.5.4 | 拖放排序（DraggableFlatList 景點排序） | ✅ |
| 2.5.5 | 即時定位（LocationScreen 地圖顯示） | ✅ |
| 2.5.6 | AI 對話（ChatScreen 行程討論） | ⚠️ Mock 階段 |

**畫面**：Planner (index.tsx) → LocationScreen / ItineraryScreenV2 / ChatScreen
**路由**：`/planner`（隱藏 Tab）、`/(tabs)/itinerary`（Tab 3 入口）

### 2.6 經濟系統

| # | 工作項目 | hooks | 狀態 |
|---|---------|-------|------|
| 2.6.1 | 金幣餘額 | useEconomyQueries | ✅ RQ |
| 2.6.2 | 等級與 XP（等級進度、稱號、階段） | useEconomyQueries | ✅ RQ |
| 2.6.3 | 每日任務（任務清單 + 獎勵） | useEconomyQueries | ✅ RQ |
| 2.6.4 | 特權商店 | useEconomyQueries | ✅ RQ |
| 2.6.5 | 遊戲規則（稀有度機率 + 規則說明） | useEconomyQueries | ✅ RQ |

**畫面**：EconomyScreen — `src/modules/traveler/screens/EconomyScreen.tsx`
**路由**：`/economy`

### 2.7 信箱系統

| # | 工作項目 | hooks | 狀態 |
|---|---------|-------|------|
| 2.7.1 | 信件列表（已讀/未讀、分類） | useMailboxQueries | ✅ RQ |
| 2.7.2 | 信件詳情（內容 + 附件） | useMailboxQueries | ✅ RQ |
| 2.7.3 | 獎勵領取（金幣/道具領取） | useMailboxQueries | ✅ RQ |

**畫面**：MailboxScreen / MailboxDetailScreen
**路由**：`/mailbox`、`/mailbox/[id]`

### 2.8 物品箱

| # | 工作項目 | hooks | 狀態 |
|---|---------|-------|------|
| 2.8.1 | 物品列表（已擁有道具一覽） | useInventoryQueries | ✅ RQ |
| 2.8.2 | 物品使用（道具效果觸發） | useInventoryQueries | ✅ RQ |
| 2.8.3 | 容量管理（上限警示 + 滿箱禁抽） | useInventoryQueries | ✅ RQ |

**畫面**：ItemBoxScreen — `src/modules/traveler/screens/ItemBoxScreen.tsx`
**路由**：`/itembox`

### 2.9 社群互動

| # | 工作項目 | hooks | 狀態 |
|---|---------|-------|------|
| 2.9.1 | 募資活動列表 | useCrowdfundingQueries | ✅ RQ |
| 2.9.2 | 募資詳情 + 贊助 | useCrowdfundingQueries | ✅ RQ |
| 2.9.3 | 社群貢獻（回報/建議/投票） | useContributionQueries | ✅ RQ |
| 2.9.4 | 最愛景點管理 | useCollectionQueries | ✅ RQ |
| 2.9.5 | 推薦好友 | useReferralQueries | ✅ RQ |
| 2.9.6 | 活動詳情 | — | ✅ |

**畫面**：CrowdfundingScreen / CrowdfundingDetailScreen / ContributionScreen / FavoritesScreen / ReferralScreen
**路由**：`/crowdfunding`、`/crowdfunding/[id]`、`/contribution`、`/favorites`、`/favorites-management`、`/referral`、`/event/[id]`

### 2.10 MINI 夥伴系統

| # | 工作項目 | hooks | 狀態 |
|---|---------|-------|------|
| 2.10.1 | MINI 個人檔案（名稱編輯） | useMiniQueries | ✅ RQ |
| 2.10.2 | 探索系統（出發/領獎/定位檢查） | useMiniQueries | ✅ RQ |
| 2.10.3 | 塗鴉牆（景點留言評論） | useMiniQueries | ✅ RQ |
| 2.10.4 | 私人筆記（地點備忘） | useMiniQueries | ✅ RQ |
| 2.10.5 | 夥伴系統（多隻 MINI 貓） | useMiniQueries | ✅ RQ |
| 2.10.6 | 成長系統（升等/進化） | useMiniQueries | ✅ RQ |

**畫面**：MiniProfileScreen — `src/modules/traveler/screens/MiniProfileScreen.tsx`
**路由**：`/mini-profile`

---

## 3. 商家系統（Merchant）— 16 畫面

### 3.1 商家入駐

| # | 畫面 | 路由 | 狀態 |
|---|------|------|------|
| 3.1.1 | MerchantApplyScreen | `/merchant-apply` | ✅ |
| 3.1.2 | MerchantRegisterScreen | `/merchant-register` | ✅ |
| 3.1.3 | MerchantRegistrationForm | `/register-merchant` | ✅ |

### 3.2 商家總覽

| # | 工作項目 | hooks | 狀態 |
|---|---------|-------|------|
| 3.2.1 | 儀表板（營運 KPI、快捷入口） | useMerchantQueries | ✅ RQ |
| 3.2.2 | 個人資料（商家基本資訊編輯） | useMerchantQueries | ✅ RQ |

**畫面**：MerchantDashboardScreen / MerchantProfileScreen
**路由**：`/merchant-dashboard`、`/merchant/profile`

### 3.3 店面管理

| # | 畫面 | hooks | 狀態 |
|---|------|-------|------|
| 3.3.1 | 店面列表 MerchantPlacesScreen / PlaceListScreen | useMerchantQueries | ✅ RQ |
| 3.3.2 | 認領店面 ClaimPlaceScreen | useMerchantQueries | ✅ RQ |
| 3.3.3 | 新增店面 NewPlaceScreen | useMerchantQueries | ✅ RQ |
| 3.3.4 | 編輯店面 PlaceEditScreen | useMerchantQueries | ✅ RQ |

**路由**：`/merchant/places`、`/merchant/place/[id]`

### 3.4 優惠券 & 產品

| # | 畫面 | hooks | 狀態 |
|---|------|-------|------|
| 3.4.1 | 優惠券列表 MerchantCouponsScreen / CouponListScreen | useMerchantQueries | ✅ RQ |
| 3.4.2 | 新增/編輯優惠券 CouponFormScreen | useMerchantQueries | ✅ RQ |
| 3.4.3 | 產品管理 MerchantProductsScreen | useMerchantQueries | ✅ RQ |

**路由**：`/merchant/coupons`、`/merchant/products`

### 3.5 數據與核銷

| # | 畫面 | hooks | 狀態 |
|---|------|-------|------|
| 3.5.1 | 數據分析 MerchantAnalyticsScreen | useMerchantQueries | ✅ RQ |
| 3.5.2 | 交易記錄 MerchantTransactionsScreen | useMerchantQueries | ✅ RQ |
| 3.5.3 | 核銷驗證 MerchantVerifyScreen | useMerchantQueries | ✅ RQ |

**路由**：`/merchant/analytics`、`/merchant/transactions`、`/merchant/verify`

---

## 4. 專家系統（Specialist）— 6 畫面

### 4.1 專家入駐

| # | 畫面 | 路由 | 狀態 |
|---|------|------|------|
| 4.1.1 | RegisterSpecialistScreen | `/register-specialist` | ✅ |
| 4.1.2 | PartnerApplyScreen | `/partner-apply` | ✅ |

### 4.2 專家營運

| # | 畫面 | hooks | 狀態 |
|---|------|-------|------|
| 4.2.1 | 儀表板 SpecialistDashboardScreen | useSpecialistQueries | ✅ RQ |
| 4.2.2 | 個人資料 SpecialistProfileScreen | useSpecialistQueries | ✅ RQ |
| 4.2.3 | 服務歷史 SpecialistHistoryScreen | useSpecialistQueries | ✅ RQ |
| 4.2.4 | 旅人列表 SpecialistTravelersScreen | — | ✅ |
| 4.2.5 | 即時追蹤 SpecialistTrackingScreen | — (WebSocket) | ✅ |

**路由**：`/specialist-dashboard`、`/specialist/profile`、`/specialist/history`、`/specialist/travelers`、`/specialist/tracking`

---

## 5. 管理員系統（Admin）— 4 畫面

| # | 畫面 | hooks | 狀態 |
|---|------|-------|------|
| 5.1 | 系統儀表板 AdminDashboardScreen | useAdminQueries | ✅ RQ |
| 5.2 | 用戶審核 AdminDashboardScreen（子功能） | useAdminQueries | ✅ RQ |
| 5.3 | 公告管理 AdminAnnouncementsScreen | useAdminQueries | ✅ RQ |
| 5.4 | 公告新增/編輯 AnnouncementManageScreen | useAdminQueries | ✅ RQ |
| 5.5 | 全域排除設定 AdminExclusionsScreen | useAdminQueries | ✅ RQ |

**路由**：`/admin-dashboard`、`/admin-announcements`、`/announcement-manage`、`/admin-exclusions`

---

## 6. 共用功能（Cross-Cutting）— 13 畫面

### 6.1 推播通知系統

| # | 工作項目 | hooks | 狀態 |
|---|---------|-------|------|
| 6.1.1 | Expo Push 註冊（取得 push token） | — | ✅ |
| 6.1.2 | 全域推播監聽器（前景/背景/關閉） | — | ✅ |
| 6.1.3 | Deep Link 導航（通知點擊 → 對應畫面） | — | ✅ |
| 6.1.4 | 通知歷史列表 NotificationListScreen | useNotificationQueries | ✅ RQ |
| 6.1.5 | 通知偏好設定 NotificationPreferencesScreen | useNotificationQueries | ✅ RQ |
| 6.1.6 | 紅點未讀狀態（首頁紅點 badge） | useNotificationQueries | ✅ RQ |

**路由**：`/notifications`、`/notification-preferences`

### 6.2 SOS 緊急求助

| # | 畫面 | hooks | 狀態 |
|---|------|-------|------|
| 6.2.1 | SOS 發送 SOSScreen | useSOSQueries | ✅ RQ |
| 6.2.2 | 緊急聯絡人 SOSContactsScreen | useSOSQueries | ✅ RQ |

**路由**：`/sos`、`/sos-contacts`

### 6.3 個人檔案

| # | 工作項目 | 狀態 |
|---|---------|------|
| 6.3.1 | 個人資料編輯（暱稱、頭像、簡介） | ✅ |
| 6.3.2 | 頭像選擇器 AvatarSelectorModal | ✅ |
| 6.3.3 | 頭像遠端化（Cloudinary URL + 三層快取） | ✅ |

**畫面**：ProfileScreen / AvatarSelectorModal
**路由**：`/profile`

### 6.4 設定

| # | 工作項目 | 狀態 |
|---|---------|------|
| 6.4.1 | 帳號管理（個人資料、推薦好友、語言切換） | ✅ |
| 6.4.2 | 探索（解鎖全球地圖、等級與成就） | ✅ |
| 6.4.3 | 偏好設定（最愛/黑名單、通知偏好、通知紀錄） | ✅ |
| 6.4.4 | 帳號操作（合併帳號、登出、刪除帳號） | ✅ |
| 6.4.5 | 關於（隱私政策、服務條款、幫助中心） | ✅ |

**畫面**：SettingsScreen
**路由**：`/settings`（Tab 4）

### 6.5 訪客升級提示

| # | 工作項目 | 狀態 |
|---|---------|------|
| 6.5.1 | 升級提示 Toast（UpgradePromptToast） | ✅ |
| 6.5.2 | 觸發點追蹤（useGuestUpgradePrompt） | ✅ |

**觸發條件**：收集第 10 個景點 / 首次 AI 對話 / 連續登入 3 天
**行為**：非阻擋式 Toast、AsyncStorage 追蹤已顯示提示、非訪客用戶不觸發

---

## 7. 架構重構（已完成）

### 7.0 Phase 0 — 清理基礎

| # | 工作項目 | 說明 |
|---|---------|------|
| 7.0.1 | 移除死碼 | 未使用的 import、變數、函數 |
| 7.0.2 | AppState 事件修復 | 正確處理前後台切換事件 |
| 7.0.3 | 環境變數整理 | 敏感資訊移至 .env |

### 7.1 Phase 1 — Context 拆分

| # | 工作項目 | 說明 |
|---|---------|------|
| 7.1.1 | 建立 AuthContext | 認證狀態（user、token、login/logout） |
| 7.1.2 | 建立 I18nContext | 多語系（t、locale、切換語言） |
| 7.1.3 | 建立 GachaProvider | 扭蛋模組專用狀態 |
| 7.1.4 | 67 個消費者遷移 | `useApp()` → `useAuth()` / `useI18n()` |

### 7.2 Phase 2 — 畫面瘦身

| # | 工作項目 | 說明 |
|---|---------|------|
| 7.2.1 | Modal 抽離 | CreateItineraryModal、AddPlacesModal |
| 7.2.2 | StyleSheet 外移 | Economy、Collection、Home、Referral 四畫面 |

### 7.3 Phase 3 — React Query 統一快取

| # | 工作項目 | 說明 |
|---|---------|------|
| 7.3.1 | 基礎建設 | QueryProvider + useAuthQuery/Mutation/Infinite |
| 7.3.2 | 16 個領域 Hooks | 每個業務領域一個 hooks 檔案 |
| 7.3.3 | 畫面遷移 | useState → React Query 自動快取 |

---

## API 服務層（30 個檔案）

| 分類 | 檔案 | 涵蓋功能 |
|------|------|---------|
| **核心** | `base.ts`、`api.ts` | Axios 配置、API Client |
| **認證** | `authApi.ts` | 登入、註冊、登出、Token refresh |
| **素材** | `assetApi.ts`、`avatarService.ts` | 素材清單、頭像快取 |
| **扭蛋** | `gachaApi.ts` | 抽卡、結果、裝置識別 |
| **物品** | `inventoryApi.ts` | 道具箱操作 |
| **圖鑑** | `collectionApi.ts` | 收藏、最愛、排除 |
| **經濟** | `economyApi.ts` | 金幣、等級、特權、每日任務 |
| **行程** | `itineraryApi.ts` | 行程 CRUD、景點管理 |
| **推薦** | `referralApi.ts` | 邀請、排行、獎勵 |
| **信箱** | `mailboxApi.ts` | 信件列表、詳情、領獎 |
| **通知** | `notificationApi.ts` | 推播設定、歷史、已讀 |
| **募資** | `crowdfundingApi.ts` | 活動、贊助、獎勵 |
| **貢獻** | `contributionApi.ts` | 回報、建議、投票 |
| **商家** | `merchantApi.ts`、`couponApi.ts` | 店面、優惠券、分析、核銷 |
| **專家** | `specialistApi.ts` | 服務、追蹤、歷史 |
| **管理** | `adminApi.ts` | 審核、公告、排除 |
| **位置** | `locationApi.ts` | 地理定位、POI |
| **活動** | `eventApi.ts` | 活動資訊 |
| **MINI** | `miniApi.ts` | MINI 夥伴全部操作 |
| **即時** | `socket.ts` | WebSocket 專家追蹤 |
| **共用** | `commonApi.ts`、`configApi.ts`、`rulesApi.ts` | 地區、設定、規則 |
| **IAP** | `revenueCatService.ts` | 內購 |
| **推播** | `pushNotificationService.ts` | Expo Push |
| **預載** | `preloadService.ts` | 登入預載 |

---

## React Query Hooks（16 個檔案）

| 檔案 | 涵蓋領域 |
|------|---------|
| `useAuthQuery.ts` | 核心 wrapper（query/mutation/infinite） |
| `useHomeQueries.ts` | 首頁（活動、每日任務） |
| `useEconomyQueries.ts` | 經濟系統（金幣、規則、特權） |
| `useCollectionQueries.ts` | 圖鑑 + 最愛 |
| `useMailboxQueries.ts` | 信箱（列表、詳情、兌換） |
| `useInventoryQueries.ts` | 物品箱 |
| `useReferralQueries.ts` | 推薦系統 |
| `useCrowdfundingQueries.ts` | 募資系統 |
| `useContributionQueries.ts` | 貢獻系統 |
| `useNotificationQueries.ts` | 通知系統 |
| `useSOSQueries.ts` | SOS 緊急求助 |
| `useAdminQueries.ts` | 管理員後台 |
| `useMerchantQueries.ts` | 商家全部操作 |
| `useSpecialistQueries.ts` | 專家模組 |
| `useMiniQueries.ts` | MINI 夥伴系統 |
| `useGuestUpgradePrompt.ts` | 訪客升級提示觸發 |

---

## 型別定義（25 個檔案）

| 分類 | 檔案 |
|------|------|
| **核心** | `auth.ts`、`common.ts`、`errors.ts`、`app.ts`、`index.ts` |
| **遊戲化** | `collection.ts`、`gacha.ts`、`economy.ts`、`inventory.ts` |
| **社群** | `mailbox.ts`、`crowdfunding.ts`、`contribution.ts`、`referral.ts` |
| **角色** | `merchant.ts`、`specialist.ts`、`admin.ts` |
| **地理** | `location.ts`、`event.ts`、`itinerary.ts` |
| **系統** | `notifications.ts`、`sos.ts`、`asset.ts`、`ads.ts`、`rules.ts` |
| **MINI** | `mini.ts` |

---

## 角色權限矩陣

| 功能 | 旅人 | 商家 | 專家 | 管理員 |
|------|------|------|------|--------|
| 首頁 | ✅ | ✅ | ✅ | ✅ |
| 扭蛋/圖鑑 | ✅ | — | — | — |
| 行程規劃 | ✅ | — | — | — |
| 經濟/等級 | ✅ | — | — | — |
| 信箱/道具 | ✅ | — | — | — |
| 募資/貢獻 | ✅ | — | — | — |
| MINI 夥伴 | ✅ | — | — | — |
| 推薦好友 | ✅ | — | — | — |
| SOS 緊急 | ✅ | — | ✅ | — |
| 通知 | ✅ | ✅ | ✅ | ✅ |
| 設定 | ✅ | ✅ | ✅ | ✅ |
| 商家管理 | — | ✅ | — | — |
| 專家管理 | — | — | ✅ | — |
| 系統管理 | — | — | — | ✅ |

---

## 技術債

| 項目 | 優先級 | 說明 |
|------|--------|------|
| ChatScreen 真實 API | P2 | 目前 Mock，待串接後端 AI Chat |
| Google Sign In | P2 | OAuth 登入第二管道 |
| 離線模式 | P2 | React Query 已有快取基礎 |
| 測試覆蓋 | P2 | hooks 層最適合加 unit test |
| 機率說明功能 | P3 | 等商家端開放 |

---

*最後更新：2026-02-28 | 資料來源：實際程式碼掃描 | API 契約：v1.4.0*
