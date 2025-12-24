# Memory: Auth Flow (認證流程)

## 支援的登入方式

1. **Apple Sign In** (iOS 優先)
2. **Google Sign In**
3. **Email/Password** 註冊與登入

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
├── Body: { identityToken, user?, fullName? }
    ↓
後端驗證 Token，返回 JWT
    ↓
儲存 JWT Token 到 AsyncStorage
    ↓
更新 AppContext 使用者狀態
    ↓
跳轉到首頁
```

### 程式碼範例
```typescript
import * as AppleAuthentication from 'expo-apple-authentication';

const handleAppleLogin = async () => {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  
  const response = await apiService.appleAuth({
    identityToken: credential.identityToken,
    user: credential.user,
    fullName: credential.fullName,
  });
  
  await AsyncStorage.setItem('@mibu_token', response.token);
  setUser(response.user, response.token);
};
```

---

## Google 登入流程

```
使用者點擊「使用 Google 登入」
    ↓
呼叫 expo-auth-session (Google OAuth)
    ↓
取得 Google Access Token
    ↓
POST /api/auth/google
├── Body: { accessToken }
    ↓
後端驗證 Token，返回 JWT
    ↓
儲存 JWT Token 到 AsyncStorage
    ↓
更新 AppContext 使用者狀態
    ↓
跳轉到首頁
```

---

## JWT Token 管理

### 儲存位置
```typescript
const STORAGE_KEYS = {
  TOKEN: '@mibu_token',
  USER: '@mibu_user',
};
```

### Token 存取
```typescript
// 儲存 Token
await AsyncStorage.setItem('@mibu_token', token);

// 讀取 Token
const token = await AsyncStorage.getItem('@mibu_token');

// 清除 Token
await AsyncStorage.removeItem('@mibu_token');
```

### Token 刷新策略
- 目前未實作自動刷新
- Token 過期時 (401 回應) 清除並跳轉登入頁

---

## 登出處理

```typescript
const handleLogout = async () => {
  // 1. 呼叫後端登出 API (選用)
  try {
    const token = await AsyncStorage.getItem('@mibu_token');
    if (token) {
      await apiService.logout(token);
    }
  } catch (error) {
    console.error('Logout API failed:', error);
  }
  
  // 2. 清除本地儲存
  await AsyncStorage.multiRemove([
    '@mibu_token',
    '@mibu_user',
    '@mibu_collection',
  ]);
  
  // 3. 重置 Context 狀態
  setUser(null);
  
  // 4. 跳轉登入頁
  router.replace('/login');
};
```

---

## 角色切換

### 支援角色
| 角色 | 代碼 | 權限 |
|------|------|------|
| 旅行者 | `traveler` | 扭蛋、收藏、行程 |
| 商家 | `merchant` | 商家管理、優惠券 |
| 專家 | `specialist` | 專家儀表板 |
| 管理員 | `admin` | 全部權限 |

### 切換流程
```typescript
const switchRole = async (role: UserRole) => {
  const token = await AsyncStorage.getItem('@mibu_token');
  const response = await apiService.switchRole(token, role);
  
  // 更新使用者狀態
  setUser({ ...user, activeRole: response.activeRole });
};
```

---

## 待補充
- [ ] Token 自動刷新機制
- [ ] 生物辨識登入
- [ ] 記住登入狀態
