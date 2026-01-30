# Memory: Screens (畫面結構)

> **TL;DR**
> - **主要功能**：Expo Router 路由設定、39 個 Screen 元件對應表
> - **關鍵檔案**：`app/` 路由、`src/modules/*/screens/`
> - **相關 API**：`GET /api/announcements`（首頁公告）
> - **常見任務**：新增頁面、修改導航、調整 Tab

---

> **跨端對應**
> - 後端：`docs/memory-travel-gacha.md`（扭蛋畫面）、`docs/memory-merchant.md`（商家畫面）

> 最後更新: 2026-01-17

## 開發環境設定

### Expo 啟動模式
| 模式 | 說明 | 使用情境 |
|------|------|----------|
| **Expo Go** | 使用通用的 Expo Go app 載入 | 一般開發測試 |
| **Development Build** | 需預編譯的自定義原生 app | 使用原生模組時 |

**Workflow 指令**：
```bash
npx expo start --web --port 5000 --tunnel --go
```

- `--go`：強制使用 Expo Go 模式（避免 Development Build 模式導致空白畫面）
- `--tunnel`：透過 ngrok 建立公網連線
- `--port 5000`：Replit 要求的 Web 端口

**注意**：若安裝了 `expo-dev-client`，不加 `--go` 參數會預設使用 Development Build 模式，導致 Expo Go app 連線異常（畫面空白）。

## 頁面清單

### Tab 導航頁面
| 路由 | 檔案 | 用途 | 角色權限 |
|------|------|------|----------|
| `/` | `app/(tabs)/index.tsx` | 首頁 | 全部 |
| `/gacha` | `app/(tabs)/gacha/index.tsx` | 扭蛋頁面 | Traveler |
| `/gacha/items` | `app/(tabs)/gacha/items.tsx` | 扭蛋結果 | Traveler |
| `/planner` | `app/(tabs)/planner/index.tsx` | 行程規劃 | Traveler |
| `/collection` | `app/(tabs)/collection.tsx` | 收藏庫 | Traveler |
| `/settings` | `app/(tabs)/settings.tsx` | 設定頁面 | 全部 |

### Stack 導航頁面 (Root)
| 路由 | 檔案 | 用途 |
|------|------|------|
| `/login` | `app/login.tsx` | 登入頁面 |
| `/register` | `app/register.tsx` | 註冊頁面 |
| `/register-success` | `app/register-success.tsx` | 註冊成功 |
| `/profile` | `app/profile.tsx` | 個人資料 |
| `/economy` | `app/economy.tsx` | 等級與成就 |
| `/account` | `app/account.tsx` | 帳號綁定 |
| `/crowdfunding` | `app/crowdfunding.tsx` | 募資活動列表 |
| `/crowdfunding/:id` | `app/crowdfunding/[id].tsx` | 募資活動詳情 |
| `/referral` | `app/referral.tsx` | 推薦好友 |
| `/contribution` | `app/contribution.tsx` | 社群貢獻 |
| `/sos` | `app/sos.tsx` | SOS 緊急求助 |
| `/pending-approval` | `app/pending-approval.tsx` | 等待審核 |

### 商家專屬頁面 (Merchant)
| 路由 | 檔案 | 用途 |
|------|------|------|
| `/merchant-dashboard` | `app/merchant-dashboard.tsx` | 商家儀表板 |
| `/merchant-register` | `app/merchant-register.tsx` | 商家註冊 |
| `/register-merchant` | `app/register-merchant.tsx` | 註冊商家 |
| `/merchant/*` | `app/merchant/` | 商家管理子頁面 |

### 專家專屬頁面 (Specialist)
| 路由 | 檔案 | 用途 |
|------|------|------|
| `/specialist-dashboard` | `app/specialist-dashboard.tsx` | 專家儀表板 |
| `/register-specialist` | `app/register-specialist.tsx` | 註冊專家 |
| `/specialist/*` | `app/specialist/` | 專家管理子頁面 |

