/**
 * ItemBoxScreen - 道具箱畫面
 *
 * 功能：
 * - 顯示用戶獲得的優惠券（以格狀陳列）
 * - 優惠券按稀有度顯示不同樣式（SP 有脈動動畫）
 * - 點擊查看優惠券詳情
 * - 長按可刪除優惠券
 * - 核銷優惠券功能（輸入商家核銷碼）
 * - 顯示優惠券到期倒數
 *
 * 串接 API（透過 React Query hooks）：
 * - useInventory() - 取得道具箱列表
 * - useMarkItemRead() - 標記已讀 mutation
 * - useRedeemItem() - 核銷優惠券 mutation
 * - useDeleteItem() - 刪除優惠券 mutation
 *
 * @see 後端合約: contracts/APP.md
 * 更新日期：2026-02-12（Phase 3 遷移至 React Query）
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, RefreshControl, Dimensions, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n, useGacha, useAuth } from '../../../context/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import { useInventory, useRedeemItem, useDeleteItem, useMarkItemRead, useOpenPlacePack } from '../../../hooks/useInventoryQueries';
import { inventoryApi } from '../../../services/inventoryApi';
import { ApiError } from '../../../services/base';
import { InventoryItem, CouponTier, PlacePackOptionsResponse } from '../../../types';
import { MibuBrand, UIColors } from '../../../../constants/Colors';

// ============================================================
// 常數定義
// ============================================================

/** 道具箱最大格數 */
const MAX_SLOTS = 30;

/** 格狀陳列的欄數 */
const GRID_COLS = 6;

/** 螢幕寬度（用於計算格子大小） */
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** 單一格子的大小 */
const SLOT_SIZE = (SCREEN_WIDTH - 48) / GRID_COLS - 8;

/**
 * 稀有度樣式配置
 * - borderColor: 邊框顏色
 * - bgColor: 背景顏色
 * - glowColor: 光暈顏色
 * - animate: 是否有脈動動畫
 */
const TIER_STYLES: Record<CouponTier, { borderColor: string; bgColor: string; glowColor: string; animate: boolean }> = {
  SP: { borderColor: MibuBrand.tierSP, bgColor: MibuBrand.tierSPBg, glowColor: 'rgba(212, 162, 76, 0.6)', animate: true },
  SSR: { borderColor: MibuBrand.tierSSR, bgColor: MibuBrand.tierSSRBg, glowColor: 'rgba(176, 136, 96, 0.4)', animate: false },
  SR: { borderColor: MibuBrand.tierSR, bgColor: MibuBrand.tierSRBg, glowColor: 'transparent', animate: false },
  S: { borderColor: MibuBrand.tierS, bgColor: MibuBrand.tierSBg, glowColor: 'transparent', animate: false },
  R: { borderColor: MibuBrand.tierR, bgColor: MibuBrand.tierRBg, glowColor: 'transparent', animate: false },
};

/**
 * 稀有度對應 icon
 */
const TIER_ICONS: Record<CouponTier, string> = {
  SP: 'star',
  SSR: 'diamond',
  SR: 'trophy',
  S: 'ribbon',
  R: 'ticket',
};

// ============================================================
// 輔助函數
// ============================================================

/**
 * 計算優惠券剩餘時間
 * @param expiresAt 到期時間 ISO 字串
 * @returns 剩餘時間資訊物件
 */
const getTimeRemaining = (expiresAt: string | null | undefined): { days: number; hours: number; isUrgent: boolean; isExpired: boolean; text: string } | null => {
  if (!expiresAt) return null;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  // 已過期
  if (diff <= 0) return { days: 0, hours: 0, isUrgent: true, isExpired: true, text: '' };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  // 格式化顯示文字
  let text = '';
  if (days > 0) {
    text = `${days}d`;
  } else if (hours > 0) {
    text = `${hours}h`;
  } else {
    text = '<1h';
  }

  return {
    days,
    hours,
    isUrgent: days < 3, // 3 天內為緊急
    isExpired: false,
    text,
  };
};

// ============================================================
// 子元件：單一道具格
// ============================================================

