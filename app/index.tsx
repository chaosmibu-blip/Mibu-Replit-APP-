import { Redirect } from 'expo-router';
import { useApp } from '../src/context/AppContext';

export default function Index() {
  const { state } = useApp();
  
  if (!state.isAuthenticated || !state.user) {
    return <Redirect href="/login" />;
  }

  const { role, isApproved } = state.user;

  if (role === 'merchant') {
    if (isApproved === false) {
      return <Redirect href="/pending-approval" />;
    }
    return <Redirect href="/merchant-dashboard" />;
  }

  if (role === 'specialist') {
    if (isApproved === false) {
      return <Redirect href="/pending-approval" />;
    }
    return <Redirect href="/specialist-dashboard" />;
  }

  return <Redirect href="/(tabs)" />;
}
