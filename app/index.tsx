import { Redirect } from 'expo-router';
import { useApp } from '../src/context/AppContext';

export default function Index() {
  const { state } = useApp();
  
  if (state.isAuthenticated && state.user) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/login" />;
}
