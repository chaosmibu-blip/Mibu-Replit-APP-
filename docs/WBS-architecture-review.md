# WBS — Mibu App 完整工作分解結構

> **專案名稱**：Mibu — 遊戲化旅遊安全平台
> **技術棧**：React Native + Expo + TypeScript + React Query v5 + Expo Router
> **四大角色**：旅人 (Traveler) / 商家 (Merchant) / 專家 (Specialist) / 管理員 (Admin)
> **最後更新**：2026-02-13

---

## 總覽

| WBS | 模組 | 畫面數 | 說明 |
|-----|------|--------|------|
| 1 | 基礎建設 | — | 認證、導航、狀態管理、主題、i18n |
| 2 | 旅人核心 | 18 | 扭蛋、圖鑑、行程、經濟、信箱 |
| 3 | 商家系統 | 14 | 店面、優惠券、產品、分析、核銷 |
| 4 | 專家系統 | 5 | 儀表板、資料、追蹤、歷史 |
| 5 | 管理員系統 | 4 | 儀表板、公告、審核、排除 |
| 6 | 共用功能 | 11 | 通知、SOS、個人檔案、設定 |
| 7 | 架構重構 | — | Context 拆分、React Query 遷移 |
| **合計** | | **52** | |

---

## 1. 基礎建設（Foundation）

### 1.1 認證系統

| # | 工作項目 | 說明 | 關鍵檔案 |
|---|---------|------|---------|
| 1.1.1 | Apple Sign In | OAuth 登入（iOS 優先） | `app/login.tsx` |
| 1.1.2 | Google Sign In | OAuth 登入（規劃中） | `hooks/useGoogleAuth.ts` |
| 1.1.3 | JWT Token 管理 | 7 天過期、自動 refresh、跨平台儲存 | `src/context/tokenUtils.ts` |
| 1.1.4 | Token 安全儲存 | iOS: SecureStore / Web: AsyncStorage | `src/context/AuthContext.tsx` |
| 1.1.5 | 401 自動攔截 | Token 過期自動登出 + 導向登入頁 | `src/services/base.ts` |
| 1.1.6 | 角色權限控制 | user / merchant / specialist / admin | `src/context/AuthContext.tsx` |
| 1.1.7 | 帳號合併 | 同 email 不同 provider 合併 | `src/services/authApi.ts` |

### 1.2 導航系統

| # | 工作項目 | 說明 | 關鍵檔案 |
|---|---------|------|---------|
| 1.2.1 | Expo Router 檔案路由 | 60+ 路由自動映射 | `app/` |
| 1.2.2 | Tab Navigator | 首頁、扭蛋、行程、圖鑑、設定 | `app/(tabs)/_layout.tsx` |
| 1.2.3 | Stack Navigator | 角色子頁面、Modal | `app/_layout.tsx` |
| 1.2.4 | Auth Guard | 未登入導向 login、角色導向 dashboard | `app/_layout.tsx` |
| 1.2.5 | Deep Link | 推播點擊 → 對應畫面 | `app/_layout.tsx` |
| 1.2.6 | 404 處理 | 找不到路由的 fallback | `app/+not-found.tsx` |

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

| # | 工作項目 | 說明 | 關鍵檔案 |
|---|---------|------|---------|
| 1.7.1 | CoinReward | 金幣 icon + 數量（sm/md/lg） | `shared/components/ui/CoinReward.tsx` |
| 1.7.2 | EmptyState | 空資料提示（icon + 標題 + CTA） | `shared/components/ui/EmptyState.tsx` |
| 1.7.3 | ErrorState | 錯誤顯示 + 重試按鈕 | `shared/components/ui/ErrorState.tsx` |
| 1.7.4 | Select | 下拉選單 | `shared/components/ui/Select.tsx` |
| 1.7.5 | Button | 基礎按鈕元件 | `shared/components/ui/Button.tsx` |
| 1.7.6 | TierBadge | 稀有度等級徽章 | `shared/components/TierBadge.tsx` |
| 1.7.7 | ModuleNav | 模組導航 | `shared/components/ModuleNav.tsx` |
| 1.7.8 | RoleSwitcher | 角色切換（SuperAdmin） | `shared/components/RoleSwitcher.tsx` |
| 1.7.9 | TutorialOverlay | 新手教學覆蓋層 | `shared/components/TutorialOverlay.tsx` |
| 1.7.10 | InfoToast | 通知 Toast | `src/components/InfoToast.tsx` |
| 1.7.11 | LoadingAdScreen | 載入等待畫面 | `src/components/LoadingAdScreen.tsx` |
| 1.7.12 | HapticTab | Tab Bar 觸覺回饋 | `components/HapticTab.tsx` |
| 1.7.13 | TagInput | 標籤輸入 | `src/components/TagInput.tsx` |

