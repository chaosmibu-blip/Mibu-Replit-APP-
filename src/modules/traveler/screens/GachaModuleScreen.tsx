import React, { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { useApp } from '../../../context/AppContext';
import { GachaTopNav, GachaSubView } from '../../shared/components/ModuleNav';
import { GachaScreen } from './GachaScreen';
import { CollectionScreen } from './CollectionScreen';
import { ItemBoxScreen } from './ItemBoxScreen';

export function GachaModuleScreen() {
  const { state } = useApp();
  const [currentTab, setCurrentTab] = useState<GachaSubView>('gacha');
  const [hasNewCollection, setHasNewCollection] = useState(false);
  const [hasNewItems, setHasNewItems] = useState(false);

  const renderContent = () => {
    switch (currentTab) {
      case 'collection':
        return <CollectionScreen />;
      case 'itembox':
        return <ItemBoxScreen />;
      case 'gacha':
      default:
        return <GachaScreen />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <GachaTopNav
        currentTab={currentTab}
        onChange={setCurrentTab}
        language={state.language}
        hasNewCollection={hasNewCollection}
        hasNewItems={hasNewItems}
      />
      <View style={{ flex: 1, backgroundColor: currentTab === 'gacha' ? '#f8fafc' : '#ffffff' }}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
