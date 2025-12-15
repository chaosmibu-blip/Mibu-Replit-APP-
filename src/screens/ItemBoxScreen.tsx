import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getCategoryLabel, getCategoryColor } from '../constants/translations';

export function ItemBoxScreen() {
  const { state, t } = useApp();
  const items = state.collection || [];

  const getLocalizedContent = (content: any): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return content[state.language] || content['zh-TW'] || content['en'] || '';
    }
    return '';
  };

  if (items.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#f8fafc',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#f1f5f9',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Ionicons name="cube-outline" size={48} color="#94a3b8" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#64748b', marginBottom: 8 }}>
          {t.emptyItemBox || '道具箱是空的'}
        </Text>
        <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
          {t.collectItemsFirst || '先去扭蛋收集一些景點吧！'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
        {t.totalItems || '共'} {items.length} {t.itemsCount || '個道具'}
      </Text>

      {items.map((item, index) => {
        const placeName = getLocalizedContent(item.place_name) || getLocalizedContent(item.verified_name) || '';
        const categoryColor = getCategoryColor(item.category as string);
        const categoryLabel = getCategoryLabel(item.category as string, state.language as any);

        return (
          <View
            key={item.id || index}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: categoryColor + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="location" size={24} color={categoryColor} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 }}
                numberOfLines={1}
              >
                {placeName}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    backgroundColor: categoryColor + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: categoryColor }}>
                    {categoryLabel}
                  </Text>
                </View>
                {item.cityDisplay || item.city ? (
                  <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                    {item.cityDisplay || item.city}
                  </Text>
                ) : null}
              </View>
            </View>

            {item.rarity && item.rarity !== 'N' && (
              <View
                style={{
                  backgroundColor: item.rarity === 'SSR' ? '#f3e8ff' : item.rarity === 'SR' ? '#dbeafe' : '#dcfce7',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: item.rarity === 'SSR' ? '#a855f7' : item.rarity === 'SR' ? '#3b82f6' : '#22c55e',
                  }}
                >
                  {item.rarity}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