### 1.8 基礎服務

| # | 工作項目 | 說明 | 關鍵檔案 |
|---|---------|------|---------|
| 1.8.1 | 預載服務 | 登入後預載頭像 + 素材 | `src/services/preloadService.ts` |
| 1.8.2 | 頭像快取服務 | 三層快取（記憶體 → AsyncStorage → 首字母） | `src/services/avatarService.ts` |
| 1.8.3 | 素材 API | `GET /api/assets?category=xxx` | `src/services/assetApi.ts` |
| 1.8.4 | Cloudinary 圖片優化 | URL builder、resize、format | `src/utils/cloudinary.ts` |
| 1.8.5 | 表單驗證 | email、phone、password | `src/utils/validation.ts` |
| 1.8.6 | RevenueCat IAP | 內購整合（眾籌解鎖） | `src/services/revenueCatService.ts` |

---

## 2. 旅人核心（Traveler Core）

### 2.1 註冊 / 登入流程

| # | 工作項目 | 畫面 | 路由 | 狀態 |
|---|---------|------|------|------|
| 2.1.1 | 登入頁 | LoginScreen | `/login` | ✅ 已實作 |
| 2.1.2 | 註冊頁 | RegisterScreen | `/register` | ✅ 已實作 |
| 2.1.3 | 註冊成功 | RegisterSuccessScreen | `/register-success` | ✅ 已實作 |
| 2.1.4 | OAuth Callback | AuthCallbackScreen | `/auth/callback` | ✅ 已實作 |
| 2.1.5 | 等待審核 | PendingApprovalScreen | `/pending-approval` | ✅ 已實作 |

### 2.2 首頁

| # | 工作項目 | 說明 | hooks | 狀態 |
|---|---------|------|-------|------|
| 2.2.1 | 問候區 | 顯示「嗨，旅行者！」+ 頭像 | — | ✅ |
| 2.2.2 | 等級卡片 | Lv、稱號、連續登入、XP 進度條 | useHomeQueries | ✅ React Query |
| 2.2.3 | 每日任務卡 | 完成數/總數、已獲 XP、點擊→經濟 | useHomeQueries | ✅ React Query |
| 2.2.4 | 活動 Tab | 公告 / 在地活動 / 限時活動 切換 | useHomeQueries | ✅ React Query |

**畫面**：HomeScreen — `src/modules/shared/screens/HomeScreen.tsx`
**路由**：`/`（Tab 1）

### 2.3 AI 扭蛋系統

| # | 工作項目 | 說明 | 狀態 |
|---|---------|------|------|
| 2.3.1 | 國家/城市選擇 | 下拉選單，API 載入 | ✅ 已實作 |
| 2.3.2 | 抽取張數調整 | Slider 5~12 張 | ✅ 已實作 |
| 2.3.3 | 道具箱容量檢查 | 滿了不能抽 / 快滿提醒 | ✅ 已實作 |
| 2.3.4 | AI 行程生成 | 呼叫後端 AI，等待 1-2 分鐘 | ✅ 已實作 |
| 2.3.5 | 扭蛋動畫 | CouponWinAnimation 抽到優惠券 | ✅ 已實作 |
| 2.3.6 | 獎池預覽 | SP/SSR 優惠券列表 Modal | ✅ 已實作 |
| 2.3.7 | 載入等待畫面 | LoadingAdScreen（AI 生成中） | ✅ 已實作 |
| 2.3.8 | 新手教學 | TutorialOverlay 引導操作 | ✅ 已實作 |
| 2.3.9 | 扭蛋結果展示 | ItemsScreen 景點卡片瀏覽 | ✅ 已實作 |
| 2.3.10 | 429 頻率限制 | 每日 36 抽上限，友善提示 | ✅ 已實作 |
| 2.3.11 | 機率說明 | 稀有度機率 Modal（暫時隱藏） | ⏸ 等商家端開放 |

