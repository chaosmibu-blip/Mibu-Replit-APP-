import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { GachaItem, Language } from '../types';
import { getCategoryLabel, getCategoryColor } from '../constants/translations';

const getPlaceName = (item: GachaItem): string => {
  const name = item.place_name;
  if (typeof name === 'string') return name;
  if (typeof name === 'object') {
    return (name as any)['en'] || (name as any)['zh-TW'] || '';
  }
  return '';
};

const getDescription = (item: GachaItem): string => {
  const desc = item.ai_description || item.description;
  if (typeof desc === 'string') return desc;
  if (typeof desc === 'object') {
    return (desc as any)['en'] || (desc as any)['zh-TW'] || '';
  }
  return '';
};

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  } catch {
    return '';
  }
};

interface PlaceDetailModalProps {
  item: GachaItem;
  language: Language;
  onClose: () => void;
}

function PlaceDetailModal({ item, language, onClose }: PlaceDetailModalProps) {
  const placeName = getPlaceName(item);
  const description = getDescription(item);
  const category = typeof item.category === 'string' ? item.category.toLowerCase() : '';
  const categoryColor = getCategoryColor(category);
  const date = formatDate(item.collectedAt);
  const cityDisplay = item.cityDisplay || item.city || '';
  const districtDisplay = item.districtDisplay || item.district || '';

  const handleNavigate = () => {
    let url: string;
    if (item.location) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${item.location.lat},${item.location.lng}`;
    } else {
      const query = [placeName, districtDisplay, cityDisplay].filter(Boolean).join(' ');
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
    }
    Linking.openURL(url);
  };

  const locationText = [districtDisplay, cityDisplay].filter(Boolean).join(' • ') || cityDisplay;

  return (
    <Modal visible transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={[styles.modalHeader, { backgroundColor: categoryColor }]}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#475569" />
            </TouchableOpacity>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {getCategoryLabel(category, language)}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalTitle}>{placeName}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{date}</Text>
              {locationText && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{locationText}</Text>
                </>
              )}
            </View>

            {description && (
              <Text style={styles.modalDescription}>{description}</Text>
            )}

            <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
              <Ionicons name="navigate" size={20} color="#ffffff" />
              <Text style={styles.navigateButtonText}>在 Google 地圖中查看</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function CollectionScreen() {
  const { state, t } = useApp();
  const { collection, language } = state;
  const [openRegions, setOpenRegions] = useState<Set<string>>(new Set());
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<GachaItem | null>(null);

  const toggleRegion = (region: string) => {
    setOpenRegions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(region)) newSet.delete(region);
      else newSet.add(region);
      return newSet;
    });
  };

  const toggleCategory = (key: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const groupedData = useMemo(() => {
    const cityMap: Record<string, { displayName: string; items: GachaItem[]; byCategory: Record<string, GachaItem[]> }> = {};

    collection.forEach(item => {
      const city = item.city || 'Unknown';
      const cityDisplay = item.cityDisplay || city;
      const category = (typeof item.category === 'string' ? item.category : '').toLowerCase() || 'other';

      if (!cityMap[city]) {
        cityMap[city] = { displayName: cityDisplay, items: [], byCategory: {} };
      }
      cityMap[city].items.push(item);

      if (!cityMap[city].byCategory[category]) {
        cityMap[city].byCategory[category] = [];
      }
      cityMap[city].byCategory[category].push(item);
    });

    return cityMap;
  }, [collection]);

  if (collection.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="location-outline" size={64} color="#cbd5e1" />
        <Text style={styles.emptyTitle}>{t.noCollection}</Text>
        <Text style={styles.emptySubtitle}>{t.startToCollect}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t.myCollection}</Text>

      {Object.entries(groupedData)
        .sort((a, b) => b[1].items.length - a[1].items.length)
        .map(([regionKey, data]) => {
          const isRegionOpen = openRegions.has(regionKey);

          return (
            <View key={regionKey} style={styles.regionCard}>
              <TouchableOpacity
                style={styles.regionHeader}
                onPress={() => toggleRegion(regionKey)}
              >
                <View style={styles.regionInfo}>
                  <View style={styles.regionIcon}>
                    <Text style={styles.regionIconText}>
                      {data.displayName.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.regionName}>{data.displayName}</Text>
                    <Text style={styles.regionCount}>
                      {data.items.length} {t.spots}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={isRegionOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>

              {isRegionOpen && (
                <View style={styles.regionContent}>
                  {Object.entries(data.byCategory)
                    .sort((a, b) => b[1].length - a[1].length)
                    .map(([category, categoryItems]) => {
                      const categoryColor = getCategoryColor(category);
                      const categoryKey = `${regionKey}-${category}`;
                      const isCategoryOpen = openCategories.has(categoryKey);

                      return (
                        <View key={categoryKey}>
                          <TouchableOpacity
                            style={[
                              styles.categoryHeader,
                              { backgroundColor: categoryColor + '10' },
                            ]}
                            onPress={() => toggleCategory(categoryKey)}
                          >
                            <View style={styles.categoryInfo}>
                              <View
                                style={[
                                  styles.categoryIndicator,
                                  { backgroundColor: categoryColor },
                                ]}
                              />
                              <Text style={styles.categoryName}>
                                {getCategoryLabel(category, language)}
                              </Text>
                              <View
                                style={[
                                  styles.categoryCount,
                                  { backgroundColor: categoryColor },
                                ]}
                              >
                                <Text style={styles.categoryCountText}>
                                  {categoryItems.length}
                                </Text>
                              </View>
                            </View>
                            <Ionicons
                              name={isCategoryOpen ? 'chevron-up' : 'chevron-down'}
                              size={16}
                              color="#94a3b8"
                            />
                          </TouchableOpacity>

                          {isCategoryOpen && (
                            <View style={styles.itemsList}>
                              {categoryItems.map((item, idx) => {
                                const placeName = getPlaceName(item);
                                const description = getDescription(item);
                                const date = formatDate(item.collectedAt);

                                return (
                                  <TouchableOpacity
                                    key={`${item.id}-${idx}`}
                                    style={[
                                      styles.itemCard,
                                      { borderColor: categoryColor + '40' },
                                    ]}
                                    onPress={() => setSelectedItem(item)}
                                  >
                                    <View style={styles.itemHeader}>
                                      <Text style={styles.itemDate}>{date}</Text>
                                      <View
                                        style={[
                                          styles.itemBadge,
                                          { backgroundColor: categoryColor },
                                        ]}
                                      >
                                        <Text style={styles.itemBadgeText}>
                                          {getCategoryLabel(category, language)}
                                        </Text>
                                      </View>
                                    </View>
                                    <Text style={styles.itemName}>{placeName}</Text>
                                    {description && (
                                      <Text
                                        style={styles.itemDescription}
                                        numberOfLines={2}
                                      >
                                        {description}
                                      </Text>
                                    )}
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          )}
                        </View>
                      );
                    })}
                </View>
              )}
            </View>
          );
        })}

      {selectedItem && (
        <PlaceDetailModal
          item={selectedItem}
          language={language}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 8,
  },
  regionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    marginBottom: 12,
    overflow: 'hidden',
  },
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  regionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  regionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  regionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  regionCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  regionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIndicator: {
    width: 6,
    height: 24,
    borderRadius: 3,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  categoryCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  itemsList: {
    marginTop: 8,
    paddingLeft: 8,
    gap: 8,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  itemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    height: 120,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalBody: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
  },
  metaDot: {
    marginHorizontal: 8,
    color: '#cbd5e1',
  },
  modalDescription: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 20,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    borderRadius: 16,
  },
  navigateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