### 管理員專屬頁面 (Admin)
| 路由 | 檔案 | 用途 |
|------|------|------|
| `/admin-dashboard` | `app/admin-dashboard.tsx` | 管理後台 |
| `/admin-announcements` | `app/admin-announcements.tsx` | 公告管理 |
| `/admin-exclusions` | `app/admin-exclusions.tsx` | 排除管理 |
| `/announcement-manage` | `app/announcement-manage.tsx` | 公告編輯 |

---

## 導航結構

### Tab Navigator
```
app/(tabs)/
├── _layout.tsx       → Tab Navigator Layout
├── index.tsx         → HomeScreen
├── gacha/
│   ├── _layout.tsx   → Gacha Stack Layout
│   ├── index.tsx     → GachaScreen
│   └── items.tsx     → ItemsScreen (扭蛋結果)
├── planner/
│   ├── _layout.tsx   → Planner Stack Layout
│   └── index.tsx     → PlannerScreen
├── collection.tsx    → CollectionScreen
└── settings.tsx      → SettingsScreen
```

### Stack Navigator (Root)
```
app/
├── _layout.tsx              → Root Layout
├── index.tsx                → Entry Point
├── login.tsx                → 登入
├── register.tsx             → 註冊
├── profile.tsx              → 個人資料
├── sos.tsx                  → SOS 緊急求助
├── auth/                    → 認證相關
├── merchant/                → 商家子頁面
└── specialist/              → 專家子頁面
```

---

## Screen 對應表 (src/screens/)

共 39 個 Screen 元件。

### 通用頁面
| Screen 元件 | 對應路由 | 說明 |
|-------------|----------|------|
| `HomeScreen.tsx` | `/` | 首頁 |
| `AuthScreen.tsx` | `/login` | 登入 |
| `ProfileScreen.tsx` | `/profile` | 個人資料 |
| `SettingsScreen.tsx` | `/settings` | 設定 |
| `AccountScreen.tsx` | `/account` | 帳號綁定（Apple/Google） |
| `PendingApprovalScreen.tsx` | `/pending-approval` | 等待審核 |

### 扭蛋模組 (Gacha) / 經濟系統
| Screen 元件 | 對應路由 | 說明 |
|-------------|----------|------|
| `GachaScreen.tsx` | `/gacha` | 扭蛋頁面 |
| `GachaModuleScreen.tsx` | - | 扭蛋模組入口 |
| `ItemsScreen.tsx` | `/gacha/items` | 扭蛋結果 |
| `ItemBoxScreen.tsx` | - | 物品盒 |
| `CollectionScreen.tsx` | `/collection` | 收藏庫/圖鑑 |
| `EconomyScreen.tsx` | `/economy` | 等級、經驗、成就 |

### 社群功能模組 (Phase 2-4)
| Screen 元件 | 對應路由 | 說明 |
|-------------|----------|------|
| `CrowdfundingScreen.tsx` | `/crowdfunding` | 募資活動列表 |
| `CrowdfundingDetailScreen.tsx` | `/crowdfunding/:id` | 募資活動詳情 |
| `ReferralScreen.tsx` | `/referral` | 推薦好友、推薦碼 |
| `ContributionScreen.tsx` | `/contribution` | 回報、建議、投票 |

### 行程規劃模組 (Planner)
| Screen 元件 | 對應路由 | 說明 |
|-------------|----------|------|
| `PlannerScreen.tsx` | `/planner` | 行程規劃 |
| `ItineraryScreenV2.tsx` | - | 行程結果（V2 版本） |
| `LocationScreen.tsx` | - | 定位頁面 |
| `LocationScreen.web.tsx` | - | 定位頁面 (Web 版) |
| `ChatScreen.tsx` | - | 聊天頁面 |
| `SOSScreen.tsx` | `/sos` | SOS 緊急求助 |