**畫面**：GachaScreen / GachaModuleScreen / ItemsScreen
**路由**：`/gacha`、`/gacha/items`（Tab 2）

### 2.4 收藏圖鑑

| # | 工作項目 | 說明 | hooks | 狀態 |
|---|---------|------|-------|------|
| 2.4.1 | 景點卡片網格 | 橫版/直版卡片、稀有度標示 | useCollectionQueries | ✅ React Query |
| 2.4.2 | 篩選（城市/稀有度） | FilterChips 多選篩選 | useCollectionQueries | ✅ React Query |
| 2.4.3 | 搜尋 | 景點名稱關鍵字搜尋 | useCollectionQueries | ✅ React Query |
| 2.4.4 | 投票 | 景點投票互動 | useCollectionQueries | ✅ React Query |

**畫面**：CollectionScreen — `src/modules/traveler/screens/CollectionScreen.tsx`
**路由**：`/collection`（Tab 4）

### 2.5 行程規劃

| # | 工作項目 | 說明 | 狀態 |
|---|---------|------|------|
| 2.5.1 | 建立行程 | CreateItineraryModal 月曆選擇 | ✅ 已實作 |
| 2.5.2 | 新增景點 | AddPlacesModal 搜尋加入 | ✅ 已實作 |
| 2.5.3 | 拖放排序 | DraggableFlatList 景點排序 | ✅ 已實作 |
| 2.5.4 | AI 對話 | ChatScreen 行程討論（Mock） | ⚠️ Mock 階段 |
| 2.5.5 | 即時定位 | LocationScreen 地圖顯示 | ✅ 已實作 |

**畫面**：ItineraryScreenV2 / ChatScreen / LocationScreen
**路由**：`/planner`（Tab 3）

### 2.6 經濟系統

| # | 工作項目 | 說明 | hooks | 狀態 |
|---|---------|------|-------|------|
| 2.6.1 | 金幣餘額 | 顯示目前金幣數 | useEconomyQueries | ✅ React Query |
| 2.6.2 | 等級與 XP | 等級進度、稱號、階段 | useEconomyQueries | ✅ React Query |
| 2.6.3 | 每日任務 | 任務清單 + 獎勵 | useEconomyQueries | ✅ React Query |
| 2.6.4 | 特權商店 | 特權項目瀏覽 | useEconomyQueries | ✅ React Query |
| 2.6.5 | 遊戲規則 | 稀有度機率 + 規則說明 | useEconomyQueries | ✅ React Query |

**畫面**：EconomyScreen — `src/modules/traveler/screens/EconomyScreen.tsx`
**路由**：`/economy`

### 2.7 信箱系統

| # | 工作項目 | 說明 | hooks | 狀態 |
|---|---------|------|-------|------|
| 2.7.1 | 信件列表 | 已讀/未讀、分類 | useMailboxQueries | ✅ React Query |
| 2.7.2 | 信件詳情 | 內容 + 附件 | useMailboxQueries | ✅ React Query |
| 2.7.3 | 獎勵領取 | 金幣/道具領取 | useMailboxQueries | ✅ React Query |

**畫面**：MailboxScreen / MailboxDetailScreen
**路由**：`/mailbox`、`/mailbox/:id`

### 2.8 物品箱

| # | 工作項目 | 說明 | hooks | 狀態 |
|---|---------|------|-------|------|
| 2.8.1 | 物品列表 | 已擁有道具一覽 | useInventoryQueries | ✅ React Query |
| 2.8.2 | 物品使用 | 道具效果觸發 | useInventoryQueries | ✅ React Query |
| 2.8.3 | 容量管理 | 上限警示 + 滿箱禁抽 | useInventoryQueries | ✅ React Query |

**畫面**：ItemBoxScreen — `src/modules/traveler/screens/ItemBoxScreen.tsx`
**路由**：`/itembox`

### 2.9 社群互動

