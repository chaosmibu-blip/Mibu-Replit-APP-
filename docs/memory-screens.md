# Memory: Screens (畫面結構)

> 最後更新: 2025-12-25

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

| Screen 元件 | 對應路由 | 說明 |
|-------------|----------|------|
| `HomeScreen.tsx` | `/` | 首頁 |
| `GachaScreen.tsx` | `/gacha` | 扭蛋頁面 |
| `ItemsScreen.tsx` | `/gacha/items` | 扭蛋結果 |
| `CollectionScreen.tsx` | `/collection` | 收藏庫 |
| `PlannerScreen.tsx` | `/planner` | 行程規劃 |
| `SettingsScreen.tsx` | `/settings` | 設定 |
| `ProfileScreen.tsx` | `/profile` | 個人資料 |
| `SOSScreen.tsx` | `/sos` | SOS 求助 |
| `AuthScreen.tsx` | `/login` | 登入 |
| `MerchantDashboardScreen.tsx` | `/merchant-dashboard` | 商家儀表板 |
| `SpecialistDashboardScreen.tsx` | `/specialist-dashboard` | 專家儀表板 |
| `AdminDashboardScreen.tsx` | `/admin-dashboard` | 管理後台 |

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

## 待補充
- [ ] 各頁面狀態管理
- [ ] Deep Linking 設定
