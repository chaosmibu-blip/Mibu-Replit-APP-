/**
 * 行程規劃頁面
 *
 * #026 Breaking Change: 使用 collectionIds 而非 placeIds
 * #027 AI 對話式排程功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { MibuBrand, getCategoryToken } from '../../../../constants/Colors';
import { itineraryApi } from '../../../services/itineraryApi';
import type {
  ItinerarySummary,
  Itinerary,
  ItineraryPlaceItem,
  AvailablePlacesByCategory,
  AvailablePlaceItem,
  AiSuggestedPlace,
  AiChatMessage,
} from '../../../types/itinerary';

type ViewMode = 'list' | 'detail' | 'add-places' | 'ai-chat';

export function ItineraryScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  // States
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data
  const [itineraries, setItineraries] = useState<ItinerarySummary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [availablePlaces, setAvailablePlaces] = useState<AvailablePlacesByCategory[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<number[]>([]); // collectionIds

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItinerary, setNewItinerary] = useState({
    date: new Date().toISOString().split('T')[0],
    country: '',
    city: '',
  });

  // AI Chat
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestedPlace[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch itineraries list
  const fetchItineraries = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    const res = await itineraryApi.getItineraries(token);
    if (res.success) {
      setItineraries(res.itineraries);
    }
    setLoading(false);
  }, [getToken]);

  // Fetch itinerary detail
  const fetchItineraryDetail = useCallback(async (id: number) => {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    const res = await itineraryApi.getItinerary(id, token);
    if (res.success) {
      setCurrentItinerary(res.itinerary);
    }
    setLoading(false);
  }, [getToken]);

  // Fetch available places
  const fetchAvailablePlaces = useCallback(async (id: number) => {
    const token = await getToken();
    if (!token) return;
    const res = await itineraryApi.getAvailablePlaces(id, token);
    if (res.success) {
      setAvailablePlaces(res.categories);
    }
  }, [getToken]);

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchItineraries();
    }
  }, [state.isAuthenticated, fetchItineraries]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItineraries();
    setRefreshing(false);
  };

  // Create new itinerary
  const handleCreate = async () => {
    if (!newItinerary.country || !newItinerary.city) {
      Alert.alert(
        isZh ? '請填寫完整' : 'Incomplete',
        isZh ? '請輸入國家和城市' : 'Please enter country and city'
      );
      return;
    }
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    const res = await itineraryApi.createItinerary(newItinerary, token);
    if (res.success) {
      setShowCreateModal(false);
      setNewItinerary({ date: new Date().toISOString().split('T')[0], country: '', city: '' });
      await fetchItineraries();
      // Open the new itinerary
      setCurrentItinerary(res.itinerary);
      setViewMode('detail');
    }
    setLoading(false);
  };

  // Delete itinerary
  const handleDelete = async (id: number) => {
    Alert.alert(
      isZh ? '刪除行程' : 'Delete Itinerary',
      isZh ? '確定要刪除這個行程嗎？' : 'Are you sure you want to delete this itinerary?',
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '刪除' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            const token = await getToken();
            if (!token) return;
            const res = await itineraryApi.deleteItinerary(id, token);
            if (res.success) {
              setCurrentItinerary(null);
              setViewMode('list');
              await fetchItineraries();
            }
          },
        },
      ]
    );
  };

  // Open add places modal
  const openAddPlaces = async () => {
    if (!currentItinerary) return;
    setSelectedPlaces([]);
    await fetchAvailablePlaces(currentItinerary.id);
    setViewMode('add-places');
  };

  // Toggle place selection (V2: using collectionId)
  const togglePlaceSelection = (collectionId: number) => {
    setSelectedPlaces(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  // Add selected places (V2: using collectionIds)
  const handleAddPlaces = async () => {
    if (!currentItinerary || selectedPlaces.length === 0) return;
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    const res = await itineraryApi.addPlaces(
      currentItinerary.id,
      { collectionIds: selectedPlaces },
      token
    );
    if (res.success) {
      await fetchItineraryDetail(currentItinerary.id);
      setViewMode('detail');
    }
    setLoading(false);
  };

  // Remove place (V2: using itemId)
  const handleRemovePlace = async (itemId: number) => {
    if (!currentItinerary) return;
    const token = await getToken();
    if (!token) return;
    const res = await itineraryApi.removePlace(currentItinerary.id, itemId, token);
    if (res.success) {
      await fetchItineraryDetail(currentItinerary.id);
    }
  };

  // AI Chat
  const sendAiMessage = async () => {
    if (!currentItinerary || !aiInput.trim()) return;
    const token = await getToken();
    if (!token) return;

    const userMessage: AiChatMessage = { role: 'user', content: aiInput.trim() };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);

    const res = await itineraryApi.aiChat(
      currentItinerary.id,
      { message: userMessage.content, previousMessages: aiMessages },
      token
    );

    if (res.success) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
      setAiSuggestions(res.suggestions);
    }
    setAiLoading(false);
  };

  // Add AI suggestions
  const handleAddAiSuggestions = async (collectionIds: number[]) => {
    if (!currentItinerary) return;
    const token = await getToken();
    if (!token) return;
    setAiLoading(true);
    const res = await itineraryApi.aiAddPlaces(currentItinerary.id, { collectionIds }, token);
    if (res.success) {
      await fetchItineraryDetail(currentItinerary.id);
      setAiSuggestions([]);
      Alert.alert(
        isZh ? '已加入' : 'Added',
        isZh ? `成功加入 ${res.addedCount} 個景點` : `Successfully added ${res.addedCount} places`
      );
    }
    setAiLoading(false);
  };

  // Not authenticated
  if (!state.isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={MibuBrand.copper} />
          <Text style={styles.emptyTitle}>
            {isZh ? '登入以管理行程' : 'Login to manage itineraries'}
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Text style={styles.loginButtonText}>{isZh ? '登入' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render list view
  const renderListView = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{isZh ? '行程規劃' : 'Trip Planner'}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && itineraries.length === 0 ? (
        <ActivityIndicator size="large" color={MibuBrand.brown} style={{ marginTop: 40 }} />
      ) : itineraries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="map-outline" size={48} color={MibuBrand.copper} />
          <Text style={styles.emptyCardTitle}>
            {isZh ? '還沒有行程' : 'No itineraries yet'}
          </Text>
          <Text style={styles.emptyCardDesc}>
            {isZh ? '點擊右上角建立你的第一個行程' : 'Tap + to create your first itinerary'}
          </Text>
        </View>
      ) : (
        itineraries.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.itineraryCard}
            onPress={async () => {
              await fetchItineraryDetail(item.id);
              setViewMode('detail');
            }}
          >
            <View style={styles.itineraryCardIcon}>
              <Ionicons name="airplane" size={24} color={MibuBrand.brown} />
            </View>
            <View style={styles.itineraryCardInfo}>
              <Text style={styles.itineraryCardTitle}>{item.title || `${item.city} ${isZh ? '之旅' : 'Trip'}`}</Text>
              <Text style={styles.itineraryCardMeta}>
                {item.date} | {item.city}, {item.country}
              </Text>
              <Text style={styles.itineraryCardPlaces}>
                {item.placeCount} {isZh ? '個景點' : 'places'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={MibuBrand.copper} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  // Render detail view
  const renderDetailView = () => {
    if (!currentItinerary) return null;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setViewMode('list')} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={MibuBrand.brown} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {currentItinerary.title || `${currentItinerary.city} ${isZh ? '之旅' : 'Trip'}`}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(currentItinerary.id)}>
            <Ionicons name="trash-outline" size={22} color={MibuBrand.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={MibuBrand.copper} />
            <Text style={styles.metaText}>{currentItinerary.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={MibuBrand.copper} />
            <Text style={styles.metaText}>{currentItinerary.city}, {currentItinerary.country}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionBtn} onPress={openAddPlaces}>
            <Ionicons name="add-circle-outline" size={20} color={MibuBrand.brown} />
            <Text style={styles.actionBtnText}>{isZh ? '加入景點' : 'Add Places'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.aiBtn]}
            onPress={() => {
              setAiMessages([]);
              setAiSuggestions([]);
              setViewMode('ai-chat');
            }}
          >
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.aiBtnText}>{isZh ? 'AI 助手' : 'AI Assistant'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          {isZh ? '行程景點' : 'Places'} ({currentItinerary.places.length})
        </Text>

        {currentItinerary.places.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="compass-outline" size={40} color={MibuBrand.copper} />
            <Text style={styles.emptyCardTitle}>
              {isZh ? '尚無景點' : 'No places yet'}
            </Text>
            <Text style={styles.emptyCardDesc}>
              {isZh ? '從你的圖鑑加入景點' : 'Add places from your collection'}
            </Text>
          </View>
        ) : (
          currentItinerary.places.map((place, index) => (
            <View key={place.id} style={styles.placeCard}>
              <View style={styles.placeIndex}>
                <Text style={styles.placeIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{place.name}</Text>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryToken(place.category).badge }]}>
                  <Text style={[styles.categoryBadgeText, { color: getCategoryToken(place.category).badgeText }]}>
                    {place.category}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleRemovePlace(place.id)}>
                <Ionicons name="close-circle" size={24} color={MibuBrand.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  // Render add places view
  const renderAddPlacesView = () => (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: 20, paddingTop: 60 }]}>
        <TouchableOpacity onPress={() => setViewMode('detail')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brown} />
        </TouchableOpacity>
        <Text style={styles.title}>{isZh ? '選擇景點' : 'Select Places'}</Text>
        <TouchableOpacity
          style={[styles.doneButton, selectedPlaces.length === 0 && styles.doneButtonDisabled]}
          onPress={handleAddPlaces}
          disabled={selectedPlaces.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.doneButtonText}>
              {isZh ? `加入 (${selectedPlaces.length})` : `Add (${selectedPlaces.length})`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0 }}>
        {availablePlaces.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="albums-outline" size={40} color={MibuBrand.copper} />
            <Text style={styles.emptyCardTitle}>
              {isZh ? '圖鑑是空的' : 'Collection is empty'}
            </Text>
            <Text style={styles.emptyCardDesc}>
              {isZh ? '先去扭蛋收集景點吧！' : 'Go play gacha to collect places!'}
            </Text>
          </View>
        ) : (
          availablePlaces.map(category => (
            <View key={category.category} style={styles.categorySection}>
              <Text style={styles.categorySectionTitle}>{category.categoryName}</Text>
              {category.places.map(place => {
                const isSelected = selectedPlaces.includes(place.collectionId);
                return (
                  <TouchableOpacity
                    key={place.collectionId}
                    style={[styles.selectablePlace, isSelected && styles.selectablePlaceSelected]}
                    onPress={() => togglePlaceSelection(place.collectionId)}
                  >
                    <View style={styles.selectablePlaceInfo}>
                      <Text style={styles.selectablePlaceName}>{place.name}</Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={isSelected ? MibuBrand.brown : MibuBrand.copper}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );

  // Render AI chat view
  const renderAiChatView = () => (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingHorizontal: 20, paddingTop: 60 }]}>
        <TouchableOpacity onPress={() => setViewMode('detail')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brown} />
        </TouchableOpacity>
        <Text style={styles.title}>{isZh ? 'AI 行程助手' : 'AI Assistant'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.chatContainer} contentContainerStyle={{ padding: 20 }}>
        {aiMessages.length === 0 && (
          <View style={styles.aiWelcome}>
            <Ionicons name="sparkles" size={40} color={MibuBrand.brown} />
            <Text style={styles.aiWelcomeTitle}>
              {isZh ? '嗨！我是你的行程助手' : "Hi! I'm your trip assistant"}
            </Text>
            <Text style={styles.aiWelcomeDesc}>
              {isZh
                ? '告訴我你想要什麼樣的行程，我會從你的圖鑑中推薦適合的景點'
                : "Tell me what kind of trip you want, and I'll recommend places from your collection"}
            </Text>
          </View>
        )}

        {aiMessages.map((msg, idx) => (
          <View
            key={idx}
            style={[styles.chatBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
          >
            <Text style={[styles.chatText, msg.role === 'user' && styles.userChatText]}>
              {msg.content}
            </Text>
          </View>
        ))}

        {aiLoading && (
          <View style={styles.aiLoadingBubble}>
            <ActivityIndicator size="small" color={MibuBrand.brown} />
            <Text style={styles.aiLoadingText}>{isZh ? '思考中...' : 'Thinking...'}</Text>
          </View>
        )}

        {aiSuggestions.length > 0 && (
          <View style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>
              {isZh ? 'AI 推薦景點' : 'AI Suggestions'}
            </Text>
            {aiSuggestions.map(s => (
              <View key={s.collectionId} style={styles.suggestionItem}>
                <View style={styles.suggestionInfo}>
                  <Text style={styles.suggestionName}>{s.name}</Text>
                  <Text style={styles.suggestionReason}>{s.reason}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addAllButton}
              onPress={() => handleAddAiSuggestions(aiSuggestions.map(s => s.collectionId))}
            >
              <Text style={styles.addAllButtonText}>
                {isZh ? '全部加入行程' : 'Add All to Itinerary'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder={isZh ? '例如：我想要美食之旅...' : 'e.g. I want a food tour...'}
          placeholderTextColor={MibuBrand.copper}
          value={aiInput}
          onChangeText={setAiInput}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !aiInput.trim() && styles.sendButtonDisabled]}
          onPress={sendAiMessage}
          disabled={!aiInput.trim() || aiLoading}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      {viewMode === 'list' && renderListView()}
      {viewMode === 'detail' && renderDetailView()}
      {viewMode === 'add-places' && renderAddPlacesView()}
      {viewMode === 'ai-chat' && renderAiChatView()}

      {/* Create Itinerary Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isZh ? '建立新行程' : 'Create New Itinerary'}
            </Text>

            <Text style={styles.inputLabel}>{isZh ? '日期' : 'Date'}</Text>
            <TextInput
              style={styles.input}
              value={newItinerary.date}
              onChangeText={text => setNewItinerary(prev => ({ ...prev, date: text }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={MibuBrand.copper}
            />

            <Text style={styles.inputLabel}>{isZh ? '國家' : 'Country'}</Text>
            <TextInput
              style={styles.input}
              value={newItinerary.country}
              onChangeText={text => setNewItinerary(prev => ({ ...prev, country: text }))}
              placeholder={isZh ? '例如：台灣' : 'e.g. Taiwan'}
              placeholderTextColor={MibuBrand.copper}
            />

            <Text style={styles.inputLabel}>{isZh ? '城市' : 'City'}</Text>
            <TextInput
              style={styles.input}
              value={newItinerary.city}
              onChangeText={text => setNewItinerary(prev => ({ ...prev, city: text }))}
              placeholder={isZh ? '例如：台北' : 'e.g. Taipei'}
              placeholderTextColor={MibuBrand.copper}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalCancelText}>{isZh ? '取消' : 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleCreate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>{isZh ? '建立' : 'Create'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    flex: 1,
    marginLeft: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginTop: 16,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginTop: 12,
  },
  emptyCardDesc: {
    fontSize: 14,
    color: MibuBrand.copper,
    marginTop: 8,
    textAlign: 'center',
  },
  itineraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  itineraryCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MibuBrand.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itineraryCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itineraryCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  itineraryCardMeta: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  itineraryCardPlaces: {
    fontSize: 12,
    color: MibuBrand.brown,
    marginTop: 4,
  },
  detailMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: MibuBrand.copper,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: MibuBrand.creamLight,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  aiBtn: {
    backgroundColor: MibuBrand.brown,
    borderWidth: 0,
  },
  aiBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 12,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  placeIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeIndexText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  placeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  doneButton: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  doneButtonDisabled: {
    backgroundColor: MibuBrand.tan,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 20,
  },
  categorySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  selectablePlace: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectablePlaceSelected: {
    borderColor: MibuBrand.brown,
    backgroundColor: MibuBrand.highlight,
  },
  selectablePlaceInfo: {
    flex: 1,
  },
  selectablePlaceName: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  chatContainer: {
    flex: 1,
  },
  aiWelcome: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    marginBottom: 16,
  },
  aiWelcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginTop: 12,
  },
  aiWelcomeDesc: {
    fontSize: 14,
    color: MibuBrand.copper,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: MibuBrand.brown,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: MibuBrand.creamLight,
  },
  chatText: {
    fontSize: 15,
    color: MibuBrand.brownDark,
    lineHeight: 22,
  },
  userChatText: {
    color: '#fff',
  },
  aiLoadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: MibuBrand.creamLight,
    padding: 12,
    borderRadius: 16,
    gap: 8,
  },
  aiLoadingText: {
    fontSize: 14,
    color: MibuBrand.copper,
  },
  suggestionsCard: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  suggestionReason: {
    fontSize: 12,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  addAllButton: {
    backgroundColor: MibuBrand.brown,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  addAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 32,
    backgroundColor: MibuBrand.creamLight,
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
  },
  chatInput: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: MibuBrand.brownDark,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: MibuBrand.tan,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginBottom: 6,
  },
  input: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: MibuBrand.brownDark,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: MibuBrand.tanLight,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