| # | 工作項目 | 畫面 | hooks | 狀態 |
|---|---------|------|-------|------|
| 2.9.1 | 募資活動列表 | CrowdfundingScreen | useCrowdfundingQueries | ✅ React Query |
| 2.9.2 | 募資詳情 + 贊助 | CrowdfundingDetailScreen | useCrowdfundingQueries | ✅ React Query |
| 2.9.3 | 社群貢獻（回報/建議/投票） | ContributionScreen | useContributionQueries | ✅ React Query |
| 2.9.4 | 最愛景點管理 | FavoritesScreen | useCollectionQueries | ✅ React Query |
| 2.9.5 | 推薦好友 | ReferralScreen | useReferralQueries | ✅ React Query |

**路由**：`/crowdfunding`、`/crowdfunding/:id`、`/contribution`、`/favorites-management`、`/referral`

---

## 3. 商家系統（Merchant）

### 3.1 商家入駐

| # | 工作項目 | 畫面 | 路由 | 狀態 |
|---|---------|------|------|------|
| 3.1.1 | 商家註冊表單 | MerchantRegistrationForm | `/register-merchant` | ✅ 已實作 |
| 3.1.2 | 商家註冊頁 | MerchantRegisterScreen | `/merchant-register` | ✅ 已實作 |

### 3.2 商家總覽

| # | 工作項目 | 說明 | hooks | 狀態 |
|---|---------|------|-------|------|
| 3.2.1 | 儀表板 | 營運 KPI、快捷入口 | useMerchantQueries | ✅ React Query |
| 3.2.2 | 個人資料 | 商家基本資訊編輯 | useMerchantQueries | ✅ React Query |

**畫面**：MerchantDashboardScreen / MerchantProfileScreen
**路由**：`/merchant-dashboard`、`/merchant/profile`

### 3.3 店面管理

| # | 工作項目 | 畫面 | hooks | 狀態 |
|---|---------|------|-------|------|
| 3.3.1 | 店面列表 | MerchantPlacesScreen / PlaceListScreen | useMerchantQueries | ✅ React Query |
| 3.3.2 | 認領店面 | ClaimPlaceScreen | useMerchantQueries | ✅ React Query |
| 3.3.3 | 新增店面 | NewPlaceScreen | useMerchantQueries | ✅ React Query |
| 3.3.4 | 編輯店面 | PlaceEditScreen | useMerchantQueries | ✅ React Query |

**路由**：`/merchant/places`、`/merchant/place/:id`

### 3.4 優惠券 & 產品

| # | 工作項目 | 畫面 | hooks | 狀態 |
|---|---------|------|-------|------|
| 3.4.1 | 優惠券列表 | MerchantCouponsScreen / CouponListScreen | useMerchantQueries | ✅ React Query |
| 3.4.2 | 新增/編輯優惠券 | CouponFormScreen | useMerchantQueries | ✅ React Query |
| 3.4.3 | 產品管理 | MerchantProductsScreen | useMerchantQueries | ✅ React Query |

**路由**：`/merchant/coupons`、`/merchant/products`

### 3.5 數據與核銷

| # | 工作項目 | 畫面 | hooks | 狀態 |
|---|---------|------|-------|------|
| 3.5.1 | 數據分析 | MerchantAnalyticsScreen | useMerchantQueries | ✅ React Query |
| 3.5.2 | 交易記錄 | MerchantTransactionsScreen | useMerchantQueries | ✅ React Query |
| 3.5.3 | 核銷驗證 | MerchantVerifyScreen | useMerchantQueries | ✅ React Query |

**路由**：`/merchant/analytics`、`/merchant/transactions`、`/merchant/verify`

---

## 4. 專家系統（Specialist）

### 4.1 專家入駐

| # | 工作項目 | 畫面 | 路由 | 狀態 |
|---|---------|------|------|------|
| 4.1.1 | 專家註冊 | RegisterSpecialistScreen | `/register-specialist` | ✅ 已實作 |

### 4.2 專家營運

