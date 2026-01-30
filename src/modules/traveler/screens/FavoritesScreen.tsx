/**
 * FavoritesScreen - 我的最愛畫面 (React Native Paper 版本)
 *
 * 功能：
 * - 顯示用戶收藏的景點列表
 * - 下拉重新整理
 * - 點擊愛心可移除收藏
 * - 顯示景點分類、評分、位置、加入時間
 * - 空狀態提示
 *
 * 串接 API：
 * - collectionApi.getFavorites() - 取得收藏列表
 * - collectionApi.removeFavorite() - 移除收藏
 *
 * UI 框架：React Native Paper
 *
 * @see 後端合約: contracts/APP.md
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Chip,
  ActivityIndicator,
  Surface,
  useTheme,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { collectionApi } from '../../../services/collectionApi';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';
import { FavoriteItem } from '../../../types/collection';

// ============================================================
// 主元件
// ============================================================

export function FavoritesScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const theme = useTheme();

  // 語言判斷
  const isZh = state.language === 'zh-TW';

  // ============================================================
  // 狀態管理
  // ============================================================

  // 載入狀態
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 收藏列表
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // 總數量
  const [total, setTotal] = useState(0);

  // ============================================================
  // API 呼叫
  // ============================================================

  /**
   * 載入收藏列表
   */
  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      const data = await collectionApi.getFavorites(token);
      if (data.success) {
        setFavorites(data.favorites);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router]);

  // 初始載入
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 下拉重新整理
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // ============================================================
  // 事件處理
  // ============================================================

  /**
   * 移除收藏
   * 顯示確認對話框，確認後呼叫 API 移除
   */
  const handleRemoveFavorite = async (placeId: string, placeName: string) => {
    Alert.alert(
      isZh ? '移除最愛' : 'Remove Favorite',
      isZh
        ? `確定要將「${placeName}」從最愛中移除嗎？`
        : `Remove "${placeName}" from favorites?`,
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '移除' : 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) return;

              const result = await collectionApi.removeFavorite(token, placeId);
              if (result.success) {
                setFavorites(prev => prev.filter(f => f.placeId !== placeId));
                setTotal(prev => prev - 1);
              }
            } catch (error) {
              console.error('Failed to remove favorite:', error);
              Alert.alert(
                isZh ? '錯誤' : 'Error',
                isZh ? '無法移除最愛' : 'Failed to remove favorite'
              );
            }
          },
        },
      ]
    );
  };

  // ============================================================
  // 輔助函數
  // ============================================================

  /**
   * 根據分類取得對應 icon
   */
  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      '餐廳': 'restaurant',
      '咖啡廳': 'cafe',
      '景點': 'camera',
      '購物': 'cart',
      '住宿': 'bed',
      '交通': 'car',
    };
    return iconMap[category] || 'location';
  };

  // ============================================================
  // 渲染項目
  // ============================================================

  /**
   * 渲染單一收藏項目
   */
  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <Card style={styles.itemCard} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <View style={styles.itemContent}>
          {/* 分類與評分 */}
          <View style={styles.itemHeader}>
            <Chip
              icon={() => (
                <Ionicons
                  name={getCategoryIcon(item.category)}
                  size={14}
                  color={theme.colors.primary}
                />
              )}
              style={styles.categoryChip}
              textStyle={styles.categoryText}
              compact
            >
              {item.category}
            </Chip>
            {item.rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color={SemanticColors.starYellow} />
                <Text variant="labelSmall" style={styles.ratingText}>
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* 地點名稱 */}
          <Text variant="titleMedium" style={styles.placeName} numberOfLines={1}>
            {item.placeName}
          </Text>

          {/* 位置 */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.outline} />
            <Text variant="bodySmall" style={styles.locationText} numberOfLines={1}>
              {item.district}, {item.city}
            </Text>
          </View>

          {/* 加入時間 */}
          <Text variant="labelSmall" style={styles.addedAt}>
            {isZh ? '加入於 ' : 'Added '}
            {new Date(item.addedAt).toLocaleDateString(isZh ? 'zh-TW' : 'en-US')}
          </Text>
        </View>

        {/* 移除按鈕 */}
        <IconButton
          icon="heart"
          iconColor={SemanticColors.errorDark}
          size={24}
          onPress={() => handleRemoveFavorite(item.placeId, item.placeName)}
          style={styles.removeBtn}
        />
      </Card.Content>
    </Card>
  );

  // ============================================================
  // 載入中狀態
  // ============================================================

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ============================================================
  // 主畫面渲染
  // ============================================================

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={styles.header} elevation={1}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.colors.primary}
          size={24}
          onPress={() => router.back()}
        />
        <View style={styles.headerCenter}>
          <Ionicons name="heart" size={24} color={SemanticColors.errorDark} />
          <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginLeft: 8 }}>
            {isZh ? '我的最愛' : 'My Favorites'}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </Surface>

      {/* Stats */}
      <Surface style={styles.statsBar} elevation={0}>
        <Text variant="labelLarge" style={{ color: theme.colors.secondary }}>
          {isZh ? `共 ${total} 個收藏` : `${total} favorites`}
        </Text>
      </Surface>

      {/* List */}
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={theme.colors.outline} />
          <Text variant="titleMedium" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            {isZh ? '還沒有最愛' : 'No favorites yet'}
          </Text>
          <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.outline }]}>
            {isZh
              ? '在圖鑑中點擊愛心即可加入最愛'
              : 'Tap the heart icon in your collection to add favorites'}
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================================
// 樣式定義
// ============================================================

const styles = StyleSheet.create({
  // 容器樣式
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 48,
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    height: 28,
  },
  categoryText: {
    fontSize: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: SemanticColors.starYellow,
    fontWeight: '600',
  },
  placeName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    flex: 1,
  },
  addedAt: {
    opacity: 0.7,
  },
  removeBtn: {
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
