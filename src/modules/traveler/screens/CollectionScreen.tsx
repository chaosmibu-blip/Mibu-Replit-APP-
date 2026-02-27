/**
 * CollectionScreen - 圖鑑畫面
 *
 * 功能：
 * - 顯示用戶收集到的所有景點
 * - 麵包屑導航：全部 → 國家 → 城市 → 分類
 * - 搜尋功能（景點名稱、描述、城市）
 * - 點擊卡片查看詳情（Modal）
 * - 支援收藏/黑名單功能
 * - 下拉重新整理
 * - 未讀標記和優惠更新通知
 *
 * 串接 API：
 * - collectionApi.getCollection() - 取得圖鑑列表
 * - collectionApi.markAsRead() - 標記已讀
 *
 * 視覺設計：
 * - 麵包屑導航（全部 > 國家 > 城市）
 * - Level 0: 國家卡片列表
 * - Level 1: 城市卡片列表
 * - Level 2: 分類 Tab + 2 欄網格景點卡片
 * - 使用分類色彩區分不同類型景點
 * - PRO 商家顯示品牌色
 *
 * 更新日期：2026-02-12（Phase 3 遷移至 React Query）
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Linking,
  Modal,
  RefreshControl,
  Alert,
  SafeAreaView,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth, useI18n, useGacha } from '../../../context/AppContext';
import { useCollectionList, useMarkCollectionRead } from '../../../hooks/useCollectionQueries';
import { collectionApi } from '../../../services/collectionApi';
import { contributionApi } from '../../../services/contributionApi';
import { GachaItem, Language } from '../../../types';
import { getCategoryLabel } from '../../../constants/translations';
import { MibuBrand, getCategoryToken, deriveMerchantScheme, UIColors } from '../../../../constants/Colors';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { SegmentedControl } from '../../shared/components/ui/SegmentedControl';
import {
  useGraffiti, useCreateGraffiti, useDeleteGraffiti,
  useNotes, useCreateNote, useUpdateNote, useDeleteNote,
} from '../../../hooks/useMiniQueries';
import type { NoteItem } from '../../../types/mini';
import { tFormat } from '../../../utils/i18n';
import { Spacing } from '../../../theme/designTokens';
import styles from './CollectionScreen.styles';

// ============================================================
// 型別定義
// ============================================================

/**
 * 擴展 GachaItem 類型
 * 新增圖鑑特有欄位
 */
type GachaItemWithRead = GachaItem & {
  isRead?: boolean;           // 是否已讀
  collectionId?: number;      // 圖鑑 ID
  hasPromoUpdate?: boolean;   // #028 是否有優惠更新通知
  placeId?: string;           // 地點 ID（用於收藏/黑名單 API）
};

// ============================================================
// 輔助函數
// ============================================================

/**
 * 取得景點名稱
 */
const getPlaceName = (item: GachaItem): string => {
  return item.placeName || '';
};

/**
 * 取得景點描述
 */
const getDescription = (item: GachaItem): string => {
  return item.description || '';
};

/**
 * 格式化日期
 * @param dateStr ISO 日期字串
 * @returns YYYY/MM/DD 格式
 */
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  } catch {
    return '';
  }
};

// ============================================================
// 子元件：景點詳情 Modal
// ============================================================

interface PlaceDetailModalProps {
  item: GachaItem;     // 景點資料
  language: Language;  // 語言設定
  onClose: () => void; // 關閉回調
  onFavorite: (item: GachaItem) => void;   // 收藏回調
  onBlacklist: (item: GachaItem) => void;  // 黑名單回調
}

/**
 * PlaceDetailModal - 景點詳情彈窗
 * 顯示景點完整資訊，可導航、收藏、加入黑名單
 * #058 塗鴉牆 + #059 筆記（Tab 切換）
 */
type PlaceDetailTab = 'info' | 'graffiti' | 'notes';

