import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { apiService, PlaceSearchResult, CategoryItem } from '../services/api';

type ViewMode = 'search' | 'manual';

interface ManualFormData {
  name: string;
  address: string;
  category: string;
}

export default function MerchantScreen() {
  const { t, state } = useApp();
  const { language } = state;
  
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [manualForm, setManualForm] = useState<ManualFormData>({
    name: '',
    address: '',
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await apiService.searchPlaces(searchQuery.trim());
      setSearchResults(response.places || []);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', t.networkError);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, t]);

  const handlePlacePress = (place: PlaceSearchResult) => {
    setSelectedPlace(place);
    setShowConfirmModal(true);
  };

  const handleClaimConfirm = async () => {
    if (!selectedPlace) return;
    
    setIsClaiming(true);
    try {
      await apiService.claimPlace({
        placeId: selectedPlace.placeId,
        placeName: selectedPlace.name,
        address: selectedPlace.address,
        category: selectedPlace.primaryType,
      });
      
      setShowConfirmModal(false);
      Alert.alert(t.claimSuccess);
      setSearchResults([]);
      setSearchQuery('');
      setHasSearched(false);
    } catch (error: any) {
      if (error.status === 409) {
        setShowConfirmModal(false);
        showConflictAlert(selectedPlace);
      } else {
        Alert.alert('Error', t.networkError);
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const showConflictAlert = (place: PlaceSearchResult) => {
    Alert.alert(
      t.placeAlreadyClaimed,
      t.areYouOwner,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.applyManualReview,
          onPress: () => handleDispute(place),
        },
      ]
    );
  };

  const handleDispute = async (place: PlaceSearchResult) => {
    try {
      await apiService.disputeClaim({
        placeId: place.placeId,
        placeName: place.name,
      });
      Alert.alert(t.disputeSubmitted, t.disputeSubmittedDesc);
    } catch (error) {
      Alert.alert('Error', t.networkError);
    }
  };

  const loadCategories = async () => {
    if (categories.length > 0) return;
    
    setLoadingCategories(true);
    try {
      const response = await apiService.getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleManualCreate = () => {
    setViewMode('manual');
    loadCategories();
  };

  const getCategoryName = (category: CategoryItem): string => {
    switch (language) {
      case 'zh-TW':
        return category.nameZh || category.name;
      case 'en':
        return category.nameEn || category.name;
      case 'ja':
        return category.nameJa || category.name;
      case 'ko':
        return category.nameKo || category.name;
      default:
        return category.name;
    }
  };

  const handleSubmitManual = async () => {
    if (!manualForm.name.trim()) {
      Alert.alert(t.fieldRequired);
      return;
    }
    if (!manualForm.address.trim()) {
      Alert.alert(t.fieldRequired);
      return;
    }
    if (!manualForm.category) {
      Alert.alert(t.selectCategory);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createManualPlace({
        name: manualForm.name.trim(),
        address: manualForm.address.trim(),
        category: manualForm.category,
      });
      Alert.alert(t.createSuccess);
      setManualForm({ name: '', address: '', category: '' });
      setViewMode('search');
    } catch (error) {
      Alert.alert('Error', t.networkError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedCategoryName = (): string => {
    const category = categories.find(c => c.id === manualForm.category);
    return category ? getCategoryName(category) : t.selectCategory;
  };

  const renderPlaceItem = ({ item }: { item: PlaceSearchResult }) => (
    <TouchableOpacity
      style={styles.placeItem}
      onPress={() => handlePlacePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeAddress}>{item.address}</Text>
        {item.types && item.types.length > 0 && (
          <View style={styles.typesContainer}>
            {item.types.slice(0, 3).map((type, index) => (
              <View key={index} style={styles.typeTag}>
                <Text style={styles.typeText}>{type.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  const renderSearchView = () => (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!searchQuery.trim() || isSearching}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>{t.search}</Text>
          )}
        </TouchableOpacity>
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>{t.searching}</Text>
        </View>
      ) : hasSearched && searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyText}>{t.noResults}</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.placeId}
          renderItem={renderPlaceItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.manualCreateButton}
        onPress={handleManualCreate}
      >
        <Ionicons name="add-circle-outline" size={20} color="#6366f1" />
        <Text style={styles.manualCreateText}>{t.manualCreate}</Text>
      </TouchableOpacity>

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.confirmClaim}</Text>
            {selectedPlace && (
              <View style={styles.modalPlaceInfo}>
                <Text style={styles.modalPlaceName}>{selectedPlace.name}</Text>
                <Text style={styles.modalPlaceAddress}>{selectedPlace.address}</Text>
              </View>
            )}
            <Text style={styles.modalDesc}>{t.confirmClaimDesc}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowConfirmModal(false)}
                disabled={isClaiming}
              >
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleClaimConfirm}
                disabled={isClaiming}
              >
                {isClaiming ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>{t.claim}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderManualView = () => (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.manualContainer} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setViewMode('search')}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>

        <Text style={styles.manualTitle}>{t.manualCreateTitle}</Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t.placeName}</Text>
          <TextInput
            style={styles.formInput}
            value={manualForm.name}
            onChangeText={(text) => setManualForm({ ...manualForm, name: text })}
            placeholder={t.placeName}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t.placeAddress}</Text>
          <TextInput
            style={styles.formInput}
            value={manualForm.address}
            onChangeText={(text) => setManualForm({ ...manualForm, address: text })}
            placeholder={t.placeAddress}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t.placeCategory}</Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text
              style={[
                styles.categorySelectorText,
                !manualForm.category && styles.categorySelectorPlaceholder,
              ]}
            >
              {getSelectedCategoryName()}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitManual}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t.submit}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{t.selectCategory}</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>
            {loadingCategories ? (
              <ActivityIndicator size="large" color="#6366f1" style={styles.pickerLoading} />
            ) : (
              <ScrollView style={styles.pickerList}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.pickerItem,
                      manualForm.category === category.id && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setManualForm({ ...manualForm, category: category.id });
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        manualForm.category === category.id && styles.pickerItemTextSelected,
                      ]}
                    >
                      {getCategoryName(category)}
                    </Text>
                    {manualForm.category === category.id && (
                      <Ionicons name="checkmark" size={20} color="#6366f1" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.merchantTitle}</Text>
      </View>
      {viewMode === 'search' ? renderSearchView() : renderManualView()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1e293b',
  },
  searchButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94a3b8',
  },
  listContent: {
    padding: 16,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  manualCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
  },
  manualCreateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalPlaceInfo: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalPlaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalPlaceAddress: {
    fontSize: 14,
    color: '#64748b',
  },
  modalDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f1f5f9',
  },
  modalConfirmButton: {
    backgroundColor: '#6366f1',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  manualContainer: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  manualTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#1e293b',
  },
  categorySelectorPlaceholder: {
    color: '#94a3b8',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  pickerLoading: {
    padding: 40,
  },
  pickerList: {
    paddingHorizontal: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerItemSelected: {
    backgroundColor: '#f8fafc',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#1e293b',
  },
  pickerItemTextSelected: {
    color: '#6366f1',
    fontWeight: '500',
  },
});
