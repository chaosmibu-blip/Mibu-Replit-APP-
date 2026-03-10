/**
 * CouponFormScreen - 新增/編輯優惠券
 *
 * 更新日期：2026-02-12（Phase 3 遷移至 React Query）
 */
import React, { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../../context/I18nContext';
import {
  useMerchantMe,
  useMerchantCoupons,
  useCreateCoupon,
  useUpdateCoupon,
} from '../../../hooks/useMerchantQueries';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { CouponTier, CouponRarityLevel } from '../../../types';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

const TIERS: { id: CouponTier; label: string; prob: string; color: string }[] = [
  { id: 'SP', label: 'SP', prob: '0.1%', color: MibuBrand.tierSP },
  { id: 'SSR', label: 'SSR', prob: '0.9%', color: MibuBrand.tierSSR },
  { id: 'SR', label: 'SR', prob: '4%', color: MibuBrand.tierSR },
  { id: 'S', label: 'S', prob: '15%', color: MibuBrand.tierS },
  { id: 'R', label: 'R', prob: '80%', color: MibuBrand.tierR },
];

export function CouponFormScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!params.id && params.id !== 'new';

  // ============ React Query Hooks ============
  const meQuery = useMerchantMe();
  const merchantId = meQuery.data?.merchant?.id;
  const couponsQuery = useMerchantCoupons(merchantId);
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();

  // 從快取中找出正在編輯的優惠券
  const existingCoupon = isEdit
    ? couponsQuery.data?.coupons?.find((c) => c.id === Number(params.id))
    : undefined;

  // ============ 衍生狀態 ============
  const loading = isEdit && couponsQuery.isLoading;
  const saving = createMutation.isPending || updateMutation.isPending;

  // ============ UI 狀態 ============
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    rarity: 'R' as CouponRarityLevel,
    terms: '',
    remainingQuantity: '100',
    isActive: true,
  });

  // 當快取資料載入完成且有編輯對象時，填入表單
  React.useEffect(() => {
    if (existingCoupon) {
      setFormData({
        code: existingCoupon.code,
        title: existingCoupon.title,
        rarity: existingCoupon.rarity ?? 'R',
        terms: existingCoupon.terms || '',
        remainingQuantity: String(existingCoupon.remainingQuantity ?? 0),
        isActive: existingCoupon.isActive,
      });
    }
  }, [existingCoupon?.id]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.title.trim()) {
      Alert.alert(t.merchant_notice, t.common_fillRequired);
      return;
    }

    try {
      const quantity = parseInt(formData.remainingQuantity, 10) || 100;

      if (isEdit) {
        await updateMutation.mutateAsync({
          couponId: Number(params.id),
          data: {
            title: formData.title.trim(),
            terms: formData.terms.trim() || undefined,
            remainingQuantity: quantity,
            isActive: formData.isActive,
          },
        });
      } else {
        if (!merchantId) {
          Alert.alert(t.common_error || '錯誤', '商家資料尚未載入');
          return;
        }
        await createMutation.mutateAsync({
          code: formData.code.trim(),
          title: formData.title.trim(),
          terms: formData.terms.trim() || undefined,
          merchantId,
          rarity: formData.rarity,
          remainingQuantity: quantity,
          isActive: formData.isActive,
        });
      }

      Alert.alert(t.common_success, t.merchant_saveSuccess, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert(t.common_error, t.common_saveFailed);
    }
  };

  if (isEdit && couponsQuery.isError) {
    return (
      <View style={styles.loadingContainer}>
        <ErrorState
          message={t.common_loadFailed}
          onRetry={() => couponsQuery.refetch()}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
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
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="返回">
            <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
          </TouchableOpacity>
          <Text style={styles.title}>{isEdit ? t.merchant_couponEditTitle : t.merchant_couponAddTitle}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Code */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t.merchant_couponCode || '優惠券代碼'}</Text>
              <Text style={styles.required}>{t.common_required}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.code}
              onChangeText={(v) => updateField('code', v)}
              placeholder={t.merchant_couponCodePlaceholder || '例：SUMMER2026'}
              placeholderTextColor={UIColors.textSecondary}
              editable={!isEdit}
            />
          </View>

          {/* Title */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t.merchant_couponName}</Text>
              <Text style={styles.required}>{t.common_required}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(v) => updateField('title', v)}
              placeholder={t.merchant_couponNamePlaceholder}
              placeholderTextColor={UIColors.textSecondary}
            />
          </View>

          {/* Rarity（僅新增時可選） */}
          {!isEdit && (
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{t.merchant_rarityTier}</Text>
                <Text style={styles.hint}>{t.merchant_tierHint}</Text>
              </View>
              <View style={styles.tierGrid}>
                {TIERS.map((tier) => (
                  <TouchableOpacity
                    key={tier.id}
                    style={[
                      styles.tierButton,
                      formData.rarity === tier.id && styles.tierButtonActive,
                      formData.rarity === tier.id && { borderColor: tier.color },
                    ]}
                    onPress={() => updateField('rarity', tier.id)}
                    accessibilityLabel={`稀有度 ${tier.label}，機率 ${tier.prob}`}
                  >
                    <Text
                      style={[
                        styles.tierLabel,
                        formData.rarity === tier.id && { color: tier.color },
                      ]}
                    >
                      {tier.label}
                    </Text>
                    <Text
                      style={[
                        styles.tierProb,
                        formData.rarity === tier.id && { color: tier.color },
                      ]}
                    >
                      {tier.prob}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Terms */}
          <View style={styles.field}>
            <Text style={styles.label}>{t.merchant_terms}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.terms}
              onChangeText={(v) => updateField('terms', v)}
              placeholder={t.merchant_termsPlaceholder}
              placeholderTextColor={UIColors.textSecondary}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          {/* Quantity */}
          <View style={styles.field}>
            <Text style={styles.label}>{t.merchant_quantity}</Text>
            <TextInput
              style={styles.input}
              value={formData.remainingQuantity}
              onChangeText={(v) => updateField('remainingQuantity', v.replace(/[^0-9]/g, ''))}
              placeholder="100"
              placeholderTextColor={UIColors.textSecondary}
              keyboardType="number-pad"
            />
          </View>

          {/* Is Active */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => updateField('isActive', !formData.isActive)}
            accessibilityLabel={formData.isActive ? '停用優惠券' : '啟用優惠券'}
          >
            <Text style={styles.toggleLabel}>{t.merchant_activateNow}</Text>
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
          accessibilityLabel="儲存"
        >
          {saving ? (
            <ActivityIndicator size="small" color={UIColors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={UIColors.white} />
              <Text style={styles.saveButtonText}>{t.common_save}</Text>
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
    backgroundColor: MibuBrand.warmWhite,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.warmWhite,
  },
  loadingText: {
    marginTop: 12,
    color: UIColors.textSecondary,
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
    backgroundColor: UIColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.dark,
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
    color: MibuBrand.dark,
  },
  required: {
    fontSize: 12,
    color: SemanticColors.errorDark,
  },
  hint: {
    fontSize: 12,
    color: UIColors.textSecondary,
  },
  input: {
    backgroundColor: UIColors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: MibuBrand.dark,
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
    backgroundColor: UIColors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    minWidth: 64,
  },
  tierButtonActive: {
    backgroundColor: MibuBrand.warmWhite,
  },
  tierLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: UIColors.textSecondary,
  },
  tierProb: {
    fontSize: 11,
    fontWeight: '500',
    color: UIColors.textSecondary,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: UIColors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.dark,
  },
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: MibuBrand.tanLight,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: MibuBrand.brown,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: UIColors.white,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 32,
  },
  saveButtonDisabled: {
    backgroundColor: MibuBrand.cream,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: UIColors.white,
  },
});
