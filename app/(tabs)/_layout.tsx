/**
 * 旅客主頁面 Tab 導航佈局
 *
 * 定義旅客介面的底部 Tab 導航結構：
 * - index (首頁): 首頁資訊、公告、快速入口
 * - gacha (扭蛋): 扭蛋系統（含圖鑑、道具箱子頁籤），含未讀 badge
 * - itinerary (行程): 行程規劃和管理
 * - planner (規劃): 隱藏 Tab
 * - collection (圖鑑): 隱藏 Tab
 * - settings (設定): 設定頁面
 *
 * 使用 Mibu 品牌配色和樣式
 */
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useAuth, useI18n, useGacha } from '../../src/context/AppContext';
import { MibuBrand, UIColors } from '../../constants/Colors';

function TabIconWithBadge({
  icon,
  focused,
  color,
  badgeCount
}: {
  icon: string;
  focused: boolean;
  color: string;
  badgeCount?: number;
}) {
  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name={(focused ? icon : `${icon}-outline`) as any} size={24} color={color} />
      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -8,
          backgroundColor: MibuBrand.error,
          borderRadius: 10,
          minWidth: 16,
          height: 16,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: UIColors.white, fontSize: 10, fontWeight: '700' }}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const { gachaState, refreshUnreadCount } = useGacha();

  useEffect(() => {
    if (isAuthenticated) {
      refreshUnreadCount();
    }
  }, [isAuthenticated, refreshUnreadCount]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MibuBrand.brown,
        tabBarInactiveTintColor: MibuBrand.copper,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: UIColors.tabBarBg,
            borderTopWidth: 0,
            height: 88,
            paddingBottom: 24,
            paddingTop: 8,
          },
          default: {
            backgroundColor: MibuBrand.creamLight,
            borderTopWidth: 1,
            borderTopColor: MibuBrand.tanLight,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.navHome,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gacha"
        options={{
          title: t.navGacha,
          tabBarIcon: ({ color, focused }) => (
            <TabIconWithBadge
              icon="gift"
              focused={focused}
              color={color}
              badgeCount={gachaState.unreadItemCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="itinerary"
        options={{
          title: t.navItinerary || '行程',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.navSettings,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
