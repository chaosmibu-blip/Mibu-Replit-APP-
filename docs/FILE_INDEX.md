# 檔案索引

> 專案所有檔案的完整清單，方便快速定位

最後更新：2026-01-30

---

## 目錄結構總覽

```
workspace/
├── app/                    # Expo Router 路由層
├── src/
│   ├── services/           # API 服務層
│   ├── types/              # TypeScript 型別定義
│   ├── modules/            # 功能模組（按角色分類）
│   ├── context/            # React Context
│   ├── theme/              # 主題與設計 Token
│   ├── lib/                # 工具函數
│   └── shared/             # 共用錯誤處理
├── components/             # Expo 模板元件
├── constants/              # 常數定義
├── hooks/                  # 自訂 Hooks
├── docs/                   # 文件
└── assets/                 # 靜態資源
```

---

## 一、設定檔

| 檔案 | 用途 |
|------|------|
| `app.config.js` | Expo 應用設定（App 名稱、權限、環境切換） |
| `eas.json` | EAS Build 雲端編譯設定 |
| `package.json` | 依賴套件與腳本 |
| `tsconfig.json` | TypeScript 編譯設定 |
| `tailwind.config.js` | Tailwind CSS + Mibu 品牌色 |
| `tamagui.config.ts` | Tamagui UI 框架設定 |
| `metro.config.js` | Metro bundler 設定 |
| `babel.config.js` | Babel 轉譯設定 |
| `eslint.config.js` | ESLint 程式碼檢查 |
| `.replit` | Replit 工作流與部署設定 |

---

## 二、API 服務層 (`src/services/`)

| 檔案 | 用途 | 主要端點 |
|------|------|----------|
| `base.ts` | API 基礎類別 | - |
| `api.ts` | 統一匯出入口 | - |
| `authApi.ts` | 認證系統 | `/api/auth/*` |
| `gachaApi.ts` | 扭蛋系統 | `/api/gacha/*` |
| `itineraryApi.ts` | 行程規劃 | `/api/itinerary/*` |
| `inventoryApi.ts` | 背包管理 | `/api/user/inventory/*` |
| `couponApi.ts` | 優惠券 | `/api/user/coupons/*` |
| `collectionApi.ts` | 收藏圖鑑 | `/api/user/collection/*` |
| `economyApi.ts` | 等級成就 | `/api/user/level`, `/api/user/achievements/*` |
| `referralApi.ts` | 推薦系統 | `/api/user/referral/*` |
| `contributionApi.ts` | 社群貢獻 | `/api/contribution/*` |
| `crowdfundingApi.ts` | 募資系統 | `/api/crowdfunding/*` |
| `eventApi.ts` | 活動系統 | `/api/events/*` |
| `locationApi.ts` | 地區資料 | `/api/locations/*` |
| `commonApi.ts` | 通用功能 | `/api/announcements`, `/api/sos/*` |
| `configApi.ts` | App 設定 | `/api/config/*` |
| `merchantApi.ts` | 商家功能 | `/api/merchant/*` |
| `specialistApi.ts` | 專員功能 | `/api/specialist/*` |
| `adminApi.ts` | 管理員功能 | `/api/admin/*` |
| `socket.ts` | Socket.io 即時通訊 | - |
| `pushNotificationService.ts` | 推播通知 | - |
| `revenueCatService.ts` | IAP 內購 | - |

---

## 三、型別定義 (`src/types/`)

| 檔案 | 用途 |
|------|------|
| `index.ts` | 統一匯出入口 |
| `app.ts` | App 全域型別（User、Role） |
| `auth.ts` | 認證相關型別 |
| `gacha.ts` | 扭蛋系統型別（Rarity、GachaResult） |
| `itinerary.ts` | 行程規劃型別 |
| `inventory.ts` | 背包物品型別 |
| `collection.ts` | 收藏圖鑑型別 |
| `economy.ts` | 等級成就型別 |
| `referral.ts` | 推薦系統型別 |
| `contribution.ts` | 社群貢獻型別 |
| `crowdfunding.ts` | 募資系統型別 |
| `event.ts` | 活動系統型別 |
| `location.ts` | 地區資料型別 |
| `common.ts` | 通用型別（分頁、API 回應） |
| `merchant.ts` | 商家相關型別 |
| `specialist.ts` | 專員相關型別 |
| `admin.ts` | 管理員相關型別 |
| `sos.ts` | SOS 緊急求助型別 |
| `notifications.ts` | 推播通知型別 |
| `ads.ts` | 廣告型別 |
| `errors.ts` | 錯誤碼定義 |