interface InventorySlotProps {
  item: InventoryItem | null;
  index: number;
  onPress: (item: InventoryItem) => void;
  onLongPress: (item: InventoryItem) => void;
  /** 翻譯物件（從 useI18n().t 傳入） */
  t: Record<string, string>;
}

/**
 * InventorySlot - 單一道具格
 * 顯示優惠券或空格，SP 級別有脈動動畫
 */
function InventorySlot({ item, index, onPress, onLongPress, t }: InventorySlotProps) {
  // SP 級別的脈動動畫值
  const [pulseAnim] = useState(new Animated.Value(1));

  // 取得稀有度（優先使用 tier，fallback 到 rarity）
  const itemTier = item?.tier || item?.rarity;

  /**
   * SP 級別啟動脈動動畫
   */
  useEffect(() => {
    if (itemTier === 'SP') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [itemTier, pulseAnim]);

  // ========== 空格狀態 ==========
  if (!item) {
    return (
      <View
        style={{
          width: SLOT_SIZE,
          height: SLOT_SIZE,
          margin: 4,
          borderRadius: 12,
          backgroundColor: '#f1f5f9',
          borderWidth: 2,
          borderColor: '#e2e8f0',
          borderStyle: 'dashed',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 格子序號 */}
        <Text style={{ fontSize: 10, color: '#cbd5e1' }}>{index + 1}</Text>
      </View>
    );
  }

  // ========== 景點包格子 ==========
  if (item.type === 'place_pack') {
    return (
      <TouchableOpacity onPress={() => onPress(item)} onLongPress={() => onLongPress(item)}>
        <View
          style={{
            width: SLOT_SIZE,
            height: SLOT_SIZE,
            margin: 4,
            borderRadius: 12,
            backgroundColor: MibuBrand.tierSBg,
            borderWidth: 3,
            borderColor: MibuBrand.copper,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: MibuBrand.copper,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 2,
            position: 'relative',
          }}
        >
          {/* 未讀紅點 */}
          {!item.isRead && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#ef4444',
                borderWidth: 2,
                borderColor: UIColors.white,
                zIndex: 10,
              }}
            />
          )}
          <Image source={{ uri: 'https://res.cloudinary.com/dgts6a89y/image/upload/v1771009433/mibu/items/%E5%AF%B6%E7%AE%B1.png' }} style={{ width: 32, height: 32 }} resizeMode="contain" />
          {item.placeCount != null && (
            <Text style={{ fontSize: 8, fontWeight: '800', color: MibuBrand.copper, marginTop: 2 }}>
              ×{item.placeCount}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // ========== 有優惠券的格子 ==========
  const tierStyle = TIER_STYLES[itemTier || 'R'] || TIER_STYLES.R;
  const isExpired = item.isExpired || Boolean(item.expiresAt && new Date(item.expiresAt) < new Date());
  const isDisabled = item.status === 'redeemed' || item.status === 'deleted' || isExpired;
  const timeRemaining = item.expiresAt && !isExpired ? getTimeRemaining(item.expiresAt) : null;

  // 格子內容
  const SlotContent = (
    <View
      style={{
        width: SLOT_SIZE,
        height: SLOT_SIZE,
        margin: 4,
        borderRadius: 12,
        backgroundColor: isDisabled ? '#e2e8f0' : tierStyle.bgColor,
        borderWidth: 3,
        borderColor: isDisabled ? '#9ca3af' : tierStyle.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? 0.5 : 1,
        shadowColor: tierStyle.glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: tierStyle.animate ? 1 : 0.5,
        shadowRadius: tierStyle.animate ? 10 : 4,
        elevation: tierStyle.animate ? 8 : 2,
        position: 'relative',
      }}
    >
      {/* 未讀紅點 */}
      {!item.isRead && !isDisabled && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#ef4444',
            borderWidth: 2,
            borderColor: UIColors.white,
            zIndex: 10,
          }}
        />
      )}

      {/* 稀有度 icon */}
      <Ionicons
        name={(TIER_ICONS[itemTier || 'R'] || 'ticket') as any}
        size={20}
        color={isDisabled ? '#9ca3af' : tierStyle.borderColor}
      />

      {/* 稀有度文字 */}
      <Text
        style={{
          fontSize: 8,
          fontWeight: '800',
          color: isDisabled ? '#9ca3af' : tierStyle.borderColor,
          marginTop: 2,
        }}
      >
        {itemTier || 'R'}
      </Text>

      {/* 已過期標籤 */}
      {isExpired && (
        <View
          style={{
            position: 'absolute',
            bottom: 2,
            backgroundColor: UIColors.overlayMedium,
            paddingHorizontal: 4,
            paddingVertical: 1,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 7, color: UIColors.white, fontWeight: '700' }}>
            {t.itemBox_slotExpired}
          </Text>
        </View>
      )}

      {/* 倒數計時 badge */}
      {timeRemaining && !isDisabled && item.status === 'active' && (
        <View
          style={{
            position: 'absolute',
            top: -6,
            left: -6,
            backgroundColor: timeRemaining.isUrgent ? '#ef4444' : '#f59e0b',
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 6,
            zIndex: 10,
            borderWidth: 1,
            borderColor: UIColors.white,
          }}
        >
          <Text style={{ fontSize: 7, color: UIColors.white, fontWeight: '800' }}>
            {timeRemaining.text}
          </Text>
        </View>
      )}

      {/* 已使用標籤 */}
      {item.status === 'redeemed' && (
        <View
          style={{
            position: 'absolute',
            bottom: 2,
            backgroundColor: 'rgba(22, 163, 74, 0.9)',
            paddingHorizontal: 4,
            paddingVertical: 1,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 7, color: UIColors.white, fontWeight: '700' }}>
            {t.itemBox_slotUsed}
          </Text>
        </View>
      )}
    </View>
  );

  // SP 級別有脈動動畫包裝
  if (itemTier === 'SP' && !isDisabled) {
    return (
      <TouchableOpacity
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
        disabled={isDisabled}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          {SlotContent}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
      disabled={isDisabled}
    >
      {SlotContent}
    </TouchableOpacity>
  );
}

// ============================================================
// 主元件
// ============================================================

export function ItemBoxScreen() {
  const { t } = useI18n();
  const { setUnreadCount } = useGacha();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // ============================================================
  // React Query Hooks
  // ============================================================

  const inventoryQuery = useInventory();
  const redeemItemMutation = useRedeemItem();
  const deleteItemMutation = useDeleteItem();
  const markItemReadMutation = useMarkItemRead();
  const openPlacePackMutation = useOpenPlacePack();

  // 從查詢結果派生資料（過濾已刪除和已開啟的景點包）
  const allItems = inventoryQuery.data?.items ?? [];
  const items = allItems.filter(i =>
    !i.isDeleted && i.status !== 'deleted' && i.status !== 'redeemed',
  );
  const slotCount = inventoryQuery.data?.slotCount ?? items.length;
  const maxSlots = inventoryQuery.data?.maxSlots ?? MAX_SLOTS;

  // 載入狀態
  const loading = inventoryQuery.isLoading;
  const refreshing = inventoryQuery.isFetching && !inventoryQuery.isLoading;

  // 更新未讀數量（當 API 資料變更時）
  // 注意：不能依賴 items（每次 render 都是新陣列引用，會造成無限循環）
  useEffect(() => {
    if (inventoryQuery.data) {
      const activeItems = inventoryQuery.data.items ?? [];
      const unread = activeItems.filter(
        (item: InventoryItem) => !item.isDeleted && item.status === 'active' && !item.isRead,
      ).length;
      setUnreadCount(unread);
    }
  }, [inventoryQuery.data, setUnreadCount]);

  // ============================================================
  // 狀態管理（UI 狀態）
  // ============================================================

  // Modal 狀態
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const redeemTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 卸載時清理 Modal 延遲 timer */
  useEffect(() => {
    return () => {
      if (redeemTimerRef.current) clearTimeout(redeemTimerRef.current);
    };
  }, []);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // 核銷相關狀態（UI 狀態）
  const [redemptionCode, setRedemptionCode] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  // 景點包相關狀態
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [packOptions, setPackOptions] = useState<PlacePackOptionsResponse | null>(null);
  const [packLoading, setPackLoading] = useState(false);

  // 從 mutation 派生 loading 狀態
  const redeeming = redeemItemMutation.isPending;
  const deleting = deleteItemMutation.isPending;

  /**
   * 核銷成功後的倒數計時
   * 3 分鐘後自動關閉 Modal
   */
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => (prev !== null && prev > 0) ? prev - 1 : null);
      }, 1000);
    } else if (countdown === 0) {
      // 倒數結束，關閉 Modal
      setRedeemSuccess(false);
      setCountdown(null);
      setRedeemModalVisible(false);
      setSelectedItem(null);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [countdown]);

  /**
   * 下拉重新整理
   */
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
  }, [queryClient]);

  // ============================================================
  // 事件處理
  // ============================================================

  /**
   * 點擊道具：依類型分流處理
   * - place_pack → 觸發開啟流程
   * - 其他 → 標記已讀 + 開啟詳情 Modal
   */
  const handleItemPress = async (item: InventoryItem) => {
    // 若未讀，先標記已讀
    if (!item.isRead && item.status === 'active') {
      try {
        await markItemReadMutation.mutateAsync(item.id);
      } catch (error) {
        console.error('Failed to mark item as read:', error);
      }
    }

    // 景點包 → 開啟流程
    if (item.type === 'place_pack') {
      setSelectedItem(item);
      await handleOpenPlacePack(item);
      return;
    }

    // 其他類型 → 詳情 Modal
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  /**
   * 景點包開啟流程
   * 1. 查詢開啟選項（是否限定城市）
   * 2. 限定城市 → 確認後直接開
   * 3. 非限定 → 彈出城市選擇器
   */
  const handleOpenPlacePack = async (item: InventoryItem) => {
    setPackLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const options = await inventoryApi.getPlacePackOptions(token, item.id);
      console.log('[PlacePack] open-options API response:', JSON.stringify(options));
      setPackOptions(options);

      if (options.restricted && options.restrictedCity) {
        // 限定城市 → 直接確認開啟
        Alert.alert(
          t.itemBox_packOpenTitle,
          t.itemBox_packOpenConfirm
            .replace('{name}', options.packName)
            .replace('{count}', String(options.placeCount))
            .replace('{city}', options.restrictedCity),
          [
            { text: t.itemBox_deleteCancel, style: 'cancel' },
            {
              text: t.itemBox_packOpen,
              onPress: () => executeOpenPack(item.id, options.restrictedCity!),
            },
          ],
        );
      } else {
        // 非限定 → 城市選擇器
        setCityPickerVisible(true);
      }
    } catch (error) {
      Alert.alert(t.itemBox_error, t.itemBox_packOpenFailed);
    } finally {
      setPackLoading(false);
    }
  };

  /**
   * 執行開啟景點包
   */
  const executeOpenPack = async (itemId: number, city: string) => {
    try {
      const result = await openPlacePackMutation.mutateAsync({ itemId, selectedCity: city });
      const { addedCount, skippedCount } = result.summary;
      // Toast 提示
      Alert.alert(
        t.itemBox_packOpenSuccess,
        t.itemBox_packOpenResult
          .replace('{added}', String(addedCount))
          .replace('{skipped}', String(skippedCount)),
      );
      setCityPickerVisible(false);
      setPackOptions(null);
      setSelectedItem(null);
    } catch (error) {
      Alert.alert(t.itemBox_error, t.itemBox_packOpenFailed);
    }
  };

  /**
   * 長按優惠券：開啟刪除確認 Modal
   */
  const handleItemLongPress = (item: InventoryItem) => {
    // 已刪除的項目不可操作
    if (item.status === 'deleted' || item.isDeleted === true) return;
    setSelectedItem(item);
    setDeleteModalVisible(true);
  };

  /**
   * 開啟核銷 Modal
   */
  const handleOpenRedeem = () => {
    setDetailModalVisible(false);
    setRedemptionCode('');
    setRedeemSuccess(false);
    setCountdown(null);
    if (redeemTimerRef.current) clearTimeout(redeemTimerRef.current);
    redeemTimerRef.current = setTimeout(() => { setRedeemModalVisible(true); redeemTimerRef.current = null; }, 300);
  };

  /**
   * 執行核銷
   */
  const handleRedeem = async () => {
    if (!selectedItem || !redemptionCode.trim()) {
      Alert.alert(t.itemBox_redeemNotice, t.itemBox_redeemEnterCode);
      return;
    }

    try {
      const response = await redeemItemMutation.mutateAsync({
        itemId: selectedItem.id,
        dailyCode: redemptionCode.trim(),
      });

      if (response.success) {
        // 核銷成功，顯示倒數計時
        setRedeemSuccess(true);
        setCountdown(180); // 3 分鐘
        // React Query 的 onSuccess 會自動 invalidate inventory 查詢
      } else {
        Alert.alert(t.itemBox_redeemFailed, (response as any).message || t.itemBox_redeemInvalidCode);
      }
    } catch (error: unknown) {
      // 用 ApiError.code 判斷錯誤類型（對應後端 RedeemErrorResponse.code 枚舉）
      // 避免用 string match 判斷 — 語言相依、脆弱
      if (error instanceof ApiError && error.code) {
        switch (error.code) {
          case 'COUPON_EXPIRED':
          case 'REDEMPTION_CODE_EXPIRED':
            Alert.alert(t.itemBox_expired, t.itemBox_redeemExpired);
            break;
          case 'ALREADY_REDEEMED':
            Alert.alert(t.itemBox_redeemAlreadyUsed, t.itemBox_redeemAlreadyUsedDesc);
            break;
          case 'INVALID_REDEMPTION_CODE':
            Alert.alert(t.itemBox_redeemInvalidCode, t.itemBox_redeemInvalidCodeDesc);
            break;
          default:
            Alert.alert(t.itemBox_error, t.itemBox_redeemError);
        }
      } else {
        // 非 ApiError（網路錯誤等）
        Alert.alert(t.itemBox_error, t.itemBox_redeemError);
      }
    }
  };

  /**
   * 刪除優惠券
   */
  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      const response = await deleteItemMutation.mutateAsync(selectedItem.id);
      if (response.success) {
        setDeleteModalVisible(false);
        setSelectedItem(null);
        // React Query 的 onSuccess 會自動 invalidate inventory 查詢
      }
    } catch (error) {
      Alert.alert(t.itemBox_error, t.itemBox_deleteFailed);
    }
  };

  // ============================================================
  // 輔助函數
  // ============================================================

  /**
   * 格式化倒數計時
   * @param seconds 剩餘秒數
   * @returns 格式化字串 "M:SS"
   */
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 取得稀有度標籤
   */
  const getTierLabel = (tier: CouponTier) => {
    const labels: Record<CouponTier, string> = {
      SP: 'Special',
      SSR: 'Super Rare',
      SR: 'Rare',
      S: 'Standard',
      R: 'Common',
    };
    return labels[tier] || tier;
  };

  // ============================================================
  // 格子陣列處理
  // ============================================================

  // 建立格子陣列，將優惠券放到對應位置
  // 如果後端有提供 slotIndex 就用，否則依序填入
  const slots: (InventoryItem | null)[] = Array(maxSlots).fill(null);
  items.forEach((item, index) => {
    const slotIdx = item.slotIndex ?? index;
    if (slotIdx >= 0 && slotIdx < maxSlots) {
      slots[slotIdx] = item;
    }
  });

  // ============================================================
  // 載入中狀態
  // ============================================================

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: MibuBrand.warmWhite, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={{ marginTop: 16, color: MibuBrand.brownLight }}>
          {t.itemBox_loading}
        </Text>
      </View>
    );
  }

  // ============================================================
  // 主畫面渲染
  // ============================================================

  return (
    <View style={{ flex: 1, backgroundColor: MibuBrand.warmWhite }}>
      {/* ========== Header 區域 ========== */}
      <View style={{
        backgroundColor: MibuBrand.creamLight,
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: MibuBrand.brown,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}>
        {/* 標題列 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="cube-outline" size={28} color={MibuBrand.brown} />
            <Text style={{ fontSize: 24, fontWeight: '800', color: MibuBrand.brown, marginLeft: 10 }}>
              {t.itemBox_title}
            </Text>
          </View>
          {/* 容量顯示 */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: slotCount >= maxSlots ? '#fef2f2' : slotCount >= maxSlots * 0.8 ? '#fef3c7' : MibuBrand.cream,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 16,
          }}>
            <Ionicons
              name="cube"
              size={18}
              color={slotCount >= maxSlots ? MibuBrand.error : slotCount >= maxSlots * 0.8 ? '#d97706' : MibuBrand.brown}
            />
            <Text style={{
              fontSize: 16,
              fontWeight: '800',
              color: slotCount >= maxSlots ? MibuBrand.error : slotCount >= maxSlots * 0.8 ? '#d97706' : MibuBrand.brown,
              marginLeft: 6,
            }}>
              {slotCount}/{maxSlots}
            </Text>
          </View>
        </View>

        {/* 滿格警告 */}
        {slotCount >= maxSlots && (
          <View style={{ backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="warning" size={18} color={MibuBrand.error} />
            <Text style={{ fontSize: 13, color: MibuBrand.error, marginLeft: 8, flex: 1 }}>
              {t.itemBox_full}
            </Text>
          </View>
        )}

        {/* 快滿警告（80% 以上） */}
        {slotCount >= maxSlots * 0.8 && slotCount < maxSlots && (
          <View style={{ backgroundColor: '#fef3c7', borderRadius: 12, padding: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={18} color="#d97706" />
            <Text style={{ fontSize: 13, color: '#92400e', marginLeft: 8, flex: 1 }}>
              {t.itemBox_almostFull.replace('{remaining}', String(maxSlots - slotCount))}
            </Text>
          </View>
        )}

      </View>

      {/* ========== 格狀列表 ========== */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[MibuBrand.brown]} tintColor={MibuBrand.brown} />
        }
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          {slots.map((item, index) => (
            <InventorySlot
              key={index}
              item={item}
              index={index}
              onPress={handleItemPress}
              onLongPress={handleItemLongPress}
              t={t}
            />
          ))}
        </View>
      </ScrollView>

      {/* ========== 詳情 Modal ========== */}
      <Modal
        visible={detailModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: UIColors.overlayMedium, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: MibuBrand.warmWhite, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, borderWidth: 2, borderColor: selectedItem ? TIER_STYLES[selectedItem.tier || selectedItem.rarity]?.borderColor : MibuBrand.tan }}>
            {selectedItem && (() => {
              const selTier = selectedItem.tier || selectedItem.rarity;
              const selIsExpired = selectedItem.isExpired || Boolean(selectedItem.expiresAt && new Date(selectedItem.expiresAt) < new Date());
              return (
              <>
                {/* 稀有度圖示 */}
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: TIER_STYLES[selTier]?.bgColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 3,
                      borderColor: TIER_STYLES[selTier]?.borderColor,
                      marginBottom: 12,
                    }}
                  >
                    <Ionicons
                      name={(TIER_ICONS[selTier] || 'ticket') as any}
                      size={36}
                      color={TIER_STYLES[selTier]?.borderColor}
                    />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: TIER_STYLES[selTier]?.borderColor }}>
                    {selTier} - {getTierLabel(selTier)}
                  </Text>
                </View>

                {/* 優惠券標題 */}
                <Text style={{ fontSize: 18, fontWeight: '800', color: MibuBrand.dark, textAlign: 'center', marginBottom: 8 }}>
                  {selectedItem.title || selectedItem.name}
                </Text>

                {/* 優惠券描述 */}
                {selectedItem.description && (
                  <Text style={{ fontSize: 14, color: MibuBrand.brownLight, textAlign: 'center', marginBottom: 16 }}>
                    {selectedItem.description}
                  </Text>
                )}

                {/* 商家名稱 */}
                {(selectedItem.merchantName || selectedItem.couponData?.merchantName) && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Ionicons name="storefront-outline" size={14} color={MibuBrand.copper} />
                    <Text style={{ fontSize: 13, color: MibuBrand.copper, marginLeft: 6 }}>{selectedItem.merchantName || selectedItem.couponData?.merchantName}</Text>
                  </View>
                )}

                {/* 有效期限 */}
                {selectedItem.expiresAt && (
                  <View style={{ backgroundColor: selIsExpired ? MibuBrand.error : MibuBrand.cream, padding: 12, borderRadius: 12, marginBottom: 20 }}>
                    <Text style={{ fontSize: 12, color: selIsExpired ? UIColors.white : MibuBrand.brown, textAlign: 'center' }}>
                      {selIsExpired
                        ? t.itemBox_expired
                        : t.itemBox_validUntil.replace('{date}', new Date(selectedItem.expiresAt).toLocaleDateString())
                      }
                    </Text>
                  </View>
                )}

                {/* 按鈕列 */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setDetailModalVisible(false)}
                    style={{ flex: 1, backgroundColor: MibuBrand.tan, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.dark }}>
                      {t.itemBox_close}
                    </Text>
                  </TouchableOpacity>

                  {/* 核銷按鈕（僅限可用狀態） */}
                  {selectedItem.status === 'active' && !selIsExpired && (
                    <TouchableOpacity
                      onPress={handleOpenRedeem}
                      style={{ flex: 1, backgroundColor: MibuBrand.brown, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '700', color: UIColors.white }}>
                        {t.itemBox_redeem}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            );})()}
          </View>
        </View>
      </Modal>

      {/* ========== 核銷 Modal ========== */}
      <Modal
        visible={redeemModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !redeemSuccess && setRedeemModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: UIColors.overlayMedium, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: MibuBrand.warmWhite, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 }}>
            {redeemSuccess ? (
              // ===== 核銷成功畫面 =====
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: MibuBrand.success, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Ionicons name="checkmark-circle" size={48} color={UIColors.white} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: MibuBrand.success, marginBottom: 8 }}>
                  {t.itemBox_redeemSuccess}
                </Text>
                <Text style={{ fontSize: 14, color: MibuBrand.brownLight, textAlign: 'center', marginBottom: 16 }}>
                  {t.itemBox_redeemShowMerchant}
                </Text>

                {/* 倒數計時 */}
                {countdown !== null && (
                  <View style={{ backgroundColor: MibuBrand.brown, paddingHorizontal: 32, paddingVertical: 20, borderRadius: 16, marginBottom: 20 }}>
                    <Text style={{ fontSize: 48, fontWeight: '900', color: UIColors.white, textAlign: 'center' }}>
                      {formatCountdown(countdown)}
                    </Text>
                    <Text style={{ fontSize: 12, color: MibuBrand.cream, textAlign: 'center', marginTop: 4 }}>
                      {t.itemBox_redeemCountdown}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setRedeemModalVisible(false)}
                  style={{ backgroundColor: MibuBrand.tan, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.dark }}>
                    {t.itemBox_redeemDone}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // ===== 輸入核銷碼畫面 =====
              <>
                {/* 標題列 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: MibuBrand.dark }}>
                    {t.itemBox_redeemTitle}
                  </Text>
                  <TouchableOpacity onPress={() => setRedeemModalVisible(false)} accessibilityLabel={t.itemBox_close}>
                    <Ionicons name="close" size={24} color={MibuBrand.brownLight} />
                  </TouchableOpacity>
                </View>

                {/* 優惠券資訊 */}
                {selectedItem && (
                  <View style={{ backgroundColor: MibuBrand.cream, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: TIER_STYLES[selectedItem.tier || selectedItem.rarity]?.borderColor }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.dark, marginBottom: 4 }}>
                      {selectedItem.title || selectedItem.name}
                    </Text>
                    {selectedItem.description && (
                      <Text style={{ fontSize: 13, color: MibuBrand.brownLight }}>{selectedItem.description}</Text>
                    )}
                  </View>
                )}

                {/* 核銷碼輸入 */}
                <Text style={{ fontSize: 14, fontWeight: '600', color: MibuBrand.brownLight, marginBottom: 8 }}>
                  {t.itemBox_redeemInputLabel}
                </Text>
                <TextInput
                  value={redemptionCode}
                  onChangeText={setRedemptionCode}
                  placeholder={t.itemBox_redeemPlaceholder}
                  placeholderTextColor={MibuBrand.copper}
                  autoCapitalize="characters"
                  maxLength={8}
                  style={{
                    backgroundColor: MibuBrand.cream,
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 24,
                    fontWeight: '700',
                    textAlign: 'center',
                    letterSpacing: 4,
                    color: MibuBrand.brown,
                    marginBottom: 20,
                    borderWidth: 2,
                    borderColor: MibuBrand.tan,
                  }}
                />

                {/* 確認核銷按鈕 */}
                <TouchableOpacity
                  onPress={handleRedeem}
                  disabled={redeeming || redemptionCode.length < 8}
                  style={{
                    backgroundColor: redemptionCode.length >= 8 ? MibuBrand.brown : MibuBrand.tan,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                >
                  {redeeming ? (
                    <ActivityIndicator color={UIColors.white} />
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: '700', color: redemptionCode.length >= 8 ? UIColors.white : MibuBrand.brownLight }}>
                      {t.itemBox_redeemConfirm}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ========== 刪除確認 Modal ========== */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: UIColors.overlayMedium, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: MibuBrand.warmWhite, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 }}>
            {/* 警告圖示 */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons name="trash" size={28} color={MibuBrand.error} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: MibuBrand.dark, marginBottom: 8 }}>
                {t.itemBox_deleteTitle}
              </Text>
              <Text style={{ fontSize: 14, color: MibuBrand.brownLight, textAlign: 'center' }}>
                {t.itemBox_deleteDesc}
              </Text>
            </View>

            {/* 要刪除的項目 */}
            {selectedItem && (
              <View style={{ backgroundColor: MibuBrand.cream, borderRadius: 12, padding: 12, marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: MibuBrand.dark, textAlign: 'center' }}>
                  {selectedItem.title || selectedItem.name}
                </Text>
              </View>
            )}

            {/* 按鈕列 */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                accessibilityLabel={t.itemBox_deleteCancel}
                style={{ flex: 1, backgroundColor: MibuBrand.tan, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.dark }}>
                  {t.itemBox_deleteCancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                disabled={deleting}
                accessibilityLabel={t.itemBox_deleteConfirm}
                style={{ flex: 1, backgroundColor: MibuBrand.error, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
              >
                {deleting ? (
                  <ActivityIndicator color={UIColors.white} />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '700', color: UIColors.white }}>
                    {t.itemBox_deleteConfirm}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========== 城市選擇器 Modal（景點包用） ========== */}
      <Modal
        visible={cityPickerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => { setCityPickerVisible(false); setPackOptions(null); }}
      >
        <View style={{ flex: 1, backgroundColor: UIColors.overlayMedium, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: MibuBrand.warmWhite, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, maxHeight: '70%' }}>
            {/* 標題 */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: MibuBrand.dark }}>
                  {t.itemBox_packSelectCity}
                </Text>
                {packOptions && (
                  <Text style={{ fontSize: 13, color: MibuBrand.brownLight, marginTop: 4 }}>
                    {packOptions.packName} — {packOptions.placeCount} {t.itemBox_packPlaces}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => { setCityPickerVisible(false); setPackOptions(null); }}>
                <Ionicons name="close" size={24} color={MibuBrand.brownLight} />
              </TouchableOpacity>
            </View>

            {/* 城市列表 */}
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {packOptions?.availableCities?.map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => selectedItem && executeOpenPack(selectedItem.id, city)}
                  disabled={openPlacePackMutation.isPending}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: MibuBrand.cream,
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="location-outline" size={20} color={MibuBrand.brown} />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: MibuBrand.dark, marginLeft: 12, flex: 1 }}>
                    {city}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={MibuBrand.brownLight} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Loading */}
            {openPlacePackMutation.isPending && (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <ActivityIndicator size="small" color={MibuBrand.brown} />
                <Text style={{ fontSize: 13, color: MibuBrand.brownLight, marginTop: 8 }}>
                  {t.itemBox_packOpening}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 景點包載入中覆蓋層 */}
      {packLoading && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: UIColors.overlayLight,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ActivityIndicator size="large" color={MibuBrand.brown} />
        </View>
      )}
    </View>
  );
}
