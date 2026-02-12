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
 * 串接 API：
 * - apiService.getInventory() - 取得道具箱列表
 * - apiService.markInventoryItemRead() - 標記已讀
 * - apiService.redeemInventoryItem() - 核銷優惠券
 * - apiService.deleteInventoryItem() - 刪除優惠券
 *
 * @see 後端合約: contracts/APP.md
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, RefreshControl, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useI18n, useGacha } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { ApiError } from '../../../services/base';
import { InventoryItem, CouponTier } from '../../../types';
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
  const { getToken } = useAuth();
  const { t } = useI18n();
  const { setUnreadCount } = useGacha();

  // ============================================================
  // 狀態管理
  // ============================================================

  // 道具箱資料
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [slotCount, setSlotCount] = useState(0);
  const [maxSlots, setMaxSlots] = useState(MAX_SLOTS);

  // 載入狀態
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // 核銷相關狀態
  const [redemptionCode, setRedemptionCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  // ============================================================
  // API 呼叫
  // ============================================================

  /**
   * 載入道具箱資料
   */
  const loadInventory = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await apiService.getInventory(token);
      // 過濾已刪除的項目（檢查 isDeleted 或 status === 'deleted'）
      const inventoryItems = (data.items || []).filter(i => !i.isDeleted && i.status !== 'deleted');
      setItems(inventoryItems);
      setSlotCount(data.slotCount || inventoryItems.length);
      setMaxSlots(data.maxSlots || MAX_SLOTS);

      // 更新未讀數量
      const unreadCount = inventoryItems.filter((item: InventoryItem) => !item.isRead && item.status === 'active').length;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      Alert.alert(t.itemBox_loadFailed, t.itemBox_loadFailedDesc);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setUnreadCount]);

  // 初始載入
  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

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
    setRefreshing(true);
    loadInventory();
  }, [loadInventory]);

  // ============================================================
  // 事件處理
  // ============================================================

  /**
   * 點擊優惠券：標記已讀 + 開啟詳情 Modal
   */
  const handleItemPress = async (item: InventoryItem) => {
    // 若未讀，先標記已讀
    if (!item.isRead && item.status === 'active') {
      try {
        const token = await getToken();
        if (token) {
          await apiService.markInventoryItemRead(token, item.id);
          setItems(prev => {
            const updated = prev.map(i => i.id === item.id ? { ...i, isRead: true } : i);
            const newUnreadCount = updated.filter(i => !i.isRead && i.status === 'active').length;
            setUnreadCount(newUnreadCount);
            return updated;
          });
        }
      } catch (error) {
        console.error('Failed to mark item as read:', error);
      }
    }

    setSelectedItem(item);
    setDetailModalVisible(true);
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

    setRedeeming(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await apiService.redeemInventoryItem(token, selectedItem.id, redemptionCode.trim());

      if (response.success) {
        // 核銷成功，顯示倒數計時
        setRedeemSuccess(true);
        setCountdown(180); // 3 分鐘
        // 更新本地狀態
        setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, isRedeemed: true, status: 'redeemed' as const } : i));
      } else {
        Alert.alert(t.itemBox_redeemFailed, response.message || t.itemBox_redeemInvalidCode);
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
    } finally {
      setRedeeming(false);
    }
  };

  /**
   * 刪除優惠券
   */
  const handleDelete = async () => {
    if (!selectedItem) return;

    setDeleting(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await apiService.deleteInventoryItem(token, selectedItem.id);
      if (response.success) {
        setDeleteModalVisible(false);
        setSelectedItem(null);
        await loadInventory(); // 重新載入列表
      }
    } catch (error) {
      Alert.alert(t.itemBox_error, t.itemBox_deleteFailed);
    } finally {
      setDeleting(false);
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

        {/* 各稀有度統計 */}
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
          {(['SP', 'SSR', 'SR', 'S', 'R'] as CouponTier[]).map(tier => {
            // 檢查 tier 或 rarity 欄位
            const count = items.filter(i => (i.tier || i.rarity) === tier && i.status === 'active').length;
            return (
              <View
                key={tier}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: TIER_STYLES[tier].bgColor,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: TIER_STYLES[tier].borderColor,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', color: TIER_STYLES[tier].borderColor }}>
                  {tier}: {count}
                </Text>
              </View>
            );
          })}
        </View>
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
    </View>
  );
}