---

## 四、路由層 (`app/`)

### Tab 導航（主要頁面）

| 路由 | 檔案 | 用途 |
|------|------|------|
| `/` | `(tabs)/index.tsx` | 首頁 |
| `/gacha` | `(tabs)/gacha/index.tsx` | 扭蛋頁 |
| `/gacha/items` | `(tabs)/gacha/items.tsx` | 扭蛋結果 |
| `/planner` | `(tabs)/planner/index.tsx` | 行程規劃 |
| `/collection` | `(tabs)/collection.tsx` | 收藏圖鑑 |
| `/settings` | `(tabs)/settings.tsx` | 設定頁 |

### 通用頁面

| 路由 | 檔案 | 用途 |
|------|------|------|
| `/login` | `login.tsx` | 登入頁 |
| `/register` | `register.tsx` | 註冊頁 |
| `/profile` | `profile.tsx` | 個人資料 |
| `/economy` | `economy.tsx` | 等級與成就 |
| `/referral` | `referral.tsx` | 推薦好友 |
| `/contribution` | `contribution.tsx` | 社群貢獻 |
| `/crowdfunding` | `crowdfunding.tsx` | 募資列表 |
| `/crowdfunding/[id]` | `crowdfunding/[id].tsx` | 募資詳情 |
| `/favorites` | `favorites.tsx` | 我的最愛 |
| `/sos` | `sos.tsx` | SOS 緊急求助 |
| `/sos-contacts` | `sos-contacts.tsx` | 緊急聯絡人 |
| `/map` | `map.tsx` | 地圖頁 |
| `/pending-approval` | `pending-approval.tsx` | 等待審核 |

### 商家頁面 (`/merchant/*`)

| 路由 | 檔案 | 用途 |
|------|------|------|
| `/merchant-dashboard` | `merchant-dashboard.tsx` | 商家儀表板 |
| `/merchant/profile` | `merchant/profile.tsx` | 商家資料 |
| `/merchant/places` | `merchant/places.tsx` | 據點管理 |
| `/merchant/place/[id]` | `merchant/place/[id].tsx` | 據點編輯 |
| `/merchant/coupons` | `merchant/coupons.tsx` | 優惠券管理 |
| `/merchant/products` | `merchant/products.tsx` | 商品管理 |
| `/merchant/transactions` | `merchant/transactions.tsx` | 交易記錄 |
| `/merchant/analytics` | `merchant/analytics.tsx` | 數據分析 |
| `/merchant/verify` | `merchant/verify.tsx` | 商家驗證 |

### 專員頁面 (`/specialist/*`)

| 路由 | 檔案 | 用途 |
|------|------|------|
| `/specialist-dashboard` | `specialist-dashboard.tsx` | 專員儀表板 |
| `/specialist/profile` | `specialist/profile.tsx` | 專員資料 |
| `/specialist/travelers` | `specialist/travelers.tsx` | 旅客管理 |
| `/specialist/tracking` | `specialist/tracking.tsx` | 旅客追蹤 |
| `/specialist/history` | `specialist/history.tsx` | 服務歷史 |

### 管理員頁面

| 路由 | 檔案 | 用途 |
|------|------|------|
| `/admin-dashboard` | `admin-dashboard.tsx` | 管理後台 |
| `/admin-announcements` | `admin-announcements.tsx` | 公告管理 |
| `/admin-exclusions` | `admin-exclusions.tsx` | 排除管理 |
| `/announcement-manage` | `announcement-manage.tsx` | 公告編輯 |

---

## 五、畫面元件 (`src/modules/`)

### 共用模組 (`shared/`)

#### 畫面 (`screens/`)

