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
 */
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
  Keyboard,
  Modal,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { itineraryApi } from '../../../services/itineraryApi';
import { locationApi } from '../../../services/locationApi';
import { preloadService } from '../../../services/preloadService';
import { MibuBrand, getCategoryToken, UIColors } from '../../../../constants/Colors';
import type { Country, Region } from '../../../types';
import { Spacing, Radius, FontSize, Shadow } from '../../../theme/designTokens';
import { Select } from '../../shared/components/ui/Select';
import {
  Itinerary,
  ItinerarySummary,
  ItineraryPlaceItem,
  AiChatMessage,
  AiSuggestedPlace,
  AiChatContext,
  AvailablePlaceItem,
  AvailablePlacesByCategory,
} from '../../../types/itinerary';

// ============================================================
// 常數定義
// ============================================================

// 螢幕寬度
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 抽屜寬度（螢幕的 88%）
const DRAWER_WIDTH = SCREEN_WIDTH * 0.88;

// ============================================================
// 打字機效果組件
// ============================================================

interface TypewriterTextProps {
  text: string;
  onComplete?: () => void;
  style?: any;
  speed?: number;  // 每個字的間隔（毫秒）
}

/**
 * 打字機效果文字組件
 * 讓文字一個一個字出現，像真人打字一樣
 */
const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  onComplete,
  style,
  speed = 30,  // 預設每 30ms 顯示一個字
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    // 重置
    setDisplayedText('');
    indexRef.current = 0;

    if (!text) return;

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return <Text style={style}>{displayedText}</Text>;
};

// ============================================================
// 輔助函數
// ============================================================

/**
 * 在 Google Maps 中查看景點
 * 用名稱搜尋，如果有經緯度會加上座標讓搜尋更精確
 * @param name 景點名稱
 * @param lat 緯度（可選）
 * @param lng 經度（可選）
 */
