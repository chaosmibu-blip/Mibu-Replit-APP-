import { Redirect } from 'expo-router';
import { useApp } from '../src/context/AppContext';

export default function Index() {
  const { state } = useApp();
  
  if (!state.isAuthenticated || !state.user) {
    return <Redirect href="/login" />;
  }

  const { role, activeRole, isApproved, isSuperAdmin } = state.user;
  
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