| # | 工作項目 | 畫面 | hooks | 狀態 |
|---|---------|------|-------|------|
| 4.2.1 | 儀表板 | SpecialistDashboardScreen | useSpecialistQueries | ✅ React Query |
| 4.2.2 | 個人資料 | SpecialistProfileScreen | useSpecialistQueries | ✅ React Query |
| 4.2.3 | 服務歷史 | SpecialistHistoryScreen | useSpecialistQueries | ✅ React Query |
| 4.2.4 | 旅人列表 | SpecialistTravelersScreen | — | ✅ 已實作 |
| 4.2.5 | 即時追蹤 | SpecialistTrackingScreen | — (WebSocket) | ✅ 已實作 |

**路由**：`/specialist-dashboard`、`/specialist/profile`、`/specialist/history`、`/specialist/travelers`、`/specialist/tracking`

---

## 5. 管理員系統（Admin）

| # | 工作項目 | 畫面 | hooks | 狀態 |
|---|---------|------|-------|------|
| 5.1 | 系統儀表板 | AdminDashboardScreen | useAdminQueries | ✅ React Query |
| 5.2 | 用戶審核 | AdminDashboardScreen（子功能） | useAdminQueries | ✅ React Query |
| 5.3 | 公告管理 | AdminAnnouncementsScreen | useAdminQueries | ✅ React Query |
| 5.4 | 公告新增/編輯 | AnnouncementManageScreen | useAdminQueries | ✅ React Query |
| 5.5 | 全域排除設定 | AdminExclusionsScreen | useAdminQueries | ✅ React Query |

**路由**：`/admin-dashboard`、`/admin-announcements`、`/announcement-manage`、`/admin-exclusions`

---

## 6. 共用功能（Cross-Cutting）

### 6.1 推播通知系統

| # | 工作項目 | 說明 | hooks | 狀態 |
|---|---------|------|-------|------|
| 6.1.1 | Expo Push 註冊 | 取得 push token、註冊至後端 | — | ✅ 已實作 |
| 6.1.2 | 全域推播監聽器 | 前景/背景/關閉 三種情境處理 | useNotificationHandler | ✅ 已實作 |
| 6.1.3 | Deep Link 導航 | 通知點擊 → 對應畫面 | — | ✅ 已實作 |
| 6.1.4 | 通知歷史列表 | NotificationListScreen | useNotificationQueries | ✅ React Query |
| 6.1.5 | 通知偏好設定 | NotificationPreferencesScreen | useNotificationQueries | ✅ React Query |
| 6.1.6 | 紅點未讀狀態 | 首頁紅點 badge | useNotificationQueries | ✅ React Query |

**路由**：`/notifications`、`/notification-preferences`

### 6.2 SOS 緊急求助

| # | 工作項目 | 畫面 | hooks | 狀態 |
|---|---------|------|-------|------|
| 6.2.1 | SOS 發送 | SOSScreen | useSOSQueries | ✅ React Query |
| 6.2.2 | 緊急聯絡人 | SOSContactsScreen | useSOSQueries | ✅ React Query |

**路由**：`/sos`、`/sos-contacts`

### 6.3 個人檔案

| # | 工作項目 | 說明 | 狀態 |
|---|---------|------|------|
| 6.3.1 | 個人資料編輯 | 暱稱、頭像、簡介 | ✅ 已實作 |
| 6.3.2 | 頭像選擇器 | AvatarSelectorModal（8 隻貓咪） | ✅ 已實作 |
| 6.3.3 | 頭像遠端化 | Cloudinary URL + 三層快取 | ✅ 已實作 |

**畫面**：ProfileScreen / AvatarSelectorModal
**路由**：`/profile`

### 6.4 設定

| # | 工作項目 | 說明 | 狀態 |
|---|---------|------|------|
| 6.4.1 | 帳號管理 | 個人資料、推薦好友、語言切換 | ✅ 已實作 |
| 6.4.2 | 探索 | 解鎖全球地圖、等級與成就 | ✅ 已實作 |
| 6.4.3 | 偏好設定 | 最愛/黑名單、通知偏好、通知紀錄 | ✅ 已實作 |
| 6.4.4 | 帳號操作 | 合併帳號、登出、刪除帳號 | ✅ 已實作 |
| 6.4.5 | 關於 | 隱私政策、服務條款、幫助中心 | ✅ 已實作 |

