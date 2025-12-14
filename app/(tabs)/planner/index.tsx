import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SegmentedControl } from '../../../src/components/ui/SegmentedControl';
import { LocationScreen } from '../../../src/screens/LocationScreen';
import { ItineraryScreen } from '../../../src/screens/ItineraryScreen';
import { ChatScreen } from '../../../src/screens/ChatScreen';
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
        return <ItineraryScreen />;
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
