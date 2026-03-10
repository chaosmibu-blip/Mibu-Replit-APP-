/**
 * SpecialistTravelersScreen - 專員服務中旅客列表畫面
 *
 * 功能說明：
 * - 顯示專員目前正在服務的所有旅客
 * - 支援下拉刷新重新載入列表
 * - 提供快捷操作：查看位置
 * - 顯示每位旅客的服務開始時間與狀態
 *
 * 串接的 API（透過 React Query hooks）：
 * - useSpecialistTravelers() - 取得服務中的旅客列表
 *
 * 更新日期：2026-03-06（遷移至 React Query）
 */
import React from 'react';
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
import { useI18n } from '../../../context/AppContext';
import { useSpecialistTravelers } from '../../../hooks/useSpecialistQueries';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MibuBrand, UIColors, SemanticColors } from '../../../../constants/Colors';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { LOCALE_MAP } from '../../../utils/i18n';

export function SpecialistTravelersScreen() {
  const { t, language } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const travelersQuery = useSpecialistTravelers();
  const travelers = (travelersQuery.data?.travelers ?? []).map((item: { id: string; name: string; status: string }) => ({
    id: item.id,
    name: item.name,
    status: item.status,
  }));
  const refreshing = travelersQuery.isFetching && !travelersQuery.isLoading;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(LOCALE_MAP[language], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (travelersQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  if (travelersQuery.isError) {
    return (
      <View style={styles.loadingContainer}>
        <ErrorState
          message={t.common_loadFailed}
          onRetry={() => travelersQuery.refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.specialist_activeTravelers}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => travelersQuery.refetch()}
            tintColor={MibuBrand.brown}
            colors={[MibuBrand.brown]}
          />
        }
      >
        {travelers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={48} color={UIColors.textSecondary} />
            <Text style={styles.emptyText}>{t.specialist_noActiveTravelers}</Text>
          </View>
        ) : (
          <View style={styles.travelersList}>
            {travelers.map((traveler) => (
              <View key={traveler.id} style={styles.travelerCard}>
                <View style={styles.travelerAvatar}>
                  <Ionicons name="person" size={28} color={UIColors.white} />
                </View>
                <View style={styles.travelerInfo}>
                  <Text style={styles.travelerName}>{traveler.name}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{t.common_active}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/specialist/tracking?travelerId=${traveler.id}` as any)}
                  >
                    <Ionicons name="location" size={20} color={MibuBrand.info} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: UIColors.white,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
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
  emptyCard: {
    backgroundColor: UIColors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  emptyText: {
    fontSize: 16,
    color: UIColors.textSecondary,
    marginTop: 12,
  },
  travelersList: {
    gap: 12,
  },
  travelerCard: {
    backgroundColor: UIColors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  travelerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MibuBrand.info,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  travelerInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SemanticColors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SemanticColors.successMain,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: SemanticColors.successDark,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