function PlaceDetailModal({ item, language, onClose, onFavorite, onBlacklist }: PlaceDetailModalProps) {
  const { t } = useI18n();
  const placeId = item.id;

  // UI 狀態
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<PlaceDetailTab>('info');
  const [graffitiInput, setGraffitiInput] = useState('');
  const [newNoteInput, setNewNoteInput] = useState('');
  const [editNoteInput, setEditNoteInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  // #058 塗鴉牆（切到該 tab 才載入，避免 Modal 動畫期間搶 JS 線程）
  const graffitiQuery = useGraffiti(placeId, activeTab === 'graffiti');
  const createGraffitiMutation = useCreateGraffiti();
  const deleteGraffitiMutation = useDeleteGraffiti();

  // #059 筆記（同上，懶載入）
  const notesQuery = useNotes(placeId, activeTab === 'notes');
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  // 衍生資料
  const placeName = getPlaceName(item);
  const description = getDescription(item);
  const category = typeof item.category === 'string' ? item.category.toLowerCase() : '';
  const categoryToken = getCategoryToken(category);
  const date = formatDate(item.collectedAt);
  const cityDisplay = item.cityDisplay || item.city || '';
  const districtDisplay = item.districtDisplay || item.district || '';
  const locationText = [districtDisplay, cityDisplay].filter(Boolean).join(' • ') || cityDisplay;

  // ========== 共用事件 ==========

  const handleNavigate = () => {
    const query = [placeName, districtDisplay, cityDisplay].filter(Boolean).join(' ');
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  const handleFavorite = () => {
    onFavorite(item);
    setShowActionMenu(false);
    onClose();
  };

  const handleBlacklist = () => {
    onBlacklist(item);
    setShowActionMenu(false);
    onClose();
  };

  const handleClosePress = () => {
    setShowActionMenu(true);
  };

  // ========== #058 塗鴉牆操作 ==========

  const handleSendGraffiti = () => {
    const content = graffitiInput.trim();
    if (!content) return;
    // 每人每景點最多 3 則
    const ownCount = (graffitiQuery.data?.graffiti ?? []).filter(g => g.isOwn).length;
    if (ownCount >= 3) {
      Alert.alert(t.mini_graffitiLimitTitle, t.mini_graffitiLimitMessage);
      return;
    }
    createGraffitiMutation.mutate(
      { placeId, params: { content } },
      {
        onSuccess: () => setGraffitiInput(''),
        onError: () => Alert.alert(t.mini_error, t.mini_graffitiCreateFail),
      },
    );
  };

  const handleDeleteGraffiti = (graffitiId: number) => {
    Alert.alert(t.mini_graffitiDelete, t.mini_graffitiDeleteConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.mini_graffitiDelete,
        style: 'destructive',
        onPress: () => deleteGraffitiMutation.mutate(
          { graffitiId, placeId },
          { onError: () => Alert.alert(t.mini_error, t.mini_graffitiDeleteFail) },
        ),
      },
    ]);
  };

  // ========== #059 筆記操作 ==========

  const handleSaveNote = () => {
    if (editingNoteId) {
      const content = editNoteInput.trim();
      if (!content) return;
      updateNoteMutation.mutate(
        { noteId: editingNoteId, placeId, params: { content } },
        {
          onSuccess: () => { setEditNoteInput(''); setEditingNoteId(null); },
          onError: () => Alert.alert(t.mini_error, t.mini_notesUpdateFail),
        },
      );
    } else {
      const content = newNoteInput.trim();
      if (!content) return;
      createNoteMutation.mutate(
        { placeId, params: { content } },
        {
          onSuccess: () => setNewNoteInput(''),
          onError: () => Alert.alert(t.mini_error, t.mini_notesCreateFail),
        },
      );
    }
  };

  const handleEditNote = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setEditNoteInput(note.content);
  };

  const handleDeleteNote = (noteId: number) => {
    Alert.alert(t.mini_notesDelete, t.mini_notesDeleteConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.mini_notesDelete,
        style: 'destructive',
        onPress: () => deleteNoteMutation.mutate(
          { noteId, placeId },
          { onError: () => Alert.alert(t.mini_error, t.mini_notesDeleteFail) },
        ),
      },
    ]);
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditNoteInput('');
  };

  // ========== Render: 詳情 Tab ==========

  const renderInfoTab = () => (
    <>
      <Text style={styles.modalPlaceName}>{placeName}</Text>
      <View style={styles.modalMetaRow}>
        <Text style={styles.modalMetaText}>{date}</Text>
        {locationText ? (
          <>
            <Text style={styles.modalMetaDot}>&bull;</Text>
            <Text style={styles.modalMetaText}>{locationText}</Text>
          </>
        ) : null}
      </View>
      {description ? <Text style={styles.modalDescription}>{description}</Text> : null}
      <TouchableOpacity
        style={styles.modalNavigateButton}
        onPress={handleNavigate}
        accessibilityLabel={t.collection_viewOnMap}
      >
        <Ionicons name="search" size={20} color={UIColors.white} />
        <Text style={styles.modalNavigateText}>{t.collection_viewOnMap}</Text>
      </TouchableOpacity>
    </>
  );

  // ========== Render: #058 塗鴉牆 Tab ==========

  const renderGraffitiTab = () => {
    const graffiti = graffitiQuery.data?.graffiti ?? [];
    return (
      <>
        {graffitiQuery.isLoading && (
          <ActivityIndicator color={MibuBrand.brown} style={{ marginVertical: Spacing.xl }} />
        )}
        {!graffitiQuery.isLoading && graffiti.length === 0 && (
          <Text style={styles.miniEmptyText}>{t.mini_graffitiEmpty}</Text>
        )}
        {graffiti.map((g) => (
          <View key={g.id} style={styles.graffitiItem}>
            <View style={styles.graffitiHeader}>
              <Text style={styles.graffitiName}>{g.displayName}</Text>
              <Text style={styles.graffitiDate}>{formatDate(g.createdAt)}</Text>
            </View>
            <Text style={styles.graffitiContent}>{g.content}</Text>
            {g.isOwn && (
              <TouchableOpacity
                style={styles.graffitiDeleteButton}
                onPress={() => handleDeleteGraffiti(g.id)}
              >
                <Ionicons name="trash-outline" size={16} color={MibuBrand.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <View style={styles.miniInputRow}>
          <TextInput
            style={styles.miniInput}
            value={graffitiInput}
            onChangeText={setGraffitiInput}
            placeholder={t.mini_graffitiPlaceholder}
            placeholderTextColor={MibuBrand.brownLight}
            maxLength={200}
            multiline
          />
          <TouchableOpacity
            style={[styles.miniSendButton, (!graffitiInput.trim() || createGraffitiMutation.isPending) && styles.miniSendButtonDisabled]}
            onPress={handleSendGraffiti}
            disabled={!graffitiInput.trim() || createGraffitiMutation.isPending}
          >
            <Ionicons name="send" size={18} color={UIColors.white} />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // ========== Render: #059 筆記 Tab ==========

  const renderNotesTab = () => {
    const notes = notesQuery.data?.notes ?? [];
    return (
      <>
        {notesQuery.isLoading && (
          <ActivityIndicator color={MibuBrand.brown} style={{ marginVertical: Spacing.xl }} />
        )}
        {!notesQuery.isLoading && notes.length === 0 && !newNoteInput && (
          <Text style={styles.miniEmptyText}>{t.mini_notesEmpty}</Text>
        )}
        {notes.map((note) => (
          <View key={note.id} style={styles.noteItem}>
            {editingNoteId === note.id ? (
              <View>
                <TextInput
                  style={styles.noteEditInput}
                  value={editNoteInput}
                  onChangeText={setEditNoteInput}
                  multiline
                  maxLength={2000}
                  autoFocus
                />
                <View style={styles.noteEditActions}>
                  <TouchableOpacity style={styles.noteCancelButton} onPress={handleCancelEditNote}>
                    <Text style={styles.noteCancelText}>{t.cancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.noteSaveButton, !editNoteInput.trim() && styles.miniSendButtonDisabled]}
                    onPress={handleSaveNote}
                    disabled={!editNoteInput.trim() || updateNoteMutation.isPending}
                  >
                    <Text style={styles.noteSaveText}>{t.mini_notesSave}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.noteContent}>{note.content}</Text>
                {(note.tags?.length ?? 0) > 0 && (
                  <View style={styles.noteTagsRow}>
                    {note.tags.map((tag, idx) => (
                      <View key={idx} style={styles.noteTag}>
                        <Text style={styles.noteTagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.noteFooter}>
                  <Text style={styles.noteDate}>{formatDate(note.updatedAt)}</Text>
                  <View style={styles.noteActions}>
                    <TouchableOpacity onPress={() => handleEditNote(note)}>
                      <Ionicons name="pencil-outline" size={18} color={MibuBrand.copper} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
                      <Ionicons name="trash-outline" size={18} color={MibuBrand.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        ))}
        {!editingNoteId && (
          <View style={styles.miniInputRow}>
            <TextInput
              style={styles.miniInput}
              value={newNoteInput}
              onChangeText={setNewNoteInput}
              placeholder={t.mini_notesPlaceholder}
              placeholderTextColor={MibuBrand.brownLight}
              maxLength={2000}
              multiline
            />
            <TouchableOpacity
              style={[styles.miniSendButton, (!newNoteInput.trim() || createNoteMutation.isPending) && styles.miniSendButtonDisabled]}
              onPress={handleSaveNote}
              disabled={!newNoteInput.trim() || createNoteMutation.isPending}
            >
              <Ionicons name="add" size={20} color={UIColors.white} />
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  // ========== Tab 定義 ==========

  const tabSegments = [
    { key: 'info', label: t.mini_infoTab },
    { key: 'graffiti', label: t.mini_graffitiTab },
    { key: 'notes', label: t.mini_notesTab },
  ];

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.modalOverlay}>
        {/* 背景層：點擊關閉（獨立 Pressable，不包住內容，避免手勢衝突） */}
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        {/* 內容層：不在任何 Touchable 裡面，ScrollView 可自由滾動 */}
        <View style={styles.modalContent}>
          <View style={[styles.modalHeader, { backgroundColor: categoryToken.badge }]}>
            <View style={styles.modalTopRight}>
              {!showActionMenu ? (
                <TouchableOpacity style={styles.modalCircleButton} onPress={handleClosePress}>
                  <Ionicons name="close" size={20} color={MibuBrand.dark} />
                </TouchableOpacity>
              ) : (
                <View style={styles.modalActionRow}>
                  <TouchableOpacity style={styles.modalCircleButton} onPress={handleFavorite} accessibilityLabel={t.collection_addToFavorites}>
                    <Ionicons name="heart-outline" size={20} color={MibuBrand.tierSP} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCircleButton} onPress={onClose} accessibilityLabel={t.collection_closeDetails}>
                    <Ionicons name="close" size={20} color={MibuBrand.dark} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCircleButton} onPress={handleBlacklist}>
                    <Ionicons name="ban-outline" size={20} color={MibuBrand.copper} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.modalCategoryBadge}>
              <Text style={[styles.modalCategoryText, { color: categoryToken.badgeText }]}>
                {getCategoryLabel(category, language)}
              </Text>
            </View>
          </View>

          {/* #058/#059 Tab 切換 */}
          <SegmentedControl
            segments={tabSegments}
            selectedKey={activeTab}
            onSelect={(key) => {
              setActiveTab(key as PlaceDetailTab);
              // 切換 tab 時重設編輯狀態
              if (editingNoteId) {
                setEditingNoteId(null);
                setEditNoteInput('');
              }
            }}
          />

          <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
            {activeTab === 'info' && renderInfoTab()}
            {activeTab === 'graffiti' && renderGraffitiTab()}
            {activeTab === 'notes' && renderNotesTab()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function CollectionScreen() {
  const { getToken } = useAuth();
  const { t, language } = useI18n();
  const { gachaState } = useGacha();
  const queryClient = useQueryClient();

  // React Query：圖鑑列表（取代 useState + useEffect + loadCollections）
  const collectionQuery = useCollectionList({ sort: 'unread' });
  const markAllReadMutation = useMarkCollectionRead();

  // 【圖鑑導航】麵包屑導航狀態
  const [navLevel, setNavLevel] = useState<0 | 1 | 2>(0);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GachaItemWithRead | null>(null);
  // #028 優惠更新通知
  const [promoUpdateIds, setPromoUpdateIds] = useState<Set<number>>(new Set());

  // 從 React Query 衍生狀態（API 有資料用 API，否則 fallback 到 gachaState 本地快取）
  const apiCollection: GachaItemWithRead[] = useMemo(() => {
    if (!collectionQuery.data?.collections) return [];
    return collectionQuery.data.collections.map(item => ({
      id: parseInt(item.placeId || item.id?.toString() || '0', 10) || 0,
      placeId: item.placeId,
      placeName: item.placeName,
      description: item.description,
      category: item.category,
      subcategory: null,
      address: null,
      rating: null,
      locationLat: null,
      locationLng: null,
      city: item.city,
      cityDisplay: item.cityDisplay,
      district: item.district,
      districtDisplay: item.districtDisplay,
      collectedAt: item.collectedAt,
      isRead: item.isRead,
      collectionId: item.id,
      merchant: item.merchant,
      isCoupon: item.isCoupon,
      couponData: item.couponData,
    })) as GachaItemWithRead[];
  }, [collectionQuery.data]);

  const collection = collectionQuery.data
    ? apiCollection
    : (gachaState?.collection ?? []) as GachaItemWithRead[];
  const refreshing = collectionQuery.isFetching && !collectionQuery.isLoading;

  // 統計資料（useMemo 避免每次渲染重算）
  const { totalSpots, uniqueCities, uniqueCategories, unreadCount } = useMemo(() => ({
    totalSpots: collection.length,
    uniqueCities: new Set(collection.map(item => item.city || 'Unknown')).size,
    uniqueCategories: new Set(collection.map(item =>
      (typeof item.category === 'string' ? item.category : '').toLowerCase() || 'other'
    )).size,
    unreadCount: collection.filter(item => item.isRead === false).length,
  }), [collection]);

  // #028 載入優惠更新通知（保留：promo 更新尚未納入 React Query）
  const loadPromoUpdates = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const response = await collectionApi.getPromoUpdates(token);
      if (response.success && response.unreadCollectionIds) {
        setPromoUpdateIds(new Set(response.unreadCollectionIds));
      }
    } catch (error) {
      console.error('Failed to load promo updates:', error);
    }
  }, [getToken]);

  // 下拉重新整理：React Query invalidate + promo 更新
  const onRefresh = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['collection'] });
    loadPromoUpdates();
  }, [queryClient, loadPromoUpdates]);

  // 點擊項目：先開 Modal，標記已讀在背景非阻塞執行（避免 await 搶 JS 線程卡動畫）
  const handleItemPress = useCallback((item: GachaItemWithRead) => {
    setSelectedItem(item);

    // 樂觀更新（同步，不阻塞）
    if (item.isRead === false) {
      queryClient.setQueryData(
        ['collection', { sort: 'unread' }],
        (old: any) => {
          if (!old?.collections) return old;
          return {
            ...old,
            collections: old.collections.map((i: any) =>
              i.id === item.collectionId ? { ...i, isRead: true } : i
            ),
          };
        }
      );
    }

    // #028 優惠已讀：背景執行，不阻塞 Modal 開啟
    if (item.collectionId && promoUpdateIds.has(item.collectionId)) {
      getToken().then(token => {
        if (!token || !item.collectionId) return;
        collectionApi.markPromoRead(token, item.collectionId).then(() => {
          setPromoUpdateIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(item.collectionId!);
            return newSet;
          });
        }).catch(error => {
          console.error('Failed to mark promo as read:', error);
        });
      });
    }
  }, [getToken, promoUpdateIds, queryClient]);

  // ========== 麵包屑導航函數 ==========

  /** 導航到國家層（選擇國家後進入城市列表） */
  const navigateToCountry = (countryKey: string) => {
    setSelectedCountry(countryKey);
    setSelectedCity(null);
    setNavLevel(1);
    setActiveCategoryTab(null);
  };

  /** 導航到城市層（選擇城市後進入景點列表） */
  const navigateToCity = (cityKey: string) => {
    setSelectedCity(cityKey);
    setNavLevel(2);
    setActiveCategoryTab(null);
  };

  /** 麵包屑：導航回指定層級 */
  const navigateBack = (level: 0 | 1 | 2) => {
    setNavLevel(level);
    if (level === 0) {
      setSelectedCountry(null);
      setSelectedCity(null);
    } else if (level === 1) {
      setSelectedCity(null);
    }
    setActiveCategoryTab(null);
  };

  /**
   * 加入我的最愛
   * 【截圖 6-8】實作收藏功能
   */
  const handleFavorite = useCallback(async (item: GachaItemWithRead) => {
    const token = await getToken();
    if (!token) {
      Alert.alert(
        language === 'zh-TW' ? '請先登入' : 'Please Login',
        language === 'zh-TW' ? '登入後才能使用收藏功能' : 'Login to use favorites'
      );
      return;
    }

    const placeId = item.placeId || item.id?.toString();
    if (!placeId) return;

    try {
      const response = await collectionApi.addFavorite(token, placeId);
      if (response.success) {
        Alert.alert(
          language === 'zh-TW' ? '已加入最愛' : 'Added to Favorites',
          language === 'zh-TW' ? `${item.placeName} 已加入我的最愛` : `${item.placeName} has been added to favorites`
        );
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);
      Alert.alert(
        language === 'zh-TW' ? '操作失敗' : 'Failed',
        language === 'zh-TW' ? '請稍後再試' : 'Please try again later'
      );
    }
  }, [getToken, language]);

  /**
   * 加入黑名單
   * 【截圖 6-8】實作黑名單功能
   */
  const handleBlacklist = useCallback(async (item: GachaItemWithRead) => {
    const token = await getToken();
    if (!token) {
      Alert.alert(
        language === 'zh-TW' ? '請先登入' : 'Please Login',
        language === 'zh-TW' ? '登入後才能使用黑名單功能' : 'Login to use blacklist'
      );
      return;
    }

    const placeId = item.placeId || item.id?.toString();
    if (!placeId) return;

    // 確認對話框
    Alert.alert(
      language === 'zh-TW' ? '加入黑名單' : 'Add to Blacklist',
      language === 'zh-TW'
        ? `確定要將「${item.placeName}」加入黑名單嗎？\n加入後扭蛋將不會再抽到此景點。`
        : `Are you sure you want to blacklist "${item.placeName}"?\nThis place will not appear in future gacha pulls.`,
      [
        { text: language === 'zh-TW' ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: language === 'zh-TW' ? '確定' : 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await contributionApi.addToBlacklist(token, placeId);
              if (response.success) {
                Alert.alert(
                  language === 'zh-TW' ? '已加入黑名單' : 'Added to Blacklist',
                  language === 'zh-TW' ? `${item.placeName} 已加入黑名單` : `${item.placeName} has been blacklisted`
                );
              }
            } catch (error) {
              console.error('Failed to add to blacklist:', error);
              Alert.alert(
                language === 'zh-TW' ? '操作失敗' : 'Failed',
                language === 'zh-TW' ? '請稍後再試' : 'Please try again later'
              );
            }
          },
        },
      ]
    );
  }, [getToken, language]);

  /**
   * 【圖鑑三層分類】國家 → 城市 → 分類
   * 後端回傳的 collection item 包含 country, city, category 欄位
   * 前端按這三層進行分組
   */
  const groupedData = useMemo(() => {
    type CityData = {
      displayName: string;
      items: GachaItemWithRead[];
      unreadCount: number;
      byCategory: Record<string, GachaItemWithRead[]>;
    };
    type CountryData = {
      displayName: string;
      cities: Record<string, CityData>;
      totalItems: number;
      unreadCount: number;
    };

    const countryMap: Record<string, CountryData> = {};

    collection.forEach(item => {
      // 取得國家、城市、分類
      const country = item.country || '台灣'; // 預設台灣
      const city = item.city || 'Unknown';
      const cityDisplay = item.cityDisplay || city;
      const category = (typeof item.category === 'string' ? item.category : '').toLowerCase() || 'other';

      // 初始化國家
      if (!countryMap[country]) {
        countryMap[country] = {
          displayName: country,
          cities: {},
          totalItems: 0,
          unreadCount: 0,
        };
      }

      // 初始化城市
      if (!countryMap[country].cities[city]) {
        countryMap[country].cities[city] = {
          displayName: cityDisplay,
          items: [],
          unreadCount: 0,
          byCategory: {},
        };
      }

      // 添加到城市
      countryMap[country].cities[city].items.push(item);
      countryMap[country].totalItems++;

      // 統計未讀
      if (item.isRead === false) {
        countryMap[country].cities[city].unreadCount++;
        countryMap[country].unreadCount++;
      }

      // 添加到分類
      if (!countryMap[country].cities[city].byCategory[category]) {
        countryMap[country].cities[city].byCategory[category] = [];
      }
      countryMap[country].cities[city].byCategory[category].push(item);
    });

    return countryMap;
  }, [collection]);

  // 搜尋結果篩選
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return collection.filter(item =>
      getPlaceName(item).toLowerCase().includes(query) ||
      getDescription(item).toLowerCase().includes(query) ||
      (item.city || '').toLowerCase().includes(query) ||
      (item.cityDisplay || '').toLowerCase().includes(query)
    );
  }, [collection, searchQuery]);

  // 當前城市資料（Level 2 使用）
  const currentCityData = useMemo(() => {
    if (!selectedCountry || !selectedCity) return null;
    return groupedData[selectedCountry]?.cities[selectedCity] || null;
  }, [groupedData, selectedCountry, selectedCity]);

  // 當前城市的分類列表
  const currentCategories = useMemo(() => {
    if (!currentCityData) return [];
    return Object.keys(currentCityData.byCategory)
      .sort((a, b) => currentCityData.byCategory[b].length - currentCityData.byCategory[a].length);
  }, [currentCityData]);

  // 依分類篩選的景點
  const filteredPlaces = useMemo(() => {
    if (!currentCityData) return [];
    return activeCategoryTab
      ? currentCityData.byCategory[activeCategoryTab] || []
      : currentCityData.items;
  }, [currentCityData, activeCategoryTab]);

  // ========== 全部已讀（POST /api/collections/read-all） ==========

  /** 全部標記已讀：樂觀更新 React Query 快取 + mutation 呼叫後端 API */
  const handleMarkAllRead = useCallback(() => {
    // 樂觀更新 React Query 快取
    queryClient.setQueryData(
      ['collection', { sort: 'unread' }],
      (old: any) => {
        if (!old?.collections) return old;
        return {
          ...old,
          collections: old.collections.map((item: any) =>
            item.isRead === false ? { ...item, isRead: true } : item
          ),
        };
      }
    );
    // 透過 mutation hook 呼叫後端 API（自動 invalidate 快取）
    markAllReadMutation.mutate(undefined as never);
  }, [queryClient, markAllReadMutation]);

  // 錯誤狀態：API 載入失敗且沒有本地資料時顯示
  if (collectionQuery.error && collection.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ErrorState
          icon="cloud-offline-outline"
          message={language === 'zh-TW' ? '圖鑑載入失敗' : 'Failed to load collection'}
          detail={language === 'zh-TW' ? '請檢查網路連線後再試' : 'Please check your connection and try again'}
            onRetry={() => collectionQuery.refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  // React Query 尚未回傳時顯示 loading，避免閃現舊快取的錯誤數量
  if (collectionQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MibuBrand.brown} />
        </View>
      </SafeAreaView>
    );
  }

  if (collection.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <EmptyState
            icon="albums-outline"
            title={t.noCollection}
            description={t.startToCollect}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ========== 景點卡片渲染（搜尋結果 & 網格共用） ==========
  const renderPlaceCard = (item: GachaItemWithRead, idx: number, mode: 'list' | 'grid') => {
    const placeName = getPlaceName(item);
    const description = getDescription(item);
    const date = formatDate(item.collectedAt);
    const category = (typeof item.category === 'string' ? item.category : '').toLowerCase() || 'other';
    const catToken = getCategoryToken(category);
    const isUnread = item.isRead === false;
    const isMerchantPro = item.merchant?.isPro && item.merchant?.brandColor;
    const merchantScheme = isMerchantPro ? deriveMerchantScheme(item.merchant!.brandColor!) : null;
    const accentColor = merchantScheme ? merchantScheme.accent : catToken.stripe;

    if (mode === 'grid') {
      return (
        <TouchableOpacity
          key={`place-${item.id}-${idx}`}
          style={[styles.gridCard, { borderColor: isUnread ? accentColor : MibuBrand.tanLight }]}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.7}
        >
          {/* 分類色條 */}
          <View style={[styles.gridCardStripe, { backgroundColor: accentColor }]} />
          <View style={styles.gridCardBody}>
            {/* 未讀紅點 + 分類標籤 */}
            <View style={styles.gridCardTopRow}>
              {isUnread && (
                <View style={styles.unreadDot} />
              )}
              <View style={[styles.categoryBadge, { backgroundColor: catToken.badge }]}>
                <Text style={[styles.categoryBadgeText, { color: catToken.badgeText }]}>
                  {getCategoryLabel(category, language)}
                </Text>
              </View>
            </View>
            {/* 景點名稱 */}
            <Text style={styles.gridCardName} numberOfLines={2}>
              {placeName}
            </Text>
            {/* 描述 */}
            {description ? (
              <Text style={styles.gridCardDescription} numberOfLines={2}>
                {description}
              </Text>
            ) : null}
            {/* 地區 */}
            <Text style={styles.gridCardDistrict}>
              {item.districtDisplay || item.district || ''}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // mode === 'list'（搜尋結果用）
    return (
      <TouchableOpacity
        key={`search-${item.id}-${idx}`}
        style={[styles.listCard, { borderColor: isUnread ? accentColor : MibuBrand.tanLight }]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.listCardTopRow}>
          <Text style={styles.listCardDate}>{date}</Text>
          <View style={[styles.listCardBadge, { backgroundColor: catToken.badge }]}>
            <Text style={[styles.listCardBadgeText, { color: catToken.badgeText }]}>
              {getCategoryLabel(category, language)}
            </Text>
          </View>
        </View>
        <Text style={[styles.listCardName, { color: accentColor }]}>
          {placeName}
        </Text>
        {description ? (
          <Text style={styles.listCardDescription} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <Text style={styles.listCardCity}>
          {item.cityDisplay || item.city || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  // Level 2 景點網格模式：用 FlatList 獨立滾動，避免 VirtualizedList 嵌套
  const isGridMode = navLevel === 2 && currentCityData && !searchQuery.trim();

  // ========== 共用 UI 區塊（ScrollView / FlatList 共用）==========

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[MibuBrand.brown]}
      tintColor={MibuBrand.brown}
    />
  );

  // Header + 統計 + 搜尋框
  const headerBlock = (
    <>
      <View style={styles.headerTitleContainer}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerAccentBar} />
          <Text style={styles.headerTitle}>
            {language === 'zh-TW' ? '我的圖鑑' : 'My Collection'}
          </Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsItem}>
          <Text style={styles.statsNumberBrown}>{totalSpots}</Text>
          <Text style={styles.statsLabel}>
            {language === 'zh-TW' ? '已收集' : 'Collected'}
          </Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statsItem}>
          <Text style={styles.statsNumberCopper}>{uniqueCities}</Text>
          <Text style={styles.statsLabel}>
            {language === 'zh-TW' ? '城市' : 'Cities'}
          </Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statsItem}>
          <Text style={styles.statsNumberTan}>{uniqueCategories}</Text>
          <Text style={styles.statsLabel}>
            {language === 'zh-TW' ? '類別' : 'Categories'}
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={MibuBrand.brownLight} />
        <TextInput
          style={styles.searchInput}
          placeholder={language === 'zh-TW' ? '搜尋景點名稱...' : 'Search places...'}
          placeholderTextColor={MibuBrand.brownLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel={t.collection_clearSearch}>
            <Ionicons name="close-circle" size={18} color={MibuBrand.brownLight} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  // 麵包屑導航
  const breadcrumbBlock = (
    <View style={styles.breadcrumb}>
      <TouchableOpacity onPress={() => navigateBack(0)}>
        <Text style={navLevel === 0 ? styles.breadcrumbActive : styles.breadcrumbLink}>
          {language === 'zh-TW' ? '全部' : 'All'}
        </Text>
      </TouchableOpacity>
      {selectedCountry && groupedData[selectedCountry] && (
        <>
          <Ionicons name="chevron-forward" size={14} color={MibuBrand.brownLight} />
          <TouchableOpacity onPress={() => navigateBack(1)}>
            <Text style={navLevel === 1 ? styles.breadcrumbActive : styles.breadcrumbLink}>
              {groupedData[selectedCountry].displayName}
            </Text>
          </TouchableOpacity>
        </>
      )}
      {selectedCity && selectedCountry && groupedData[selectedCountry]?.cities[selectedCity] && (
        <>
          <Ionicons name="chevron-forward" size={14} color={MibuBrand.brownLight} />
          <Text style={styles.breadcrumbCurrent}>
            {groupedData[selectedCountry].cities[selectedCity].displayName}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>

    {/* ========== Level 2 景點網格：固定 header + FlatList 獨立滾動 ========== */}
    {isGridMode ? (
      <View style={styles.gridModeContainer}>
        {/* 固定區域：麵包屑 + 分類 Tab + 全部已讀 */}
        <View style={styles.gridFixedHeader}>
          {breadcrumbBlock}
          {/* 分類 Tab */}
          {currentCityData && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryTabScroll}
              contentContainerStyle={styles.categoryTabContent}
            >
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  {
                    backgroundColor: !activeCategoryTab ? MibuBrand.brown : MibuBrand.warmWhite,
                    borderColor: !activeCategoryTab ? MibuBrand.brown : MibuBrand.tanLight,
                  },
                ]}
                onPress={() => setActiveCategoryTab(null)}
              >
                <Text style={[
                  styles.categoryTabText,
                  { color: !activeCategoryTab ? UIColors.white : MibuBrand.brownDark },
                ]}>
                  {language === 'zh-TW' ? '全部' : 'All'} ({currentCityData.items.length})
                </Text>
              </TouchableOpacity>
              {currentCategories.map(cat => {
                const catToken = getCategoryToken(cat);
                const isActive = activeCategoryTab === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryTab,
                      {
                        backgroundColor: isActive ? catToken.stripe : MibuBrand.warmWhite,
                        borderColor: isActive ? catToken.stripe : MibuBrand.tanLight,
                      },
                    ]}
                    onPress={() => setActiveCategoryTab(cat)}
                  >
                    <Text style={[
                      styles.categoryTabText,
                      { color: isActive ? UIColors.white : MibuBrand.brownDark },
                    ]}>
                      {getCategoryLabel(cat, language)} ({currentCityData.byCategory[cat].length})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {/* 全部已讀按鈕 */}
          {currentCityData && currentCityData.unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllReadButton}
              onPress={handleMarkAllRead}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-done" size={16} color={MibuBrand.copper} />
              <Text style={styles.markAllReadText}>
                {language === 'zh-TW' ? '全部已讀' : 'Mark all read'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* 景點網格：獨立滾動區域 */}
        <FlatList
          style={styles.gridList}
          contentContainerStyle={styles.gridListContent}
          data={filteredPlaces}
          numColumns={2}
          renderItem={({ item, index }) => renderPlaceCard(item, index, 'grid')}
          keyExtractor={(item) => String(item.id || item.placeId)}
          columnWrapperStyle={styles.gridColumnWrapper}
          ItemSeparatorComponent={() => <View style={styles.gridRowSeparator} />}
          refreshControl={refreshControl}
          removeClippedSubviews={true}
          windowSize={8}
          maxToRenderPerBatch={6}
          initialNumToRender={6}
        />
      </View>
    ) : (

    /* ========== 非 Level 2：原本的 ScrollView ========== */
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={refreshControl}
    >
      {headerBlock}

      {searchQuery.trim() ? (
        /* ========== 搜尋結果 ========== */
        <>
          <Text style={styles.searchResultCount}>
            {language === 'zh-TW'
              ? `找到 ${searchResults.length} 個結果`
              : `${searchResults.length} results found`}
          </Text>
          {searchResults.length === 0 ? (
            <View style={styles.searchEmpty}>
              <Ionicons name="search-outline" size={48} color={MibuBrand.tanLight} />
              <Text style={styles.searchEmptyText}>
                {language === 'zh-TW' ? '找不到符合的景點' : 'No matching places'}
              </Text>
            </View>
          ) : (
            <View style={styles.searchResultList}>
              {searchResults.map((item, idx) => renderPlaceCard(item, idx, 'list'))}
            </View>
          )}
        </>
      ) : (
        /* ========== 麵包屑導航 + 分層內容 ========== */
        <>
          {breadcrumbBlock}

          {/* ===== Level 0：國家列表 ===== */}
          {navLevel === 0 && (
            <View style={styles.levelListContainer}>
              {Object.entries(groupedData)
                .sort((a, b) => b[1].totalItems - a[1].totalItems)
                .map(([countryKey, countryData]) => (
                  <TouchableOpacity
                    key={countryKey}
                    style={styles.levelCard}
                    onPress={() => navigateToCountry(countryKey)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.levelCardLeft}>
                      <View style={styles.levelIconWrapper}>
                        <View style={styles.countryIcon}>
                          <Ionicons name="flag" size={20} color={MibuBrand.brown} />
                        </View>
                        {countryData.unreadCount > 0 && (
                          <View style={styles.countryUnreadDot} />
                        )}
                      </View>
                      <View>
                        <Text style={styles.countryName}>
                          {countryData.displayName}
                        </Text>
                        <Text style={styles.countrySubtext}>
                          {countryData.totalItems} {t.spots} • {Object.keys(countryData.cities).length} {language === 'zh-TW' ? '城市' : 'cities'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={MibuBrand.brownLight} />
                  </TouchableOpacity>
                ))}
            </View>
          )}

          {/* ===== Level 1：城市列表 ===== */}
          {navLevel === 1 && selectedCountry && groupedData[selectedCountry] && (
            <View style={styles.levelListContainer}>
              {groupedData[selectedCountry].unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.markAllReadButtonLevel1}
                  onPress={handleMarkAllRead}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-done" size={16} color={MibuBrand.copper} />
                  <Text style={styles.markAllReadText}>
                    {language === 'zh-TW' ? '全部已讀' : 'Mark all read'}
                  </Text>
                </TouchableOpacity>
              )}
              {Object.entries(groupedData[selectedCountry].cities)
                .sort((a, b) => b[1].items.length - a[1].items.length)
                .map(([cityKey, cityData]) => (
                  <TouchableOpacity
                    key={cityKey}
                    style={styles.levelCard}
                    onPress={() => navigateToCity(cityKey)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.levelCardLeft}>
                      <View style={styles.levelIconWrapper}>
                        <View style={styles.cityIcon}>
                          <Text style={styles.cityInitial}>
                            {cityData.displayName.charAt(0)}
                          </Text>
                        </View>
                        {cityData.unreadCount > 0 && (
                          <View style={styles.cityUnreadDot} />
                        )}
                      </View>
                      <View>
                        <Text style={styles.cityName}>
                          {cityData.displayName}
                        </Text>
                        <Text style={styles.citySubtext}>
                          {cityData.items.length} {t.spots} • {Object.keys(cityData.byCategory).length} {language === 'zh-TW' ? '類別' : 'categories'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={MibuBrand.brownLight} />
                  </TouchableOpacity>
                ))}
            </View>
          )}

        </>
      )}
    </ScrollView>
    )}

      {selectedItem && (
        <PlaceDetailModal
          item={selectedItem}
          language={language}
          onClose={() => setSelectedItem(null)}
          onFavorite={handleFavorite}
          onBlacklist={handleBlacklist}
        />
      )}
    </SafeAreaView>
  );
}