| 檔案 | 用途 |
|------|------|
| `HomeScreen.tsx` | 首頁畫面 |
| `app/login.tsx` | 登入畫面（OAuth，#044 移除密碼認證） |
| `ProfileScreen.tsx` | 個人資料畫面 |
| `SettingsScreen.tsx` | 設定畫面 |
| `ChatScreen.tsx` | 聊天畫面 |
| `SOSScreen.tsx` | SOS 緊急求助 |
| `SOSContactsScreen.tsx` | 緊急聯絡人管理 |
| `LocationScreen.tsx` | 定位畫面（原生） |
| `LocationScreen.web.tsx` | 定位畫面（Web） |
| `PendingApprovalScreen.tsx` | 等待審核畫面 |

#### 元件 (`components/`)

| 檔案 | 用途 |
|------|------|
| `CtaButton.tsx` | 主要行動按鈕 |
| `FilterChips.tsx` | 篩選晶片 |
| `InfoToast.tsx` | 資訊提示 |
| `LoadingAdScreen.tsx` | 載入廣告畫面（等待 AI 生成） |
| `ModuleNav.tsx` | 模組導航 |
| `RoleSwitcher.tsx` | 角色切換器 |
| `SearchInput.tsx` | 搜尋輸入框 |
| `StatCard.tsx` | 統計卡片 |
| `TagInput.tsx` | 標籤輸入 |
| `TierBadge.tsx` | 稀有度徽章 |
| `TutorialOverlay.tsx` | 教學導覽 |

#### UI 基礎元件 (`components/ui/`)

| 檔案 | 用途 |
|------|------|
| `Button.tsx` | 按鈕元件 |
| `Card.tsx` | 卡片元件 |
| `SegmentedControl.tsx` | 分段控制器 |
| `Select.tsx` | 下拉選單 |

---

### 旅客模組 (`traveler/`)

#### 畫面 (`screens/`)

| 檔案 | 用途 |
|------|------|
| `GachaScreen.tsx` | 扭蛋主畫面 |
| `GachaModuleScreen.tsx` | 扭蛋模組入口 |
| `ItemsScreen.tsx` | 扭蛋結果畫面 |
| `ItemBoxScreen.tsx` | 背包/物品盒 |
| `CollectionScreen.tsx` | 收藏圖鑑 |
| `PlannerScreen.tsx` | 行程規劃入口 |
| `ItineraryScreenV2.tsx` | 行程詳情 |
| `EconomyScreen.tsx` | 等級與成就 |
| `ReferralScreen.tsx` | 推薦好友 |
| `ContributionScreen.tsx` | 社群貢獻 |
| `CrowdfundingScreen.tsx` | 募資列表 |
| `CrowdfundingDetailScreen.tsx` | 募資詳情 |
| `FavoritesScreen.tsx` | 我的最愛 |

#### 元件 (`components/`)

| 檔案 | 用途 |
|------|------|
| `CouponPreviewCard.tsx` | 優惠券預覽卡片 |
| `CouponWinAnimation.tsx` | 優惠券獲得動畫 |

---

### 商家模組 (`merchant/`)

#### 畫面 (`screens/`)

| 檔案 | 用途 |
|------|------|
| `MerchantDashboardScreen.tsx` | 商家儀表板 |
| `MerchantProfileScreen.tsx` | 商家資料 |
| `MerchantPlacesScreen.tsx` | 據點列表 |
| `PlaceListScreen.tsx` | 據點列表（舊版） |
| `PlaceEditScreen.tsx` | 據點編輯 |
| `NewPlaceScreen.tsx` | 新增據點 |
| `ClaimPlaceScreen.tsx` | 認領據點 |
| `MerchantCouponsScreen.tsx` | 優惠券管理 |
| `CouponListScreen.tsx` | 優惠券列表 |
| `CouponFormScreen.tsx` | 優惠券表單 |
| `MerchantProductsScreen.tsx` | 商品管理 |
| `MerchantTransactionsScreen.tsx` | 交易記錄 |
| `MerchantAnalyticsScreen.tsx` | 數據分析 |
| `MerchantVerifyScreen.tsx` | 商家驗證 |

#### 元件 (`components/`)

| 檔案 | 用途 |
|------|------|
| `MerchantRegistrationForm.tsx` | 商家註冊表單 |

---

### 專員模組 (`specialist/`)