### 商家模組 (Merchant)
| Screen 元件 | 對應路由 | 說明 |
|-------------|----------|------|
| `MerchantDashboardScreen.tsx` | `/merchant-dashboard` | 商家儀表板 |
| `MerchantProfileScreen.tsx` | `/merchant/profile` | 商家資料 |
| `MerchantPlacesScreen.tsx` | `/merchant/places` | 商家地點管理 |
| `MerchantProductsScreen.tsx` | `/merchant/products` | 商家商品管理 |
| `MerchantCouponsScreen.tsx` | `/merchant/coupons` | 商家優惠券管理 |
| `MerchantTransactionsScreen.tsx` | `/merchant/transactions` | 商家交易記錄 |
| `MerchantAnalyticsScreen.tsx` | `/merchant/analytics` | 商家數據分析 |
| `MerchantVerifyScreen.tsx` | `/merchant/verify` | 商家驗證 |

### 專家模組 (Specialist)
| Screen 元件 | 對應路由 | 說明 |
|-------------|----------|------|
| `SpecialistDashboardScreen.tsx` | `/specialist-dashboard` | 專家儀表板 |
| `SpecialistProfileScreen.tsx` | `/specialist/profile` | 專家資料 |
| `SpecialistTravelersScreen.tsx` | `/specialist/travelers` | 專家旅客管理 |
| `SpecialistTrackingScreen.tsx` | `/specialist/tracking` | 旅客追蹤 |
| `SpecialistHistoryScreen.tsx` | `/specialist/history` | 服務歷史 |

### 管理員模組 (Admin)
| Screen 元件 | 對應路由 | 說明 |
|-------------|----------|------|
| `AdminDashboardScreen.tsx` | `/admin-dashboard` | 管理後台 |
| `AdminAnnouncementsScreen.tsx` | `/admin-announcements` | 公告管理 |
| `AdminExclusionsScreen.tsx` | `/admin-exclusions` | 排除管理 |
| `AnnouncementManageScreen.tsx` | `/announcement-manage` | 公告編輯

---

## 路由設定 (Expo Router)

### File-based Routing
- `app/` 目錄下的檔案自動成為路由
- `(tabs)/` 群組用於 Tab Navigator
- `_layout.tsx` 定義導航器配置
- 資料夾可建立 Nested Stack

### 路由參數
```typescript
// 傳遞參數
router.push({ pathname: '/gacha/items', params: { itemId: '123' } });

// 接收參數
const { itemId } = useLocalSearchParams();
```

---

---

## 首頁公告串接 (2025-12-27)

### 功能說明
首頁動態顯示從後端 API 取得的公告，取代原本寫死的假資料。

### API 端點
```
GET /api/announcements
```

### 公告類型
| 類型 | 區塊樣式 | 說明 |
|------|----------|------|
| `announcement` | 淺色卡片 | 一般公告 |
| `flash_event` | 深色卡片 (棕色) | 快閃活動 |
| `holiday_event` | 深色卡片 (紅色) | 節慶活動 |

### 顯示邏輯
- 依類型分類顯示在不同區塊
- 若該類型無公告則隱藏區塊
- 若完全無公告則顯示「目前沒有公告」提示
- 公告有連結 (`linkUrl`) 時可點擊開啟

### 後端過濾（前端無需處理）
- `isActive = true`
- `startDate <= now`
- `endDate IS NULL OR endDate >= now`
- 按 `priority DESC, createdAt DESC` 排序

---

## 機率說明功能 (2025-12-29)

### 狀態
**暫時隱藏** - 等商家端開放後再啟用

### 說明
- 扭蛋頁面原本有「ℹ️ 機率說明」按鈕，呼叫 `GET /api/rarity-config` 顯示優惠券稀有度機率
- 因 v1.0 尚未開放商家端，暫無真實優惠券，故先隱藏此功能
- 程式碼已用 JSX 註解包裹，搜尋 `TODO: 商家端開放後` 即可找到

### 恢復方式
在 `src/screens/GachaScreen.tsx` 中：
1. 搜尋 `TODO: 商家端開放後取消註解顯示機率說明按鈕`
2. 搜尋 `TODO: 商家端開放後取消註解顯示機率說明 Modal`
3. 移除包裹的 `{/* */}` 註解

---

## 待補充
- [ ] 各頁面狀態管理
- [ ] Deep Linking 設定
