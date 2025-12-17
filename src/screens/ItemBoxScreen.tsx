import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { InventoryItem } from '../types';

export function ItemBoxScreen() {
  const { state, setUnreadCount } = useApp();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const loadInventory = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('@mibu_token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const data = await apiService.getInventory(token);
      const inventoryItems = data.items || [];
      setItems(inventoryItems);
      const unreadCount = inventoryItems.filter((item: InventoryItem) => !item.isRead).length;
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
    if (!item.isRead) {
      try {
        const token = await AsyncStorage.getItem('@mibu_token');
        if (token) {
          await apiService.markInventoryItemRead(token, item.id);
          setItems(prev => {
            const updated = prev.map(i => i.id === item.id ? { ...i, isRead: true } : i);
            const newUnreadCount = updated.filter(i => !i.isRead).length;
            setUnreadCount(newUnreadCount);
            return updated;
          });
        }
      } catch (error) {
        console.error('Failed to mark item as read:', error);
      }
    }
    
    if (item.itemType === 'coupon' && !item.isRedeemed) {
      setSelectedItem(item);
      setRedemptionCode('');
      setRedeemSuccess(false);
      setCountdown(null);
      setRedeemModalVisible(true);
    }
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
      const token = await AsyncStorage.getItem('@mibu_token');
      if (!token) return;

      const response = await apiService.redeemInventoryItem(token, selectedItem.id, redemptionCode.trim());
      
      if (response.success) {
        setRedeemSuccess(true);
        setCountdown(180);
        setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, isRedeemed: true } : i));
      } else {
        Alert.alert(
          state.language === 'zh-TW' ? '核銷失敗' : 'Redemption Failed',
          response.message || (state.language === 'zh-TW' ? '核銷碼錯誤' : 'Invalid redemption code')
        );
      }
    } catch (error) {
      Alert.alert(
        state.language === 'zh-TW' ? '錯誤' : 'Error',
        state.language === 'zh-TW' ? '核銷失敗，請稍後再試' : 'Redemption failed. Please try again.'
      );
    } finally {
      setRedeeming(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'coupon': return 'ticket';
      case 'ticket': return 'pricetag';
      case 'gift': return 'gift';
      default: return 'cube';
    }
  };

  const getItemColor = (itemType: string) => {
    switch (itemType) {
      case 'coupon': return '#f59e0b';
      case 'ticket': return '#6366f1';
      case 'gift': return '#ec4899';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 16, color: '#64748b' }}>
          {state.language === 'zh-TW' ? '載入中...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#f8fafc',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#fef3c7',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Ionicons name="cube-outline" size={48} color="#f59e0b" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#64748b', marginBottom: 8 }}>
          {state.language === 'zh-TW' ? '道具箱是空的' : 'Itembox is Empty'}
        </Text>
        <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
          {state.language === 'zh-TW' ? '抽蛋獲得的優惠券會出現在這裡' : 'Coupons from gacha will appear here'}
        </Text>
      </View>
    );
  }

  const unreadCount = items.filter(i => !i.isRead).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6366f1']} />
        }
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#64748b' }}>
            {state.language === 'zh-TW' ? `共 ${items.length} 個道具` : `${items.length} items`}
          </Text>
          {unreadCount > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', marginRight: 6 }} />
              <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: '600' }}>
                {state.language === 'zh-TW' ? `${unreadCount} 個未讀` : `${unreadCount} unread`}
              </Text>
            </View>
          )}
        </View>

        {items.map((item) => {
          const itemColor = getItemColor(item.itemType);
          const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleItemPress(item)}
              disabled={item.isRedeemed || !!isExpired}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                opacity: (item.isRedeemed || isExpired) ? 0.6 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
                borderWidth: !item.isRead ? 2 : 0,
                borderColor: !item.isRead ? '#ef4444' : 'transparent',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: itemColor + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name={getItemIcon(item.itemType) as any} size={24} color={itemColor} />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text
                    style={{ fontSize: 16, fontWeight: '700', color: '#1e293b', flex: 1 }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {!item.isRead && (
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', marginLeft: 8 }} />
                  )}
                </View>
                
                {item.description && (
                  <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {item.merchantName && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="storefront-outline" size={12} color="#94a3b8" />
                      <Text style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>{item.merchantName}</Text>
                    </View>
                  )}
                  {item.expiresAt && (
                    <Text style={{ fontSize: 11, color: isExpired ? '#ef4444' : '#94a3b8' }}>
                      {isExpired 
                        ? (state.language === 'zh-TW' ? '已過期' : 'Expired')
                        : `${state.language === 'zh-TW' ? '有效期至' : 'Valid until'} ${new Date(item.expiresAt).toLocaleDateString()}`
                      }
                    </Text>
                  )}
                </View>
              </View>

              {item.isRedeemed ? (
                <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#16a34a' }}>
                    {state.language === 'zh-TW' ? '已使用' : 'Used'}
                  </Text>
                </View>
              ) : !isExpired && (
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal
        visible={redeemModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !redeemSuccess && setRedeemModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 }}>
            {redeemSuccess ? (
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#16a34a', marginBottom: 8 }}>
                  {state.language === 'zh-TW' ? '核銷成功！' : 'Redeemed!'}
                </Text>
                <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 16 }}>
                  {state.language === 'zh-TW' ? '請出示此畫面給商家確認' : 'Please show this screen to the merchant'}
                </Text>
                
                {countdown !== null && (
                  <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, marginBottom: 20 }}>
                    <Text style={{ fontSize: 36, fontWeight: '900', color: '#d97706', textAlign: 'center' }}>
                      {formatCountdown(countdown)}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#92400e', textAlign: 'center', marginTop: 4 }}>
                      {state.language === 'zh-TW' ? '倒數計時' : 'Countdown'}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setRedeemModalVisible(false)}
                  style={{ backgroundColor: '#6366f1', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>
                    {state.language === 'zh-TW' ? '完成' : 'Done'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#1e293b' }}>
                    {state.language === 'zh-TW' ? '核銷優惠券' : 'Redeem Coupon'}
                  </Text>
                  <TouchableOpacity onPress={() => setRedeemModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {selectedItem && (
                  <View style={{ backgroundColor: '#fef3c7', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#92400e', marginBottom: 4 }}>
                      {selectedItem.title}
                    </Text>
                    {selectedItem.description && (
                      <Text style={{ fontSize: 13, color: '#a16207' }}>{selectedItem.description}</Text>
                    )}
                  </View>
                )}

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 }}>
                  {state.language === 'zh-TW' ? '請輸入商家核銷碼' : 'Enter Merchant Redemption Code'}
                </Text>
                <TextInput
                  value={redemptionCode}
                  onChangeText={setRedemptionCode}
                  placeholder={state.language === 'zh-TW' ? '8位核銷碼' : '8-digit code'}
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="characters"
                  maxLength={8}
                  style={{
                    backgroundColor: '#f1f5f9',
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 20,
                    fontWeight: '700',
                    textAlign: 'center',
                    letterSpacing: 4,
                    color: '#1e293b',
                    marginBottom: 20,
                  }}
                />

                <TouchableOpacity
                  onPress={handleRedeem}
                  disabled={redeeming || redemptionCode.length < 8}
                  style={{
                    backgroundColor: redemptionCode.length >= 8 ? '#6366f1' : '#e2e8f0',
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                >
                  {redeeming ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: '700', color: redemptionCode.length >= 8 ? '#ffffff' : '#94a3b8' }}>
                      {state.language === 'zh-TW' ? '確認核銷' : 'Confirm Redemption'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
