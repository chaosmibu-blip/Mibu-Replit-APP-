/**
 * FavoritesScreen - 我的最愛
 * 顯示用戶收藏的景點列表
 *
 * @see 後端合約: contracts/APP.md
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { collectionApi } from '../../../services/collectionApi';
import { MibuBrand } from '../../../../constants/Colors';
import { FavoriteItem } from '../../../types/collection';

export function FavoritesScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [total, setTotal] = useState(0);

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

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

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={14}
              color={MibuBrand.brown}
            />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          {item.rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.placeName} numberOfLines={1}>
          {item.placeName}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={MibuBrand.tan} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.district}, {item.city}
          </Text>
        </View>

        <Text style={styles.addedAt}>
          {isZh ? '加入於 ' : 'Added '}
          {new Date(item.addedAt).toLocaleDateString(isZh ? 'zh-TW' : 'en-US')}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemoveFavorite(item.placeId, item.placeName)}
      >
        <Ionicons name="heart" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="heart" size={24} color="#EF4444" />
          <Text style={styles.headerTitle}>
            {isZh ? '我的最愛' : 'My Favorites'}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {isZh ? `共 ${total} 個收藏` : `${total} favorites`}
        </Text>
      </View>

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
              tintColor={MibuBrand.brown}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={MibuBrand.tan} />
          <Text style={styles.emptyTitle}>
            {isZh ? '還沒有最愛' : 'No favorites yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isZh
              ? '在圖鑑中點擊愛心即可加入最愛'
              : 'Tap the heart icon in your collection to add favorites'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  statsText: {
    fontSize: 14,
    color: MibuBrand.copper,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
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
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: MibuBrand.tan,
    flex: 1,
  },
  addedAt: {
    fontSize: 11,
    color: MibuBrand.tan,
  },
  removeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: MibuBrand.tan,
    textAlign: 'center',
    lineHeight: 20,
  },
});
