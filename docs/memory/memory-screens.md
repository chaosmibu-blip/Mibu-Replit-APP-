# Memory: Screens (畫面結構)

## 頁面清單

### Tab 導航頁面
| 路由 | 檔案 | 用途 | 角色權限 |
|------|------|------|----------|
| `/` | `app/(tabs)/index.tsx` | 首頁 | 全部 |
| `/gacha` | `app/(tabs)/gacha.tsx` | 扭蛋頁面 | Traveler |
| `/planner` | `app/(tabs)/planner.tsx` | 行程規劃 | Traveler |
| `/collection` | `app/(tabs)/collection.tsx` | 收藏庫 | Traveler |
| `/settings` | `app/(tabs)/settings.tsx` | 設定頁面 | 全部 |

### Stack 導航頁面
| 路由 | 檔案 | 用途 |
|------|------|------|
| `/login` | `app/login.tsx` | 登入頁面 |
| `/result` | `app/result.tsx` | 扭蛋結果 |
| `/items` | `app/items.tsx` | 物品詳情 |
| `/location` | `app/location.tsx` | 地點詳情 |

### 角色專屬頁面
| 路由 | 角色 | 用途 |
|------|------|------|
| `/merchant/*` | Merchant | 商家管理 |
| `/specialist/*` | Specialist | 專家儀表板 |
| `/admin/*` | Admin | 管理後台 |

---

## 導航結構

### Tab Navigator
```
(tabs)/
├── index.tsx      → HomeScreen
├── gacha.tsx      → GachaScreen
├── planner.tsx    → PlannerScreen
├── collection.tsx → CollectionScreen
└── settings.tsx   → SettingsScreen
```

### Stack Navigator (Root)
```
app/
├── _layout.tsx    → Root Layout
├── login.tsx      → LoginScreen
├── result.tsx     → ResultScreen
├── items.tsx      → ItemsScreen
└── location.tsx   → LocationScreen
```

---

## 路由設定 (Expo Router)

### File-based Routing
- `app/` 目錄下的檔案自動成為路由
- `(tabs)/` 群組用於 Tab Navigator
- `_layout.tsx` 定義導航器配置

### 路由參數
```typescript
// 傳遞參數
router.push({ pathname: '/items', params: { itemId: '123' } });

// 接收參數
const { itemId } = useLocalSearchParams();
```

---

## 待補充
- [ ] 各頁面狀態管理
- [ ] 頁面間資料傳遞
- [ ] Deep Linking 設定
