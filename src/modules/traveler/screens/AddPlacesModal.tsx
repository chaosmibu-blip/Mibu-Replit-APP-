/**
 * AddPlacesModal - 從圖鑑加入景點 Modal
 *
 * 從 ItineraryScreenV2 抽離的子元件，負責：
 * - 顯示圖鑑中可用的景點（按分類手風琴展開）
 * - 搜索過濾景點
 * - 多選後確認加入行程
 *
 * 更新日期：2026-02-12（Phase 2A 元件抽離）
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useI18n } from '../../../context/AppContext';
import { itineraryApi } from '../../../services/itineraryApi';
import { MibuBrand } from '../../../../constants/Colors';
import { getCategoryToken } from '../../../../constants/Colors';
import type { AvailablePlacesByCategory } from '../../../types/itinerary';
import styles from './ItineraryScreenV2.styles';

// ============ Props ============

interface AddPlacesModalProps {
  visible: boolean;
  itineraryId: number | null;
  onClose: () => void;
  /** 加入成功後的回調 */
  onConfirmed: () => void;
  /** 顯示 Toast 通知 */
  showToast: (message: string) => void;
  /** 圖鑑快取（外部管理，避免每次開啟都重新載入） */
  cachedPlaces: AvailablePlacesByCategory[] | null;
  onCacheUpdate: (places: AvailablePlacesByCategory[]) => void;
}

// ============ 主元件 ============