**畫面**：SettingsScreen
**路由**：`/settings`（Tab 5）

---

## 7. 架構重構（已完成）

### 7.0 Phase 0 — 清理基礎

| # | 工作項目 | 說明 |
|---|---------|------|
| 7.0.1 | 移除死碼 | 未使用的 import、變數、函數 |
| 7.0.2 | AppState 事件修復 | 正確處理前後台切換事件 |
| 7.0.3 | 環境變數整理 | 敏感資訊移至 .env |

**交付物**：`f9b7c5a`

### 7.1 Phase 1 — Context 拆分

| # | 工作項目 | 說明 |
|---|---------|------|
| 7.1.1 | 建立 AuthContext | 認證狀態（user、token、login/logout） |
| 7.1.2 | 建立 I18nContext | 多語系（t、locale、切換語言） |
| 7.1.3 | 建立 GachaProvider | 扭蛋模組專用狀態 |
| 7.1.4 | 67 個消費者遷移 | `useApp()` → `useAuth()` / `useI18n()` |

**交付物**：`ab724a8`、`add1303`、`cb01c6f`

### 7.2 Phase 2 — 畫面瘦身

| # | 工作項目 | 說明 |
|---|---------|------|
| 7.2.1 | Modal 抽離 | CreateItineraryModal、AddPlacesModal |
| 7.2.2 | StyleSheet 外移 | Economy、Collection、Home、Referral 四畫面 |

**交付物**：`b4f8729`、`03fbde4`

### 7.3 Phase 3 — React Query 統一快取

| # | 工作項目 | 說明 |
|---|---------|------|
| 7.3.1 | 基礎建設 | QueryProvider + useAuthQuery/Mutation/Infinite |
| 7.3.2 | 14 個領域 Hooks | 每個業務領域一個 hooks 檔案 |
| 7.3.3 | 31 個畫面遷移 | useState → React Query 自動快取 |
| 7.3.4 | 7 個畫面跳過 | 有明確理由：WebSocket / 一次性 / Mock / 複雜 |

**交付物**：`356a25c`、`45f9357`、`bb73486`、`23ab0e0`、`ba9cef1`

### 遷移模式摘要

| 移除的模式 | 替換為 |
|-----------|--------|
| `useState` (data/loading/refreshing) | `useXxxQuery()` 衍生狀態 |
| `useCallback` + `getToken` + API | React Query 自動快取 |
| `useEffect` 初始載入 | Query 自動 mount fetch |
| 手動 `setRefreshing` | `query.isFetching && !query.isLoading` |
| 手動錯誤處理 | Query `onError` / `isError` |
| `apiService.xxx(token, ...)` | `mutation.mutate(params)` |

---

## API 服務層總覽（27 個檔案）

| 分類 | 檔案 | 涵蓋功能 |
|------|------|---------|
| **核心** | `base.ts`、`api.ts` | Axios 配置、API Client |
| **認證** | `authApi.ts` | 登入、註冊、登出、Token refresh |
| **素材** | `assetApi.ts`、`avatarService.ts` | 素材清單、頭像快取 |
| **扭蛋** | `gachaApi.ts` | 抽卡、結果、裝置識別 |
| **物品** | `inventoryApi.ts` | 道具箱操作 |
| **圖鑑** | `collectionApi.ts` | 收藏、最愛、排除 |
| **經濟** | `economyApi.ts` | 金幣、等級、特權、每日任務 |
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
| **即時** | `socket.ts` | WebSocket 專家追蹤 |
| **共用** | `commonApi.ts`、`configApi.ts`、`rulesApi.ts` | 地區、設定、規則 |
| **IAP** | `revenueCatService.ts` | 內購 |
| **推播** | `pushNotificationService.ts` | Expo Push |
| **預載** | `preloadService.ts` | 登入預載 |

---

## React Query Hooks 總覽（14 個檔案）

