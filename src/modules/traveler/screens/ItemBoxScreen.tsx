import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, RefreshControl, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { InventoryItem, CouponTier } from '../../../types';
import { MibuBrand } from '../../../../constants/Colors';

const MAX_SLOTS = 30;
const GRID_COLS = 6;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLOT_SIZE = (SCREEN_WIDTH - 48) / GRID_COLS - 8;

const TIER_STYLES: Record<CouponTier, { borderColor: string; bgColor: string; glowColor: string; animate: boolean }> = {
  SP: { borderColor: MibuBrand.tierSP, bgColor: MibuBrand.tierSPBg, glowColor: 'rgba(212, 162, 76, 0.6)', animate: true },
  SSR: { borderColor: MibuBrand.tierSSR, bgColor: MibuBrand.tierSSRBg, glowColor: 'rgba(176, 136, 96, 0.4)', animate: false },
  SR: { borderColor: MibuBrand.tierSR, bgColor: MibuBrand.tierSRBg, glowColor: 'transparent', animate: false },
  S: { borderColor: MibuBrand.tierS, bgColor: MibuBrand.tierSBg, glowColor: 'transparent', animate: false },
  R: { borderColor: MibuBrand.tierR, bgColor: MibuBrand.tierRBg, glowColor: 'transparent', animate: false },
};

const TIER_ICONS: Record<CouponTier, string> = {
  SP: 'star',
  SSR: 'diamond',
  SR: 'trophy',
  S: 'ribbon',
  R: 'ticket',
};

// 計算剩餘時間
const getTimeRemaining = (expiresAt: string | null | undefined): { days: number; hours: number; isUrgent: boolean; isExpired: boolean; text: string } | null => {
  if (!expiresAt) return null;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, isUrgent: true, isExpired: true, text: '' };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

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
    isUrgent: days < 3,
    isExpired: false,
    text,
  };
};

interface InventorySlotProps {
  item: InventoryItem | null;
  index: number;
  onPress: (item: InventoryItem) => void;
  onLongPress: (item: InventoryItem) => void;
  language: string;
}

