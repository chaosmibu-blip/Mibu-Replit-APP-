/**
 * GachaTopNav - 扭蛋模組頂部導航元件
 *
 * 用於扭蛋功能頁面的子頁面切換導航。
 * 提供扭蛋、圖鑑、行程三個主要功能入口。
 *
 * 特點：
 * - 底部有指示器顯示目前選中的頁籤
 * - 支援多語系（中/英/日/韓）
 * - 可顯示新內容提示紅點
 *
 * @example
 * <GachaTopNav
 *   currentTab={activeTab}
 *   onChange={setActiveTab}
 *   language="zh-TW"
 *   hasNewCollection={true}
 * />
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Language } from '../../../types';
import { MibuBrand } from '../../../../constants/Colors';

// ============ 型別定義 ============

/**
 * 扭蛋模組子頁面類型
 */
export type GachaSubView = 'gacha' | 'collection' | 'itinerary' | 'itembox';

// ============ Props 介面定義 ============

/**
 * GachaTopNav 元件的 Props 介面
 */
interface GachaTopNavProps {
  /** 目前選中的頁籤 */
  currentTab: GachaSubView;
  /** 頁籤變更時的回調函數 */
  onChange: (tab: GachaSubView) => void;
  /** 語言設定 */
  language: Language;
  /** 圖鑑是否有新內容（顯示紅點） */
  hasNewCollection?: boolean;
  /** 道具箱是否有新內容（顯示紅點，目前未使用） */
  hasNewItems?: boolean;
}

// ============ 常數配置 ============

/**
 * 各頁籤的多語系標籤
 */
const TAB_LABELS: Record<GachaSubView, Record<Language, string>> = {
  gacha: {
    'zh-TW': '扭蛋',
    'en': 'Gacha',
    'ja': 'ガチャ',
    'ko': '가챠',
  },
  collection: {
    'zh-TW': '圖鑑',
    'en': 'Collection',
    'ja': '図鑑',
    'ko': '도감',
  },
  itinerary: {
    'zh-TW': '行程',
    'en': 'Itinerary',
    'ja': '旅程',
    'ko': '여정',
  },
  itembox: {
    'zh-TW': '道具箱',
    'en': 'Item Box',
    'ja': 'アイテム',
    'ko': '아이템',
  },
};

// ============ 主元件 ============

/**
 * 扭蛋模組頂部導航元件
 *
 * 目前只顯示三個頁籤：扭蛋、圖鑑、行程。
 * 道具箱（itembox）已在 TAB_LABELS 中定義但未顯示。
 */
export function GachaTopNav({
  currentTab,
  onChange,
  language,
  hasNewCollection = false,
  hasNewItems = false,
}: GachaTopNavProps) {
  // 要顯示的頁籤及其新內容狀態
  const tabs: { key: GachaSubView; hasNew: boolean }[] = [
    { key: 'gacha', hasNew: false },
    { key: 'collection', hasNew: hasNewCollection },
    { key: 'itinerary', hasNew: false },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: MibuBrand.warmWhite,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: MibuBrand.tanLight,
      }}
    >
      {tabs.map(({ key, hasNew }) => {
        const isActive = currentTab === key;
        // 取得對應語言的標籤，若無則使用繁中
        const label = TAB_LABELS[key][language] || TAB_LABELS[key]['zh-TW'];

        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 12,
              position: 'relative',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* 頁籤文字 */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? MibuBrand.brown : MibuBrand.copper,
                }}
              >
                {label}
              </Text>
              {/* 新內容紅點提示 */}
              {hasNew && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#ef4444',
                    marginLeft: 4,
                  }}
                />
              )}
            </View>
            {/* 底部指示器（選中時顯示） */}
            {isActive && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '25%',
                  right: '25%',
                  height: 3,
                  backgroundColor: MibuBrand.brown,
                  borderRadius: 2,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
