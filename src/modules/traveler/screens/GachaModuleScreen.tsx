/**
 * GachaModuleScreen - 扭蛋模組畫面
 *
 * 功能：
 * - 扭蛋模組的頂層容器
 * - 管理四個子頁籤：扭蛋、圖鑑、行程、道具箱
 * - 維護 Tab 切換邏輯和未讀狀態
 *
 * 子畫面：
 * - GachaScreen: 扭蛋主畫面
 * - CollectionScreen: 圖鑑畫面
 * - ItineraryScreenV2: 行程詳情
 * - ItemBoxScreen: 道具箱畫面
 *
 * @see GachaTopNav - 頂部 Tab 導航元件
 */
import React, { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { useApp } from '../../../context/AppContext';
import { GachaTopNav, GachaSubView } from '../../shared/components/ModuleNav';
import { GachaScreen } from './GachaScreen';
import { CollectionScreen } from './CollectionScreen';
import { ItineraryScreenV2 } from './ItineraryScreenV2';
import { ItemBoxScreen } from './ItemBoxScreen';
import { MibuBrand } from '../../../../constants/Colors';

/**
 * GachaModuleScreen - 扭蛋模組主容器
 *
 * 透過 GachaTopNav 切換不同子畫面
 */
export function GachaModuleScreen() {
  // 取得全域語言設定
  const { state } = useApp();

  // ============================================================
  // 狀態管理
  // ============================================================

  // 當前選中的 Tab（預設為扭蛋頁）
  const [currentTab, setCurrentTab] = useState<GachaSubView>('gacha');

  // 圖鑑是否有新項目（紅點提示）
  const [hasNewCollection, setHasNewCollection] = useState(false);

  // 道具箱是否有新項目（紅點提示）
  const [hasNewItems, setHasNewItems] = useState(false);

  // ============================================================
  // 子畫面渲染
  // ============================================================

  /**
   * 根據當前 Tab 渲染對應子畫面
   */
  const renderContent = () => {
    switch (currentTab) {
      case 'collection':
        // 圖鑑畫面
        return <CollectionScreen />;
      case 'itinerary':
        // 行程詳情畫面
        return <ItineraryScreenV2 />;
      case 'itembox':
        // 道具箱畫面
        return <ItemBoxScreen />;
      case 'gacha':
      default:
        // 扭蛋主畫面（預設）
        return <GachaScreen />;
    }
  };

  // ============================================================
  // 主畫面渲染
  // ============================================================

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MibuBrand.warmWhite }}>
      {/* ========== 頂部 Tab 導航 ========== */}
      <GachaTopNav
        currentTab={currentTab}
        onChange={setCurrentTab}
        language={state.language}
        hasNewCollection={hasNewCollection}
        hasNewItems={hasNewItems}
      />

      {/* ========== 子畫面內容區 ========== */}
      <View style={{ flex: 1, backgroundColor: MibuBrand.warmWhite }}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