function InventorySlot({ item, index, onPress, onLongPress, language }: InventorySlotProps) {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (item?.tier === 'SP') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [item?.tier, pulseAnim]);

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
        <Text style={{ fontSize: 10, color: '#cbd5e1' }}>{index + 1}</Text>
      </View>
    );
  }

  const tierStyle = TIER_STYLES[item.tier] || TIER_STYLES.R;
  const isExpired = item.isExpired || Boolean(item.expiresAt && new Date(item.expiresAt) < new Date());
  const isDisabled = item.status === 'redeemed' || item.status === 'deleted' || isExpired;
  const timeRemaining = item.expiresAt && !isExpired ? getTimeRemaining(item.expiresAt) : null;

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

      <Ionicons
        name={(TIER_ICONS[item.tier] || 'ticket') as any}
        size={20}
        color={isDisabled ? '#9ca3af' : tierStyle.borderColor}
      />

      <Text
        style={{
          fontSize: 8,
          fontWeight: '800',
          color: isDisabled ? '#9ca3af' : tierStyle.borderColor,
          marginTop: 2,
        }}
      >
        {item.tier}
      </Text>

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

  if (item.tier === 'SP' && !isDisabled) {
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

export function ItemBoxScreen() {
  const { state, setUnreadCount, getToken } = useApp();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [slotCount, setSlotCount] = useState(0);
  const [maxSlots, setMaxSlots] = useState(MAX_SLOTS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const loadInventory = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      
      const data = await apiService.getInventory(token);
      const inventoryItems = (data.items || []).filter(i => !i.isDeleted);
      setItems(inventoryItems);
      setSlotCount(data.slotCount || inventoryItems.length);
      setMaxSlots(data.maxSlots || MAX_SLOTS);
      const unreadCount = inventoryItems.filter((item: InventoryItem) => !item.isRead && item.status === 'active').length;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => (prev !== null && prev > 0) ? prev - 1 : null);
      }, 1000);
    } else if (countdown === 0) {
      setRedeemSuccess(false);
      setCountdown(null);
      setRedeemModalVisible(false);
      setSelectedItem(null);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [countdown]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadInventory();
  };

  const handleItemPress = async (item: InventoryItem) => {
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

  const handleItemLongPress = (item: InventoryItem) => {
    if (item.status === 'deleted' || item.isDeleted) return;
    setSelectedItem(item);
    setDeleteModalVisible(true);
  };

  const handleOpenRedeem = () => {
    setDetailModalVisible(false);
    setRedemptionCode('');
    setRedeemSuccess(false);
    setCountdown(null);
    setTimeout(() => setRedeemModalVisible(true), 300);
  };

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
        setRedeemSuccess(true);
        setCountdown(180);
        setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, isRedeemed: true, status: 'redeemed' as const } : i));
      } else {
        Alert.alert(
          state.language === 'zh-TW' ? '核銷失敗' : 'Redemption Failed',
          response.message || (state.language === 'zh-TW' ? '核銷碼錯誤' : 'Invalid redemption code')
        );
      }
    } catch (error: unknown) {
      const errorMessage = error?.message || '';
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
        await loadInventory();
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

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const slots: (InventoryItem | null)[] = Array(maxSlots).fill(null);
  items.forEach(item => {
    if (item.slotIndex >= 0 && item.slotIndex < maxSlots) {
      slots[item.slotIndex] = item;
    }
  });

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

  return (
    <View style={{ flex: 1, backgroundColor: MibuBrand.warmWhite }}>
      {/* Header 區域 */}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="cube-outline" size={28} color={MibuBrand.brown} />
            <Text style={{ fontSize: 24, fontWeight: '800', color: MibuBrand.brown, marginLeft: 10 }}>
              {state.language === 'zh-TW' ? '道具箱' : 'Item Box'}
            </Text>
          </View>
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
        {slotCount >= maxSlots * 0.8 && slotCount < maxSlots && (
          <View style={{ backgroundColor: '#fef3c7', borderRadius: 12, padding: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={18} color="#d97706" />
            <Text style={{ fontSize: 13, color: '#92400e', marginLeft: 8, flex: 1 }}>
              {state.language === 'zh-TW' ? `道具箱快滿了，還剩 ${maxSlots - slotCount} 格` : `Item box almost full, ${maxSlots - slotCount} slots remaining`}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
          {(['SP', 'SSR', 'SR', 'S', 'R'] as CouponTier[]).map(tier => {
            const count = items.filter(i => i.tier === tier && i.status === 'active').length;
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

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: MibuBrand.warmWhite, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, borderWidth: 2, borderColor: selectedItem ? TIER_STYLES[selectedItem.tier]?.borderColor : MibuBrand.tan }}>
            {selectedItem && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: TIER_STYLES[selectedItem.tier]?.bgColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 3,
                      borderColor: TIER_STYLES[selectedItem.tier]?.borderColor,
                      marginBottom: 12,
                    }}
                  >
                    <Ionicons
                      name={(TIER_ICONS[selectedItem.tier] || 'ticket') as any}
                      size={36}
                      color={TIER_STYLES[selectedItem.tier]?.borderColor}
                    />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: TIER_STYLES[selectedItem.tier]?.borderColor }}>
                    {selectedItem.tier} - {getTierLabel(selectedItem.tier)}
                  </Text>
                </View>

                <Text style={{ fontSize: 18, fontWeight: '800', color: MibuBrand.dark, textAlign: 'center', marginBottom: 8 }}>
                  {selectedItem.title}
                </Text>

                {selectedItem.description && (
                  <Text style={{ fontSize: 14, color: MibuBrand.brownLight, textAlign: 'center', marginBottom: 16 }}>
                    {selectedItem.description}
                  </Text>
                )}

                {selectedItem.merchantName && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Ionicons name="storefront-outline" size={14} color={MibuBrand.copper} />
                    <Text style={{ fontSize: 13, color: MibuBrand.copper, marginLeft: 6 }}>{selectedItem.merchantName}</Text>
                  </View>
                )}

                {selectedItem.expiresAt && (
                  <View style={{ backgroundColor: selectedItem.isExpired ? MibuBrand.error : MibuBrand.cream, padding: 12, borderRadius: 12, marginBottom: 20 }}>
                    <Text style={{ fontSize: 12, color: selectedItem.isExpired ? '#ffffff' : MibuBrand.brown, textAlign: 'center' }}>
                      {selectedItem.isExpired
                        ? (state.language === 'zh-TW' ? '已過期' : 'Expired')
                        : `${state.language === 'zh-TW' ? '有效期至' : 'Valid until'} ${new Date(selectedItem.expiresAt).toLocaleDateString()}`
                      }
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setDetailModalVisible(false)}
                    style={{ flex: 1, backgroundColor: MibuBrand.tan, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.dark }}>
                      {state.language === 'zh-TW' ? '關閉' : 'Close'}
                    </Text>
                  </TouchableOpacity>

                  {selectedItem.status === 'active' && !selectedItem.isExpired && (
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
            )}
          </View>
        </View>
      </Modal>

      {/* Redeem Modal */}
      <Modal
        visible={redeemModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !redeemSuccess && setRedeemModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: MibuBrand.warmWhite, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 }}>
            {redeemSuccess ? (
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
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: MibuBrand.dark }}>
                    {state.language === 'zh-TW' ? '核銷優惠券' : 'Redeem Coupon'}
                  </Text>
                  <TouchableOpacity onPress={() => setRedeemModalVisible(false)}>
                    <Ionicons name="close" size={24} color={MibuBrand.brownLight} />
                  </TouchableOpacity>
                </View>

                {selectedItem && (
                  <View style={{ backgroundColor: MibuBrand.cream, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: TIER_STYLES[selectedItem.tier]?.borderColor }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.dark, marginBottom: 4 }}>
                      {selectedItem.title}
                    </Text>
                    {selectedItem.description && (
                      <Text style={{ fontSize: 13, color: MibuBrand.brownLight }}>{selectedItem.description}</Text>
                    )}
                  </View>
                )}

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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: MibuBrand.warmWhite, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 }}>
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

            {selectedItem && (
              <View style={{ backgroundColor: MibuBrand.cream, borderRadius: 12, padding: 12, marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: MibuBrand.dark, textAlign: 'center' }}>
                  {selectedItem.title}
                </Text>
              </View>
            )}

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
