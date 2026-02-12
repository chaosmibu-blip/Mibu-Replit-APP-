/**
 * 路由判斷頁面（App 入口點）
 *
 * 根據用戶的登入狀態和角色，自動導向到對應的頁面：
 * - 未登入 → /login
 * - traveler → /(tabs)
 * - merchant（待審核）→ /pending-approval
 * - merchant（已審核）→ /merchant-dashboard
 * - specialist（待審核）→ /pending-approval
 * - specialist（已審核）→ /specialist-dashboard
 * - admin → /admin-dashboard
 *
 * Super Admin 可透過 activeRole 切換介面
 */
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AppContext';

export default function Index() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Redirect href="/login" />;
  }

  const { role, activeRole, isApproved, isSuperAdmin } = user;
  
  // For super admin, use activeRole to determine interface
  const effectiveRole = isSuperAdmin ? (activeRole || role) : role;

  if (effectiveRole === 'merchant') {
    // Super admins skip approval check
    if (!isSuperAdmin && isApproved === false) {
      return <Redirect href="/pending-approval" />;
    }
    return <Redirect href="/merchant-dashboard" />;
  }

  if (effectiveRole === 'specialist') {
    // Super admins skip approval check
    if (!isSuperAdmin && isApproved === false) {
      return <Redirect href="/pending-approval" />;
    }
    return <Redirect href="/specialist-dashboard" />;
  }

  if (effectiveRole === 'admin') {
    return <Redirect href="/admin-dashboard" />;
  }

  return <Redirect href="/(tabs)" />;
}
