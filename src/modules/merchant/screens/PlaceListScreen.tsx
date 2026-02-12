/**
 * PlaceListScreen - 地點列表
 *
 * 功能說明：
 * - 顯示商家已認領的店家列表
 * - 支援下拉刷新
 * - 提供認領現有店家和新增自有店家的入口
 * - 顯示店家驗證狀態
 *
 * 串接的 API：
 * - GET /merchant/places - 取得已認領店家列表
 */
import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { apiService } from '../../../services/api';
import { tFormat } from '../../../utils/i18n';
import { MerchantPlace } from '../../../types';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

// ============ 主元件 ============
export function PlaceListScreen() {
  // ============ Hooks ============
  const { getToken } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  // ============ 狀態變數 ============
  // places: 店家列表
  const [places, setPlaces] = useState<MerchantPlace[]>([]);
  // loading: 初始載入狀態
  const [loading, setLoading] = useState(true);
  // refreshing: 下拉刷新狀態
  const [refreshing, setRefreshing] = useState(false);

  // ============ 資料載入函數 ============

  /**
   * loadPlaces - 載入店家列表
   * @param showRefresh - 是否顯示刷新指示器（否則顯示載入指示器）
   */
  const loadPlaces = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const token = await getToken();
      if (!token) return;

      const data = await apiService.getMerchantPlaces(token);
      setPlaces(data.places || []);
    } catch (error) {
      console.error('Failed to load places:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============ Effect Hooks ============
  // 元件載入時取得店家列表
  useEffect(() => {
    loadPlaces();
  }, []);

  // 從其他頁面返回時重新載入
  useFocusEffect(
    useCallback(() => {
      loadPlaces();
    }, [])
  );

  // ============ 載入中畫面 ============
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{t.loading}</Text>

      </View>
    );
  }

  // ============ 主要 JSX 渲染 ============
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadPlaces(true)} />
      }
    >
      {/* ============ 頂部標題區 ============ */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="返回">
          <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t.merchant_myPlaces}</Text>
          <Text style={styles.subtitle}>{t.merchant_myPlacesSubtitle}</Text>
        </View>
      </View>

      {/* ============ 操作按鈕區 ============ */}
      <View style={styles.actionButtons}>
        {/* 認領現有店家按鈕 */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/merchant/claim-place' as any)}
          accessibilityLabel="認領現有店家"
        >
          <Ionicons name="search" size={20} color={MibuBrand.brown} />
          <Text style={styles.actionButtonText}>{t.merchant_claimExisting}</Text>
        </TouchableOpacity>
        {/* 新增自有店家按鈕 */}
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => router.push('/merchant/new-place' as any)}
          accessibilityLabel="新增自有店家"
        >
          <Ionicons name="add" size={20} color={UIColors.white} />
          <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>{t.merchant_addNewPlace}</Text>
        </TouchableOpacity>
      </View>

      {/* ============ 店家列表區 ============ */}
      {places.length === 0 ? (
        // 空狀態
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="storefront-outline" size={48} color={UIColors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>{t.merchant_noPlaces}</Text>
          <Text style={styles.emptySubtitle}>{t.merchant_noPlacesHint}</Text>
        </View>
      ) : (
        // 店家卡片列表
        <>
          {/* 店家數量統計 */}
          <Text style={styles.countText}>{tFormat(t.merchant_placesCount, { n: places.length })}</Text>
          <View style={styles.placesList}>
            {places.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeCard}
                onPress={() => router.push(`/merchant/place/${place.linkId}` as any)}
                accessibilityLabel={`查看 ${place.placeName}`}
              >
                {/* 店家圖示 */}
                <View style={styles.placeIcon}>
                  <Ionicons name="storefront" size={24} color={MibuBrand.brown} />
                </View>
                {/* 店家資訊 */}
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.placeName}</Text>
                  <Text style={styles.placeLocation}>
                    {[place.district, place.city].filter(Boolean).join(', ')}
                  </Text>
                </View>
                {/* 右側：狀態標籤和箭頭 */}
                <View style={styles.placeRight}>
                  {/* 驗證狀態標籤 */}
                  <View
                    style={[
                      styles.statusBadge,
                      place.isVerified ? styles.verifiedBadge : styles.pendingBadge,
                    ]}
                  >
                    <Ionicons
                      name={place.isVerified ? 'checkmark-circle' : 'time'}
                      size={14}
                      color={place.isVerified ? SemanticColors.successDark : SemanticColors.warningDark}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        place.isVerified ? styles.verifiedText : styles.pendingText,
                      ]}
                    >
                      {place.isVerified ? t.common_verified : t.common_pending}
                    </Text>
                  </View>
                  {/* 右箭頭 */}
                  <Ionicons name="chevron-forward" size={20} color={UIColors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

// ============ 樣式定義 ============
const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  // 內容區
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  // 載入中容器
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.warmWhite,
  },
  // 載入中文字
  loadingText: {
    marginTop: 12,
    color: UIColors.textSecondary,
    fontSize: 16,
  },
  // 頂部標題區
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  // 返回按鈕
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: UIColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 標題文字區
  headerText: {
    flex: 1,
  },
  // 頁面標題
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.dark,
  },
  // 副標題
  subtitle: {
    fontSize: 14,
    color: UIColors.textSecondary,
    marginTop: 2,
  },
  // 操作按鈕區
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  // 操作按鈕
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: UIColors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 主要操作按鈕（填滿色）
  actionButtonPrimary: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  // 操作按鈕文字
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  // 主要操作按鈕文字
  actionButtonTextPrimary: {
    color: UIColors.white,
  },
  // 空狀態容器
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  // 空狀態圖示容器
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  // 空狀態標題
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.dark,
    marginBottom: 8,
  },
  // 空狀態副標題
  emptySubtitle: {
    fontSize: 14,
    color: UIColors.textSecondary,
    textAlign: 'center',
  },
  // 店家數量文字
  countText: {
    fontSize: 14,
    color: UIColors.textSecondary,
    marginBottom: 12,
  },
  // 店家列表
  placesList: {
    gap: 12,
  },
  // 店家卡片
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UIColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 店家圖示容器
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  // 店家資訊區
  placeInfo: {
    flex: 1,
  },
  // 店家名稱
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.dark,
    marginBottom: 4,
  },
  // 店家位置
  placeLocation: {
    fontSize: 13,
    color: UIColors.textSecondary,
  },
  // 右側區域
  placeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // 狀態標籤
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // 已驗證標籤
  verifiedBadge: {
    backgroundColor: SemanticColors.successLight,
  },
  // 待驗證標籤
  pendingBadge: {
    backgroundColor: SemanticColors.warningLight,
  },
  // 狀態文字
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // 已驗證文字
  verifiedText: {
    color: SemanticColors.successDark,
  },
  // 待驗證文字
  pendingText: {
    color: SemanticColors.warningDark,
  },
});
