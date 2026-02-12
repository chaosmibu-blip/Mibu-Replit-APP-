import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { apiService } from '../../../services/api';
import { MerchantApplyParams } from '../../../types';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

interface MerchantRegistrationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// 商家類型對應的翻譯 key
const BUSINESS_CATEGORY_KEYS = [
  { value: 'restaurant', tKey: 'merchant_catRestaurant' },
  { value: 'retail', tKey: 'merchant_catRetail' },
  { value: 'hotel', tKey: 'merchant_catHotel' },
  { value: 'entertainment', tKey: 'merchant_catEntertainment' },
  { value: 'service', tKey: 'merchant_catService' },
  { value: 'other', tKey: 'merchant_catOther' },
] as const;

export function MerchantRegistrationForm({ onSuccess, onCancel }: MerchantRegistrationFormProps) {
  const { user, getToken } = useAuth();
  const { t } = useI18n();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MerchantApplyParams>({
    ownerName: '',
    businessName: '',
    taxId: '',
    businessCategory: 'restaurant',
    address: '',
    phone: '',
    mobile: '',
    email: user?.email || '',
  });

  const handleSubmit = async () => {
    if (!formData.ownerName.trim() || !formData.businessName.trim() || 
        !formData.businessCategory || !formData.address.trim() ||
        !formData.mobile.trim() || !formData.email.trim()) {
      Alert.alert(t.common_error, t.merchant_requiredFields);
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      await apiService.applyMerchant(token, formData);
      Alert.alert(
        t.common_success,
        t.merchant_submitSuccess,
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (error) {
      console.error('Apply failed:', error);
      Alert.alert(t.common_error, t.merchant_submitFailed);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof MerchantApplyParams, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton} accessibilityLabel="關閉">
          <Ionicons name="close" size={24} color={UIColors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="storefront" size={32} color={MibuBrand.brown} />
        </View>
        <Text style={styles.title}>{t.merchant_appFormTitle}</Text>
        <Text style={styles.subtitle}>{t.merchant_appFormSubtitle}</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>{t.merchant_ownerName}</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerName}
            onChangeText={text => updateField('ownerName', text)}
            placeholder={t.merchant_enterOwnerName}
            placeholderTextColor={UIColors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.merchant_businessName}</Text>
          <TextInput
            style={styles.input}
            value={formData.businessName}
            onChangeText={text => updateField('businessName', text)}
            placeholder={t.merchant_enterBusinessName}
            placeholderTextColor={UIColors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.merchant_businessCategoryLabel}</Text>
          <View style={styles.categoryGrid}>
            {BUSINESS_CATEGORY_KEYS.map(cat => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryOption,
                  formData.businessCategory === cat.value && styles.categoryOptionActive,
                ]}
                onPress={() => updateField('businessCategory', cat.value)}
                accessibilityLabel={t[cat.tKey]}
              >
                <Text style={[
                  styles.categoryText,
                  formData.businessCategory === cat.value && styles.categoryTextActive,
                ]}>
                  {t[cat.tKey]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.merchant_taxId}</Text>
          <TextInput
            style={styles.input}
            value={formData.taxId}
            onChangeText={text => updateField('taxId', text)}
            placeholder={t.merchant_optional}
            placeholderTextColor={UIColors.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.common_address} *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={text => updateField('address', text)}
            placeholder={t.merchant_enterAddress}
            placeholderTextColor={UIColors.textSecondary}
            multiline
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfSection}>
            <Text style={styles.label}>{t.merchant_merchantPhone}</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={text => updateField('phone', text)}
              placeholder="02-1234-5678"
              placeholderTextColor={UIColors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.label}>{t.merchant_merchantMobile}</Text>
            <TextInput
              style={styles.input}
              value={formData.mobile}
              onChangeText={text => updateField('mobile', text)}
              placeholder="0912-345-678"
              placeholderTextColor={UIColors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.merchant_contactEmail}</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={text => updateField('email', text)}
            placeholder="contact@example.com"
            placeholderTextColor={UIColors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} accessibilityLabel="取消">
            <Text style={styles.cancelButtonText}>{t.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityLabel="提交申請"
          >
            {loading ? (
              <ActivityIndicator color={UIColors.white} size="small" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={18} color={UIColors.white} />
                <Text style={styles.submitButtonText}>{t.merchant_submitAppForm}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UIColors.white,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: MibuBrand.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: UIColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: MibuBrand.dark,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    backgroundColor: MibuBrand.warmWhite,
  },
  categoryOptionActive: {
    backgroundColor: MibuBrand.creamLight,
    borderColor: MibuBrand.brown,
  },
  categoryText: {
    fontSize: 14,
    color: UIColors.textSecondary,
  },
  categoryTextActive: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfSection: {
    flex: 1,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
    color: UIColors.textSecondary,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: MibuBrand.brown,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: UIColors.white,
  },
});
