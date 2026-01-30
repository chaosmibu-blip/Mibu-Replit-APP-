/**
 * 我的最愛/黑名單管理頁面
 *
 * 功能：
 * - 查看和管理我的最愛景點
 * - 查看和管理黑名單（不想在扭蛋中看到的景點）
 * - Tab 切換「我的最愛」和「黑名單」
 * - 移除項目功能
 *
 * 最愛的景點會優先出現在扭蛋結果中
 * 黑名單項目不會出現在扭蛋結果中
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { MibuBrand } from '../constants/Colors';

type TabType = 'favorites' | 'blacklist';

// 模擬資料 - 之後改接 API
const MOCK_FAVORITES = [
  { id: 1, name: '夯來夯趣-行動烤肉車', city: '宜蘭縣', category: '美食' },
  { id: 2, name: '九份老街', city: '新北市', category: '景點' },
];

const MOCK_BLACKLIST = [
  { id: 3, name: '某家餐廳', city: '台北市', category: '美食' },
];

export default function FavoritesManagementScreen() {
  const router = useRouter();
  const { state } = useApp();
  const isZh = state.language === 'zh-TW';
  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);
  const [blacklist, setBlacklist] = useState(MOCK_BLACKLIST);

  const handleRemoveFavorite = (id: number) => {
    Alert.alert(
      isZh ? '移除最愛' : 'Remove Favorite',
      isZh ? '確定要從最愛移除嗎？' : 'Remove from favorites?',
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '移除' : 'Remove',
          style: 'destructive',
          onPress: () => {
            setFavorites(prev => prev.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const handleRemoveBlacklist = (id: number) => {
    Alert.alert(
      isZh ? '移除黑名單' : 'Remove from Blacklist',
      isZh ? '確定要從黑名單移除嗎？' : 'Remove from blacklist?',
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '移除' : 'Remove',
          onPress: () => {
            setBlacklist(prev => prev.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const currentList = activeTab === 'favorites' ? favorites : blacklist;
  const handleRemove = activeTab === 'favorites' ? handleRemoveFavorite : handleRemoveBlacklist;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isZh ? '我的最愛/黑名單' : 'Favorites & Blacklist'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab 切換 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
          onPress={() => setActiveTab('favorites')}
        >
          <Ionicons
            name="heart"
            size={18}
            color={activeTab === 'favorites' ? MibuBrand.tierSP : MibuBrand.tan}
          />
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
            {isZh ? '我的最愛' : 'Favorites'}
          </Text>
          <View style={[styles.tabBadge, activeTab === 'favorites' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, activeTab === 'favorites' && styles.tabBadgeTextActive]}>
              {favorites.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'blacklist' && styles.tabActive]}
          onPress={() => setActiveTab('blacklist')}
        >
          <Ionicons
            name="ban"
            size={18}
            color={activeTab === 'blacklist' ? MibuBrand.copper : MibuBrand.tan}
          />
          <Text style={[styles.tabText, activeTab === 'blacklist' && styles.tabTextActive]}>
            {isZh ? '黑名單' : 'Blacklist'}
          </Text>
          <View style={[styles.tabBadge, activeTab === 'blacklist' && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, activeTab === 'blacklist' && styles.tabBadgeTextActive]}>
              {blacklist.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 列表 */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {currentList.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={activeTab === 'favorites' ? 'heart-outline' : 'ban-outline'}
              size={48}
              color={MibuBrand.tanLight}
            />
            <Text style={styles.emptyText}>
              {activeTab === 'favorites'
                ? (isZh ? '尚無最愛項目' : 'No favorites yet')
                : (isZh ? '尚無黑名單項目' : 'No blacklisted items')}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'favorites'
                ? (isZh ? '在圖鑑中點擊愛心加入最愛' : 'Tap the heart icon to add favorites')
                : (isZh ? '在圖鑑中將不喜歡的項目加入黑名單' : 'Add items you don\'t like to blacklist')}
            </Text>
          </View>
        ) : (
          currentList.map(item => (
            <View key={item.id} style={styles.listItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemCity}>{item.city}</Text>
                  <Text style={styles.itemDot}>•</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(item.id)}
              >
                <Ionicons name="close-circle" size={24} color={MibuBrand.tan} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* 說明 */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={18} color={MibuBrand.copper} />
        <Text style={styles.infoText}>
          {activeTab === 'favorites'
            ? (isZh ? '最愛的景點會優先出現在扭蛋結果中' : 'Favorite places will appear more often in gacha')
            : (isZh ? '黑名單項目不會出現在扭蛋結果中' : 'Blacklisted items won\'t appear in gacha')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: MibuBrand.creamLight,
  },
  tabActive: {
    backgroundColor: MibuBrand.highlight,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.tan,
  },
  tabTextActive: {
    color: MibuBrand.brownDark,
  },
  tabBadge: {
    backgroundColor: MibuBrand.tanLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: MibuBrand.brown,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },
  tabBadgeTextActive: {
    color: MibuBrand.warmWhite,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownLight,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: MibuBrand.tan,
    marginTop: 8,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCity: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  itemDot: {
    fontSize: 13,
    color: MibuBrand.tan,
    marginHorizontal: 6,
  },
  itemCategory: {
    fontSize: 13,
    color: MibuBrand.tan,
  },
  removeButton: {
    padding: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.highlight,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: MibuBrand.copper,
    lineHeight: 18,
  },
});
