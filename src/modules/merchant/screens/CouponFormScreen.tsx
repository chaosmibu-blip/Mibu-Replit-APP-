/**
 * CouponFormScreen - 新增/編輯優惠券
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { MerchantCoupon, MerchantCouponTier } from '../../../types';
import { MibuBrand } from '../../../../constants/Colors';

const TIERS: { id: MerchantCouponTier; label: string; prob: string; color: string }[] = [
  { id: 'SP', label: 'SP', prob: '0.1%', color: MibuBrand.tierSP },
  { id: 'SSR', label: 'SSR', prob: '0.9%', color: MibuBrand.tierSSR },
  { id: 'SR', label: 'SR', prob: '4%', color: MibuBrand.tierSR },
  { id: 'S', label: 'S', prob: '15%', color: MibuBrand.tierS },
  { id: 'R', label: 'R', prob: '80%', color: MibuBrand.tierR },
];

export default function CouponFormScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isZh = state.language === 'zh-TW';
  const isEdit = !!params.id && params.id !== 'new';

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tier: 'R' as MerchantCouponTier,
    content: '',
    terms: '',
    quantity: '100',
    validUntil: '',
    isActive: true,
  });

  const t = {
    titleNew: isZh ? '新增優惠券' : 'Add Coupon',
    titleEdit: isZh ? '編輯優惠券' : 'Edit Coupon',
    name: isZh ? '優惠券名稱' : 'Coupon Name',
    namePlaceholder: isZh ? '例：滿千折百' : 'e.g. 10% Off',
    tier: isZh ? '稀有度等級' : 'Rarity Tier',
    tierHint: isZh ? '等級越高，抽中機率越低' : 'Higher tier = lower draw rate',
    content: isZh ? '優惠內容' : 'Discount Content',
    contentPlaceholder: isZh ? '詳細描述優惠內容...' : 'Describe the discount...',
    terms: isZh ? '使用條款' : 'Terms & Conditions',
    termsPlaceholder: isZh ? '使用限制與注意事項（選填）' : 'Usage restrictions (optional)',
    quantity: isZh ? '發放數量' : 'Quantity',
    quantityHint: isZh ? '總共可發放的數量' : 'Total coupons to distribute',
    validUntil: isZh ? '有效期限' : 'Valid Until',
    validUntilPlaceholder: 'YYYY-MM-DD',
    validUntilHint: isZh ? '留空表示無期限' : 'Leave empty for no expiration',
    isActive: isZh ? '立即啟用' : 'Activate Now',
    save: isZh ? '儲存' : 'Save',
    required: isZh ? '必填' : 'Required',
    fillRequired: isZh ? '請填寫必要欄位' : 'Please fill required fields',
    saveSuccess: isZh ? '儲存成功' : 'Saved successfully',
    saveFailed: isZh ? '儲存失敗' : 'Save failed',
    loading: isZh ? '載入中...' : 'Loading...',
  };

  useEffect(() => {
    if (isEdit) {
      loadCoupon();
    }
  }, [params.id]);

  const loadCoupon = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await apiService.getMerchantCoupons(token);
      const coupon = response.coupons.find((c) => c.id === Number(params.id));
      if (coupon) {
        setFormData({
          name: coupon.name,
          tier: coupon.tier,
          content: coupon.content,
          terms: coupon.terms || '',
          quantity: String(coupon.quantity),
          validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
          isActive: coupon.isActive,
        });
      }
    } catch (error) {
      console.error('Failed to load coupon:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      Alert.alert(isZh ? '提示' : 'Notice', t.fillRequired);
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      const quantity = parseInt(formData.quantity, 10) || 100;

      if (isEdit) {
        await apiService.updateMerchantCoupon(token, Number(params.id), {
          name: formData.name.trim(),
          tier: formData.tier,
          content: formData.content.trim(),
          terms: formData.terms.trim() || undefined,
          quantity,
          validUntil: formData.validUntil || undefined,
          isActive: formData.isActive,
        });
      } else {
        await apiService.createMerchantCoupon(token, {
          name: formData.name.trim(),
          tier: formData.tier,
          content: formData.content.trim(),
          terms: formData.terms.trim() || undefined,
          quantity,
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: formData.validUntil || undefined,
          isActive: formData.isActive,
        });
      }

      Alert.alert(isZh ? '成功' : 'Success', t.saveSuccess, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', t.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.title}>{isEdit ? t.titleEdit : t.titleNew}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t.name}</Text>
              <Text style={styles.required}>{t.required}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(v) => updateField('name', v)}
              placeholder={t.namePlaceholder}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Tier */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t.tier}</Text>
              <Text style={styles.hint}>{t.tierHint}</Text>
            </View>
            <View style={styles.tierGrid}>
              {TIERS.map((tier) => (
                <TouchableOpacity
                  key={tier.id}
                  style={[
                    styles.tierButton,
                    formData.tier === tier.id && styles.tierButtonActive,
                    formData.tier === tier.id && { borderColor: tier.color },
                  ]}
                  onPress={() => updateField('tier', tier.id)}
                >
                  <Text
                    style={[
                      styles.tierLabel,
                      formData.tier === tier.id && { color: tier.color },
                    ]}
                  >
                    {tier.label}
                  </Text>
                  <Text
                    style={[
                      styles.tierProb,
                      formData.tier === tier.id && { color: tier.color },
                    ]}
                  >
                    {tier.prob}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Content */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t.content}</Text>
              <Text style={styles.required}>{t.required}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(v) => updateField('content', v)}
              placeholder={t.contentPlaceholder}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Terms */}
          <View style={styles.field}>
            <Text style={styles.label}>{t.terms}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.terms}
              onChangeText={(v) => updateField('terms', v)}
              placeholder={t.termsPlaceholder}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          {/* Quantity & Valid Until Row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>{t.quantity}</Text>
              <TextInput
                style={styles.input}
                value={formData.quantity}
                onChangeText={(v) => updateField('quantity', v.replace(/[^0-9]/g, ''))}
                placeholder="100"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>{t.validUntil}</Text>
              <TextInput
                style={styles.input}
                value={formData.validUntil}
                onChangeText={(v) => updateField('validUntil', v)}
                placeholder={t.validUntilPlaceholder}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Is Active */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => updateField('isActive', !formData.isActive)}
          >
            <Text style={styles.toggleLabel}>{t.isActive}</Text>
            <View
              style={[
                styles.toggle,
                formData.isActive && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  formData.isActive && styles.toggleKnobActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
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
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  required: {
    fontSize: 12,
    color: '#ef4444',
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  tierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tierButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minWidth: 64,
  },
  tierButtonActive: {
    backgroundColor: '#f8fafc',
  },
  tierLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748b',
  },
  tierProb: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#6366f1',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 32,
  },
  saveButtonDisabled: {
    backgroundColor: '#c7d2fe',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
