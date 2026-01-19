/**
 * FavoritesScreen - 我的最愛 (Tamagui 版本)
 * 顯示用戶收藏的景點列表
 *
 * @see 後端合約: contracts/APP.md
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  YStack,
  XStack,
  Text,
  Card,
  Button,
  View,
  Spinner,
  styled,
  useTheme,
} from 'tamagui';
import { useApp } from '../../../context/AppContext';
import { collectionApi } from '../../../services/collectionApi';
import { MibuBrand } from '../../../../constants/Colors';
import { FavoriteItem } from '../../../types/collection';

// 自定義樣式元件
const HeaderContainer = styled(XStack, {
  name: 'HeaderContainer',
  paddingTop: Platform.OS === 'ios' ? 60 : 40,
  paddingHorizontal: '$4',
  paddingBottom: '$4',
  backgroundColor: '$backgroundStrong',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const StatsBar = styled(XStack, {
  name: 'StatsBar',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  backgroundColor: '$backgroundStrong',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
});

const ItemCard = styled(Card, {
  name: 'ItemCard',
  marginBottom: '$3',
  padding: '$4',
  backgroundColor: '$card',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
  flexDirection: 'row',
  alignItems: 'center',
  pressStyle: {
    scale: 0.98,
    opacity: 0.9,
  },
  animation: 'fast',
});

const CategoryBadge = styled(XStack, {
  name: 'CategoryBadge',
  alignItems: 'center',
  gap: '$1',
  backgroundColor: '$accent',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$2',
});

export function FavoritesScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';
  const theme = useTheme();

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

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <ItemCard elevate>
      <YStack flex={1} gap="$2">
        {/* 分類與評分 */}
        <XStack alignItems="center" gap="$2">
          <CategoryBadge>
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={14}
              color={MibuBrand.brown}
            />
            <Text fontSize={12} fontWeight="600" color="$primary">
              {item.category}
            </Text>
          </CategoryBadge>
          {item.rating && (
            <XStack alignItems="center" gap="$1">
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text fontSize={12} fontWeight="600" color="#F59E0B">
                {item.rating.toFixed(1)}
              </Text>
            </XStack>
          )}
        </XStack>

        {/* 地點名稱 */}
        <Text
          fontSize={16}
          fontWeight="700"
          color="$color"
          numberOfLines={1}
        >
          {item.placeName}
        </Text>

        {/* 位置 */}
        <XStack alignItems="center" gap="$1">
          <Ionicons name="location-outline" size={14} color={MibuBrand.tan} />
          <Text fontSize={13} color="$placeholderColor" numberOfLines={1} flex={1}>
            {item.district}, {item.city}
          </Text>
        </XStack>

        {/* 加入時間 */}
        <Text fontSize={11} color="$placeholderColor">
          {isZh ? '加入於 ' : 'Added '}
          {new Date(item.addedAt).toLocaleDateString(isZh ? 'zh-TW' : 'en-US')}
        </Text>
      </YStack>

      {/* 移除按鈕 */}
      <Button
        size="$4"
        circular
        chromeless
        onPress={() => handleRemoveFavorite(item.placeId, item.placeName)}
        pressStyle={{ scale: 0.9 }}
        animation="fast"
      >
        <Ionicons name="heart" size={24} color="#EF4444" />
      </Button>
    </ItemCard>
  );

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="$primary" />
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <HeaderContainer>
        <Button
          size="$4"
          circular
          chromeless
          onPress={() => router.back()}
          pressStyle={{ scale: 0.9 }}
          animation="fast"
        >
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </Button>

        <XStack alignItems="center" gap="$2">
          <Ionicons name="heart" size={24} color="#EF4444" />
          <Text fontSize={18} fontWeight="700" color="$color">
            {isZh ? '我的最愛' : 'My Favorites'}
          </Text>
        </XStack>

        <View width={40} />
      </HeaderContainer>

      {/* Stats */}
      <StatsBar>
        <Text fontSize={14} color="$secondary" fontWeight="500">
          {isZh ? `共 ${total} 個收藏` : `${total} favorites`}
        </Text>
      </StatsBar>

      {/* List */}
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
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
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
          <Ionicons name="heart-outline" size={64} color={MibuBrand.tan} />
          <Text
            fontSize={18}
            fontWeight="700"
            color="$color"
            marginTop="$4"
            marginBottom="$2"
          >
            {isZh ? '還沒有最愛' : 'No favorites yet'}
          </Text>
          <Text
            fontSize={14}
            color="$placeholderColor"
            textAlign="center"
            lineHeight={20}
          >
            {isZh
              ? '在圖鑑中點擊愛心即可加入最愛'
              : 'Tap the heart icon in your collection to add favorites'}
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