| 檔案 | 用途 |
|------|------|
| `SpecialistDashboardScreen.tsx` | 專員儀表板 |
| `SpecialistProfileScreen.tsx` | 專員資料 |
| `SpecialistTravelersScreen.tsx` | 旅客管理 |
| `SpecialistTrackingScreen.tsx` | 旅客追蹤 |
| `SpecialistHistoryScreen.tsx` | 服務歷史 |

---

### 管理員模組 (`admin/`)

| 檔案 | 用途 |
|------|------|
| `AdminDashboardScreen.tsx` | 管理後台 |
| `AdminAnnouncementsScreen.tsx` | 公告管理 |
| `AdminExclusionsScreen.tsx` | 排除管理 |
| `AnnouncementManageScreen.tsx` | 公告編輯 |

---

## 六、狀態管理 (`src/context/`)

| 檔案 | 用途 |
|------|------|
| `AppContext.tsx` | 全域狀態（用戶、Token、角色、設定） |

---

## 七、主題與樣式 (`src/theme/`)

| 檔案 | 用途 |
|------|------|
| `designTokens.ts` | 設計 Token（間距、圓角、字體、陰影） |
| `paperTheme.ts` | React Native Paper 主題 |

---

## 八、常數 (`constants/` & `src/constants/`)

| 檔案 | 用途 |
|------|------|
| `constants/Colors.ts` | Mibu 品牌色彩定義 |
| `src/constants/tierStyles.ts` | 稀有度樣式對應 |
| `src/constants/translations.ts` | 多語言翻譯 |

---

## 九、Hooks (`hooks/`)

| 檔案 | 用途 |
|------|------|
| `useColorScheme.ts` | 取得當前色彩模式 |
| `useColorScheme.web.ts` | 取得色彩模式（Web 版） |
| `useThemeColor.ts` | 取得主題顏色 |
| `useGoogleAuth.ts` | Google 登入 Hook |

---

## 十、工具函數 (`src/lib/` & `src/shared/`)

| 檔案 | 用途 |
|------|------|
| `src/lib/api.ts` | API 請求工具函數 |
| `src/shared/errors.ts` | 錯誤處理工具 |

---

## 十一、Expo 模板元件 (`components/`)

| 檔案 | 用途 |
|------|------|
| `Collapsible.tsx` | 可折疊區塊 |
| `ExternalLink.tsx` | 外部連結 |
| `HapticTab.tsx` | 觸覺回饋 Tab |
| `HelloWave.tsx` | 揮手動畫 |
| `ParallaxScrollView.tsx` | 視差滾動 |
| `ThemedText.tsx` | 主題文字 |
| `ThemedView.tsx` | 主題容器 |
| `ui/IconSymbol.tsx` | SF Symbol 圖示 |
| `ui/TabBarBackground.tsx` | Tab Bar 背景 |

---

## 十二、文件 (`docs/`)

| 檔案 | 用途 |
|------|------|
| `FILE_INDEX.md` | 檔案索引（本文件） |
| `MIBU_PROJECT_OVERVIEW.md` | 專案商業模式總覽 |
| `memory-screens.md` | 畫面結構與路由 |
| `memory-auth-flow.md` | 認證流程 |
| `memory-components.md` | 元件清單 |
| `memory-state.md` | 狀態管理 |
| `memory-assets.md` | 靜態資源 |
| `memory-api-client.md` | API 客戶端 |
| `memory-tabs.md` | Tab 功能對應 |
| `architecture-audit-report.md` | 架構審查報告 |
| `APP_STORE_REVIEW_CHECKLIST.md` | App Store 審核清單 |
| `sync-backend.md` | 後端同步事項 |

---

## 快速查找

| 要找什麼 | 去哪裡 |
|----------|--------|
| API 怎麼串接 | `src/services/` |
| 型別定義 | `src/types/` |
| 某個畫面的邏輯 | `src/modules/*/screens/` |
| 路由設定 | `app/` |
| 共用元件 | `src/modules/shared/components/` |
| 品牌色彩 | `constants/Colors.ts` |
| 設計 Token | `src/theme/designTokens.ts` |
| 全域狀態 | `src/context/AppContext.tsx` |
| 錯誤碼 | `src/types/errors.ts` |
| API 契約 | 後端 `docs/contracts/APP.md` |
