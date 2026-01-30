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
import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { itineraryApi } from '../../../services/itineraryApi';
import { locationApi } from '../../../services/locationApi';
import { MibuBrand, getCategoryToken } from '../../../../constants/Colors';
import type { Country, Region } from '../../../types';
import { Spacing, Radius, FontSize, Shadow } from '../../../theme/designTokens';
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
// 輔助函數
// ============================================================

/**
 * #033: 開啟原生地圖導航
 * @param lat 緯度
 * @param lng 經度
 * @param name 景點名稱
 */
const openInMaps = (lat: number, lng: number, name: string) => {
  const url = Platform.select({
    ios: `maps:?q=${encodeURIComponent(name)}&ll=${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`,
    default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  });
  if (url) {
    Linking.openURL(url).catch(err => console.warn('無法開啟地圖:', err));
  }
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

  // Drawer 狀態
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  // 【截圖 9】使用說明 Tooltip 狀態（淡入淡出）
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const helpTooltipOpacity = useRef(new Animated.Value(0)).current;

  // 從圖鑑加入景點 Modal 狀態
  const [addPlacesModalVisible, setAddPlacesModalVisible] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState<AvailablePlacesByCategory[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [addingPlaces, setAddingPlaces] = useState(false);

  // 建立行程 Modal 狀態
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newItinerary, setNewItinerary] = useState({
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
    }
  }, [getToken, activeItineraryId]);

  // 載入行程詳情
  const fetchItineraryDetail = useCallback(async (id: number) => {
    const token = await getToken();
    if (!token) return;

    try {
      const res = await itineraryApi.getItinerary(id, token);
      if (res.success) {
        setCurrentItinerary(res.itinerary);
        // 初始化 AI 歡迎訊息
        if (messages.length === 0) {
          const city = res.itinerary.city || res.itinerary.country || '這裡';
          setMessages([
            {
              role: 'assistant',
              content: `嗨！${city}之旅想怎麼玩？告訴我你的喜好，我來幫你安排行程 ✨`,
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch itinerary detail:', error);
    }
  }, [getToken, messages.length]);

  // 發送 AI 訊息
  const sendAiMessage = useCallback(async () => {
    if (!currentItinerary || !inputText.trim()) return;
    const token = await getToken();
    if (!token) return;

    Keyboard.dismiss();
    const userMessage: AiChatMessage = { role: 'user', content: inputText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAiLoading(true);

    try {
      const res = await itineraryApi.aiChat(
        currentItinerary.id,
        {
          message: userMessage.content,
          context: aiContext ? {
            currentFilters: aiContext.currentFilters,
            excludedPlaces: aiContext.excludedPlaces,
            // v2.2.0: 傳送用戶偏好（未來可從本地統計取得）
            userPreferences: aiContext.userPreferences,
          } : undefined,
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

        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);

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
  }, [currentItinerary, inputText, getToken, aiContext, fetchItineraryDetail, isZh]);

  // 移除景點
  const handleRemovePlace = useCallback(async (itemId: number) => {
    if (!currentItinerary) return;
    const token = await getToken();
    if (!token) return;

    Alert.alert(
      isZh ? '移除景點' : 'Remove Place',
      isZh ? '確定要從行程中移除這個景點嗎？' : 'Are you sure you want to remove this place?',
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '移除' : 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await itineraryApi.removePlace(currentItinerary.id, itemId, token);
              if (res.success) {
                await fetchItineraryDetail(currentItinerary.id);
              }
            } catch (error) {
              console.error('Remove place error:', error);
            }
          },
        },
      ]
    );
  }, [currentItinerary, getToken, fetchItineraryDetail, isZh]);

  // 切換行程
  const handleSelectItinerary = useCallback(async (id: number) => {
    setActiveItineraryId(id);
    setMessages([]); // 清空對話
    setAiContext(undefined);
    setAiSuggestions([]);
    await fetchItineraryDetail(id);
    closeLeftDrawer();
  }, [fetchItineraryDetail]);

  // 開啟「從圖鑑加入」Modal
  const openAddPlacesModal = useCallback(async () => {
    if (!currentItinerary) return;
    const token = await getToken();
    if (!token) return;

    setLoadingAvailable(true);
    setAddPlacesModalVisible(true);
    setSelectedCollectionIds([]);

    try {
      const res = await itineraryApi.getAvailablePlaces(currentItinerary.id, token);
      if (res.success) {
        setAvailablePlaces(res.categories);
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

  // 確認加入選取的景點
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
        Alert.alert(
          isZh ? '成功' : 'Success',
          isZh ? `已加入 ${res.addedCount} 個景點` : `Added ${res.addedCount} places`
        );
      }
    } catch (error) {
      console.error('Failed to add places:', error);
      Alert.alert(
        isZh ? '錯誤' : 'Error',
        isZh ? '加入景點失敗，請稍後再試' : 'Failed to add places, please try again'
      );
    } finally {
      setAddingPlaces(false);
    }
  }, [currentItinerary, selectedCollectionIds, getToken, fetchItineraryDetail, isZh]);

  // 移動景點（上/下）
  const handleMovePlace = useCallback(async (itemId: number, direction: 'up' | 'down') => {
    if (!currentItinerary) return;
    const token = await getToken();
    if (!token) return;

    const places = currentItinerary.places;
    const currentIndex = places.findIndex(p => p.id === itemId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= places.length) return;

    // 重新排序陣列
    const newPlaces = [...places];
    const [movedItem] = newPlaces.splice(currentIndex, 1);
    newPlaces.splice(newIndex, 0, movedItem);

    // 樂觀更新 UI
    setCurrentItinerary(prev => prev ? { ...prev, places: newPlaces } : null);

    // 呼叫 API
    try {
      const itemIds = newPlaces.map(p => p.id);
      const res = await itineraryApi.reorderPlaces(currentItinerary.id, { itemIds }, token);
      if (!res.success) {
        // 失敗時還原
        await fetchItineraryDetail(currentItinerary.id);
      }
    } catch (error) {
      console.error('Reorder error:', error);
      await fetchItineraryDetail(currentItinerary.id);
    }
  }, [currentItinerary, getToken, fetchItineraryDetail]);

  // 載入國家列表
  const loadCountries = useCallback(async () => {
    setLoadingCountries(true);
    try {
      const data = await locationApi.getCountries();
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
      const data = await locationApi.getRegions(countryId);
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
      const res = await itineraryApi.createItinerary({
        date: newItinerary.date,
        country: newItinerary.countryName,
        city: newItinerary.regionName,
      }, token);

      if (res.success) {
        setCreateModalVisible(false);
        await fetchItineraries();
        // 切換到新建立的行程
        setActiveItineraryId(res.itinerary.id);
        setCurrentItinerary(res.itinerary);
        setMessages([]);
        setAiContext(undefined);
        setAiSuggestions([]);
        closeLeftDrawer();
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
  }, [newItinerary, getToken, fetchItineraries, isZh]);

  // 刪除行程
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
              }
            } catch (error) {
              console.error('Delete itinerary error:', error);
            }
          },
        },
      ]
    );
  }, [getToken, activeItineraryId, fetchItineraryDetail, isZh]);

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

  /**
   * 【截圖 9】顯示使用說明 Tooltip（淡入淡出，持續 3 秒）
   */
  const showHelpInfo = useCallback(() => {
    setShowHelpTooltip(true);
    // 淡入
    Animated.timing(helpTooltipOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // 持續 3 秒後淡出
      setTimeout(() => {
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
   * 開啟左側 Drawer（行程列表）
   */
  const openLeftDrawer = () => {
    // 停止進行中的動畫，避免動畫衝突
    leftDrawerAnim.stopAnimation();
    overlayAnim.stopAnimation();
    // 立即設定狀態，不等動畫完成
    setLeftDrawerOpen(true);
    Animated.parallel([
      Animated.spring(leftDrawerAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * 關閉左側 Drawer
   */
  const closeLeftDrawer = () => {
    // 停止進行中的動畫
    leftDrawerAnim.stopAnimation();
    overlayAnim.stopAnimation();
    // 立即設定狀態（重要！不要放在 .start() callback 裡）
    setLeftDrawerOpen(false);
    Animated.parallel([
      Animated.spring(leftDrawerAnim, {
        toValue: -DRAWER_WIDTH,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * 開啟右側 Drawer（景點列表）
   */
  const openRightDrawer = () => {
    // 停止進行中的動畫
    rightDrawerAnim.stopAnimation();
    overlayAnim.stopAnimation();
    setRightDrawerOpen(true);
    Animated.parallel([
      Animated.spring(rightDrawerAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * 關閉右側 Drawer
   */
  const closeRightDrawer = () => {
    // 停止進行中的動畫
    rightDrawerAnim.stopAnimation();
    overlayAnim.stopAnimation();
    // 立即設定狀態
    setRightDrawerOpen(false);
    Animated.parallel([
      Animated.spring(rightDrawerAnim, {
        toValue: DRAWER_WIDTH,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
  if (itineraries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="map-outline" size={64} color={MibuBrand.tanLight} />
        <Text style={styles.emptyTitle}>{isZh ? '還沒有行程' : 'No itineraries yet'}</Text>
        <Text style={styles.emptySubtitle}>
          {isZh ? '在「行程」頁籤建立你的第一個行程' : 'Create your first itinerary in the Itinerary tab'}
        </Text>
      </View>
    );
  }

  // ===== 主畫面：AI 對話 =====
  const renderMainContent = () => (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: Spacing.md }]}>
        <TouchableOpacity
          onPress={openLeftDrawer}
          style={styles.headerIconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={26} color={MibuBrand.brown} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {currentItinerary?.title || (isZh ? '行程助手' : 'Trip Assistant')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentItinerary?.city || currentItinerary?.country || ''}
          </Text>
        </View>

        <TouchableOpacity
          onPress={openRightDrawer}
          style={styles.headerIconButton}
          activeOpacity={0.7}
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

        {/* 【截圖 9】使用說明 Tooltip（淡入淡出 3 秒） */}
        {showHelpTooltip && (
          <Animated.View style={[styles.helpTooltip, { opacity: helpTooltipOpacity }]}>
            <Text style={styles.helpTooltipText}>
              {isZh
                ? '💡 告訴我你的旅遊偏好，我會推薦景點並加入行程。點擊右上角查看行程表！'
                : '💡 Tell me your preferences, I\'ll recommend places. Tap top-right to view itinerary!'}
            </Text>
          </Animated.View>
        )}

        {/* 對話訊息 */}
        {messages.map((msg, index) => (
          <View
            key={index}
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
              <Text
                style={[
                  styles.messageText,
                  msg.role === 'user' && styles.userMessageText,
                ]}
              >
                {msg.content}
              </Text>
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
      <View style={[styles.inputArea, { paddingBottom: insets.bottom + Spacing.sm }]}>
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
          <TouchableOpacity
            onPress={closeLeftDrawer}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={MibuBrand.copper} />
          </TouchableOpacity>
        </View>

        {/* 行程列表 */}
        <ScrollView
          style={styles.drawerScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Spacing.xxl }}
        >
          {itineraries.map((item) => (
            <View key={item.id} style={styles.tripCardWrapper}>
              <TouchableOpacity
                style={[
                  styles.tripCard,
                  item.id === activeItineraryId && styles.tripCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectItinerary(item.id)}
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
                {item.id === activeItineraryId && (
                  <View style={styles.activeIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color={MibuBrand.brown} />
                  </View>
                )}
              </TouchableOpacity>
              {/* 刪除按鈕 */}
              <TouchableOpacity
                style={styles.tripDeleteButton}
                activeOpacity={0.7}
                onPress={() => handleDeleteItinerary(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color={MibuBrand.error} />
              </TouchableOpacity>
            </View>
          ))}

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

        {/* 景點卡片列表 */}
        <ScrollView
          style={styles.drawerScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Spacing.xxl }}
        >
          {currentItinerary?.places && currentItinerary.places.length > 0 ? (
            currentItinerary.places.map((place, index) => {
              const categoryToken = getCategoryToken(getPlaceCategory(place));
              const coords = getPlaceCoords(place);
              const description = getPlaceDescription(place);
              const name = getPlaceName(place);
              const isFirst = index === 0;
              const isLast = index === currentItinerary.places.length - 1;

              return (
                <View key={place.id} style={styles.placeCard}>
                  {/* 左側：排序按鈕 + 色條 */}
                  <View style={styles.reorderControls}>
                    <View
                      style={[
                        styles.placeStripe,
                        { backgroundColor: categoryToken.stripe },
                      ]}
                    />
                    <View style={styles.reorderButtonsContainer}>
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
                  </View>

                  <View style={styles.placeContent}>
                    {/* 頂部：順序 + 類別 */}
                    <View style={styles.placeTopRow}>
                      <View style={styles.placeOrderBadge}>
                        <Text style={styles.placeOrderText}>{index + 1}</Text>
                      </View>
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

                    {/* 景點名稱 */}
                    <Text style={styles.placeName}>{name}</Text>

                    {/* 描述 */}
                    {description && (
                      <Text style={styles.placeDescription}>{description}</Text>
                    )}

                    {/* 底部操作 */}
                    <View style={styles.placeActions}>
                      {/* 地圖按鈕 */}
                      <TouchableOpacity
                        style={[
                          styles.placeActionButton,
                          !(coords.lat && coords.lng) && styles.placeActionDisabled,
                        ]}
                        activeOpacity={0.7}
                        disabled={!(coords.lat && coords.lng)}
                        onPress={() => {
                          if (coords.lat && coords.lng) {
                            openInMaps(coords.lat, coords.lng, name);
                          }
                        }}
                      >
                        <Ionicons
                          name="map-outline"
                          size={16}
                          color={coords.lat && coords.lng ? MibuBrand.copper : MibuBrand.tanLight}
                        />
                        <Text
                          style={[
                            styles.placeActionText,
                            !(coords.lat && coords.lng) && { color: MibuBrand.tanLight },
                          ]}
                        >
                          {isZh ? '地圖' : 'Map'}
                        </Text>
                      </TouchableOpacity>

                      {/* 移除按鈕 */}
                      <TouchableOpacity
                        style={styles.placeActionButton}
                        activeOpacity={0.7}
                        onPress={() => handleRemovePlace(place.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={MibuBrand.error} />
                        <Text style={[styles.placeActionText, { color: MibuBrand.error }]}>
                          {isZh ? '移除' : 'Remove'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyPlaces}>
              <Ionicons name="location-outline" size={48} color={MibuBrand.tanLight} />
              <Text style={styles.emptyPlacesText}>
                {isZh ? '還沒有景點\n跟 AI 聊聊想去哪吧！' : 'No places yet\nChat with AI to add some!'}
              </Text>
            </View>
          )}

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
        </ScrollView>
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

  // ===== 從圖鑑加入景點 Modal =====
  const renderAddPlacesModal = () => (
    <Modal
      visible={addPlacesModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setAddPlacesModalVisible(false)}
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setAddPlacesModalVisible(false)}
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

        {/* Modal Content */}
        {loadingAvailable ? (
          <View style={styles.modalLoading}>
            <ActivityIndicator size="large" color={MibuBrand.brown} />
            <Text style={styles.modalLoadingText}>
              {isZh ? '載入中...' : 'Loading...'}
            </Text>
          </View>
        ) : availablePlaces.length === 0 ? (
          <View style={styles.modalEmpty}>
            <Ionicons name="albums-outline" size={48} color={MibuBrand.tanLight} />
            <Text style={styles.modalEmptyText}>
              {isZh ? '圖鑑中沒有可加入的景點\n先去抽卡收集一些吧！' : 'No places in collection\nGo gacha to collect some!'}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {availablePlaces.map(categoryGroup => (
              <View key={categoryGroup.category} style={styles.modalCategorySection}>
                <Text style={styles.modalCategoryTitle}>{categoryGroup.categoryName}</Text>
                {categoryGroup.places.map(place => {
                  const isSelected = selectedCollectionIds.includes(place.collectionId);
                  // 使用父層的 category，因為後端不在 place 內提供 category
                  const categoryToken = getCategoryToken(categoryGroup.category);
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
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  // ===== 建立行程 Modal =====
  const renderCreateModal = () => (
    <Modal
      visible={createModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setCreateModalVisible(false)}
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setCreateModalVisible(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color={MibuBrand.copper} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {isZh ? '新增行程' : 'New Itinerary'}
          </Text>
          <TouchableOpacity
            onPress={handleCreateItinerary}
            style={[
              styles.modalConfirmButton,
              (!newItinerary.countryId || !newItinerary.regionId) && styles.modalConfirmButtonDisabled,
            ]}
            disabled={!newItinerary.countryId || !newItinerary.regionId || creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
            ) : (
              <Text style={styles.modalConfirmText}>
                {isZh ? '建立' : 'Create'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Modal Content */}
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.createModalContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 日期 */}
          <Text style={styles.createInputLabel}>{isZh ? '日期' : 'Date'}</Text>
          <TextInput
            style={styles.createInput}
            value={newItinerary.date}
            onChangeText={(text) => setNewItinerary(prev => ({ ...prev, date: text }))}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={MibuBrand.copper}
          />

          {/* 國家選擇 */}
          <Text style={styles.createInputLabel}>{isZh ? '國家' : 'Country'}</Text>
          {loadingCountries ? (
            <View style={styles.createLoadingRow}>
              <ActivityIndicator size="small" color={MibuBrand.brown} />
              <Text style={styles.createLoadingText}>{isZh ? '載入中...' : 'Loading...'}</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.createChipScroll}
              contentContainerStyle={styles.createChipContainer}
            >
              {countries.map((country) => {
                const isSelected = newItinerary.countryId === country.id;
                return (
                  <TouchableOpacity
                    key={country.id}
                    style={[styles.createChip, isSelected && styles.createChipSelected]}
                    onPress={() => setNewItinerary(prev => ({
                      ...prev,
                      countryId: country.id,
                      countryName: getLocalizedName(country),
                    }))}
                  >
                    <Text style={[styles.createChipText, isSelected && styles.createChipTextSelected]}>
                      {getLocalizedName(country)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* 城市選擇 */}
          {newItinerary.countryId && (
            <>
              <Text style={styles.createInputLabel}>{isZh ? '城市' : 'City'}</Text>
              {loadingRegions ? (
                <View style={styles.createLoadingRow}>
                  <ActivityIndicator size="small" color={MibuBrand.brown} />
                  <Text style={styles.createLoadingText}>{isZh ? '載入中...' : 'Loading...'}</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.createChipScroll}
                  contentContainerStyle={styles.createChipContainer}
                >
                  {regions.map((region) => {
                    const isSelected = newItinerary.regionId === region.id;
                    return (
                      <TouchableOpacity
                        key={region.id}
                        style={[styles.createChip, isSelected && styles.createChipSelected]}
                        onPress={() => setNewItinerary(prev => ({
                          ...prev,
                          regionId: region.id,
                          regionName: region.nameZh || '',
                        }))}
                      >
                        <Text style={[styles.createChipText, isSelected && styles.createChipTextSelected]}>
                          {getLocalizedName(region)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderMainContent()}
      {renderOverlay()}
      {renderLeftDrawer()}
      {renderRightDrawer()}
      {renderAddPlacesModal()}
      {renderCreateModal()}
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
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    marginTop: Spacing.sm,
    textAlign: 'center',
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
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    letterSpacing: -0.3,
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

  // ===== Place Cards (Right Drawer) =====
  placeCard: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.md,
  },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  placeStripe: {
    width: 5,
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
    padding: Spacing.lg,
  },
  placeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  placeOrderBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  placeOrderText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },
  placeCategoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  placeCategoryText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  placeName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  placeDescription: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
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
  modalCategorySection: {
    marginBottom: Spacing.xl,
  },
  modalCategoryTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.md,
    paddingLeft: Spacing.sm,
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

  // ===== Create Modal =====
  createModalContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
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
    backgroundColor: MibuBrand.brownDark,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  helpTooltipText: {
    fontSize: FontSize.sm,
    color: MibuBrand.warmWhite,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default ItineraryScreenV2;
