/**
 * ItineraryScreenV2 - 行程規劃畫面 V2
 *
 * 功能：
 * - 主畫面：AI 對話式規劃（核心體驗）
 * - 左側抽屜：行程列表切換
 * - 右側抽屜：行程詳情揭曉（WOW 時刻）
 * - 建立新行程（選擇國家、地區、日期）
 * - AI 智能推薦景點
 * - 手動新增/移除景點
 * - 景點導航功能
 *
 * 設計理念：
 * - 主畫面：純 AI 對話（像跟朋友聊天）
 * - 右側邊欄：行程揭曉（WOW 時刻）
 * - 左側邊欄：行程列表切換
 *
 * 串接 API：
 * - itineraryApi.getItineraries() - 取得行程列表
 * - itineraryApi.getItinerary() - 取得行程詳情
 * - itineraryApi.createItinerary() - 建立行程
 * - itineraryApi.deleteItinerary() - 刪除行程
 * - itineraryApi.addPlacesToItinerary() - 新增景點
 * - itineraryApi.removePlaceFromItinerary() - 移除景點
 * - itineraryApi.aiChat() - AI 對話
 * - locationApi.getCountries/Regions - 取得地區資料
 *
 * UI 特色：
 * - Mibu 品牌風格：溫暖、療癒、大地色調
 * - 滑動抽屜動畫
 * - 打字機效果（AI 回覆）
 *
 * 拆分模組：
 * - ItineraryScreenV2.styles.ts：StyleSheet（1,134 行）
 * - TypewriterText.tsx：打字機效果元件
 * - itineraryHelpers.ts：輔助函數（座標/名稱/分類/導航）
 *
 * 更新日期：2026-02-10（拆分 StyleSheet、輔助函數、TypewriterText）
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  Modal,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Image as ExpoImage } from 'expo-image';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
// Calendar 已移至 CreateItineraryModal
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useI18n } from '../../../context/AppContext';
import { tFormat } from '../../../utils/i18n';
import { itineraryApi } from '../../../services/itineraryApi';
// locationApi, preloadService 已移至 CreateItineraryModal
import { MibuBrand, getCategoryToken } from '../../../../constants/Colors';
import { Spacing } from '../../../theme/designTokens';
import {
  Itinerary,
  ItinerarySummary,
  ItineraryPlaceItem,
  AiChatMessage,
  AiSuggestedPlace,
  AiChatContext,
  AvailablePlacesByCategory,
} from '../../../types/itinerary';
// 拆分模組
import styles, { DRAWER_WIDTH } from './ItineraryScreenV2.styles';
import TypewriterText from './TypewriterText';
import {
  openInGoogleMaps,
  getPlaceCoords,
  getPlaceDescription,
  getPlaceName,
  getPlaceCategory,
  MINI_AVATAR_URL,
} from './itineraryHelpers';
// Phase 2A 抽離的子元件
import { CreateItineraryModal } from './CreateItineraryModal';
import { AddPlacesModal } from './AddPlacesModal';

// 常數、TypewriterText、輔助函數已拆至獨立檔案
// → ItineraryScreenV2.styles.ts / TypewriterText.tsx / itineraryHelpers.ts
// → CreateItineraryModal.tsx / AddPlacesModal.tsx

export function ItineraryScreenV2() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, getToken, user } = useAuth();
  const { t, language } = useI18n();

  // ===== 狀態管理 =====
  const [loading, setLoading] = useState(true);
  const [itineraries, setItineraries] = useState<ItinerarySummary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [activeItineraryId, setActiveItineraryId] = useState<number | null>(null);

  // AI 對話狀態
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState<AiChatContext | undefined>(undefined);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestedPlace[]>([]);
  // 打字機效果：正在打字的訊息索引（-1 表示沒有）
  const [typingMessageIndex, setTypingMessageIndex] = useState<number>(-1);

  // Drawer 狀態
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  // 【截圖 36 修復】防止動畫中重複觸發
  const drawerAnimating = useRef(false);

  // 【截圖 9-15 #2】行程列表多選刪除狀態
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItineraryIds, setSelectedItineraryIds] = useState<number[]>([]);

  // 【截圖 9-15 #5】預先載入快取
  const itineraryCache = useRef<Record<number, Itinerary>>({});
  const collectionCacheRef = useRef<AvailablePlacesByCategory[] | null>(null);
  // 【預防卡住】追踪當前正在載入的行程 ID，避免快速切換時的狀態錯亂
  const loadingItineraryIdRef = useRef<number | null>(null);

  // 【截圖 9】使用說明 Tooltip 狀態（淡入淡出）
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const helpTooltipOpacity = useRef(new Animated.Value(0)).current;

  // 【截圖 9-15 #8 #11】Toast 通知狀態（淡入淡出 3 秒）
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  // 【預防卡住】Timer refs 用於清理 setTimeout
  // 使用 ReturnType<typeof setTimeout> 避免 Node.js 與瀏覽器環境型別衝突
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const helpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 從圖鑑加入景點 Modal 狀態（UI 邏輯已抽至 AddPlacesModal）
  const [addPlacesModalVisible, setAddPlacesModalVisible] = useState(false);

  // 建立行程 Modal 狀態（表單邏輯已抽至 CreateItineraryModal）
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // 【截圖 9-15 #12】編輯標題狀態
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const savingTitleRef = useRef(false); // 使用 ref 防止重複保存（同步更新）

  // 動畫值
  const leftDrawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const rightDrawerAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const chatScrollRef = useRef<ScrollView>(null);

  // ===== 共用函數 =====

  /**
   * 【截圖 9-15 #8 #11】顯示 Toast 通知（淡入淡出，持續 3 秒）
   * 用於加入景點成功、刪除景點等操作回饋
   * 不使用 icon，純文字
   * 【預防卡住】正確清理 timer 避免記憶體洩漏
   */
  const showToastMessage = useCallback((message: string) => {
    // 清理之前的 timer
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    // 停止之前的動畫
    toastOpacity.stopAnimation();

    setToastMessage(message);
    setShowToast(true);
    // 重置動畫值
    toastOpacity.setValue(0);
    // 淡入
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // 持續 3 秒後淡出
      toastTimerRef.current = setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 3000);
    });
  }, [toastOpacity]);

  // ===== API 呼叫 =====

  // 載入行程列表
  const fetchItineraries = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const res = await itineraryApi.getItineraries(token);
      if (res.success) {
        setItineraries(res.itineraries);
        // 如果有行程且沒有選中的，選第一個
        if (res.itineraries.length > 0 && !activeItineraryId) {
          setActiveItineraryId(res.itineraries[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch itineraries:', error);
      Alert.alert(t.itinerary_createFailed, t.itinerary_tryAgainLater);
    }
  }, [getToken, activeItineraryId]);

  /**
   * 【截圖 9-15 #13】保存對話記錄到本地
   */
  const saveMessages = useCallback(async (itineraryId: number, msgs: AiChatMessage[]) => {
    try {
      const key = `@itinerary_messages_${itineraryId}`;
      await AsyncStorage.setItem(key, JSON.stringify(msgs));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }, []);

  /**
   * 【截圖 9-15 #13】從本地載入對話記錄
   */
  const loadMessages = useCallback(async (itineraryId: number): Promise<AiChatMessage[]> => {
    try {
      const key = `@itinerary_messages_${itineraryId}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
    return [];
  }, []);

  // 載入行程詳情
  // 【截圖 36 修復】同時更新快取，確保資料一致性
  // 【預防卡住】檢查載入的 ID 是否仍是當前想要的，避免快速切換時狀態錯亂
  const fetchItineraryDetail = useCallback(async (id: number, isBackgroundUpdate = false) => {
    const token = await getToken();
    if (!token) return;

    // 標記正在載入的 ID
    if (!isBackgroundUpdate) {
      loadingItineraryIdRef.current = id;
    }

    try {
      const res = await itineraryApi.getItinerary(id, token);

      // 【預防卡住】如果用戶已切換到其他行程，忽略這次結果
      if (!isBackgroundUpdate && loadingItineraryIdRef.current !== id) {
        // 過期的請求結果，忽略
        return;
      }

      if (res.success) {
        // 【預防卡住】再次檢查是否是當前行程
        if (!isBackgroundUpdate && loadingItineraryIdRef.current !== id) return;

        setCurrentItinerary(res.itinerary);
        // 【截圖 36 修復】更新快取
        itineraryCache.current[id] = res.itinerary;

        // 【截圖 9-15 #13】載入已保存的對話記錄
        const savedMessages = await loadMessages(id);
        if (savedMessages.length > 0) {
          setMessages(savedMessages);
        } else {
          // 初始化 AI 歡迎訊息
          const city = res.itinerary.city || res.itinerary.country || t.itinerary_hereLocation;
          const welcomeMessage: AiChatMessage = {
            role: 'assistant',
            content: tFormat(t.itinerary_aiWelcome, { city }),
          };
          setMessages([welcomeMessage]);
          // 保存歡迎訊息
          saveMessages(id, [welcomeMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch itinerary detail:', error);
      Alert.alert(t.itinerary_createFailed, t.itinerary_tryAgainLater);
    }
  }, [getToken, loadMessages, saveMessages]);

  // 發送 AI 訊息
  const sendAiMessage = useCallback(async () => {
    if (!currentItinerary || !inputText.trim()) return;
    const token = await getToken();
    if (!token) return;

    Keyboard.dismiss();
    const userMessage: AiChatMessage = { role: 'user', content: inputText.trim() };
    // 【截圖 9-15 #13】保存用戶訊息
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      saveMessages(currentItinerary.id, newMessages);
      return newMessages;
    });
    setInputText('');
    setAiLoading(true);

    try {
      // v2.3.0: 組裝 lastSuggestedPlaces（從上一輪的 aiSuggestions 轉換）
      const lastSuggestedPlaces = aiSuggestions.length > 0
        ? aiSuggestions.map(s => ({
            collectionId: s.collectionId,
            placeName: s.placeName || s.name || '',
          }))
        : undefined;

      const res = await itineraryApi.aiChat(
        currentItinerary.id,
        {
          message: userMessage.content,
          context: {
            currentFilters: aiContext?.currentFilters,
            excludedPlaces: aiContext?.excludedPlaces,
            // v2.2.0: 傳送用戶偏好（未來可從本地統計取得）
            userPreferences: aiContext?.userPreferences,
            // v2.3.0: 傳遞上一輪推薦，讓 AI 可以理解「好啊」等確認回覆
            lastSuggestedPlaces,
          },
        },
        token
      );

      if (res.success) {
        // v2.2.0: 根據 actionTaken 顯示操作結果
        let responseText = res.response;
        if (res.actionTaken?.type === 'add_place') {
          responseText += '\n\n✅ ' + t.itinerary_addedToItinerary;
        } else if (res.actionTaken?.type === 'remove_place') {
          responseText += '\n\n✅ ' + t.itinerary_removedFromItinerary;
        }

        const assistantMessage: AiChatMessage = { role: 'assistant', content: responseText };
        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          // 【截圖 9-15 #13】保存對話記錄
          saveMessages(currentItinerary.id, newMessages);
          // 觸發打字機效果（設定為新訊息的索引）
          setTypingMessageIndex(newMessages.length - 1);
          return newMessages;
        });

        // v2.2.0: 根據 detectedIntent 決定是否顯示推薦
        // chitchat 和 unsupported 不顯示推薦卡片
        const shouldShowSuggestions = res.detectedIntent !== 'chitchat' && res.detectedIntent !== 'unsupported';

        setAiSuggestions(shouldShowSuggestions ? (res.suggestions || []) : []);

        // 保存篩選條件
        if (res.extractedFilters) {
          setAiContext(prev => ({
            ...prev,
            currentFilters: res.extractedFilters,
          }));
        }

        // 行程有更新時重新載入（含 AI 自動操作）
        if (res.itineraryUpdated) {
          await fetchItineraryDetail(currentItinerary.id);
        }

        // 滾動到底部
        setTimeout(() => {
          chatScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: t.itinerary_aiUnavailable
      }]);
    } finally {
      setAiLoading(false);
    }
  }, [currentItinerary, inputText, getToken, aiContext, aiSuggestions, fetchItineraryDetail, t]);

  // 【截圖 9-15 #11】移除景點 - 不使用彈窗確認，直接移除並顯示 Toast
  const handleRemovePlace = useCallback(async (itemId: number, placeName?: string) => {
    if (!currentItinerary) return;
    const token = await getToken();
    if (!token) return;

    try {
      const res = await itineraryApi.removePlace(currentItinerary.id, itemId, token);
      if (res.success) {
        await fetchItineraryDetail(currentItinerary.id);
        // 顯示 Toast 通知
        showToastMessage(tFormat(t.itinerary_removed, { name: placeName || '' }));
      }
    } catch (error) {
      console.error('Remove place error:', error);
      showToastMessage(t.itinerary_removeFailed);
    }
  }, [currentItinerary, getToken, fetchItineraryDetail, t, showToastMessage]);

  /**
   * 關閉左側 Drawer
   * 【截圖 36 修復】改用 timing 動畫，並在動畫完成後才設置狀態
   * 【修復】移除 leftDrawerOpen 狀態檢查，避免閉包問題導致無法關閉
   * 【修正】提前定義，避免 handleSelectItinerary 在宣告前引用
   */
  const closeLeftDrawer = useCallback(() => {
    // 防止動畫中重複觸發
    if (drawerAnimating.current) return;
    drawerAnimating.current = true;

    // 停止進行中的動畫
    leftDrawerAnim.stopAnimation();
    overlayAnim.stopAnimation();
    Animated.parallel([
      Animated.timing(leftDrawerAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 動畫完成後設置狀態
      setLeftDrawerOpen(false);
      drawerAnimating.current = false;
    });
  }, [leftDrawerAnim, overlayAnim]);

  // 【截圖 9-15 #5 #13】【截圖 36 修復】切換行程 - 使用快取但同時背景更新
  const handleSelectItinerary = useCallback(async (id: number) => {
    setActiveItineraryId(id);
    setAiContext(undefined);
    setAiSuggestions([]);

    // 【截圖 36 修復】快取僅用於快速顯示，同時在背景載入最新資料
    const cached = itineraryCache.current[id];
    if (cached && cached.places && cached.places.length > 0) {
      // 有有效快取：先顯示快取，再背景更新
      setCurrentItinerary(cached);
      // 載入保存的對話記錄
      const savedMessages = await loadMessages(id);
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        const city = cached.city || cached.country || t.itinerary_hereLocation;
        const welcomeMessage: AiChatMessage = {
          role: 'assistant',
          content: tFormat(t.itinerary_aiWelcome, { city }),
        };
        setMessages([welcomeMessage]);
        saveMessages(id, [welcomeMessage]);
      }
      // 背景更新（不 await，不阻塞 UI）
      // 【預防卡住】標記為背景更新，不會影響狀態檢查
      fetchItineraryDetail(id, true);
    } else {
      // 沒有有效快取時正常載入
      await fetchItineraryDetail(id, false);
    }
    closeLeftDrawer();
  }, [fetchItineraryDetail, loadMessages, saveMessages, closeLeftDrawer]);

  // 開啟「從圖鑑加入」Modal（UI 邏輯已抽至 AddPlacesModal）
  const openAddPlacesModal = useCallback(() => {
    if (!currentItinerary) return;
    setAddPlacesModalVisible(true);
  }, [currentItinerary]);

  /** AddPlacesModal 確認回調：重新載入行程詳情 */
  const handleAddPlacesConfirmed = useCallback(async () => {
    if (currentItinerary) {
      await fetchItineraryDetail(currentItinerary.id);
    }
  }, [currentItinerary, fetchItineraryDetail]);

  // 移動景點（上/下）
  // 【預防卡住】失敗時直接還原本地狀態，不重新載入整個行程
  const handleMovePlace = useCallback(async (itemId: number, direction: 'up' | 'down') => {
    if (!currentItinerary) return;
    const token = await getToken();
    if (!token) return;

    const oldPlaces = currentItinerary.places;
    const currentIndex = oldPlaces.findIndex(p => p.id === itemId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= oldPlaces.length) return;

    // 重新排序陣列
    const newPlaces = [...oldPlaces];
    const [movedItem] = newPlaces.splice(currentIndex, 1);
    newPlaces.splice(newIndex, 0, movedItem);

    // 樂觀更新 UI
    setCurrentItinerary(prev => prev ? { ...prev, places: newPlaces } : null);

    // 呼叫 API
    try {
      const itemIds = newPlaces.map(p => p.id);
      const res = await itineraryApi.reorderPlaces(currentItinerary.id, { itemIds }, token);
      if (!res.success) {
        // 【預防卡住】失敗時直接還原本地狀態
        setCurrentItinerary(prev => prev ? { ...prev, places: oldPlaces } : null);
      } else {
        // 更新快取
        if (itineraryCache.current[currentItinerary.id]) {
          itineraryCache.current[currentItinerary.id] = {
            ...itineraryCache.current[currentItinerary.id],
            places: newPlaces,
          };
        }
      }
    } catch (error) {
      console.error('Reorder error:', error);
      // 【預防卡住】失敗時直接還原本地狀態
      setCurrentItinerary(prev => prev ? { ...prev, places: oldPlaces } : null);
    }
  }, [currentItinerary, getToken]);

  // 【截圖 9-15 #9】拖曳重新排序
  // 【預防卡住】失敗時直接還原本地狀態，不重新載入整個行程
  const handleDragReorder = useCallback(async (newPlaces: ItineraryPlaceItem[]) => {
    if (!currentItinerary) return;
    const token = await getToken();
    if (!token) return;

    // 檢查順序是否有變化
    const oldPlaces = currentItinerary.places;
    const oldIds = oldPlaces.map(p => p.id);
    const newIds = newPlaces.map(p => p.id);
    if (JSON.stringify(oldIds) === JSON.stringify(newIds)) {
      return; // 順序沒變，不需要更新
    }

    // 樂觀更新 UI
    setCurrentItinerary(prev => prev ? { ...prev, places: newPlaces } : null);

    // 呼叫 API
    try {
      const itemIds = newPlaces.map(p => p.id);
      const res = await itineraryApi.reorderPlaces(currentItinerary.id, { itemIds }, token);
      if (!res.success) {
        // 【預防卡住】失敗時直接還原本地狀態，不發起新的網路請求
        setCurrentItinerary(prev => prev ? { ...prev, places: oldPlaces } : null);
        showToastMessage(t.itinerary_reorderFailed);
      } else {
        // 更新快取
        if (itineraryCache.current[currentItinerary.id]) {
          itineraryCache.current[currentItinerary.id] = {
            ...itineraryCache.current[currentItinerary.id],
            places: newPlaces,
          };
        }
        // 用戶操作不跳通知
      }
    } catch (error) {
      console.error('Drag reorder error:', error);
      // 【預防卡住】失敗時直接還原本地狀態
      setCurrentItinerary(prev => prev ? { ...prev, places: oldPlaces } : null);
      showToastMessage(t.itinerary_reorderFailed);
    }
  }, [currentItinerary, getToken, t, showToastMessage]);

  // 開啟建立行程 Modal（表單邏輯已抽至 CreateItineraryModal）
  const openCreateModal = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  /** CreateItineraryModal 建立成功回調 */
  const handleItineraryCreated = useCallback(async (newItin: Itinerary) => {
    await fetchItineraries();
    // 切換到新建立的行程
    setActiveItineraryId(newItin.id);
    setCurrentItinerary(newItin);
    setMessages([]);
    setAiContext(undefined);
    setAiSuggestions([]);
    // 延遲關閉抽屜，等 Modal 完全關閉後再執行
    setTimeout(() => {
      drawerAnimating.current = false;
      Animated.parallel([
        Animated.timing(leftDrawerAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setLeftDrawerOpen(false);
      });
    }, 100);
  }, [fetchItineraries, leftDrawerAnim, overlayAnim]);

  /**
   * 【截圖 9-15 #12】保存行程標題
   * 使用 ref 防止 onBlur + onSubmitEditing 重複觸發（ref 是同步更新）
   * 使用樂觀更新確保 UI 立即反映變更
   */
  const handleSaveTitle = useCallback(async () => {
    // 使用 ref 檢查是否正在保存（同步，不會有閉包問題）
    if (savingTitleRef.current) return;

    if (!currentItinerary || !titleInput.trim()) {
      setEditingTitle(false);
      return;
    }

    // 標題沒有變化則不需要保存
    const newTitle = titleInput.trim();
    if (newTitle === currentItinerary.title) {
      setEditingTitle(false);
      return;
    }

    const token = await getToken();
    if (!token) return;

    const itineraryId = currentItinerary.id;
    const oldTitle = currentItinerary.title;

    // 立即標記為保存中（同步）
    savingTitleRef.current = true;

    // 【關鍵修復】樂觀更新：先更新 UI，再呼叫 API
    // 這樣當 editingTitle 變成 false 時，UI 會立即顯示新標題
    setCurrentItinerary(prev => prev ? { ...prev, title: newTitle } : null);
    setItineraries(prev =>
      prev.map(item =>
        item.id === itineraryId
          ? { ...item, title: newTitle }
          : item
      )
    );
    if (itineraryCache.current[itineraryId]) {
      itineraryCache.current[itineraryId] = {
        ...itineraryCache.current[itineraryId],
        title: newTitle,
      };
    }

    // 關閉編輯模式（此時 UI 已顯示新標題）
    setEditingTitle(false);

    try {
      const res = await itineraryApi.updateItinerary(
        itineraryId,
        { title: newTitle },
        token
      );
      if (!res.success) {
        // API 失敗，回滾到舊標題
        setCurrentItinerary(prev => prev ? { ...prev, title: oldTitle } : null);
        setItineraries(prev =>
          prev.map(item =>
            item.id === itineraryId
              ? { ...item, title: oldTitle }
              : item
          )
        );
        if (itineraryCache.current[itineraryId]) {
          itineraryCache.current[itineraryId] = {
            ...itineraryCache.current[itineraryId],
            title: oldTitle,
          };
        }
        showToastMessage(t.itinerary_updateFailed);
      }
    } catch (error) {
      console.error('Update title error:', error);
      // API 錯誤，回滾到舊標題
      setCurrentItinerary(prev => prev ? { ...prev, title: oldTitle } : null);
      setItineraries(prev =>
        prev.map(item =>
          item.id === itineraryId
            ? { ...item, title: oldTitle }
            : item
        )
      );
      if (itineraryCache.current[itineraryId]) {
        itineraryCache.current[itineraryId] = {
          ...itineraryCache.current[itineraryId],
          title: oldTitle,
        };
      }
      showToastMessage(t.itinerary_updateFailed);
    } finally {
      savingTitleRef.current = false;
    }
  }, [currentItinerary, titleInput, getToken, t, showToastMessage]);

  /**
   * 【截圖 9-15 #12】開始編輯標題
   */
  const startEditingTitle = useCallback(() => {
    if (currentItinerary) {
      setTitleInput(currentItinerary.title || '');
      setEditingTitle(true);
    }
  }, [currentItinerary]);

  /**
   * 【截圖 9-15 #2】切換行程選擇
   */
  const toggleItinerarySelection = useCallback((id: number) => {
    setSelectedItineraryIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  /**
   * 【截圖 9-15 #2】批量刪除選中的行程
   */
  const handleDeleteSelectedItineraries = useCallback(async () => {
    if (selectedItineraryIds.length === 0) return;

    Alert.alert(
      t.itinerary_deleteItineraries,
      tFormat(t.itinerary_deleteItinerariesConfirm, { count: selectedItineraryIds.length }),
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.common_delete,
          style: 'destructive',
          onPress: async () => {
            const token = await getToken();
            if (!token) return;

            try {
              // 逐一刪除
              for (const id of selectedItineraryIds) {
                await itineraryApi.deleteItinerary(id, token);
              }

              // 重新載入列表
              const listRes = await itineraryApi.getItineraries(token);
              if (listRes.success) {
                setItineraries(listRes.itineraries);
                // 如果刪除的包含當前行程，切換到第一個
                if (selectedItineraryIds.includes(activeItineraryId!)) {
                  if (listRes.itineraries.length > 0) {
                    setActiveItineraryId(listRes.itineraries[0].id);
                    await fetchItineraryDetail(listRes.itineraries[0].id);
                  } else {
                    setActiveItineraryId(null);
                    setCurrentItinerary(null);
                  }
                }
              }

              // 退出選擇模式
              setSelectMode(false);
              setSelectedItineraryIds([]);
              showToastMessage(tFormat(t.itinerary_deleted, { count: selectedItineraryIds.length }));
            } catch (error) {
              console.error('Delete itineraries error:', error);
              showToastMessage(t.itinerary_deleteFailed);
            }
          },
        },
      ]
    );
  }, [selectedItineraryIds, getToken, activeItineraryId, fetchItineraryDetail, t, showToastMessage]);

  // 刪除單一行程（非選擇模式時使用）
  const handleDeleteItinerary = useCallback(async (id: number) => {
    Alert.alert(
      t.itinerary_deleteItinerary,
      t.itinerary_deleteItineraryConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.common_delete,
          style: 'destructive',
          onPress: async () => {
            const token = await getToken();
            if (!token) return;

            try {
              const res = await itineraryApi.deleteItinerary(id, token);
              if (res.success) {
                // 重新載入列表
                const listRes = await itineraryApi.getItineraries(token);
                if (listRes.success) {
                  setItineraries(listRes.itineraries);
                  // 如果刪除的是當前行程，切換到第一個
                  if (id === activeItineraryId) {
                    if (listRes.itineraries.length > 0) {
                      setActiveItineraryId(listRes.itineraries[0].id);
                      await fetchItineraryDetail(listRes.itineraries[0].id);
                    } else {
                      setActiveItineraryId(null);
                      setCurrentItinerary(null);
                    }
                  }
                }
                showToastMessage(t.itinerary_deletedSingle);
              }
            } catch (error) {
              console.error('Delete itinerary error:', error);
            }
          },
        },
      ]
    );
  }, [getToken, activeItineraryId, fetchItineraryDetail, t, showToastMessage]);

  // 初始載入
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchItineraries();
      setLoading(false);
    };

    if (isAuthenticated) {
      init();
    }
  }, [isAuthenticated, fetchItineraries]);

  // 載入選中的行程詳情
  useEffect(() => {
    if (activeItineraryId) {
      fetchItineraryDetail(activeItineraryId);
    }
  }, [activeItineraryId, fetchItineraryDetail]);

  // 【預防卡住】組件卸載時清理所有 timers，避免記憶體洩漏
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      if (helpTimerRef.current) {
        clearTimeout(helpTimerRef.current);
        helpTimerRef.current = null;
      }
      if (keyboardScrollTimerRef.current) {
        clearTimeout(keyboardScrollTimerRef.current);
        keyboardScrollTimerRef.current = null;
      }
    };
  }, []);

  // 鍵盤顯示時自動滾動聊天區域到底部，避免訊息被擋住
  useEffect(() => {
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardDidShowListener = Keyboard.addListener(keyboardShowEvent, () => {
      setKeyboardVisible(true);
      keyboardScrollTimerRef.current = setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener(keyboardHideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  /**
   * 【截圖 9】顯示使用說明 Tooltip（淡入淡出，持續 3 秒）
   * 【預防卡住】正確清理 timer 避免記憶體洩漏
   */
  /** 儲存 Mini 頭像到相簿 */
  const saveAvatarToGallery = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要權限', '請允許存取相簿以儲存圖片');
        return;
      }
      const fileUri = FileSystem.cacheDirectory + 'mini-avatar.png';
      await FileSystem.downloadAsync(MINI_AVATAR_URL, fileUri);
      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('儲存成功', 'Mini 的頭像已儲存到相簿');
    } catch (error) {
      console.error('[ItineraryScreen] saveAvatar error:', error);
      Alert.alert('儲存失敗', '請稍後再試');
    }
  }, []);

  const showHelpInfo = useCallback(() => {
    // 清理之前的 timer
    if (helpTimerRef.current) {
      clearTimeout(helpTimerRef.current);
      helpTimerRef.current = null;
    }
    // 停止之前的動畫
    helpTooltipOpacity.stopAnimation();

    setShowHelpTooltip(true);
    // 重置動畫值
    helpTooltipOpacity.setValue(0);
    // 淡入
    Animated.timing(helpTooltipOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // 持續 3 秒後淡出
      helpTimerRef.current = setTimeout(() => {
        Animated.timing(helpTooltipOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowHelpTooltip(false));
      }, 3000);
    });
  }, [helpTooltipOpacity]);

  // ===== Drawer 控制 =====
  // 【截圖 0 修復】連續開關會卡住的問題
  // 問題：快速連續點擊開關按鈕時，drawer 會卡在中間位置
  // 原因：前一個動畫還在執行時，新動畫就啟動，造成狀態不一致
  // 解法：
  //   1. 在啟動新動畫前，先呼叫 stopAnimation() 停止進行中的動畫
  //   2. 立即設定 state（不要等動畫完成才設定）
  //   3. 兩個 drawer 共用一個 overlayAnim，所以開/關時都要停止它

  /**
   * 【截圖 9-15 #5】預先載入所有行程詳情
   * 在開啟左側抽屜時背景載入，提升切換行程時的體驗
   */
  const preloadItineraries = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    // 背景載入所有行程詳情
    for (const item of itineraries) {
      if (!itineraryCache.current[item.id]) {
        try {
          const res = await itineraryApi.getItinerary(item.id, token);
          if (res.success) {
            itineraryCache.current[item.id] = res.itinerary;
          }
        } catch (error) {
          console.error(`Failed to preload itinerary ${item.id}:`, error);
        }
      }
    }
  }, [getToken, itineraries]);

  /**
   * 【截圖 9-15 #5】預先載入該城市的圖鑑內容
   * 在開啟右側抽屜時背景載入，提升從圖鑑加入景點時的體驗
   */
  const preloadCollection = useCallback(async () => {
    if (!currentItinerary || collectionCacheRef.current) return;
    const token = await getToken();
    if (!token) return;

    try {
      const res = await itineraryApi.getAvailablePlaces(currentItinerary.id, token);
      if (res.success) {
        collectionCacheRef.current = res.categories;
      }
    } catch (error) {
      console.error('Failed to preload collection:', error);
    }
  }, [currentItinerary, getToken]);

  /**
   * 開啟左側 Drawer（行程列表）
   * 【截圖 36 修復】改用 timing 動畫避免 spring 卡住 + 防抖機制
   * 【修復】改用 useCallback 避免閉包問題
   */
  const openLeftDrawer = useCallback(() => {
    // 【截圖 36 修復】防止動畫中重複觸發
    if (drawerAnimating.current || leftDrawerOpen) return;
    drawerAnimating.current = true;

    // 停止進行中的動畫，避免動畫衝突
    leftDrawerAnim.stopAnimation();
    overlayAnim.stopAnimation();
    // 立即設定狀態，不等動畫完成
    setLeftDrawerOpen(true);
    // 【截圖 9-15 #5】背景預先載入所有行程詳情
    preloadItineraries();
    Animated.parallel([
      Animated.timing(leftDrawerAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      drawerAnimating.current = false;
    });
  }, [leftDrawerOpen, leftDrawerAnim, overlayAnim, preloadItineraries]);

  /**
   * 開啟右側 Drawer（景點列表）
   * 【截圖 36 修復】改用 timing 動畫避免 spring 卡住 + 防抖機制
   * 【修復】改用 useCallback 避免閉包問題
   */
  const openRightDrawer = useCallback(() => {
    // 【截圖 36 修復】防止動畫中重複觸發
    if (drawerAnimating.current || rightDrawerOpen) return;
    drawerAnimating.current = true;

    // 停止進行中的動畫
    rightDrawerAnim.stopAnimation();
    overlayAnim.stopAnimation();
    setRightDrawerOpen(true);
    // 【截圖 9-15 #5】背景預先載入該城市的圖鑑內容
    preloadCollection();
    Animated.parallel([
      Animated.timing(rightDrawerAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      drawerAnimating.current = false;
    });
  }, [rightDrawerOpen, rightDrawerAnim, overlayAnim, preloadCollection]);

  /**
   * 關閉右側 Drawer
   * 【截圖 36 修復】改用 timing 動畫，並在動畫完成後才設置狀態 + 防抖機制
   * 【修復】移除 rightDrawerOpen 狀態檢查，避免閉包問題導致無法關閉
   */
  const closeRightDrawer = useCallback(() => {
    // 防止動畫中重複觸發
    if (drawerAnimating.current) return;
    drawerAnimating.current = true;

    // 停止進行中的動畫
    rightDrawerAnim.stopAnimation();
    overlayAnim.stopAnimation();
    Animated.parallel([
      Animated.timing(rightDrawerAnim, {
        toValue: DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 動畫完成後設置狀態
      setRightDrawerOpen(false);
      drawerAnimating.current = false;
    });
  }, [rightDrawerAnim, overlayAnim]);

  // ===== 未登入 / 訪客狀態 =====
  if (!isAuthenticated || user?.provider === 'guest') {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="airplane-outline" size={64} color={MibuBrand.tanLight} />
        <Text style={styles.emptyTitle}>{t.itinerary_loginRequired}</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>{t.login}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===== 載入中 =====
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  // ===== 無行程狀態 =====
  // 注意：Modal 在下方的 renderCreateModal 統一渲染，這裡只渲染空狀態 UI
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* 主視覺區 */}
      <View style={styles.emptyIconCircle}>
        <Ionicons name="map-outline" size={48} color={MibuBrand.brown} />
      </View>
      <Text style={styles.emptyTitle}>{t.itinerary_noItineraries}</Text>
      <Text style={styles.emptySubtitle}>
        {t.itinerary_noItinerariesDesc}
      </Text>

      {/* 建立按鈕 */}
      <TouchableOpacity
        style={styles.emptyCreateButton}
        onPress={openCreateModal}
        activeOpacity={0.8}
        accessibilityLabel={t.itinerary_createFirst}
      >
        <Ionicons name="add-circle-outline" size={24} color={MibuBrand.warmWhite} />
        <Text style={styles.emptyCreateButtonText}>
          {t.itinerary_createFirst}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ===== 主畫面：AI 對話 =====
  // 【截圖 9-15 #3 #4】修復輸入框被底部導航欄和鍵盤擋住的問題
  // - iOS 使用 padding behavior，offset 設定為底部 Tab 高度（約 80）
  // - Android 使用 height behavior
  const renderMainContent = () => (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      {/* Header（insets.top 處理頂部安全區，獨立 tab 時需要） */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity
          onPress={openLeftDrawer}
          style={styles.headerIconButton}
          activeOpacity={0.7}
          accessibilityLabel={t.itinerary_openList}
        >
          <Ionicons name="menu-outline" size={26} color={MibuBrand.brown} />
        </TouchableOpacity>

        {/* 【截圖 9-15 #12】標題可編輯 */}
        <TouchableOpacity
          style={styles.headerCenter}
          onPress={startEditingTitle}
          activeOpacity={0.7}
        >
          {editingTitle ? (
            <View style={styles.titleEditContainer}>
              <TextInput
                style={styles.titleEditInput}
                value={titleInput}
                onChangeText={setTitleInput}
                onBlur={handleSaveTitle}
                onSubmitEditing={handleSaveTitle}
                autoFocus
                selectTextOnFocus
                returnKeyType="done"
              />
            </View>
          ) : (
            <>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerTitle}>
                  {currentItinerary?.title || t.itinerary_tripAssistant}
                </Text>
                <Ionicons name="pencil-outline" size={14} color={MibuBrand.copper} style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.headerSubtitle}>
                {currentItinerary?.city || currentItinerary?.country || ''}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openRightDrawer}
          style={styles.headerIconButton}
          activeOpacity={0.7}
          accessibilityLabel={t.itinerary_viewDetails}
        >
          <View style={styles.itineraryBadge}>
            <Text style={styles.itineraryBadgeText}>
              {currentItinerary?.places?.length || 0}
            </Text>
          </View>
          <Ionicons name="list-outline" size={24} color={MibuBrand.brown} />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={chatScrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 【截圖 9 修改】AI 歡迎區塊 - 移除圖片、文字置中、左上角加說明按鈕 */}
        <View style={styles.welcomeCard}>
          {/* 左上角驚嘆號按鈕 - 點擊顯示使用說明（淡入淡出 tooltip） */}
          <TouchableOpacity
            style={styles.helpButton}
            onPress={showHelpInfo}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={22} color={MibuBrand.copper} />
          </TouchableOpacity>
          <Text style={styles.welcomeSubtitle}>
            {t.itinerary_welcomeSubtitle}
          </Text>
        </View>

        {/* 【截圖 9-15 #1】使用說明 Tooltip（淡入淡出 3 秒） */}
        {showHelpTooltip && (
          <Animated.View style={[styles.helpTooltip, { opacity: helpTooltipOpacity }]}>
            <Text style={styles.helpTooltipText}>
              {t.itinerary_helpText}
            </Text>
          </Animated.View>
        )}

        {/* 對話訊息 */}
        {messages.map((msg, index) => (
          <View
            key={`msg-${index}-${msg.role}`}
            style={[
              styles.messageRow,
              msg.role === 'user' ? styles.userMessageRow : styles.assistantMessageRow,
            ]}
          >
            {/* AI 訊息：頭像 + 名稱 + 對話框（LINE 風格） */}
            {msg.role === 'assistant' && (
              <>
                <TouchableOpacity activeOpacity={0.7} onPress={() => setShowAvatarPreview(true)} style={{ alignSelf: 'flex-start' }}>
                  <View style={styles.avatarContainer}>
                    <ExpoImage
                      source={{ uri: MINI_AVATAR_URL }}
                      style={styles.avatarIcon}
                      contentFit="cover"
                    />
                  </View>
                </TouchableOpacity>
                <View style={{ flex: 1, flexDirection: 'column', marginTop: 16 }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: MibuBrand.brownLight, marginBottom: 2, marginLeft: -4, marginTop: -4 }}>Mini</Text>
                  <View style={[styles.messageBubble, styles.assistantBubble]}>
                    {index === typingMessageIndex ? (
                      <TypewriterText
                        text={msg.content}
                        style={styles.messageText}
                        speed={25}
                        onComplete={() => setTypingMessageIndex(-1)}
                      />
                    ) : (
                      <Text style={styles.messageText}>{msg.content}</Text>
                    )}
                  </View>
                </View>
              </>
            )}
            {/* 用戶訊息：靠右對齊 */}
            {msg.role === 'user' && (
              <View style={[styles.messageBubble, styles.userBubble]}>
                <Text style={[styles.messageText, styles.userMessageText]}>{msg.content}</Text>
              </View>
            )}
          </View>
        ))}

        {/* AI 載入中 */}
        {/* 【截圖 9 修改】AI 頭像根據城市可更換 */}
        {aiLoading && (
          <View style={[styles.messageRow, styles.assistantMessageRow]}>
            {/* AI 頭像（LINE 風格，與對話訊息一致） */}
            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowAvatarPreview(true)} style={{ alignSelf: 'flex-start' }}>
              <View style={styles.avatarContainer}>
                <ExpoImage
                  source={{ uri: MINI_AVATAR_URL }}
                  style={styles.avatarIcon}
                  contentFit="cover"
                />
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: MibuBrand.brownLight, marginBottom: 2, marginLeft: -4, marginTop: -4 }}>Mini</Text>
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <ActivityIndicator size="small" color={MibuBrand.brown} />
              </View>
            </View>
          </View>
        )}

        {/* AI 建議的景點 - 已移除，用戶直接在行程表查看 */}
      </ScrollView>

      {/* Input Area */}
      {/* 【截圖 9-15 #3】加大底部間距，避免被底部導航欄擋住 */}
      <View style={[styles.inputArea, { paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 20) + 60 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder={t.itinerary_inputPlaceholder}
            placeholderTextColor={MibuBrand.copper}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!aiLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || aiLoading) && styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim() || aiLoading}
            onPress={sendAiMessage}
            activeOpacity={0.8}
            accessibilityLabel={t.itinerary_sendMessage}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() && !aiLoading ? MibuBrand.warmWhite : MibuBrand.tan}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  // ===== 左側邊欄：行程列表 =====
  const renderLeftDrawer = () => (
    <Animated.View
      style={[
        styles.drawer,
        styles.leftDrawer,
        { transform: [{ translateX: leftDrawerAnim }] },
      ]}
    >
      <View style={[styles.drawerInner, { paddingTop: insets.top + Spacing.lg }]}>
        {/* Drawer Header */}
        <View style={styles.drawerHeader}>
          <View>
            <Text style={styles.drawerTitle}>{t.itinerary_myTrips}</Text>
            <Text style={styles.drawerSubtitle}>
              {itineraries.length} {t.itinerary_tripsCount}
            </Text>
          </View>
          <View style={styles.drawerHeaderActions}>
            {/* 【截圖 9-15 #2】選擇/取消選擇按鈕 */}
            <TouchableOpacity
              onPress={() => {
                setSelectMode(!selectMode);
                setSelectedItineraryIds([]);
              }}
              style={styles.selectModeButton}
              activeOpacity={0.7}
              accessibilityLabel={selectMode ? t.itinerary_cancelSelect : t.itinerary_selectItineraries}
            >
              <Text style={styles.selectModeText}>
                {selectMode ? t.cancel : t.itinerary_selectMode}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={closeLeftDrawer}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={MibuBrand.copper} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 【截圖 9-15 #2】選擇模式下顯示刪除按鈕 */}
        {selectMode && selectedItineraryIds.length > 0 && (
          <TouchableOpacity
            style={styles.deleteSelectedButton}
            onPress={handleDeleteSelectedItineraries}
            activeOpacity={0.8}
            accessibilityLabel={t.itinerary_deleteSelected}
          >
            <Ionicons name="trash-outline" size={18} color={MibuBrand.warmWhite} />
            <Text style={styles.deleteSelectedText}>
              {tFormat(t.itinerary_deleteCount, { count: selectedItineraryIds.length })}
            </Text>
          </TouchableOpacity>
        )}

        {/* 行程列表 */}
        <ScrollView
          style={styles.drawerScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Spacing.xxl }}
        >
          {itineraries.map((item) => {
            const isSelected = selectedItineraryIds.includes(item.id);
            return (
              <View key={item.id} style={styles.tripCardWrapper}>
                {/* 【截圖 9-15 #2】選擇模式下顯示勾選框 */}
                {selectMode && (
                  <TouchableOpacity
                    style={[
                      styles.tripCheckbox,
                      isSelected && styles.tripCheckboxSelected,
                    ]}
                    onPress={() => toggleItinerarySelection(item.id)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color={MibuBrand.warmWhite} />
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.tripCard,
                    item.id === activeItineraryId && styles.tripCardActive,
                    selectMode && styles.tripCardSelectMode,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (selectMode) {
                      toggleItinerarySelection(item.id);
                    } else {
                      handleSelectItinerary(item.id);
                    }
                  }}
                >
                  <View style={styles.tripIconContainer}>
                    <Ionicons
                      name="airplane"
                      size={20}
                      color={item.id === activeItineraryId ? MibuBrand.brown : MibuBrand.copper}
                    />
                  </View>
                  <View style={styles.tripInfo}>
                    <Text
                      style={[
                        styles.tripTitle,
                        item.id === activeItineraryId && styles.tripTitleActive,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.tripMeta}>
                      {item.date} · {item.city}
                    </Text>
                    <View style={styles.tripBadgeRow}>
                      <View style={styles.tripCountBadge}>
                        <Ionicons name="location" size={12} color={MibuBrand.copper} />
                        <Text style={styles.tripCountText}>
                          {item.placeCount} {t.itinerary_places}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {!selectMode && item.id === activeItineraryId && (
                    <View style={styles.activeIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color={MibuBrand.brown} />
                    </View>
                  )}
                </TouchableOpacity>
                {/* 非選擇模式下顯示刪除按鈕 */}
                {!selectMode && (
                  <TouchableOpacity
                    style={styles.tripDeleteButton}
                    activeOpacity={0.7}
                    onPress={() => handleDeleteItinerary(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={MibuBrand.error} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {/* 新增行程按鈕 */}
          <TouchableOpacity
            style={styles.addTripButton}
            activeOpacity={0.8}
            onPress={openCreateModal}
          >
            <Ionicons name="add-circle-outline" size={24} color={MibuBrand.brown} />
            <Text style={styles.addTripText}>{t.itinerary_newTrip}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Animated.View>
  );

  // ===== 右側邊欄：行程揭曉 =====
  const renderRightDrawer = () => (
    <Animated.View
      style={[
        styles.drawer,
        styles.rightDrawer,
        { transform: [{ translateX: rightDrawerAnim }] },
      ]}
    >
      <View style={[styles.drawerInner, { paddingTop: insets.top + Spacing.lg }]}>
        {/* Drawer Header */}
        <View style={styles.drawerHeader}>
          <View>
            <Text style={styles.drawerTitle}>{t.itinerary_itinerary}</Text>
            <Text style={styles.drawerSubtitle}>
              {currentItinerary?.date} · {currentItinerary?.city}
            </Text>
          </View>
          <TouchableOpacity
            onPress={closeRightDrawer}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={MibuBrand.copper} />
          </TouchableOpacity>
        </View>

        {/* 【截圖 9-15 #9】【截圖 36 修復】景點卡片列表 - 支援長按拖曳排序 */}
        {/* 修復：更穩健的條件判斷，確保 places 陣列存在且有內容 */}
        {/* 2026-02-01 修復：添加 containerStyle={{ flex: 1 }} 確保 DraggableFlatList 在 flex 容器中正確計算高度 */}
        {Array.isArray(currentItinerary?.places) && currentItinerary.places.length > 0 ? (
          <DraggableFlatList
            data={currentItinerary.places}
            keyExtractor={(item) => String(item.id)}
            onDragEnd={({ data }) => handleDragReorder(data)}
            contentContainerStyle={{ paddingBottom: Spacing.xxl, flexGrow: 1 }}
            containerStyle={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            style={styles.drawerScroll}
            renderItem={({ item: place, getIndex, drag, isActive }: RenderItemParams<ItineraryPlaceItem>) => {
              const index = getIndex() ?? 0;
              const categoryToken = getCategoryToken(getPlaceCategory(place));
              const description = getPlaceDescription(place);
              const name = getPlaceName(place, t.itinerary_unknownPlace);
              const isFirst = index === 0;
              const isLast = index === (currentItinerary?.places.length ?? 1) - 1;

              return (
                <ScaleDecorator>
                  <View
                    style={[
                      styles.placeCard,
                      isActive && styles.placeCardDragging,
                    ]}
                  >
                    {/* 左側：拖曳把手 + 色條（長按觸發拖曳） */}
                    <TouchableOpacity
                      style={styles.reorderControls}
                      onLongPress={drag}
                      delayLongPress={150}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.placeStripe,
                          { backgroundColor: categoryToken.stripe },
                        ]}
                      />
                      <View style={styles.reorderButtonsContainer}>
                        {/* 拖曳圖示提示 */}
                        <Ionicons
                          name="reorder-three"
                          size={20}
                          color={MibuBrand.copper}
                          style={{ marginBottom: 4 }}
                        />
                        <TouchableOpacity
                          style={[styles.reorderButton, isFirst && styles.reorderButtonDisabled]}
                          activeOpacity={0.7}
                          disabled={isFirst}
                          onPress={() => handleMovePlace(place.id, 'up')}
                        >
                          <Ionicons
                            name="chevron-up"
                            size={18}
                            color={isFirst ? MibuBrand.tanLight : MibuBrand.copper}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.reorderButton, isLast && styles.reorderButtonDisabled]}
                          activeOpacity={0.7}
                          disabled={isLast}
                          onPress={() => handleMovePlace(place.id, 'down')}
                        >
                          <Ionicons
                            name="chevron-down"
                            size={18}
                            color={isLast ? MibuBrand.tanLight : MibuBrand.copper}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.placeContent}>
                      {/* 右上角刪除按鈕 X */}
                      <TouchableOpacity
                        style={styles.placeDeleteX}
                        activeOpacity={0.7}
                        onPress={() => handleRemovePlace(place.id, name)}
                      >
                        <Ionicons name="close" size={16} color={MibuBrand.copper} />
                      </TouchableOpacity>

                      {/* 頂部：順序 + 類別 */}
                      <View style={styles.placeTopRow}>
                        {/* 順序編號 */}
                        <View style={styles.placeOrderBadge}>
                          <Text style={styles.placeOrderText}>{index + 1}</Text>
                        </View>
                        {/* 類別標籤 */}
                        <View
                          style={[
                            styles.placeCategoryBadge,
                            { backgroundColor: categoryToken.badge },
                          ]}
                        >
                          <Text
                            style={[
                              styles.placeCategoryText,
                              { color: categoryToken.badgeText },
                            ]}
                          >
                            {getPlaceCategory(place)}
                          </Text>
                        </View>
                      </View>

                      {/* 【對齊扭蛋】景點名稱 - 加大字體 */}
                      <Text style={styles.placeName} numberOfLines={2}>{name}</Text>

                      {/* 【對齊扭蛋】描述 */}
                      {description && (
                        <Text style={styles.placeDescription}>{description}</Text>
                      )}

                      {/* 底部：Google Maps 按鈕 */}
                      <TouchableOpacity
                        style={styles.placeMapButton}
                        activeOpacity={0.7}
                        onPress={() => openInGoogleMaps(
                          name,
                          place.locationLat ?? place.place?.locationLat,
                          place.locationLng ?? place.place?.locationLng
                        )}
                      >
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color={MibuBrand.copper}
                        />
                        <Text style={styles.placeMapText}>
                          {t.itinerary_viewOnGoogleMaps}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScaleDecorator>
              );
            }}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addFromCollectionButton}
                activeOpacity={0.8}
                onPress={openAddPlacesModal}
              >
                <Ionicons name="albums-outline" size={20} color={MibuBrand.brown} />
                <Text style={styles.addFromCollectionText}>
                  {t.itinerary_addFromCollection}
                </Text>
              </TouchableOpacity>
            }
          />
        ) : (
          <View style={styles.drawerScroll}>
            <View style={styles.emptyPlaces}>
              <Ionicons name="location-outline" size={48} color={MibuBrand.tanLight} />
              <Text style={styles.emptyPlacesText}>
                {t.itinerary_noPlaces}
              </Text>
            </View>
            {/* 從圖鑑加入 */}
            <TouchableOpacity
              style={styles.addFromCollectionButton}
              activeOpacity={0.8}
              onPress={openAddPlacesModal}
            >
              <Ionicons name="albums-outline" size={20} color={MibuBrand.brown} />
              <Text style={styles.addFromCollectionText}>
                {t.itinerary_addFromCollection}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );

  // ===== Overlay =====
  const renderOverlay = () =>
    (leftDrawerOpen || rightDrawerOpen) && (
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {
            if (leftDrawerOpen) closeLeftDrawer();
            if (rightDrawerOpen) closeRightDrawer();
          }}
        />
      </Animated.View>
    );

  // Modals 已抽至獨立元件：CreateItineraryModal, AddPlacesModal

  // 【截圖 9-15 #8 #11】Toast 通知組件
  const renderToast = () =>
    showToast && (
      <Animated.View
        style={[
          styles.toastContainer,
          { opacity: toastOpacity, bottom: insets.bottom + 70 },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>
    );

  // 無行程時顯示空狀態，有行程時顯示主畫面
  return (
    <View style={styles.container}>
      {itineraries.length === 0 ? renderEmptyState() : (
        <>
          {renderMainContent()}
          {renderOverlay()}
          {renderLeftDrawer()}
          {renderRightDrawer()}
        </>
      )}
      {/* Modal 子元件 */}
      <AddPlacesModal
        visible={addPlacesModalVisible}
        itineraryId={currentItinerary?.id ?? null}
        onClose={() => setAddPlacesModalVisible(false)}
        onConfirmed={handleAddPlacesConfirmed}
        showToast={showToastMessage}
        cachedPlaces={collectionCacheRef.current}
        onCacheUpdate={(places) => { collectionCacheRef.current = places; }}
      />
      <CreateItineraryModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreated={handleItineraryCreated}
      />
      {renderToast()}

      {/* Mini 頭像放大預覽（LINE 風格） */}
      <Modal
        visible={showAvatarPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarPreview(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowAvatarPreview(false)}
          style={styles.avatarPreviewOverlay}
        >
          <View style={styles.avatarPreviewContainer}>
            <Text style={styles.avatarPreviewName}>Mini</Text>
            <ExpoImage
              source={{ uri: MINI_AVATAR_URL }}
              style={styles.avatarPreviewImage}
              contentFit="cover"
            />
          </View>
          {/* 右下角儲存按鈕 */}
          <TouchableOpacity
            style={styles.avatarSaveButton}
            onPress={(e) => { e.stopPropagation(); saveAvatarToGallery(); }}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// 樣式已拆至 ItineraryScreenV2.styles.ts

