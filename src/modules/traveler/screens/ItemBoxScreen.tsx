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
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, RefreshControl, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { InventoryItem, CouponTier } from '../../../types';
import { MibuBrand } from '../../../../constants/Colors';

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
  language: string;
}

/**
 * InventorySlot - 單一道具格
 * 顯示優惠券或空格，SP 級別有脈動動畫
 */
function InventorySlot({ item, index, onPress, onLongPress, language }: InventorySlotProps) {
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
            borderColor: '#ffffff',
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
            backgroundColor: 'rgba(0,0,0,0.6)',
            paddingHorizontal: 4,
            paddingVertical: 1,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 7, color: '#ffffff', fontWeight: '700' }}>
            {language === 'zh-TW' ? '過期' : 'EXP'}
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
            borderColor: '#ffffff',
          }}
        >
          <Text style={{ fontSize: 7, color: '#ffffff', fontWeight: '800' }}>
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
          <Text style={{ fontSize: 7, color: '#ffffff', fontWeight: '700' }}>
            {language === 'zh-TW' ? '已用' : 'USED'}
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
  const { state, setUnreadCount, getToken } = useApp();

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
  const handleRefresh = () => {
    setRefreshing(true);
    loadInventory();
  };

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
    setTimeout(() => setRedeemModalVisible(true), 300);
  };

  /**
   * 執行核銷
   */
  const handleRedeem = async () => {
    if (!selectedItem || !redemptionCode.trim()) {
      Alert.alert(
        state.language === 'zh-TW' ? '提示' : 'Notice',
        state.language === 'zh-TW' ? '請輸入商家核銷碼' : 'Please enter merchant redemption code'
      );
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
        Alert.alert(
          state.language === 'zh-TW' ? '核銷失敗' : 'Redemption Failed',
          response.message || (state.language === 'zh-TW' ? '核銷碼錯誤' : 'Invalid redemption code')
        );
      }
    } catch (error: unknown) {
      // 處理特定錯誤
      const errorMessage = (error instanceof Error ? error.message : String(error)) || '';
      if (errorMessage.includes('expired') || errorMessage.includes('過期')) {
        Alert.alert(
          state.language === 'zh-TW' ? '已過期' : 'Expired',
          state.language === 'zh-TW' ? '此優惠券已過期' : 'This coupon has expired'
        );
      } else if (errorMessage.includes('redeemed') || errorMessage.includes('已使用')) {
        Alert.alert(
          state.language === 'zh-TW' ? '已使用' : 'Already Used',
          state.language === 'zh-TW' ? '此優惠券已使用' : 'This coupon has already been used'
        );
      } else {
        Alert.alert(
          state.language === 'zh-TW' ? '錯誤' : 'Error',
          state.language === 'zh-TW' ? '核銷失敗，請稍後再試' : 'Redemption failed. Please try again.'
        );
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
      Alert.alert(
        state.language === 'zh-TW' ? '錯誤' : 'Error',
        state.language === 'zh-TW' ? '刪除失敗' : 'Delete failed'
      );
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
          {state.language === 'zh-TW' ? '載入中...' : 'Loading...'}
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
              {state.language === 'zh-TW' ? '道具箱' : 'Item Box'}
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
              {state.language === 'zh-TW' ? '道具箱已滿！請刪除或使用部分優惠券後再抽卡。' : 'Item box is full! Please delete or use some coupons before drawing.'}
            </Text>
          </View>
        )}

        {/* 快滿警告（80% 以上） */}
        {slotCount >= maxSlots * 0.8 && slotCount < maxSlots && (
          <View style={{ backgroundColor: '#fef3c7', borderRadius: 12, padding: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={18} color="#d97706" />
            <Text style={{ fontSize: 13, color: '#92400e', marginLeft: 8, flex: 1 }}>
              {state.language === 'zh-TW' ? `道具箱快滿了，還剩 ${maxSlots - slotCount} 格` : `Item box almost full, ${maxSlots - slotCount} slots remaining`}
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
              language={state.language}
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
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
                    <Text style={{ fontSize: 12, color: selIsExpired ? '#ffffff' : MibuBrand.brown, textAlign: 'center' }}>
                      {selIsExpired
                        ? (state.language === 'zh-TW' ? '已過期' : 'Expired')
                        : `${state.language === 'zh-TW' ? '有效期至' : 'Valid until'} ${new Date(selectedItem.expiresAt).toLocaleDateString()}`
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
                      {state.language === 'zh-TW' ? '關閉' : 'Close'}
                    </Text>
                  </TouchableOpacity>

                  {/* 核銷按鈕（僅限可用狀態） */}
                  {selectedItem.status === 'active' && !selIsExpired && (
                    <TouchableOpacity
                      onPress={handleOpenRedeem}
                      style={{ flex: 1, backgroundColor: MibuBrand.brown, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>
                        {state.language === 'zh-TW' ? '核銷' : 'Redeem'}
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: MibuBrand.warmWhite, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 }}>
            {redeemSuccess ? (
              // ===== 核銷成功畫面 =====
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: MibuBrand.success, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Ionicons name="checkmark-circle" size={48} color="#ffffff" />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: MibuBrand.success, marginBottom: 8 }}>
                  {state.language === 'zh-TW' ? '核銷成功！' : 'Redeemed!'}
                </Text>
                <Text style={{ fontSize: 14, color: MibuBrand.brownLight, textAlign: 'center', marginBottom: 16 }}>
                  {state.language === 'zh-TW' ? '請出示此畫面給商家確認' : 'Please show this screen to the merchant'}
                </Text>

                {/* 倒數計時 */}
                {countdown !== null && (
                  <View style={{ backgroundColor: MibuBrand.brown, paddingHorizontal: 32, paddingVertical: 20, borderRadius: 16, marginBottom: 20 }}>
                    <Text style={{ fontSize: 48, fontWeight: '900', color: '#ffffff', textAlign: 'center' }}>
                      {formatCountdown(countdown)}
                    </Text>
                    <Text style={{ fontSize: 12, color: MibuBrand.cream, textAlign: 'center', marginTop: 4 }}>
                      {state.language === 'zh-TW' ? '倒數計時' : 'Countdown'}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setRedeemModalVisible(false)}
                  style={{ backgroundColor: MibuBrand.tan, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.dark }}>
                    {state.language === 'zh-TW' ? '完成' : 'Done'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // ===== 輸入核銷碼畫面 =====
              <>
                {/* 標題列 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: MibuBrand.dark }}>
                    {state.language === 'zh-TW' ? '核銷優惠券' : 'Redeem Coupon'}
                  </Text>
                  <TouchableOpacity onPress={() => setRedeemModalVisible(false)}>
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
                  {state.language === 'zh-TW' ? '請輸入商家核銷碼' : 'Enter Merchant Redemption Code'}
                </Text>
                <TextInput
                  value={redemptionCode}
                  onChangeText={setRedemptionCode}
                  placeholder={state.language === 'zh-TW' ? '8位核銷碼' : '8-digit code'}
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
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: '700', color: redemptionCode.length >= 8 ? '#ffffff' : MibuBrand.brownLight }}>
                      {state.language === 'zh-TW' ? '確認核銷' : 'Confirm Redemption'}
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: MibuBrand.warmWhite, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 }}>
            {/* 警告圖示 */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons name="trash" size={28} color={MibuBrand.error} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: MibuBrand.dark, marginBottom: 8 }}>
                {state.language === 'zh-TW' ? '確定刪除？' : 'Delete Item?'}
              </Text>
              <Text style={{ fontSize: 14, color: MibuBrand.brownLight, textAlign: 'center' }}>
                {state.language === 'zh-TW' ? '此操作無法復原' : 'This action cannot be undone'}
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
                style={{ flex: 1, backgroundColor: MibuBrand.tan, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.dark }}>
                  {state.language === 'zh-TW' ? '取消' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                disabled={deleting}
                style={{ flex: 1, backgroundColor: MibuBrand.error, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
              >
                {deleting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>
                    {state.language === 'zh-TW' ? '刪除' : 'Delete'}
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
