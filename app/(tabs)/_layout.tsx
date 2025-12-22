import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useApp } from '../../src/context/AppContext';
import { MibuBrand } from '../../constants/Colors';

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
          backgroundColor: '#ef4444',
          borderRadius: 10,
          minWidth: 16,
          height: 16,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '700' }}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { t, state, refreshUnreadCount } = useApp();
  
  useEffect(() => {
    if (state.isAuthenticated) {
      refreshUnreadCount();
    }
  }, [state.isAuthenticated, refreshUnreadCount]);

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
            backgroundColor: 'rgba(253, 248, 243, 0.98)',
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
              badgeCount={state.unreadItemCount} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: t.navCollection,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
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
