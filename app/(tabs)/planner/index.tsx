/**
 * 規劃主頁面
 *
 * 整合三個子功能的分頁式頁面：
 * - location (定位): 顯示當前位置和附近景點
 * - itinerary (行程): 行程規劃和管理
 * - chat (聊天): AI 旅遊助手對話
 *
 * 使用 SegmentedControl 切換子頁面
 */
import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SegmentedControl } from '../../../src/components/ui/SegmentedControl';
import { LocationScreen } from '../../../src/modules/shared/screens/LocationScreen';
import { ItineraryScreenV2 } from '../../../src/modules/traveler/screens/ItineraryScreenV2';
import { ChatScreen } from '../../../src/modules/shared/screens/ChatScreen';
import { useApp } from '../../../src/context/AppContext';

type SubView = 'location' | 'itinerary' | 'chat';

export default function PlannerScreen() {
  const [activeView, setActiveView] = useState<SubView>('location');
  const { t } = useApp();
  const insets = useSafeAreaInsets();

  const segments = [
    { key: 'location', label: t.navLocation || '定位' },
    { key: 'itinerary', label: t.navItinerary || '行程' },
    { key: 'chat', label: t.navChat || '聊天' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'location':
        return <LocationScreen />;
      case 'itinerary':
        return <ItineraryScreenV2 />;
      case 'chat':
        return <ChatScreen />;
      default:
        return <LocationScreen />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SegmentedControl
          segments={segments}
          selectedKey={activeView}
          onSelect={(key) => setActiveView(key as SubView)}
        />
      </View>
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  content: {
    flex: 1,
  },
});