const openInGoogleMaps = (name: string, lat?: number | null, lng?: number | null) => {
  let url: string;
  if (lat && lng) {
    // 有經緯度：用名稱 + 座標搜尋，精確定位到該地點
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}+${lat},${lng}`;
  } else {
    // 沒有經緯度：只用名稱搜尋
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
  }
  Linking.openURL(url).catch(err => console.warn('無法開啟 Google Maps:', err));
};

/**
 * 取得景點的座標
 * 支援新舊 API 回應結構
 */
const getPlaceCoords = (place: ItineraryPlaceItem) => {
  const lat = place.locationLat ?? place.place?.locationLat;
  const lng = place.locationLng ?? place.place?.locationLng;
  return { lat, lng };
};

/**
 * 取得景點的描述
 * 支援新舊 API 回應結構
 */
const getPlaceDescription = (place: ItineraryPlaceItem) => {
  return place.description ?? place.place?.description;
};

/**
 * 取得景點的名稱
 * 支援新舊 API 回應結構
 */
const getPlaceName = (place: ItineraryPlaceItem) => {
  return place.name ?? place.place?.name ?? '未知景點';
};

// 取得景點的分類（支援新舊結構）
const getPlaceCategory = (place: ItineraryPlaceItem) => {
  return place.category ?? place.place?.category ?? 'other';
};

/**
 * 【截圖 9】取得城市專屬的 AI 頭像
 * 根據城市名稱返回對應的頭像，用戶可以上傳不同城市的 MIBU 頭像
 * 目前使用預設圖片，之後會根據城市切換
 *
 * @param city 城市名稱
 * @returns 對應的頭像 source
 */
const getCityAvatar = (city: string | undefined) => {
  // TODO: 根據城市載入不同頭像
  // 目前使用預設頭像，之後可以擴展城市頭像映射
  // 例如: { '台北市': require('...taipei.png'), '高雄市': require('...kaohsiung.png') }
  const defaultAvatar = require('../../../../assets/images/icon.png');

  // 城市頭像映射（之後擴展）
  // const cityAvatars: Record<string, any> = {
  //   '台北市': require('../../../../assets/images/avatars/taipei.png'),
  //   '高雄市': require('../../../../assets/images/avatars/kaohsiung.png'),
  //   // ... 更多城市
  // };
  // return city && cityAvatars[city] ? cityAvatars[city] : defaultAvatar;

  return defaultAvatar;
};

export function ItineraryScreenV2() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, getToken } = useApp();
  const isZh = state.language === 'zh-TW';

  // ===== 狀態管理 =====
  const [loading, setLoading] = useState(true);
  const [itineraries, setItineraries] = useState<ItinerarySummary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [activeItineraryId, setActiveItineraryId] = useState<number | null>(null);

  // AI 對話狀態
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
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

  // 從圖鑑加入景點 Modal 狀態
  const [addPlacesModalVisible, setAddPlacesModalVisible] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState<AvailablePlacesByCategory[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [addingPlaces, setAddingPlaces] = useState(false);

  // 【截圖 9-15 #6 #7】圖鑑手風琴 + 搜索狀態
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');

  // 建立行程 Modal 狀態
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  // 【截圖 9-15 #12】編輯標題狀態
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const savingTitleRef = useRef(false); // 使用 ref 防止重複保存（同步更新）
  const [newItinerary, setNewItinerary] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    countryId: null as number | null,
    countryName: '',
    regionId: null as number | null,
    regionName: '',
  });
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);

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
      Alert.alert('載入失敗', '無法載入行程列表，請稍後再試');
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
          const city = res.itinerary.city || res.itinerary.country || '這裡';
          const welcomeMessage: AiChatMessage = {
            role: 'assistant',
            content: `嗨！${city}之旅想怎麼玩？告訴我你的喜好，我來幫你安排行程 ✨`,
          };
          setMessages([welcomeMessage]);
          // 保存歡迎訊息
          saveMessages(id, [welcomeMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch itinerary detail:', error);
      Alert.alert('載入失敗', '無法載入行程詳情，請稍後再試');
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
          responseText += isZh ? '\n\n✅ 已加入行程' : '\n\n✅ Added to itinerary';
        } else if (res.actionTaken?.type === 'remove_place') {
          responseText += isZh ? '\n\n✅ 已從行程移除' : '\n\n✅ Removed from itinerary';
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
        content: isZh ? '抱歉，我暫時無法回應，請稍後再試' : 'Sorry, I cannot respond right now. Please try again later.'
      }]);
    } finally {
      setAiLoading(false);
    }
  }, [currentItinerary, inputText, getToken, aiContext, aiSuggestions, fetchItineraryDetail, isZh]);

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
        showToastMessage(isZh ? `已移除「${placeName || '景點'}」` : `Removed "${placeName || 'place'}"`);
      }
    } catch (error) {
      console.error('Remove place error:', error);
      showToastMessage(isZh ? '移除失敗，請稍後再試' : 'Failed to remove, please try again');
    }
  }, [currentItinerary, getToken, fetchItineraryDetail, isZh, showToastMessage]);

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
        const city = cached.city || cached.country || '這裡';
        const welcomeMessage: AiChatMessage = {
          role: 'assistant',
          content: `嗨！${city}之旅想怎麼玩？告訴我你的喜好，我來幫你安排行程 ✨`,
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

  // 【截圖 9-15 #5】開啟「從圖鑑加入」Modal - 優先使用快取
  const openAddPlacesModal = useCallback(async () => {
    if (!currentItinerary) return;

    setAddPlacesModalVisible(true);
    setSelectedCollectionIds([]);

    // 優先使用快取
    if (collectionCacheRef.current) {
      setAvailablePlaces(collectionCacheRef.current);
      setLoadingAvailable(false);
      return;
    }

    const token = await getToken();
    if (!token) return;

    setLoadingAvailable(true);
    try {
      const res = await itineraryApi.getAvailablePlaces(currentItinerary.id, token);
      if (res.success) {
        setAvailablePlaces(res.categories);
        collectionCacheRef.current = res.categories;
      }
    } catch (error) {
      console.error('Failed to fetch available places:', error);
    } finally {
      setLoadingAvailable(false);
    }
  }, [currentItinerary, getToken]);

  // 切換景點選取
  const togglePlaceSelection = useCallback((collectionId: number) => {
    setSelectedCollectionIds(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  }, []);

  // 【截圖 9-15 #8】確認加入選取的景點 - 使用 Toast 而不是 Alert
  const confirmAddPlaces = useCallback(async () => {
    if (!currentItinerary || selectedCollectionIds.length === 0) return;
    const token = await getToken();
    if (!token) return;

    setAddingPlaces(true);
    try {
      const res = await itineraryApi.addPlaces(
        currentItinerary.id,
        { collectionIds: selectedCollectionIds },
        token
      );
      if (res.success) {
        await fetchItineraryDetail(currentItinerary.id);
        setAddPlacesModalVisible(false);
        // 用戶操作不跳通知，直接關閉 Modal 即可
      }
    } catch (error) {
      console.error('Failed to add places:', error);
      showToastMessage(isZh ? '加入景點失敗，請稍後再試' : 'Failed to add places, please try again');
    } finally {
      setAddingPlaces(false);
    }
  }, [currentItinerary, selectedCollectionIds, getToken, fetchItineraryDetail, isZh, showToastMessage]);

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
        showToastMessage(isZh ? '排序失敗，請重試' : 'Reorder failed, please try again');
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
      showToastMessage(isZh ? '排序失敗，請重試' : 'Reorder failed, please try again');
    }
  }, [currentItinerary, getToken, isZh, showToastMessage]);

  // 載入國家列表
  const loadCountries = useCallback(async () => {
    setLoadingCountries(true);
    try {
      // 使用預載入快取，避免重複請求
      const data = await preloadService.getCountries();
      setCountries(data);
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  // 載入城市列表
  const loadRegions = useCallback(async (countryId: number) => {
    setLoadingRegions(true);
    setRegions([]);
    setNewItinerary(prev => ({ ...prev, regionId: null, regionName: '' }));
    try {
      // 使用預載入快取
      const data = await preloadService.getRegions(countryId);
      setRegions(data);
    } catch (error) {
      console.error('Failed to load regions:', error);
    } finally {
      setLoadingRegions(false);
    }
  }, []);

  // 取得本地化名稱
  const getLocalizedName = useCallback((item: Country | Region): string => {
    if (isZh) return item.nameZh || item.nameEn || '';
    return item.nameEn || item.nameZh || '';
  }, [isZh]);

  // 開啟建立行程 Modal
  const openCreateModal = useCallback(() => {
    setCreateModalVisible(true);
    setNewItinerary({
      title: '',
      date: new Date().toISOString().split('T')[0],
      countryId: null,
      countryName: '',
      regionId: null,
      regionName: '',
    });
    setRegions([]);
    if (countries.length === 0) {
      loadCountries();
    }
  }, [countries.length, loadCountries]);

  // 建立行程
  const handleCreateItinerary = useCallback(async () => {
    if (!newItinerary.countryName || !newItinerary.regionName) {
      Alert.alert(
        isZh ? '請填寫完整' : 'Incomplete',
        isZh ? '請選擇國家和城市' : 'Please select country and city'
      );
      return;
    }
    const token = await getToken();
    if (!token) return;

    setCreating(true);
    try {
      const trimmedTitle = newItinerary.title.trim();
      const res = await itineraryApi.createItinerary({
        ...(trimmedTitle ? { title: trimmedTitle } : {}),
        date: newItinerary.date,
        country: newItinerary.countryName,
        city: newItinerary.regionName,
      }, token);

      if (res.success) {
        // 如果用戶有填標題但後端沒套用，補一次 updateItinerary
        let finalItinerary = res.itinerary;
        if (trimmedTitle && res.itinerary.title !== trimmedTitle) {
          const updateRes = await itineraryApi.updateItinerary(
            res.itinerary.id,
            { title: trimmedTitle },
            token,
          );
          if (updateRes.success) {
            finalItinerary = updateRes.itinerary;
          }
        }

        setCreateModalVisible(false);
        await fetchItineraries();
        // 切換到新建立的行程
        setActiveItineraryId(finalItinerary.id);
        setCurrentItinerary(finalItinerary);
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
      } else {
        Alert.alert(
          isZh ? '建立失敗' : 'Create Failed',
          res.message || (isZh ? '請稍後再試' : 'Please try again later')
        );
      }
    } catch (error) {
      console.error('Create itinerary error:', error);
      Alert.alert(
        isZh ? '建立失敗' : 'Create Failed',
        isZh ? '網路錯誤，請稍後再試' : 'Network error, please try again later'
      );
    } finally {
      setCreating(false);
    }
  }, [newItinerary, getToken, fetchItineraries, isZh, leftDrawerAnim, overlayAnim]);

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
        showToastMessage(isZh ? '更新失敗' : 'Update failed');
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
      showToastMessage(isZh ? '更新失敗' : 'Update failed');
    } finally {
      savingTitleRef.current = false;
    }
  }, [currentItinerary, titleInput, getToken, isZh, showToastMessage]);

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
      isZh ? '刪除行程' : 'Delete Itineraries',
      isZh
        ? `確定要刪除 ${selectedItineraryIds.length} 個行程嗎？此操作無法復原。`
        : `Are you sure you want to delete ${selectedItineraryIds.length} itineraries? This cannot be undone.`,
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '刪除' : 'Delete',
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
              showToastMessage(isZh ? `已刪除 ${selectedItineraryIds.length} 個行程` : `Deleted ${selectedItineraryIds.length} itineraries`);
            } catch (error) {
              console.error('Delete itineraries error:', error);
              showToastMessage(isZh ? '刪除失敗' : 'Delete failed');
            }
          },
        },
      ]
    );
  }, [selectedItineraryIds, getToken, activeItineraryId, fetchItineraryDetail, isZh, showToastMessage]);

  // 刪除單一行程（非選擇模式時使用）
  const handleDeleteItinerary = useCallback(async (id: number) => {
    Alert.alert(
      isZh ? '刪除行程' : 'Delete Itinerary',
      isZh ? '確定要刪除這個行程嗎？此操作無法復原。' : 'Are you sure you want to delete this itinerary? This cannot be undone.',
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '刪除' : 'Delete',
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
                showToastMessage(isZh ? '行程已刪除' : 'Itinerary deleted');
              }
            } catch (error) {
              console.error('Delete itinerary error:', error);
            }
          },
        },
      ]
    );
  }, [getToken, activeItineraryId, fetchItineraryDetail, isZh, showToastMessage]);

  // 初始載入
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchItineraries();
      setLoading(false);
    };

    if (state.isAuthenticated) {
      init();
    }
  }, [state.isAuthenticated, fetchItineraries]);

  // 載入選中的行程詳情
  useEffect(() => {
    if (activeItineraryId) {
      fetchItineraryDetail(activeItineraryId);
    }
  }, [activeItineraryId, fetchItineraryDetail]);

  // 當選擇國家時載入城市
  useEffect(() => {
    if (newItinerary.countryId) {
      loadRegions(newItinerary.countryId);
    }
  }, [newItinerary.countryId, loadRegions]);

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
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        // 延遲滾動，等待 KeyboardAvoidingView 調整完成
        // 用 ref 追蹤 timer，避免組件卸載後 timer 仍執行
        keyboardScrollTimerRef.current = setTimeout(() => {
          chatScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  /**
   * 【截圖 9】顯示使用說明 Tooltip（淡入淡出，持續 3 秒）
   * 【預防卡住】正確清理 timer 避免記憶體洩漏
   */
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

  // ===== 未登入狀態 =====
  if (!state.isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="airplane-outline" size={64} color={MibuBrand.tanLight} />
        <Text style={styles.emptyTitle}>{isZh ? '登入以使用行程助手' : 'Login to use Trip Assistant'}</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>{isZh ? '登入' : 'Login'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===== 載入中 =====
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{isZh ? '載入中...' : 'Loading...'}</Text>
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
      <Text style={styles.emptyTitle}>{isZh ? '還沒有行程' : 'No itineraries yet'}</Text>
      <Text style={styles.emptySubtitle}>
        {isZh ? '建立行程，讓 AI 幫你規劃完美旅途' : 'Create a trip and let AI plan for you'}
      </Text>

      {/* 功能提示卡片 */}
      <View style={styles.emptyTipsCard}>
        {[
          { icon: 'sparkles' as const, text: isZh ? 'AI 智慧推薦景點' : 'AI recommends spots' },
          { icon: 'calendar-outline' as const, text: isZh ? '自動安排每日行程' : 'Auto daily planning' },
          { icon: 'navigate-outline' as const, text: isZh ? '即時導航帶你走' : 'Real-time navigation' },
        ].map((tip) => (
          <View key={tip.icon} style={styles.emptyTipRow}>
            <Ionicons name={tip.icon} size={18} color={MibuBrand.copper} />
            <Text style={styles.emptyTipText}>{tip.text}</Text>
          </View>
        ))}
      </View>

      {/* 建立按鈕 */}
      <TouchableOpacity
        style={styles.emptyCreateButton}
        onPress={openCreateModal}
        activeOpacity={0.8}
        accessibilityLabel={isZh ? '建立第一個行程' : 'Create first itinerary'}
      >
        <Ionicons name="add-circle-outline" size={24} color={MibuBrand.warmWhite} />
        <Text style={styles.emptyCreateButtonText}>
          {isZh ? '建立第一個行程' : 'Create First Itinerary'}
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: Spacing.md }]}>
        <TouchableOpacity
          onPress={openLeftDrawer}
          style={styles.headerIconButton}
          activeOpacity={0.7}
          accessibilityLabel={isZh ? '開啟行程列表' : 'Open itinerary list'}
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
                  {currentItinerary?.title || (isZh ? '行程助手' : 'Trip Assistant')}
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
          accessibilityLabel={isZh ? '查看行程詳情' : 'View itinerary details'}
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
          <Text style={styles.welcomeTitle}>Mibu {isZh ? '行程助手' : 'Trip Assistant'}</Text>
          <Text style={styles.welcomeSubtitle}>
            {isZh ? '告訴我你想去哪，我來幫你安排' : 'Tell me where you want to go'}
          </Text>
        </View>

        {/* 【截圖 9-15 #1】使用說明 Tooltip（淡入淡出 3 秒） */}
        {showHelpTooltip && (
          <Animated.View style={[styles.helpTooltip, { opacity: helpTooltipOpacity }]}>
            <Text style={styles.helpTooltipText}>
              {isZh
                ? '告訴我你的旅遊偏好，我會推薦景點並加入行程\n點擊左上角查看行程列表，點擊右上角查看行程表'
                : 'Tell me your preferences, I\'ll recommend places\nTap top-left for trip list, top-right for itinerary'}
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
            {/* 【截圖 9 修改】AI 頭像根據城市可更換 */}
            {msg.role === 'assistant' && (
              <View style={styles.avatarContainer}>
                <Image
                  source={getCityAvatar(currentItinerary?.city)}
                  style={styles.avatarIcon}
                  resizeMode="contain"
                />
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {/* AI 訊息使用打字機效果（僅對正在打字的訊息） */}
              {msg.role === 'assistant' && index === typingMessageIndex ? (
                <TypewriterText
                  text={msg.content}
                  style={styles.messageText}
                  speed={25}
                  onComplete={() => setTypingMessageIndex(-1)}
                />
              ) : (
                <Text
                  style={[
                    styles.messageText,
                    msg.role === 'user' && styles.userMessageText,
                  ]}
                >
                  {msg.content}
                </Text>
              )}
            </View>
          </View>
        ))}

        {/* AI 載入中 */}
        {/* 【截圖 9 修改】AI 頭像根據城市可更換 */}
        {aiLoading && (
          <View style={[styles.messageRow, styles.assistantMessageRow]}>
            <View style={styles.avatarContainer}>
              <Image
                source={getCityAvatar(currentItinerary?.city)}
                style={styles.avatarIcon}
                resizeMode="contain"
              />
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <ActivityIndicator size="small" color={MibuBrand.brown} />
            </View>
          </View>
        )}

        {/* AI 建議的景點 - 已移除，用戶直接在行程表查看 */}
      </ScrollView>

      {/* Input Area */}
      {/* 【截圖 9-15 #3】加大底部間距，避免被底部導航欄擋住 */}
      <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 20) + 60 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder={isZh ? '想去哪裡？告訴我...' : 'Where do you want to go?'}
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
            accessibilityLabel={isZh ? '發送訊息' : 'Send message'}
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
            <Text style={styles.drawerTitle}>{isZh ? '我的行程' : 'My Trips'}</Text>
            <Text style={styles.drawerSubtitle}>
              {itineraries.length} {isZh ? '個行程' : 'trips'}
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
              accessibilityLabel={isZh ? (selectMode ? '取消選擇' : '選擇行程') : (selectMode ? 'Cancel selection' : 'Select itineraries')}
            >
              <Text style={styles.selectModeText}>
                {selectMode ? (isZh ? '取消' : 'Cancel') : (isZh ? '選擇' : 'Select')}
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
            accessibilityLabel={isZh ? '刪除已選行程' : 'Delete selected itineraries'}
          >
            <Ionicons name="trash-outline" size={18} color={MibuBrand.warmWhite} />
            <Text style={styles.deleteSelectedText}>
              {isZh ? `刪除 ${selectedItineraryIds.length} 個` : `Delete ${selectedItineraryIds.length}`}
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
                          {item.placeCount} {isZh ? '個景點' : 'places'}
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
            <Text style={styles.addTripText}>{isZh ? '新增行程' : 'New Trip'}</Text>
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
            <Text style={styles.drawerTitle}>{isZh ? '行程表' : 'Itinerary'}</Text>
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
              const name = getPlaceName(place);
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
                          {isZh ? '在 Google Maps 查看' : 'View on Google Maps'}
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
                  {isZh ? '從圖鑑加入景點' : 'Add from Collection'}
                </Text>
              </TouchableOpacity>
            }
          />
        ) : (
          <View style={styles.drawerScroll}>
            <View style={styles.emptyPlaces}>
              <Ionicons name="location-outline" size={48} color={MibuBrand.tanLight} />
              <Text style={styles.emptyPlacesText}>
                {isZh ? '還沒有景點\n跟 AI 聊聊想去哪吧！' : 'No places yet\nChat with AI to add some!'}
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
                {isZh ? '從圖鑑加入景點' : 'Add from Collection'}
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

  // ===== 【截圖 9-15 #6 #7】從圖鑑加入景點 Modal（手風琴 + 搜索） =====
  const renderAddPlacesModal = () => {
    // 搜索過濾
    const filteredPlaces = availablePlaces.map(categoryGroup => ({
      ...categoryGroup,
      places: categoryGroup.places.filter(place =>
        placeSearchQuery.trim() === '' ||
        place.name.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
        (place.nameEn && place.nameEn.toLowerCase().includes(placeSearchQuery.toLowerCase()))
      ),
    })).filter(group => group.places.length > 0);

    return (
      <Modal
        visible={addPlacesModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setAddPlacesModalVisible(false);
          setExpandedCategory(null);
          setPlaceSearchQuery('');
        }}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setAddPlacesModalVisible(false);
                setExpandedCategory(null);
                setPlaceSearchQuery('');
              }}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={MibuBrand.copper} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isZh ? '從圖鑑加入景點' : 'Add from Collection'}
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
                  {isZh ? `加入 (${selectedCollectionIds.length})` : `Add (${selectedCollectionIds.length})`}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 【截圖 9-15 #7】搜索輸入框 */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={MibuBrand.copper} />
            <TextInput
              style={styles.searchInput}
              placeholder={isZh ? '搜尋景點...' : 'Search places...'}
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
                {isZh ? '載入中...' : 'Loading...'}
              </Text>
            </View>
          ) : filteredPlaces.length === 0 ? (
            <View style={styles.modalEmpty}>
              <Ionicons name="albums-outline" size={48} color={MibuBrand.tanLight} />
              <Text style={styles.modalEmptyText}>
                {placeSearchQuery.trim()
                  ? (isZh ? '找不到符合的景點' : 'No matching places found')
                  : (isZh ? '圖鑑中沒有可加入的景點\n先去抽卡收集一些吧！' : 'No places in collection\nGo gacha to collect some!')}
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
                // 【截圖 9-15 #6】最多顯示 15 個
                const displayPlaces = isExpanded ? categoryGroup.places.slice(0, 15) : [];

                return (
                  <View key={categoryGroup.category} style={styles.modalCategorySection}>
                    {/* 手風琴標題（可點擊展開/收合） */}
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

                    {/* 展開的景點列表（可滑動，最多 15 個） */}
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
                        {categoryGroup.places.length > 15 && (
                          <Text style={styles.accordionMoreText}>
                            {isZh
                              ? `還有 ${categoryGroup.places.length - 15} 個景點...`
                              : `${categoryGroup.places.length - 15} more places...`}
                          </Text>
                        )}
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
  };

  // ===== 建立行程 Modal（方案 A 卡片式）=====
  const renderCreateModal = () => {
    const canCreate = !!newItinerary.countryId && !!newItinerary.regionId;
    return (
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={[styles.createModalContainer, { paddingTop: insets.top }]}>
          {/* Header：關閉 + 標題 */}
          <View style={styles.createModalHeader}>
            <TouchableOpacity
              onPress={() => setCreateModalVisible(false)}
              style={styles.modalCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={MibuBrand.copper} />
            </TouchableOpacity>
            <Text style={styles.createModalTitle}>
              {isZh ? '新增行程' : 'New Itinerary'}
            </Text>
            {/* 佔位，讓標題置中 */}
            <View style={{ width: 44 }} />
          </View>

          {/* 卡片區 */}
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.createCardScroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.createCard}>
              {/* 行程標題（可選） */}
              <View style={styles.createFieldGroup}>
                <View style={styles.createFieldIcon}>
                  <Ionicons name="create-outline" size={18} color={MibuBrand.copper} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.createFieldLabel}>{isZh ? '行程標題' : 'Trip Title'}</Text>
                  <TextInput
                    style={styles.createFieldInput}
                    value={newItinerary.title}
                    onChangeText={(text) => setNewItinerary(prev => ({ ...prev, title: text }))}
                    placeholder={isZh ? '為你的旅程取個名字（選填）' : 'Name your trip (optional)'}
                    placeholderTextColor={MibuBrand.tan}
                    maxLength={50}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* 分隔線 */}
              <View style={styles.createDivider} />

              {/* 日期 */}
              <View style={styles.createFieldGroup}>
                <View style={styles.createFieldIcon}>
                  <Ionicons name="calendar-outline" size={18} color={MibuBrand.copper} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.createFieldLabel}>{isZh ? '日期' : 'Date'}</Text>
                  <TextInput
                    style={styles.createFieldInput}
                    value={newItinerary.date}
                    onChangeText={(text) => setNewItinerary(prev => ({ ...prev, date: text }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={MibuBrand.tan}
                  />
                </View>
              </View>

              {/* 分隔線 */}
              <View style={styles.createDivider} />

              {/* 國家 + 城市並排 */}
              <View style={styles.createFieldGroup}>
                <View style={styles.createFieldIcon}>
                  <Ionicons name="globe-outline" size={18} color={MibuBrand.copper} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.createLocationRow}>
                    {/* 國家 */}
                    <View style={{ flex: 1, marginRight: Spacing.sm }}>
                      <Select
                        label={isZh ? '國家' : 'Country'}
                        options={countries.map(c => ({ label: getLocalizedName(c), value: c.id }))}
                        value={newItinerary.countryId || null}
                        onChange={(value) => {
                          const country = countries.find(c => c.id === value);
                          setNewItinerary(prev => ({
                            ...prev,
                            countryId: value as number,
                            countryName: country ? getLocalizedName(country) : '',
                            regionId: null,
                            regionName: '',
                          }));
                        }}
                        placeholder={isZh ? '選擇國家' : 'Country'}
                        loading={loadingCountries}
                      />
                    </View>
                    {/* 城市 */}
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <Select
                        label={isZh ? '城市' : 'City'}
                        options={regions.map(r => ({ label: getLocalizedName(r), value: r.id }))}
                        value={newItinerary.regionId || null}
                        onChange={(value) => {
                          const region = regions.find(r => r.id === value);
                          setNewItinerary(prev => ({
                            ...prev,
                            regionId: value as number,
                            regionName: region?.nameZh || '',
                          }));
                        }}
                        placeholder={isZh ? '選擇城市' : 'City'}
                        loading={loadingRegions || !newItinerary.countryId}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* 底部建立按鈕 */}
          <View style={[styles.createBottomBar, { paddingBottom: insets.bottom + Spacing.lg }]}>
            <TouchableOpacity
              onPress={handleCreateItinerary}
              style={[
                styles.createBottomButton,
                !canCreate && styles.createBottomButtonDisabled,
              ]}
              disabled={!canCreate || creating}
              activeOpacity={0.8}
            >
              {creating ? (
                <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color={MibuBrand.warmWhite} style={{ marginRight: Spacing.sm }} />
                  <Text style={styles.createBottomButtonText}>
                    {isZh ? '建立行程' : 'Create Itinerary'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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
          {renderAddPlacesModal()}
        </>
      )}
      {/* Modal 不管有沒有行程都要渲染，這樣空狀態也能建立行程 */}
      {renderCreateModal()}
      {renderToast()}
    </View>
  );
}

// ========== 樣式 ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },

  // ===== Empty/Loading States =====
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.creamLight,
    padding: Spacing.xl,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: MibuBrand.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyTipsCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    width: '100%',
    maxWidth: 280,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  emptyTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyTipText: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
    flex: 1,
  },
  emptyCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyCreateButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    marginTop: Spacing.lg,
  },
  loginButton: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.xl,
  },
  loginButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },

  // ===== 主畫面 =====
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  // 【截圖 9-15 #12】標題列（含編輯圖示）
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    letterSpacing: -0.3,
  },
  // 【截圖 9-15 #12】標題編輯輸入框
  titleEditContainer: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  titleEditInput: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    textAlign: 'center',
    minWidth: 120,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  itineraryBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  itineraryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },

  // ===== Chat Area =====
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  welcomeCard: {
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.xl,
    position: 'relative',
    ...Shadow.md,
  },
  // 【截圖 9】左上角說明按鈕
  helpButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
  },

  // ===== Messages =====
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarIcon: {
    width: 20,
    height: 20,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  userBubble: {
    backgroundColor: MibuBrand.brown,
    borderBottomRightRadius: Radius.xs,
  },
  assistantBubble: {
    backgroundColor: MibuBrand.warmWhite,
    borderBottomLeftRadius: Radius.xs,
    ...Shadow.sm,
  },
  messageText: {
    fontSize: FontSize.md,
    lineHeight: 22,
    color: MibuBrand.brownDark,
  },
  userMessageText: {
    color: MibuBrand.warmWhite,
  },

  // ===== AI Suggestions (已移除 UI，保留樣式供未來使用) =====

  // ===== Input Area =====
  inputArea: {
    backgroundColor: MibuBrand.warmWhite,
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.xl,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: MibuBrand.tanLight,
  },

  // ===== Drawer Common =====
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: MibuBrand.warmWhite,
    zIndex: 100,
    ...Shadow.lg,
  },
  leftDrawer: {
    left: 0,
    borderTopRightRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  rightDrawer: {
    right: 0,
    borderTopLeftRadius: Radius.xxl,
    borderBottomLeftRadius: Radius.xxl,
  },
  drawerInner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  drawerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    letterSpacing: -0.5,
  },
  drawerSubtitle: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginTop: Spacing.xs,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 【截圖 9-15 #2】Drawer header actions
  drawerHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectModeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.xs,
  },
  selectModeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  // 【截圖 9-15 #2】批量刪除按鈕
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.error,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  deleteSelectedText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
    marginLeft: Spacing.xs,
  },
  // 【截圖 9-15 #2】行程勾選框
  tripCheckbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  tripCheckboxSelected: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  tripCardSelectMode: {
    flex: 1,
  },
  drawerScroll: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(90, 56, 32, 0.4)',
    zIndex: 50,
  },

  // ===== Trip List (Left Drawer) =====
  tripCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tripCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  tripDeleteButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  tripCardActive: {
    backgroundColor: MibuBrand.highlight,
    borderWidth: 2,
    borderColor: MibuBrand.brown,
  },
  tripIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: MibuBrand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  tripInfo: {
    flex: 1,
  },
  tripTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  tripTitleActive: {
    color: MibuBrand.brown,
    fontWeight: '700',
  },
  tripMeta: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  tripBadgeRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  tripCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  tripCountText: {
    fontSize: FontSize.xs,
    color: MibuBrand.copper,
    marginLeft: 4,
  },
  activeIndicator: {
    marginLeft: Spacing.sm,
  },
  addTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    borderStyle: 'dashed',
    marginTop: Spacing.md,
  },
  addTripText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brown,
    marginLeft: Spacing.sm,
  },

  // ===== Place Cards (Right Drawer) - 對齊扭蛋卡片樣式 =====
  placeCard: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16, // 對齊扭蛋卡片
    marginBottom: 12, // 對齊扭蛋卡片
    overflow: 'hidden',
    // 對齊扭蛋卡片陰影
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  // 【截圖 9-15 #9】拖曳時的卡片樣式
  placeCardDragging: {
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  placeStripe: {
    width: 4, // 對齊扭蛋卡片（從 5 改為 4）
  },
  reorderButtonsContainer: {
    width: 32,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButton: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButtonDisabled: {
    opacity: 0.4,
  },
  placeContent: {
    flex: 1,
    padding: 20, // 對齊扭蛋卡片（從 Spacing.lg 改為 20）
    position: 'relative',
  },
  // 【截圖 9-15 #11】右上角刪除按鈕
  placeDeleteX: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  placeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // 改為 flex-start
    marginBottom: 12, // 對齊扭蛋卡片
    flexWrap: 'wrap',
    gap: 8,
  },
  // 【對齊扭蛋】時間預估 badge
  placeDurationBadge: {
    backgroundColor: MibuBrand.creamLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  placeDurationText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  placeOrderBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },
  placeCategoryBadge: {
    paddingHorizontal: 12, // 對齊扭蛋卡片
    paddingVertical: 5, // 對齊扭蛋卡片
    borderRadius: 12, // 對齊扭蛋卡片
  },
  placeCategoryText: {
    fontSize: 12, // 對齊扭蛋卡片
    fontWeight: '600',
  },
  placeName: {
    fontSize: 20, // 對齊扭蛋卡片（從 16 改為 20）
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 8, // 對齊扭蛋卡片
    letterSpacing: -0.3,
  },
  placeDescription: {
    fontSize: 14, // 對齊扭蛋卡片（從 12 改為 14）
    color: MibuBrand.brownLight,
    lineHeight: 22, // 對齊扭蛋卡片
    marginBottom: 16, // 對齊扭蛋卡片
  },
  // 【對齊扭蛋】地圖按鈕樣式
  placeMapButton: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeMapButtonDisabled: {
    opacity: 0.5,
  },
  placeMapText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginLeft: 6,
  },
  // 舊的 placeActions 保留以防其他地方使用
  placeActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
  placeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  placeActionDisabled: {
    opacity: 0.5,
  },
  placeActionText: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginLeft: 4,
  },
  emptyPlaces: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyPlacesText: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 22,
  },
  addFromCollectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: MibuBrand.highlight,
    marginTop: Spacing.md,
  },
  addFromCollectionText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brown,
    marginLeft: Spacing.sm,
  },

  // ===== Add Places Modal =====
  modalContainer: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.warmWhite,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  modalConfirmButton: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  modalConfirmButtonDisabled: {
    backgroundColor: MibuBrand.tanLight,
  },
  modalConfirmText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
  modalLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingText: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    marginTop: Spacing.md,
  },
  modalEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalEmptyText: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 22,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  // 【截圖 9-15 #7】搜索輸入框
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
    marginLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  modalCategorySection: {
    marginBottom: Spacing.md,
  },
  modalCategoryTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  // 【截圖 9-15 #6】手風琴樣式
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Shadow.sm,
  },
  accordionHeaderExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionStripe: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  accordionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    flex: 1,
  },
  accordionCountBadge: {
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginRight: Spacing.md,
  },
  accordionCountText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  accordionContent: {
    backgroundColor: MibuBrand.warmWhite,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    maxHeight: 300,
    paddingVertical: Spacing.sm,
  },
  accordionMoreText: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    textAlign: 'center',
    paddingVertical: Spacing.md,
    fontStyle: 'italic',
  },
  modalPlaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  modalPlaceItemSelected: {
    borderWidth: 2,
    borderColor: MibuBrand.brown,
  },
  modalPlaceStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  modalPlaceInfo: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  modalPlaceName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  modalPlaceNameEn: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  modalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    marginRight: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCheckboxSelected: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },

  // ===== Create Modal（方案 A 卡片式）=====
  createModalContainer: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  createModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  createModalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  createCardScroll: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  createCard: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  createFieldGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  createFieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MibuBrand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  createFieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginBottom: Spacing.xs,
  },
  createFieldInput: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  createDivider: {
    height: 1,
    backgroundColor: MibuBrand.tanLight,
    marginVertical: Spacing.lg,
  },
  createLocationRow: {
    flexDirection: 'row',
  },
  createBottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: MibuBrand.warmWhite,
  },
  createBottomButton: {
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createBottomButtonDisabled: {
    backgroundColor: MibuBrand.tanLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  createBottomButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },
  // 相容舊 style 引用
  createInputLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  createInput: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  createLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  createLoadingText: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginLeft: Spacing.sm,
  },
  createChipScroll: {
    maxHeight: 50,
  },
  createChipContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  createChip: {
    backgroundColor: MibuBrand.warmWhite,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  createChipSelected: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  createChipText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: MibuBrand.brownDark,
  },
  createChipTextSelected: {
    color: MibuBrand.warmWhite,
  },

  // ===== 【截圖 9】使用說明 Tooltip 樣式（淡入淡出） =====
  helpTooltip: {
    backgroundColor: 'rgba(128, 128, 128, 0.5)',  // 灰色 50% 透明度
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  helpTooltipText: {
    fontSize: FontSize.sm,
    color: UIColors.white,  // 白色文字
    lineHeight: 20,
    textAlign: 'center',
  },

  // ===== Toast 通知樣式（參考扭蛋說明風格） =====
  toastContainer: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: 'rgba(128, 128, 128, 0.5)',  // 灰色半透明（同扭蛋說明）
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: UIColors.white,
    textAlign: 'center',
  },
});

export default ItineraryScreenV2;
