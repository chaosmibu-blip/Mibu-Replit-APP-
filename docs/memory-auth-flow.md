# Memory: Auth Flow (認證流程)

## 支援的登入方式

1. **Apple Sign In** (iOS 優先)
2. ~~Google Sign In~~ (暫未實作)
3. ~~Email/Password~~ (暫未實作)

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

### 儲存方式 (推薦使用 SecureStore)
```typescript
import * as SecureStore from 'expo-secure-store';

// 儲存 Token
await SecureStore.setItemAsync('jwt_token', token);

// 讀取 Token
const token = await SecureStore.getItemAsync('jwt_token');

// 清除 Token
await SecureStore.deleteItemAsync('jwt_token');
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

## 待補充
- [ ] Google 登入實作
- [ ] Token 自動刷新機制
- [ ] 生物辨識登入
