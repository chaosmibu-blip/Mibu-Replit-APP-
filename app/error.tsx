/**
 * 全域錯誤邊界頁面
 *
 * 當任何路由發生未捕捉的 JS 錯誤時，顯示此頁面取代白屏。
 * 用戶可以點擊「重試」恢復，或回到首頁。
 *
 * 使用 expo-router 內建的 ErrorBoundary 機制（+error.tsx）
 *
 * 更新日期：2026-02-10（新增全域錯誤防護）
 */
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '../constants/Colors';

interface ErrorBoundaryProps {
  error: Error;
  retry: () => void;
}

export default function ErrorScreen({ error, retry }: ErrorBoundaryProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="warning-outline" size={64} color={MibuBrand.warning} />
      <Text style={styles.title}>發生了一點問題</Text>
      <Text style={styles.message}>{error.message || '未知錯誤'}</Text>

      <TouchableOpacity style={styles.retryButton} onPress={retry}>
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.retryText}>重試</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.homeText}>回到首頁</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: MibuBrand.warmWhite,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: MibuBrand.copper,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  homeText: {
    color: MibuBrand.copper,
    fontSize: 14,
    fontWeight: '500',
  },
});
