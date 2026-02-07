/**
 * SpecialistHistoryScreen - 專員工作紀錄畫面
 *
 * 功能說明：
 * - 顯示專員過往的服務紀錄列表
 * - 支援篩選：全部 / 進行中 / 已完成
 * - 顯示每筆服務的旅客名稱、開始時間、狀態
 *
 * 串接的 API：
 * - GET /specialist/services - 取得服務紀錄列表
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { ServiceRelation } from '../../../types';
import { UIColors } from '../../../../constants/Colors';

// ============ 元件主體 ============
export function SpecialistHistoryScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();

  // ============ 狀態變數 ============
  // services: 服務紀錄列表
  const [services, setServices] = useState<ServiceRelation[]>([]);
  // loading: 是否正在載入資料
  const [loading, setLoading] = useState(true);
  // filter: 目前的篩選條件（全部 / 進行中 / 已完成）
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // 判斷目前語言是否為繁體中文
  const isZh = state.language === 'zh-TW';

  // ============ 多語系翻譯 ============
  const translations = {
    title: isZh ? '服務歷史' : 'Service History',
    all: isZh ? '全部' : 'All',
    active: isZh ? '進行中' : 'Active',
    completed: isZh ? '已完成' : 'Completed',
    cancelled: isZh ? '已取消' : 'Cancelled',
    noServices: isZh ? '尚無服務記錄' : 'No service history',
    loading: isZh ? '載入中...' : 'Loading...',
    since: isZh ? '開始於' : 'Started',
    traveler: isZh ? '旅客' : 'Traveler',
    status: isZh ? '狀態' : 'Status',
  };

  // 元件載入時取得服務紀錄
  useEffect(() => {
    loadServices();
  }, []);

  // ============ 資料載入函數 ============

  /**
   * 載入服務紀錄列表
   * 從 API 取得所有服務關係資料
   */
  const loadServices = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await apiService.getSpecialistServices(token);
      setServices(data.relations || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ 篩選邏輯 ============

  /**
   * 根據篩選條件過濾服務列表
   * @returns 篩選後的服務列表
   */
  const filteredServices = services.filter(service => {
    if (filter === 'all') return true;
    if (filter === 'active') return service.status === 'active';
    if (filter === 'completed') return service.status === 'completed';
    return true;
  });

  // ============ 格式化函數 ============

  /**
   * 格式化日期顯示
   * @param dateStr - ISO 日期字串
   * @returns 格式化後的日期時間字串
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isZh ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * 取得狀態標籤文字
   * @param status - 服務狀態
   * @returns 對應的翻譯文字
   */
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return translations.active;
      case 'completed': return translations.completed;
      case 'cancelled': return translations.cancelled;
      default: return status;
    }
  };

  /**
   * 取得狀態標籤樣式
   * @param status - 服務狀態
   * @returns 對應的樣式物件
   */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { badge: styles.activeBadge, text: styles.activeText };
      case 'completed': return { badge: styles.completedBadge, text: styles.completedText };
      case 'cancelled': return { badge: styles.cancelledBadge, text: styles.cancelledText };
      default: return { badge: styles.activeBadge, text: styles.activeText };
    }
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ============ 頁面標題區 ============ */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      {/* ============ 篩選按鈕區 ============ */}
      <View style={styles.filterRow}>
        {(['all', 'active', 'completed'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? translations.all : f === 'active' ? translations.active : translations.completed}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ============ 服務紀錄列表 ============ */}
      {filteredServices.length === 0 ? (
        // 空狀態顯示
        <View style={styles.emptyCard}>
          <Ionicons name="time-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>{translations.noServices}</Text>
        </View>
      ) : (
        // 服務卡片列表
        <View style={styles.servicesList}>
          {filteredServices.map(service => {
            const statusStyle = getStatusStyle(service.status);
            return (
              <View key={service.id} style={styles.serviceCard}>
                {/* 旅客頭像 */}
                <View style={styles.serviceAvatar}>
                  <Ionicons name="person" size={24} color="#ffffff" />
                </View>
                {/* 服務資訊 */}
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>
                    {service.traveler?.name || `${translations.traveler} #${service.travelerId.slice(0, 8)}`}
                  </Text>
                  <Text style={styles.serviceDate}>
                    {translations.since}: {formatDate(service.createdAt)}
                  </Text>
                </View>
                {/* 狀態標籤 */}
                <View style={[styles.statusBadge, statusStyle.badge]}>
                  <Text style={[styles.statusText, statusStyle.text]}>
                    {getStatusLabel(service.status)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

// ============ 樣式定義 ============
const styles = StyleSheet.create({
  // 容器樣式
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 60,
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
  // 頁面標題樣式
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  // 篩選按鈕樣式
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: UIColors.textSecondary,
  },
  filterTextActive: {
    color: '#ffffff',
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
  // 服務列表樣式
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  serviceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceDate: {
    fontSize: 13,
    color: UIColors.textSecondary,
  },
  // 狀態標籤樣式
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // 進行中狀態樣式
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  activeText: {
    color: '#16a34a',
  },
  // 已完成狀態樣式
  completedBadge: {
    backgroundColor: '#e0e7ff',
  },
  completedText: {
    color: '#6366f1',
  },
  // 已取消狀態樣式
  cancelledBadge: {
    backgroundColor: '#fef2f2',
  },
  cancelledText: {
    color: '#ef4444',
  },
});