export function AddPlacesModal({
  visible,
  itineraryId,
  onClose,
  onConfirmed,
  showToast,
  cachedPlaces,
  onCacheUpdate,
}: AddPlacesModalProps) {
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();
  const { t } = useI18n();

  // ===== 狀態 =====
  const [availablePlaces, setAvailablePlaces] = useState<AvailablePlacesByCategory[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [addingPlaces, setAddingPlaces] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');

  // ===== 開啟時載入 =====
  useEffect(() => {
    if (visible && itineraryId) {
      setSelectedCollectionIds([]);
      setExpandedCategory(null);
      setPlaceSearchQuery('');

      // 優先使用快取
      if (cachedPlaces) {
        setAvailablePlaces(cachedPlaces);
        setLoadingAvailable(false);
        return;
      }

      loadAvailablePlaces(itineraryId);
    }
  }, [visible, itineraryId]);

  // ===== API 呼叫 =====

  const loadAvailablePlaces = useCallback(async (itinId: number) => {
    const token = await getToken();
    if (!token) return;

    setLoadingAvailable(true);
    try {
      const res = await itineraryApi.getAvailablePlaces(itinId, token);
      if (res.success) {
        setAvailablePlaces(res.categories);
        onCacheUpdate(res.categories);
      }
    } catch (error) {
      console.error('Failed to fetch available places:', error);
    } finally {
      setLoadingAvailable(false);
    }
  }, [getToken, onCacheUpdate]);

  const togglePlaceSelection = useCallback((collectionId: number) => {
    setSelectedCollectionIds(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  }, []);

  const confirmAddPlaces = useCallback(async () => {
    if (!itineraryId || selectedCollectionIds.length === 0) return;
    const token = await getToken();
    if (!token) return;

    setAddingPlaces(true);
    try {
      const res = await itineraryApi.addPlaces(
        itineraryId,
        { collectionIds: selectedCollectionIds },
        token
      );
      if (res.success) {
        onClose();
        onConfirmed();
      }
    } catch (error) {
      console.error('Failed to add places:', error);
      showToast(t.itinerary_addPlacesFailed);
    } finally {
      setAddingPlaces(false);
    }
  }, [itineraryId, selectedCollectionIds, getToken, onClose, onConfirmed, showToast, t]);

  const handleClose = useCallback(() => {
    setExpandedCategory(null);
    setPlaceSearchQuery('');
    onClose();
  }, [onClose]);

  // ===== 搜索過濾 =====
  const filteredPlaces = availablePlaces.map(categoryGroup => ({
    ...categoryGroup,
    places: categoryGroup.places.filter(place =>
      placeSearchQuery.trim() === '' ||
      place.name.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
      (place.nameEn && place.nameEn.toLowerCase().includes(placeSearchQuery.toLowerCase()))
    ),
  })).filter(group => group.places.length > 0);

  // ===== 渲染 =====

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color={MibuBrand.copper} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {t.itinerary_addFromCollection}
          </Text>
          <TouchableOpacity
            onPress={confirmAddPlaces}
            style={[
              styles.modalConfirmButton,
              selectedCollectionIds.length === 0 && styles.modalConfirmButtonDisabled,
            ]}
            disabled={selectedCollectionIds.length === 0 || addingPlaces}
          >
            {addingPlaces ? (
              <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
            ) : (
              <Text style={styles.modalConfirmText}>
                {t.itinerary_addCount ? t.itinerary_addCount.replace('{count}', String(selectedCollectionIds.length)) : `加入 (${selectedCollectionIds.length})`}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 搜索輸入框 */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={MibuBrand.copper} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.itinerary_searchPlaces}
            placeholderTextColor={MibuBrand.copper}
            value={placeSearchQuery}
            onChangeText={setPlaceSearchQuery}
          />
          {placeSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setPlaceSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={MibuBrand.copper} />
            </TouchableOpacity>
          )}
        </View>

        {/* Modal Content */}
        {loadingAvailable ? (
          <View style={styles.modalLoading}>
            <ActivityIndicator size="large" color={MibuBrand.brown} />
            <Text style={styles.modalLoadingText}>
              {t.loading}
            </Text>
          </View>
        ) : filteredPlaces.length === 0 ? (
          <View style={styles.modalEmpty}>
            <Ionicons name="albums-outline" size={48} color={MibuBrand.tanLight} />
            <Text style={styles.modalEmptyText}>
              {placeSearchQuery.trim()
                ? (t.itinerary_noMatchingPlaces)
                : (t.itinerary_noCollectionPlaces)}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredPlaces.map(categoryGroup => {
              const categoryToken = getCategoryToken(categoryGroup.category);
              const isExpanded = expandedCategory === categoryGroup.category;
              const displayPlaces = isExpanded ? categoryGroup.places : [];

              return (
                <View key={categoryGroup.category} style={styles.modalCategorySection}>
                  {/* 手風琴標題 */}
                  <TouchableOpacity
                    style={[
                      styles.accordionHeader,
                      isExpanded && styles.accordionHeaderExpanded,
                    ]}
                    onPress={() => setExpandedCategory(isExpanded ? null : categoryGroup.category)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accordionHeaderLeft}>
                      <View
                        style={[
                          styles.accordionStripe,
                          { backgroundColor: categoryToken.stripe },
                        ]}
                      />
                      <Text style={styles.accordionTitle}>{categoryGroup.categoryName}</Text>
                      <View style={styles.accordionCountBadge}>
                        <Text style={styles.accordionCountText}>{categoryGroup.places.length}</Text>
                      </View>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={MibuBrand.copper}
                    />
                  </TouchableOpacity>

                  {/* 展開的景點列表 */}
                  {isExpanded && (
                    <ScrollView
                      style={styles.accordionContent}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={true}
                    >
                      {displayPlaces.map(place => {
                        const isSelected = selectedCollectionIds.includes(place.collectionId);
                        return (
                          <TouchableOpacity
                            key={place.collectionId}
                            style={[
                              styles.modalPlaceItem,
                              isSelected && styles.modalPlaceItemSelected,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => togglePlaceSelection(place.collectionId)}
                          >
                            <View
                              style={[
                                styles.modalPlaceStripe,
                                { backgroundColor: categoryToken.stripe },
                              ]}
                            />
                            <View style={styles.modalPlaceInfo}>
                              <Text style={styles.modalPlaceName}>{place.name}</Text>
                              {place.nameEn && (
                                <Text style={styles.modalPlaceNameEn}>{place.nameEn}</Text>
                              )}
                            </View>
                            <View style={[
                              styles.modalCheckbox,
                              isSelected && styles.modalCheckboxSelected,
                            ]}>
                              {isSelected && (
                                <Ionicons name="checkmark" size={16} color={MibuBrand.warmWhite} />
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
