/**
 * Shared 模組 - 跨角色共用的畫面與功能
 */

// Screens
export { default as AuthScreen } from './screens/AuthScreen';
export { default as HomeScreen } from './screens/HomeScreen';
export { default as ProfileScreen } from './screens/ProfileScreen';
export { default as SettingsScreen } from './screens/SettingsScreen';
export { default as ChatScreen } from './screens/ChatScreen';
export { default as SOSScreen } from './screens/SOSScreen';
export { default as LocationScreen } from './screens/LocationScreen';
export { default as PendingApprovalScreen } from './screens/PendingApprovalScreen';
export { AccountScreen } from './screens/AccountScreen';

// Components
export * from './components';

// 相關 API
export { authApi } from '../../services/authApi';
export { locationApi } from '../../services/locationApi';
export { commonApi } from '../../services/commonApi';
