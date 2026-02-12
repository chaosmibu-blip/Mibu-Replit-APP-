/**
 * NewPlaceScreen - 新增自有景點表單
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
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { apiService } from '../../../services/api';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

// 分類選項定義：透過 t key 取得多語系標籤
const CATEGORY_IDS = ['food', 'stay', 'scenery', 'shopping', 'entertainment', 'education'] as const;
const CATEGORY_ICONS: Record<string, string> = {
  food: 'restaurant',
  stay: 'bed',
  scenery: 'camera',
  shopping: 'cart',
  entertainment: 'game-controller',
  education: 'school',
};
// 翻譯 key 對應：分類 id → t key
const CATEGORY_T_KEYS: Record<string, string> = {
  food: 'merchant_catFood',
  stay: 'merchant_catStay',
  scenery: 'merchant_catScenery',
  shopping: 'merchant_catShopping',
  entertainment: 'merchant_catEntertainment',
  education: 'merchant_catEducation',
};

export function NewPlaceScreen() {
  const { getToken } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    placeName: '',
    category: '',
    district: '',
    city: '',
    address: '',
    description: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.placeName.trim() || !formData.category || !formData.city.trim()) {
      Alert.alert(t.merchant_notice, t.common_fillRequired);
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      // 使用 claimMerchantPlace 來新增店家
      await apiService.claimMerchantPlace(token, {
        placeName: formData.placeName.trim(),
        district: formData.district.trim(),
        city: formData.city.trim(),
        country: '台灣',
      });

      Alert.alert(t.common_success, t.merchant_applicationSubmitted, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Submit failed:', error);
      Alert.alert(t.common_error, t.merchant_submitError);
    } finally {
      setSaving(false);
    }
  };

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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="返回">
            <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t.merchant_addPlace}</Text>
            <Text style={styles.subtitle}>{t.merchant_addPlaceSubtitle}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Place Name */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t.merchant_placeName}</Text>
              <Text style={styles.required}>{t.common_required}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.placeName}
              onChangeText={(v) => updateField('placeName', v)}
              placeholder={t.merchant_placeNamePlaceholder}
              placeholderTextColor={UIColors.textSecondary}
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t.merchant_category}</Text>
              <Text style={styles.required}>{t.common_required}</Text>
            </View>
            <View style={styles.categoryGrid}>
              {CATEGORY_IDS.map((catId) => (
                <TouchableOpacity
                  key={catId}
                  style={[
                    styles.categoryButton,
                    formData.category === catId && styles.categoryButtonActive,
                  ]}
                  onPress={() => updateField('category', catId)}
                  accessibilityLabel={`分類：${(t as any)[CATEGORY_T_KEYS[catId]]}`}
                >
                  <Ionicons
                    name={CATEGORY_ICONS[catId] as any}
                    size={20}
                    color={formData.category === catId ? MibuBrand.brown : UIColors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      formData.category === catId && styles.categoryTextActive,
                    ]}
                  >
                    {(t as any)[CATEGORY_T_KEYS[catId]]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* City & District Row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{t.merchant_city}</Text>
                <Text style={styles.required}>{t.common_required}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(v) => updateField('city', v)}
                placeholder={t.merchant_cityPlaceholder}
                placeholderTextColor={UIColors.textSecondary}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>{t.merchant_district}</Text>
              <TextInput
                style={styles.input}
                value={formData.district}
                onChangeText={(v) => updateField('district', v)}
                placeholder={t.merchant_districtPlaceholder}
                placeholderTextColor={UIColors.textSecondary}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.field}>
            <Text style={styles.label}>{t.merchant_placeAddress}</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(v) => updateField('address', v)}
              placeholder={t.merchant_addressPlaceholder}
              placeholderTextColor={UIColors.textSecondary}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>{t.merchant_placeDesc}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder={t.merchant_placeDescPlaceholder}
              placeholderTextColor={UIColors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
          accessibilityLabel="提交申請"
        >
          {saving ? (
            <ActivityIndicator size="small" color={UIColors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={UIColors.white} />
              <Text style={styles.submitButtonText}>{t.merchant_submitApplication}</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
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
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.dark,
  },
  subtitle: {
    fontSize: 14,
    color: UIColors.textSecondary,
    marginTop: 2,
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
    minHeight: 100,
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: UIColors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  categoryButtonActive: {
    backgroundColor: MibuBrand.creamLight,
    borderColor: MibuBrand.brown,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: UIColors.textSecondary,
  },
  categoryTextActive: {
    color: MibuBrand.brown,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 32,
  },
  submitButtonDisabled: {
    backgroundColor: MibuBrand.cream,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: UIColors.white,
  },
});
