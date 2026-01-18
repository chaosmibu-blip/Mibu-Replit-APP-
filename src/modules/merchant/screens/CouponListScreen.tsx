/**
 * CouponListScreen - 優惠券列表
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { MerchantCoupon, MerchantCouponTier } from '../../../types';
import { MibuBrand } from '../../../../constants/Colors';

const TIER_COLORS: Record<MerchantCouponTier, { bg: string; text: string; border: string }> = {
  SP: { bg: '#fef3c7', text: '#b45309', border: '#fbbf24' },
  SSR: { bg: '#fce7f3', text: '#be185d', border: '#f472b6' },
  SR: { bg: '#dbeafe', text: '#1d4ed8', border: '#60a5fa' },
  S: { bg: '#dcfce7', text: '#16a34a', border: '#4ade80' },
  R: { bg: '#f1f5f9', text: '#475569', border: '#94a3b8' },
};

const TIER_PROBABILITY: Record<MerchantCouponTier, string> = {
  SP: '0.1%',
  SSR: '0.9%',
  SR: '4%',
  S: '15%',
  R: '80%',
};

export default function CouponListScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [coupons, setCoupons] = useState<MerchantCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const t = {
    title: isZh ? '優惠券管理' : 'Coupon Management',
    subtitle: isZh ? '創建和管理您的優惠券' : 'Create and manage your coupons',
    addCoupon: isZh ? '新增優惠券' : 'Add Coupon',
    noCoupons: isZh ? '尚未創建優惠券' : 'No coupons yet',
    noCouponsHint: isZh ? '開始創建您的第一張優惠券' : 'Start creating your first coupon',
    remaining: isZh ? '剩餘' : 'Remaining',
    active: isZh ? '啟用中' : 'Active',
    inactive: isZh ? '已停用' : 'Inactive',
    expired: isZh ? '已過期' : 'Expired',
    edit: isZh ? '編輯' : 'Edit',
    delete: isZh ? '刪除' : 'Delete',
    confirmDelete: isZh ? '確定要刪除此優惠券嗎？' : 'Delete this coupon?',
    deleteSuccess: isZh ? '刪除成功' : 'Deleted successfully',
    deleteFailed: isZh ? '刪除失敗' : 'Delete failed',
    probability: isZh ? '抽中機率' : 'Draw rate',
    validUntil: isZh ? '有效期至' : 'Valid until',
    loading: isZh ? '載入中...' : 'Loading...',
  };

  const loadCoupons = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const token = await getToken();
      if (!token) return;

      const response = await apiService.getMerchantCoupons(token);
      setCoupons(response.coupons || []);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCoupons();
    }, [])
  );

  const handleDelete = (coupon: MerchantCoupon) => {
    Alert.alert(
      t.delete,
      t.confirmDelete,
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            setDeleting(coupon.id);
            try {
              const token = await getToken();
              if (!token) return;
              await apiService.deleteMerchantCoupon(token, coupon.id);
              setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
            } catch (error) {
              console.error('Delete failed:', error);
              Alert.alert(isZh ? '錯誤' : 'Error', t.deleteFailed);
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const getCouponStatus = (coupon: MerchantCoupon) => {
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return { label: t.expired, color: '#ef4444' };
    }
    if (!coupon.isActive) {
      return { label: t.inactive, color: '#64748b' };
    }
    return { label: t.active, color: '#16a34a' };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadCoupons(true)} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/merchant/coupon/new' as any)}
      >
        <Ionicons name="add-circle" size={20} color="#ffffff" />
        <Text style={styles.addButtonText}>{t.addCoupon}</Text>
      </TouchableOpacity>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="ticket-outline" size={48} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>{t.noCoupons}</Text>
          <Text style={styles.emptySubtitle}>{t.noCouponsHint}</Text>
        </View>
      ) : (
        <View style={styles.couponsList}>
          {coupons.map((coupon) => {
            const tierStyle = TIER_COLORS[coupon.tier];
            const status = getCouponStatus(coupon);
            return (
              <View key={coupon.id} style={styles.couponCard}>
                {/* Tier Badge */}
                <View
                  style={[
                    styles.tierBadge,
                    { backgroundColor: tierStyle.bg, borderColor: tierStyle.border },
                  ]}
                >
                  <Text style={[styles.tierText, { color: tierStyle.text }]}>
                    {coupon.tier}
                  </Text>
                  <Text style={[styles.tierProb, { color: tierStyle.text }]}>
                    {TIER_PROBABILITY[coupon.tier]}
                  </Text>
                </View>

                {/* Coupon Info */}
                <View style={styles.couponInfo}>
                  <Text style={styles.couponName}>{coupon.name}</Text>
                  <Text style={styles.couponContent} numberOfLines={2}>
                    {coupon.content}
                  </Text>
                  <View style={styles.couponMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="cube-outline" size={14} color="#64748b" />
                      <Text style={styles.metaText}>
                        {t.remaining}: {coupon.remainingQuantity}/{coupon.quantity}
                      </Text>
                    </View>
                    {coupon.validUntil && (
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={14} color="#64748b" />
                        <Text style={styles.metaText}>
                          {coupon.validUntil.split('T')[0]}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Status & Actions */}
                <View style={styles.couponActions}>
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text style={[styles.statusLabel, { color: status.color }]}>
                    {status.label}
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => router.push(`/merchant/coupon/${coupon.id}` as any)}
                    >
                      <Ionicons name="create-outline" size={20} color={MibuBrand.brown} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDelete(coupon)}
                      disabled={deleting === coupon.id}
                    >
                      {deleting === coupon.id ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  loadingText: {
    marginTop: 12,
    color: MibuBrand.copper,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: MibuBrand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.brownDark,
  },
  subtitle: {
    fontSize: 14,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MibuBrand.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: MibuBrand.copper,
    textAlign: 'center',
  },
  couponsList: {
    gap: 16,
  },
  couponCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '800',
  },
  tierProb: {
    fontSize: 12,
    fontWeight: '500',
  },
  couponInfo: {
    marginBottom: 12,
  },
  couponName: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  couponContent: {
    fontSize: 14,
    color: MibuBrand.copper,
    lineHeight: 20,
    marginBottom: 8,
  },
  couponMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  couponActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