| 檔案 | 涵蓋領域 | 對應畫面數 |
|------|---------|-----------|
| `useAuthQuery.ts` | 核心 wrapper（query/mutation/infinite） | 全部 |
| `useHomeQueries.ts` | 首頁（活動、每日任務） | 1 |
| `useEconomyQueries.ts` | 經濟系統（金幣、規則、特權） | 1 |
| `useCollectionQueries.ts` | 圖鑑 + 最愛 | 2 |
| `useMailboxQueries.ts` | 信箱（列表、詳情、兌換） | 2 |
| `useInventoryQueries.ts` | 物品箱 | 1 |
| `useReferralQueries.ts` | 推薦系統 | 1 |
| `useCrowdfundingQueries.ts` | 募資系統 | 2 |
| `useContributionQueries.ts` | 貢獻系統 | 1 |
| `useNotificationQueries.ts` | 通知系統 | 2 |
| `useSOSQueries.ts` | SOS 緊急求助 | 2 |
| `useAdminQueries.ts` | 管理員後台 | 4 |
| `useMerchantQueries.ts` | 商家全部操作 | 14 |
| `useSpecialistQueries.ts` | 專家模組 | 3 |

---

## 型別定義總覽（24 個檔案）

| 分類 | 檔案 | 說明 |
|------|------|------|
| **核心** | `auth.ts`、`common.ts`、`errors.ts`、`app.ts` | 用戶、分頁、錯誤碼、全域設定 |
| **遊戲化** | `collection.ts`、`gacha.ts`、`economy.ts`、`inventory.ts` | 圖鑑、扭蛋、經濟、道具 |
| **社群** | `mailbox.ts`、`crowdfunding.ts`、`contribution.ts`、`referral.ts` | 信箱、募資、貢獻、推薦 |
| **角色** | `merchant.ts`、`specialist.ts`、`admin.ts` | 商家、專家、管理員 |
| **地理** | `location.ts`、`event.ts`、`itinerary.ts` | 定位、活動、行程 |
| **系統** | `notifications.ts`、`sos.ts`、`asset.ts`、`ads.ts`、`rules.ts` | 通知、SOS、素材、廣告、規則 |

---

## 畫面統計

| 模組 | 畫面數 | React Query 遷移 | 特殊處理 |
|------|--------|------------------|---------|
| 認證 | 5 | — | OAuth 流程 |
| Shared | 11 | 5 | 6 個跳過（Mock/串流/低價值） |
| Traveler | 18 | 10 | ItineraryV2/Gacha/Items/Chat 跳過 |
| Merchant | 14 + 2 入駐 | 14 | 全數遷移 |
| Specialist | 5 + 1 入駐 | 3 | Tracking(WS) + Travelers 跳過 |
| Admin | 4 | 4 | 全數遷移 |
| **合計** | **52 + 8 特殊** | **36** | **16 有明確理由跳過** |

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
| 推薦好友 | ✅ | — | — | — |
| SOS 緊急 | ✅ | — | ✅ | — |
| 通知 | ✅ | ✅ | ✅ | ✅ |
| 設定 | ✅ | ✅ | ✅ | ✅ |
| 商家管理 | — | ✅ | — | — |
| 專家管理 | — | — | ✅ | — |
| 系統管理 | — | — | — | ✅ |

---

## 技術債與未來工作

| 項目 | 優先級 | 說明 | WBS 位置 |
|------|--------|------|---------|
| ItineraryScreenV2 重構 | P1 | 18+ useState，需拆分狀態管理 | 2.5 |
| ChatScreen 真實 API | P2 | 目前 Mock，待串接後端 AI Chat | 2.5.4 |
| Google Sign In | P2 | OAuth 登入第二管道 | 1.1.2 |
| 離線模式 | P2 | React Query 已有快取基礎 | 1.3 |
| 測試覆蓋 | P2 | hooks 層最適合加 unit test | 全域 |
| 機率說明功能 | P3 | 等商家端開放 | 2.3.11 |

---

## 成果數據（架構重構）

| 指標 | 數值 |
|------|------|
| 總修改檔案 | 116 |
| 新增行數 | +9,492 |
| 移除行數 | -5,498 |
| 遷移畫面數 | 31 → 36 |
| 新增 hooks 檔案 | 14 |
| Context 拆分 | 1 → 3（Auth + I18n + Gacha） |
| 消費者遷移 | 67 個檔案 |
| Commits | 21 |

---

*最後更新：2026-02-13 | API 契約：v1.4.0*
