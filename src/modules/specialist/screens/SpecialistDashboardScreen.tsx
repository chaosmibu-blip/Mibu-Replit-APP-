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
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { SpecialistInfo, ServiceRelation } from '../../../types';
import { RoleSwitcher } from '../../shared/components/RoleSwitcher';
import { MibuBrand } from '../../../../constants/Colors';

export function SpecialistDashboardScreen() {
  const { state, getToken, setUser } = useApp();
  const router = useRouter();
  const [specialist, setSpecialist] = useState<SpecialistInfo | null>(null);
  const [services, setServices] = useState<ServiceRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '專員後台' : 'Specialist Dashboard',
    online: isZh ? '上線中' : 'Online',
    offline: isZh ? '離線' : 'Offline',
    toggleOnline: isZh ? '上線狀態' : 'Online Status',
    activeServices: isZh ? '服務中旅客' : 'Active Services',
    noServices: isZh ? '目前無服務中旅客' : 'No active services',
    loading: isZh ? '載入中...' : 'Loading...',
    since: isZh ? '開始於' : 'Since',
    region: isZh ? '地區' : 'Region',
    logout: isZh ? '登出' : 'Logout',
  };

  const handleLogout = async () => {
    setUser(null);
    router.replace('/login');
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(isZh ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{translations.title}</Text>
          {state.user?.isSuperAdmin && <RoleSwitcher compact />}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>{translations.logout}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusInfo}>
            <View style={[
              styles.statusIndicator,
              specialist?.isOnline ? styles.statusOnline : styles.statusOffline,
            ]} />
            <Text style={styles.statusText}>
              {specialist?.isOnline ? translations.online : translations.offline}
            </Text>
          </View>
          <View style={styles.toggleContainer}>
            {toggling ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Switch
                value={specialist?.isOnline || false}
                onValueChange={handleToggleOnline}
                trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
                thumbColor={specialist?.isOnline ? '#6366f1' : '#94a3b8'}
              />
            )}
          </View>
        </View>
        <Text style={styles.toggleLabel}>{translations.toggleOnline}</Text>
        {specialist?.serviceRegion && (
          <Text style={styles.regionText}>
            {translations.region}: {specialist.serviceRegion}
          </Text>
        )}
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/specialist/travelers' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="people-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '服務中旅客' : 'Active Travelers'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '查看服務中的旅客' : 'View travelers being served'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/specialist/tracking' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="map-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '即時位置追蹤' : 'Live Tracking'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '在地圖上查看旅客位置' : 'View travelers on map'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/specialist/history' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="time-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '服務歷史' : 'Service History'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '查看過往服務記錄' : 'View past service records'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/specialist/profile' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="person-circle-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '專員資料' : 'Specialist Profile'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '查看與編輯個人資料' : 'View and edit profile'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{translations.activeServices}</Text>

      {services.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="people-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>{translations.noServices}</Text>
        </View>
      ) : (
        <View style={styles.servicesList}>
          {services.map(service => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceAvatar}>
                <Ionicons name="person" size={24} color="#ffffff" />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>
                  {service.traveler?.name || `Traveler #${service.travelerId}`}
                </Text>
                <Text style={styles.serviceDate}>
                  {translations.since}: {formatDate(service.createdAt)}
                </Text>
              </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.dark,
    marginBottom: 16,
  },
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
