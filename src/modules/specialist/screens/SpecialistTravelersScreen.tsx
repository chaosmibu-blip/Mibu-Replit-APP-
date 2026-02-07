/**
 * SpecialistTravelersScreen - 專員服務中旅客列表畫面
 *
 * 功能說明：
 * - 顯示專員目前正在服務的所有旅客
 * - 支援下拉刷新重新載入列表
 * - 提供快捷操作：查看位置、開啟聊天
 * - 顯示每位旅客的服務開始時間與狀態
 *
 * 串接的 API：
 * - GET /specialist/travelers - 取得服務中的旅客列表
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { ServiceRelation } from '../../../types';
import { UIColors } from '../../../../constants/Colors';

// ============ 型別定義 ============

/**
 * 旅客資料結構（包含服務關係與旅客詳細資訊）
 */
interface TravelerData {
  serviceRelation: ServiceRelation;  // 服務關係資訊
  traveler: {
    id: string;                       // 旅客 ID
    firstName: string;                // 名
    lastName: string;                 // 姓
  };
}

// ============ 元件主體 ============
export function SpecialistTravelersScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();

  // ============ 狀態變數 ============
  // travelers: 服務中的旅客列表
  const [travelers, setTravelers] = useState<TravelerData[]>([]);
  // loading: 是否正在載入資料
  const [loading, setLoading] = useState(true);
  // refreshing: 是否正在下拉刷新
  const [refreshing, setRefreshing] = useState(false);

  // 判斷目前語言是否為繁體中文
  const isZh = state.language === 'zh-TW';

  // ============ 多語系翻譯 ============
  const translations = {
    title: isZh ? '服務中旅客' : 'Active Travelers',
    noTravelers: isZh ? '目前無服務中旅客' : 'No active travelers',
    loading: isZh ? '載入中...' : 'Loading...',
    since: isZh ? '開始於' : 'Since',
    status: isZh ? '狀態' : 'Status',
    active: isZh ? '服務中' : 'Active',
    viewLocation: isZh ? '查看位置' : 'View Location',
    chat: isZh ? '聊天' : 'Chat',
  };

  // 元件載入時取得旅客列表
  useEffect(() => {
    loadTravelers();
  }, []);

  // ============ 資料載入函數 ============

  /**
   * 載入服務中的旅客列表
   * 從 API 取得專員目前服務的所有旅客
   */
  const loadTravelers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await apiService.getSpecialistTravelers(token);
      // 將 API 回應轉換為 TravelerData 格式
      const travelerData = (response.travelers || []).map((t: { id: string; name: string; status: string }) => ({
        serviceRelation: { id: parseInt(t.id, 10) || 0, travelerId: t.id, specialistId: 0, status: t.status as 'active' | 'completed' | 'cancelled', createdAt: '' },
        traveler: { id: t.id, firstName: t.name, lastName: '' },
      })) as TravelerData[];
      setTravelers(travelerData);
    } catch (error) {
      console.error('Failed to load travelers:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 處理下拉刷新
   * 重新載入旅客列表
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTravelers();
    setRefreshing(false);
  };

  // ============ 格式化函數 ============

  /**
   * 格式化日期顯示
   * @param dateStr - ISO 日期字串
   * @returns 格式化後的日期時間字串
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(isZh ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============ Loading 畫面 ============
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  // ============ 主畫面 JSX ============
  return (
    <View style={styles.container}>
      {/* ============ 頁面標題區 ============ */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      {/* ============ 旅客列表區（支援下拉刷新） ============ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {travelers.length === 0 ? (
          // 空狀態顯示
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>{translations.noTravelers}</Text>
          </View>
        ) : (
          // 旅客卡片列表
          <View style={styles.travelersList}>
            {travelers.map(({ serviceRelation, traveler }) => (
              <View key={serviceRelation.id} style={styles.travelerCard}>
                {/* 旅客頭像 */}
                <View style={styles.travelerAvatar}>
                  <Ionicons name="person" size={28} color="#ffffff" />
                </View>
                {/* 旅客資訊 */}
                <View style={styles.travelerInfo}>
                  {/* 旅客姓名 */}
                  <Text style={styles.travelerName}>
                    {traveler.firstName} {traveler.lastName}
                  </Text>
                  {/* 服務開始時間 */}
                  <Text style={styles.travelerDate}>
                    {translations.since}: {formatDate(serviceRelation.createdAt)}
                  </Text>
                  {/* 服務狀態標籤 */}
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{translations.active}</Text>
                  </View>
                </View>
                {/* 快捷操作按鈕 */}
                <View style={styles.actions}>
                  {/* 查看位置按鈕 */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/specialist/tracking?travelerId=${traveler.id}` as any)}
                  >
                    <Ionicons name="location" size={20} color="#6366f1" />
                  </TouchableOpacity>
                  {/* 開啟聊天按鈕 */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/specialist/chat/${traveler.id}` as any)}
                  >
                    <Ionicons name="chatbubble" size={20} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ============ 樣式定義 ============
const styles = StyleSheet.create({
  // 容器樣式
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // 頁面標題樣式
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  // ScrollView 樣式
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  // Loading 狀態樣式
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: UIColors.textSecondary,
    fontSize: 16,
  },
  // 空狀態樣式
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 16,
    color: UIColors.textSecondary,
    marginTop: 12,
  },
  // 旅客列表樣式
  travelersList: {
    gap: 12,
  },
  travelerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  // 旅客頭像樣式
  travelerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  // 旅客資訊樣式
  travelerInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  travelerDate: {
    fontSize: 13,
    color: UIColors.textSecondary,
    marginBottom: 6,
  },
  // 狀態標籤樣式
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  // 操作按鈕區樣式
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
