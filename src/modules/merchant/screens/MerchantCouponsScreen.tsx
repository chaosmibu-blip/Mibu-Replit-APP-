import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { MerchantCoupon, MerchantCouponTier, CreateMerchantCouponParams, UpdateMerchantCouponParams } from '../types';
import { TierBadge } from '../components/TierBadge';
import { TIER_ORDER, getTierStyle } from '../constants/tierStyles';

export function MerchantCouponsScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<MerchantCoupon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<MerchantCoupon | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    tier: MerchantCouponTier;
    content: string;
    terms: string;
    quantity: string;
    validUntil: string;
  }>({
    name: '',
    tier: 'R',
    content: '',
    terms: '',
    quantity: '100',
    validUntil: '',
  });

  const translations = {
    title: isZh ? '優惠券管理' : 'Coupon Management',
    addCoupon: isZh ? '新增優惠券' : 'Add Coupon',
    editCoupon: isZh ? '編輯優惠券' : 'Edit Coupon',
    name: isZh ? '優惠券名稱' : 'Coupon Name',
    tier: isZh ? '稀有度等級' : 'Rarity Tier',
    content: isZh ? '優惠內容' : 'Discount Content',
    terms: isZh ? '使用條款' : 'Terms & Conditions',
    quantity: isZh ? '發放數量' : 'Quantity',
    validUntil: isZh ? '有效期限 (YYYY-MM-DD)' : 'Valid Until (YYYY-MM-DD)',
    save: isZh ? '儲存' : 'Save',
    cancel: isZh ? '取消' : 'Cancel',
    delete: isZh ? '刪除' : 'Delete',
    remaining: isZh ? '剩餘' : 'Remaining',
    active: isZh ? '啟用中' : 'Active',
    inactive: isZh ? '已停用' : 'Inactive',
    expired: isZh ? '已過期' : 'Expired',
    noCoupons: isZh ? '尚未創建優惠券' : 'No coupons yet',
    confirmDelete: isZh ? '確定要刪除此優惠券嗎？' : 'Delete this coupon?',
    tierProbability: isZh ? '抽中機率' : 'Draw Probability',
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await apiService.getMerchantCoupons(token);
      setCoupons(response.coupons || []);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      name: '',
      tier: 'R',
      content: '',
      terms: '',
      quantity: '100',
      validUntil: '',
    });
    setShowModal(true);
  };

  const openEditModal = (coupon: MerchantCoupon) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name,
      tier: coupon.tier,
      content: coupon.content,
      terms: coupon.terms || '',
      quantity: String(coupon.quantity),
      validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '請填寫必要欄位' : 'Please fill required fields');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      const parsedQuantity = parseInt(formData.quantity, 10);
      const quantity = isNaN(parsedQuantity) || parsedQuantity < 1 ? 100 : parsedQuantity;

      if (editingCoupon) {
        const updateParams: UpdateMerchantCouponParams = {};
        if (formData.name.trim() !== editingCoupon.name) {
          updateParams.name = formData.name.trim();
        }
        if (formData.tier !== editingCoupon.tier) {
          updateParams.tier = formData.tier;
        }
        if (formData.content.trim() !== editingCoupon.content) {
          updateParams.content = formData.content.trim();
        }
        if (formData.terms.trim() !== (editingCoupon.terms || '')) {
          updateParams.terms = formData.terms.trim() || undefined;
        }
        if (quantity !== editingCoupon.quantity) {
          updateParams.quantity = quantity;
        }
        const validUntilVal = formData.validUntil || undefined;
        const existingValidUntil = editingCoupon.validUntil ? editingCoupon.validUntil.split('T')[0] : undefined;
        if (validUntilVal !== existingValidUntil) {
          updateParams.validUntil = validUntilVal;
        }
        
        if (Object.keys(updateParams).length > 0) {
          await apiService.updateMerchantCoupon(token, editingCoupon.id, updateParams);
        }
      } else {
        const createParams: CreateMerchantCouponParams = {
          name: formData.name.trim(),
          tier: formData.tier,
          content: formData.content.trim(),
          terms: formData.terms.trim() || undefined,
          quantity,
          validUntil: formData.validUntil || undefined,
          isActive: true,
        };
        await apiService.createMerchantCoupon(token, createParams);
      }

      setShowModal(false);
      loadCoupons();
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '儲存失敗' : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (couponId: number) => {
    Alert.alert(
      isZh ? '確認刪除' : 'Confirm Delete',
      translations.confirmDelete,
      [
        { text: translations.cancel, style: 'cancel' },
        {
          text: translations.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) return;

              await apiService.deleteMerchantCoupon(token, couponId);
              loadCoupons();
            } catch (error) {
              Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '刪除失敗' : 'Delete failed');
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (coupon: MerchantCoupon) => {
    try {
      const token = await getToken();
      if (!token) return;

      await apiService.updateMerchantCoupon(token, coupon.id, { isActive: !coupon.isActive });
      loadCoupons();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(isZh ? 'zh-TW' : 'en-US');
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations.title}</Text>
        <TouchableOpacity onPress={openCreateModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.probabilityInfo}>
          <Text style={styles.probabilityTitle}>{translations.tierProbability}</Text>
          <View style={styles.probabilityGrid}>
            {TIER_ORDER.map(tier => {
              const style = getTierStyle(tier);
              return (
                <View key={tier} style={styles.probabilityItem}>
                  <TierBadge tier={tier} isZh={isZh} size="small" />
                  <Text style={[styles.probabilityValue, { color: style.textColor }]}>
                    {style.probability}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {coupons.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>{translations.noCoupons}</Text>
            <TouchableOpacity style={styles.emptyAddButton} onPress={openCreateModal}>
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.emptyAddText}>{translations.addCoupon}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          coupons.map(coupon => (
            <TouchableOpacity
              key={coupon.id}
              style={[
                styles.couponCard,
                !coupon.isActive && styles.couponCardInactive,
              ]}
              onPress={() => openEditModal(coupon)}
            >
              <View style={styles.couponHeader}>
                <TierBadge tier={coupon.tier} isZh={isZh} />
                <View style={[
                  styles.statusBadge,
                  coupon.isActive
                    ? (isExpired(coupon.validUntil) ? styles.statusExpired : styles.statusActive)
                    : styles.statusInactive
                ]}>
                  <Text style={styles.statusText}>
                    {coupon.isActive
                      ? (isExpired(coupon.validUntil) ? translations.expired : translations.active)
                      : translations.inactive}
                  </Text>
                </View>
              </View>

              <Text style={styles.couponName}>{coupon.name}</Text>
              <Text style={styles.couponContent}>{coupon.content}</Text>

              <View style={styles.couponMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="layers-outline" size={14} color="#64748b" />
                  <Text style={styles.metaText}>
                    {translations.remaining}: {coupon.remainingQuantity}/{coupon.quantity}
                  </Text>
                </View>
                {coupon.validUntil && (
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{formatDate(coupon.validUntil)}</Text>
                  </View>
                )}
              </View>

              <View style={styles.couponActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleActive(coupon)}
                >
                  <Ionicons
                    name={coupon.isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                    size={20}
                    color={coupon.isActive ? '#f59e0b' : '#22c55e'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(coupon.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCoupon ? translations.editCoupon : translations.addCoupon}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.inputLabel}>{translations.name} *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                placeholder={isZh ? '例：九折優惠' : 'e.g., 10% Off'}
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.inputLabel}>{translations.tier}</Text>
              <View style={styles.tierGrid}>
                {TIER_ORDER.map(tier => {
                  const tierStyle = getTierStyle(tier);
                  return (
                    <TouchableOpacity
                      key={tier}
                      style={[
                        styles.tierOption,
                        formData.tier === tier && {
                          backgroundColor: tierStyle.backgroundColor,
                          borderColor: tierStyle.borderColor,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, tier })}
                    >
                      <Text style={[
                        styles.tierOptionText,
                        formData.tier === tier && { color: tierStyle.textColor, fontWeight: '700' },
                      ]}>
                        {tier} ({tierStyle.probability}%)
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>{translations.content} *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.content}
                onChangeText={text => setFormData({ ...formData, content: text })}
                placeholder={isZh ? '優惠詳細內容' : 'Discount details'}
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>{translations.terms}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.terms}
                onChangeText={text => setFormData({ ...formData, terms: text })}
                placeholder={isZh ? '使用條款（選填）' : 'Terms (optional)'}
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={2}
              />

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>{translations.quantity}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.quantity}
                    onChangeText={text => setFormData({ ...formData, quantity: text.replace(/[^0-9]/g, '') })}
                    keyboardType="number-pad"
                    placeholder="100"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>{translations.validUntil}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.validUntil}
                    onChangeText={text => setFormData({ ...formData, validUntil: text })}
                    placeholder="2025-12-31"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>{translations.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{translations.save}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#6366f1',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  probabilityInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  probabilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  probabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  probabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  probabilityValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  couponCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  couponCardInactive: {
    opacity: 0.6,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#f1f5f9',
  },
  statusExpired: {
    backgroundColor: '#fef2f2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  couponName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  couponContent: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  couponMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  couponActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  actionButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tierOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tierOptionText: {
    fontSize: 13,
    color: '#64748b',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
