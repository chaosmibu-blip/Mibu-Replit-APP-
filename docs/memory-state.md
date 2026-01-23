# Memory: State Management (狀態管理)

> **TL;DR**
> - **主要功能**：React Context 全域狀態、AsyncStorage 持久化
> - **關鍵檔案**：`src/context/AppContext.tsx`
> - **核心 Hook**：`useApp()` → `state`, `t`, `setUser`, `getToken`
> - **常見任務**：存取用戶狀態、切換語言、管理 Token

---

> **跨端對應**
> - 後端：（無直接對應，前端專屬）

> 最後更新: 2026-01-11

## 狀態管理方案

**使用 React Context + useState**
- 檔案位置: `src/context/AppContext.tsx`
- 全域狀態透過 `useApp()` Hook 存取

---

## 全域狀態結構

```typescript
interface AppState {
  // 使用者狀態
  user: User | null;
  isAuthenticated: boolean;
  
  // 語言設定
  language: Language;  // 'zh-TW' | 'en' | 'ja' | 'ko'
  
  // 地區選擇 (扭蛋用)
  country: string;
  city: string;
  countryId: number | null;
  regionId: number | null;
  level: string;  // 抽卡等級
  
  // 扭蛋相關
  collection: GachaItem[];
  result: GachaResponse | null;
  
  // UI 狀態
  loading: boolean;
  error: string | null;
  view: AppView;
  unreadItemCount: number;
}
```

### User 物件結構
```typescript
interface User {
  id: string;
  name?: string;
  email: string | null;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  profileImageUrl?: string | null;
  role?: UserRole;           // 原始角色
  activeRole?: UserRole;     // 當前啟用角色
  isApproved?: boolean;
  isSuperAdmin?: boolean;
  accessibleRoles?: string[];
  provider?: string | null;  // 登入提供者 (apple, google)
  providerId?: string | null;
  isMerchant?: boolean;
  token?: string;
}
```

---

## Context 方法

| 方法 | 用途 |
|------|------|
| `updateState(updates)` | 通用狀態更新 |
| `setUser(user, token?)` | 設定使用者狀態 |
| `setLanguage(lang)` | 切換語言 |
| `addToCollection(items)` | 新增收藏 |
| `setResult(result)` | 設定扭蛋結果 |
| `setLoading(boolean)` | 設定載入狀態 |
| `setError(message)` | 設定錯誤訊息 |
| `switchRole(role)` | 切換使用者角色 |
| `getToken()` | 取得 JWT Token |
| `refreshUnreadCount()` | 刷新未讀物品數 |
| `setUnreadCount(count)` | 設定未讀物品數 |

---

## 使用範例

```typescript
import { useApp } from '@/src/context/AppContext';

function MyComponent() {
  const { state, t, setLanguage, addToCollection } = useApp();
  
  // 存取狀態
  const isLoggedIn = state.isAuthenticated;
  const userName = state.user?.name;
  
  // 使用翻譯
  const title = t.welcome;
  
  // 更新狀態
  const handleAddItem = (items: GachaItem[]) => {
    addToCollection(items);
  };
  
  return (
    <View>
      <Text>{title}, {userName}</Text>
    </View>
  );
}
```

---

## 持久化設定

### AsyncStorage Keys
```typescript
const STORAGE_KEYS = {
  LANGUAGE: '@mibu_language',
  COLLECTION: '@mibu_collection',
  USER: '@mibu_user',
  TOKEN: '@mibu_token',
};
```

### 載入流程 (App 啟動時)
```typescript
useEffect(() => {
  loadStoredData();
}, []);

const loadStoredData = async () => {
  const [storedLanguage, storedCollection, storedUser] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
    AsyncStorage.getItem(STORAGE_KEYS.COLLECTION),
    AsyncStorage.getItem(STORAGE_KEYS.USER),
  ]);
  
  // 還原狀態...
};
```

---

## 快取策略

### 本地快取
| 資料 | 快取位置 | 過期策略 |
|------|----------|----------|
| 使用者資料 | AsyncStorage | 登出時清除 |
| 收藏列表 | AsyncStorage | 永久保存 |
| 語言設定 | AsyncStorage | 永久保存 |
| 每日限制 | AsyncStorage | 每日重置 |

### API 快取
- 目前未實作 API 回應快取
- 國家/地區列表可考慮快取

---

## 待補充
- [ ] 考慮遷移到 Zustand
- [ ] 實作 API 回應快取
- [ ] 離線資料同步
