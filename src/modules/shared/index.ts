/**
 * Shared 模組 - 跨角色共用的畫面與功能
 */

// Screens - 畫面元件
// #044: AuthScreen（密碼登入/註冊）已移除，僅保留 OAuth（app/login.tsx）
export { HomeScreen } from './screens/HomeScreen';
export { ProfileScreen } from './screens/ProfileScreen';
export { SettingsScreen } from './screens/SettingsScreen';
export { ChatScreen } from './screens/ChatScreen';
export { SOSScreen } from './screens/SOSScreen';
export { LocationScreen } from './screens/LocationScreen';
export { PendingApprovalScreen } from './screens/PendingApprovalScreen';
export { AccountScreen } from './screens/AccountScreen';
export { SOSContactsScreen } from './screens/SOSContactsScreen';

// Components - 元件
export * from './components';

// 相關 API
export { authApi } from '../../services/authApi';
export { locationApi } from '../../services/locationApi';
export { commonApi } from '../../services/commonApi';
