/**
 * SpecialistDashboardScreen - 專家儀表板畫面
 *
 * 功能說明：
 * - 顯示專員的上線/離線狀態，可透過開關切換
 * - 提供快捷選單導航至其他功能頁面
 * - 顯示目前服務中的旅客列表
 * - 支援登出功能
 *
 * 串接的 API：
 * - GET /specialist/me - 取得專員資訊
 * - GET /specialist/services - 取得服務中的旅客列表
 * - POST /specialist/toggle-online - 切換上線狀態
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth, useI18n } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { SpecialistInfo, ServiceRelation } from '../../../types';
import { RoleSwitcher } from '../../shared/components/RoleSwitcher';
import { MibuBrand } from '../../../../constants/Colors';
import { LOCALE_MAP } from '../../../utils/i18n';

// ============ 元件主體 ============
export function SpecialistDashboardScreen() {
  const { user, getToken, setUser } = useAuth();
  const { t, language } = useI18n();
  const router = useRouter();

  // ============ 狀態變數 ============
  // specialist: 專員資訊（名稱、上線狀態、服務地區等）
  const [specialist, setSpecialist] = useState<SpecialistInfo | null>(null);
  // services: 服務中的旅客關係列表
  const [services, setServices] = useState<ServiceRelation[]>([]);
  // loading: 是否正在載入資料
  const [loading, setLoading] = useState(true);
  // toggling: 是否正在切換上線狀態
  const [toggling, setToggling] = useState(false);

  // ============ 事件處理函數 ============

  /**
   * 處理登出
   * 清除用戶狀態並導航至登入頁面
   */
  const handleLogout = async () => {
    await setUser(null);
    router.replace('/login');
  };

  // 元件載入時取得資料
  useEffect(() => {
    loadData();
  }, []);

  /**
   * 載入專員資訊與服務列表
   * 同時呼叫兩個 API 並更新狀態
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      // 同時取得專員資訊與服務列表
      const [specialistData, servicesData] = await Promise.all([
        apiService.getSpecialistMe(token).catch(() => null),
        apiService.getSpecialistServices(token).catch(() => ({ relations: [] })),
      ]);

      setSpecialist(specialistData);
      setServices(servicesData.relations || []);
    } catch (error) {
      console.error('Failed to load specialist data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 切換上線/離線狀態
   * 呼叫 API 並更新專員狀態
   */
  const handleToggleOnline = async () => {
    try {
      setToggling(true);
      const token = await getToken();
      if (!token) return;

      const response = await apiService.toggleSpecialistOnline(token);
      setSpecialist(response.specialist);
    } catch (error) {
      console.error('Failed to toggle online:', error);
    } finally {
      setToggling(false);
    }
  };

  /**
   * 格式化日期顯示
   * @param dateStr - ISO 日期字串
   * @returns 格式化後的日期時間字串
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(LOCALE_MAP[language], {
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
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  // ============ 主畫面 JSX ============
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ============ 頁面標題區 ============ */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{t.specialist_dashboard}</Text>
          {/* 超級管理員才顯示角色切換器 */}
          {user?.isSuperAdmin && <RoleSwitcher compact />}
        </View>
        {/* 登出按鈕 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>{t.common_logout}</Text>
        </TouchableOpacity>
      </View>

      {/* ============ 上線狀態卡片 ============ */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          {/* 狀態指示燈與文字 */}
          <View style={styles.statusInfo}>
            <View style={[
              styles.statusIndicator,
              specialist?.isOnline ? styles.statusOnline : styles.statusOffline,
            ]} />
            <Text style={styles.statusText}>
              {specialist?.isOnline ? t.specialist_online : t.specialist_offline}
            </Text>
          </View>
          {/* 上線狀態開關 */}
          <View style={styles.toggleContainer}>
            {toggling ? (
              <ActivityIndicator size="small" color={MibuBrand.brown} />
            ) : (
              <Switch
                value={specialist?.isOnline || false}
                onValueChange={handleToggleOnline}
                trackColor={{ false: MibuBrand.tanLight, true: MibuBrand.highlight }}
                thumbColor={specialist?.isOnline ? MibuBrand.brown : MibuBrand.tan}
              />
            )}
          </View>
        </View>
        <Text style={styles.toggleLabel}>{t.specialist_onlineStatus}</Text>
        {/* 服務地區資訊 */}
        {specialist?.serviceRegion && (
          <Text style={styles.regionText}>
            {t.specialist_region}: {specialist.serviceRegion}
          </Text>
        )}
      </View>

      {/* ============ 快捷選單區 ============ */}
      <View style={styles.menuSection}>
        {/* 服務中旅客 */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/specialist/travelers' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="people-outline" size={24} color={MibuBrand.brown} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{t.specialist_activeTravelers}</Text>
            <Text style={styles.menuSubtitle}>{t.specialist_viewTravelers}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.copper} />
        </TouchableOpacity>

        {/* 即時位置追蹤 */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/specialist/tracking' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="map-outline" size={24} color={MibuBrand.brown} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{t.specialist_liveTracking}</Text>
            <Text style={styles.menuSubtitle}>{t.specialist_viewTravelersOnMap}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.copper} />
        </TouchableOpacity>

        {/* 服務歷史 */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/specialist/history' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="time-outline" size={24} color={MibuBrand.brown} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{t.specialist_serviceHistory}</Text>
            <Text style={styles.menuSubtitle}>{t.specialist_viewPastRecords}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.copper} />
        </TouchableOpacity>

        {/* 專員資料 */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/specialist/profile' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="person-circle-outline" size={24} color={MibuBrand.brown} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{t.specialist_profile}</Text>
            <Text style={styles.menuSubtitle}>{t.specialist_viewEditProfile}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.copper} />
        </TouchableOpacity>
      </View>

      {/* ============ 服務中旅客區塊標題 ============ */}
      <Text style={styles.sectionTitle}>{t.specialist_activeServices}</Text>

      {/* ============ 服務中旅客列表 ============ */}
      {services.length === 0 ? (
        // 空狀態顯示
        <View style={styles.emptyCard}>
          <Ionicons name="people-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>{t.specialist_noServices}</Text>
        </View>
      ) : (
        // 旅客卡片列表
        <View style={styles.servicesList}>
          {services.map(service => (
            <View key={service.id} style={styles.serviceCard}>
              {/* 旅客頭像 */}
              <View style={styles.serviceAvatar}>
                <Ionicons name="person" size={24} color="#ffffff" />
              </View>
              {/* 旅客資訊 */}
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>
                  {service.traveler?.name || `Traveler #${service.travelerId}`}
                </Text>
                <Text style={styles.serviceDate}>
                  {t.specialist_since}: {formatDate(service.createdAt)}
                </Text>
              </View>
              {/* 服務狀態標籤 */}
              <View style={[
                styles.serviceStatus,
                service.status === 'active' && styles.serviceStatusActive,
              ]}>
                <Text style={styles.serviceStatusText}>{service.status}</Text>
              </View>
            </View>
          ))}
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
    backgroundColor: MibuBrand.creamLight,
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
    color: MibuBrand.copper,
    fontSize: 16,
  },
  // 頁面標題樣式
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: MibuBrand.brown,
  },
  // 登出按鈕樣式
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.error,
  },
  // 狀態卡片樣式
  statusCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOnline: {
    backgroundColor: '#22c55e',
  },
  statusOffline: {
    backgroundColor: '#94a3b8',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.dark,
  },
  toggleContainer: {
    width: 60,
    alignItems: 'flex-end',
  },
  toggleLabel: {
    fontSize: 14,
    color: MibuBrand.copper,
  },
  regionText: {
    fontSize: 14,
    color: MibuBrand.brown,
    marginTop: 8,
  },
  // 選單區樣式
  menuSection: {
    marginBottom: 24,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: MibuBrand.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.dark,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  // 區塊標題樣式
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.dark,
    marginBottom: 16,
  },
  // 空狀態樣式
  emptyCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  emptyText: {
    fontSize: 16,
    color: MibuBrand.copper,
    marginTop: 12,
  },
  // 服務列表樣式
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  serviceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MibuBrand.brown,
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
    color: MibuBrand.dark,
    marginBottom: 4,
  },
  serviceDate: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  serviceStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: MibuBrand.highlight,
  },
  serviceStatusActive: {
    backgroundColor: '#dcfce7',
  },
  serviceStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
});
