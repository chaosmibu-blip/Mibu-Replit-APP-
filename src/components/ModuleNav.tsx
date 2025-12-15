import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Language } from '../types';

export type GachaSubView = 'gacha' | 'collection' | 'itembox';

interface GachaTopNavProps {
  currentTab: GachaSubView;
  onChange: (tab: GachaSubView) => void;
  language: Language;
  hasNewCollection?: boolean;
  hasNewItems?: boolean;
}

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
  itembox: {
    'zh-TW': '道具箱',
    'en': 'Item Box',
    'ja': 'アイテム',
    'ko': '아이템',
  },
};

export function GachaTopNav({
  currentTab,
  onChange,
  language,
  hasNewCollection = false,
  hasNewItems = false,
}: GachaTopNavProps) {
  const tabs: { key: GachaSubView; hasNew: boolean }[] = [
    { key: 'gacha', hasNew: false },
    { key: 'collection', hasNew: hasNewCollection },
    { key: 'itembox', hasNew: hasNewItems },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
      }}
    >
      {tabs.map(({ key, hasNew }) => {
        const isActive = currentTab === key;
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
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#6366f1' : '#64748b',
                }}
              >
                {label}
              </Text>
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
            {isActive && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '25%',
                  right: '25%',
                  height: 3,
                  backgroundColor: '#6366f1',
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
