# Memory: Auth Flow (認證流程)

> **TL;DR**
> - **主要功能**：Apple/Google 登入、JWT Token 管理、角色權限
> - **關鍵檔案**：`src/context/AppContext.tsx`、`hooks/useGoogleAuth.ts`
> - **相關 API**：`POST /api/auth/mobile`、`GET /api/auth/user`
> - **Token 儲存**：iOS/Android 用 SecureStore、Web 用 AsyncStorage

---

> **跨端對應**
> - 後端：`docs/memory-auth.md`

## 支援的登入方式

1. **Apple Sign In** (iOS 限定)
2. **Google Sign In** (iOS/Android 原生 SDK，Web 用 Replit OAuth)
3. **訪客瀏覽** (免登入，部分功能限制)
4. ~~Email/Password~~ (暫未實作)

---

## Apple 登入流程

```
使用者點擊「使用 Apple 登入」
    ↓
呼叫 expo-apple-authentication
    ↓
取得 Apple Identity Token
    ↓
POST /api/auth/apple
├── Body: { identityToken }
    ↓
後端驗證 Token，返回 JWT + User
    ↓
儲存 JWT Token 到 SecureStore
    ↓
更新 AppContext 使用者狀態
    ↓
跳轉到首頁
```

### 程式碼範例
```typescript
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';

const handleAppleLogin = async () => {
  // 1. 使用 expo-apple-authentication 取得 identityToken
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    ],
  });
  
  // 2. 發送給後端換取 JWT
  const response = await fetch(`${API_BASE_URL}/api/auth/apple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identityToken: credential.identityToken })
  });
  
  const { token, user } = await response.json();
  
  // 3. 儲存 Token (SecureStore)
  await SecureStore.setItemAsync('jwt_token', token);
  
  // 4. 更新 Context 狀態
  setUser(user, token);
};
```

---

## JWT Token 管理

### JWT 結構
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'merchant' | 'specialist' | 'admin';
  iat: number;
  exp: number;  // 7 天後過期
}
```

### 儲存方式（跨平台安全儲存）

> ⚠️ **2025-01-03 更新**：Token 儲存已統一使用 `AppContext` 的 `loadToken()` / `saveToken()` / `removeToken()` 函數

| 平台 | 儲存方式 | Key |
|------|----------|-----|
| iOS / Android | `expo-secure-store`（加密） | `mibu_token` |
| Web | `AsyncStorage` | `@mibu_token` |

```typescript
// AppContext.tsx 中的跨平台實作
const saveToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('@mibu_token', token);
  } else {
    await SecureStore.setItemAsync('mibu_token', token);
  }
};

const loadToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem('@mibu_token');
  }
  return await SecureStore.getItemAsync('mibu_token');
};

const removeToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem('@mibu_token');
  } else {
    await SecureStore.deleteItemAsync('mibu_token');
  }
};
```

### 在畫面中取得 Token
```typescript
// ✅ 正確方式：使用 useApp() 的 getToken
const { getToken } = useApp();
const token = await getToken();

// ❌ 錯誤方式：直接使用 AsyncStorage
const token = await AsyncStorage.getItem('@mibu_token');
```

### JWT 使用方式
```typescript
// 所有 API 請求都需帶入 Authorization Header
const token = await SecureStore.getItemAsync('jwt_token');
const response = await fetch(`${API_BASE_URL}/api/xxx`, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

// Token 過期 (401) 時，導向重新登入
if (response.status === 401) {
  await SecureStore.deleteItemAsync('jwt_token');
  navigation.navigate('Login');
}
```

---

## Token 過期處理

### 自動檢測 401
```typescript
const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
  
  if (response.status === 401) {
    // Token 過期，清除並跳轉登入
    await SecureStore.deleteItemAsync('jwt_token');
    router.replace('/login');
    throw new Error('Token expired');
  }
  
  return response.json();
};
```

---

## 登出處理

```typescript
const handleLogout = async () => {
  // 1. 呼叫後端登出 API
  try {
    const token = await SecureStore.getItemAsync('jwt_token');
    if (token) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error('Logout API failed:', error);
  }
  
  // 2. 清除本地儲存
  await SecureStore.deleteItemAsync('jwt_token');
  
  // 3. 重置 Context 狀態
  setUser(null);
  
  // 4. 跳轉登入頁
  router.replace('/login');
};
```

---

## 角色權限

### 支援角色
| 角色 | 代碼 | 權限 |
|------|------|------|
| 旅行者 | `user` | 扭蛋、收藏、行程 |
| 商家 | `merchant` | 商家管理、優惠券 |
| 專家 | `specialist` | 專家儀表板 |
| 管理員 | `admin` | 全部權限 |

### 角色檢查
```typescript
const isAdmin = user?.role === 'admin';
const isMerchant = user?.role === 'merchant';
const isSpecialist = user?.role === 'specialist';
```

---

## Google 原生登入流程

```
使用者點擊「使用 Google 登入」
    ↓
Platform.OS 判斷
├── iOS/Android → useGoogleAuth Hook（原生 SDK）
└── Web → Replit OAuth（瀏覽器視窗）

iOS/Android 原生流程：
  1. GoogleSignin.hasPlayServices()（Android 檢查）
  2. GoogleSignin.signIn() → 原生登入 UI
  3. 取得 Google idToken
  4. POST /api/auth/mobile { provider: 'google', identityToken, portal, deviceId? }
  5. 後端驗證 → 回傳 JWT + User
  6. 儲存 Token → 更新 AuthContext → 導向對應首頁
```

### 關鍵檔案
| 檔案 | 用途 |
|------|------|
| `hooks/useGoogleAuth.ts` | 原生 SDK 延遲載入 + 登入邏輯 |
| `app/login.tsx` | 登入 UI + 平台分流 + 後端串接 |
| `app.config.js` | config plugin + iosUrlScheme |

### 注意事項
- **Expo Go 不支援**：原生模組需要 EAS Build dev client
- `useGoogleAuth.ts` 使用延遲載入（`require()`），Expo Go 中不會 crash，會拋出明確錯誤
- Android 不需要 `androidClientId`，透過 `webClientId` + GCP SHA-1 fingerprint 驗證
- `GoogleSignin.configure()` 只在首次呼叫 `signInWithGoogle()` 時執行

---

## 待補充
- [ ] Token 自動刷新機制
- [ ] 生物辨識登入
