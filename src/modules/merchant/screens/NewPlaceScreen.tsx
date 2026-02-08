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
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

const CATEGORIES = [
  { id: 'food', label: '美食', labelEn: 'Food', icon: 'restaurant' },
  { id: 'stay', label: '住宿', labelEn: 'Stay', icon: 'bed' },
  { id: 'scenery', label: '景點', labelEn: 'Scenery', icon: 'camera' },
  { id: 'shopping', label: '購物', labelEn: 'Shopping', icon: 'cart' },
  { id: 'entertainment', label: '娛樂', labelEn: 'Entertainment', icon: 'game-controller' },
  { id: 'education', label: '文化教育', labelEn: 'Education', icon: 'school' },
];

export function NewPlaceScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    placeName: '',
    category: '',
    district: '',
    city: '',
    address: '',
    description: '',
  });

  const t = {
    title: isZh ? '新增店家' : 'Add New Place',
    subtitle: isZh ? '填寫您的店家資訊' : 'Fill in your place information',
    placeName: isZh ? '店家名稱' : 'Place Name',
    placeNamePlaceholder: isZh ? '輸入店家名稱' : 'Enter place name',
    category: isZh ? '分類' : 'Category',
    selectCategory: isZh ? '選擇分類' : 'Select category',
    district: isZh ? '區域' : 'District',
    districtPlaceholder: isZh ? '例：大安區' : 'e.g. Da\'an District',
    city: isZh ? '城市' : 'City',
    cityPlaceholder: isZh ? '例：台北市' : 'e.g. Taipei',
    address: isZh ? '地址' : 'Address',
    addressPlaceholder: isZh ? '完整地址' : 'Full address',
    description: isZh ? '店家介紹' : 'Description',
    descriptionPlaceholder: isZh ? '簡短介紹您的店家...' : 'Brief introduction of your place...',
    submit: isZh ? '提交申請' : 'Submit',
    required: isZh ? '必填' : 'Required',
    success: isZh ? '申請已提交！我們將盡快審核' : 'Application submitted! We will review it soon.',
    error: isZh ? '提交失敗，請稍後再試' : 'Submit failed, please try again',
    fillRequired: isZh ? '請填寫必要欄位' : 'Please fill required fields',
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.placeName.trim() || !formData.category || !formData.city.trim()) {
      Alert.alert(isZh ? '提示' : 'Notice', t.fillRequired);
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

      Alert.alert(isZh ? '成功' : 'Success', t.success, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Submit failed:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', t.error);
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
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Place Name */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t.placeName}</Text>
              <Text style={styles.required}>{t.required}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.placeName}
              onChangeText={(v) => updateField('placeName', v)}
              placeholder={t.placeNamePlaceholder}
              placeholderTextColor={UIColors.textSecondary}
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t.category}</Text>
              <Text style={styles.required}>{t.required}</Text>
            </View>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    formData.category === cat.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => updateField('category', cat.id)}
                  accessibilityLabel={`分類：${cat.label}`}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={formData.category === cat.id ? MibuBrand.brown : UIColors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      formData.category === cat.id && styles.categoryTextActive,
                    ]}
                  >
                    {isZh ? cat.label : cat.labelEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* City & District Row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{t.city}</Text>
                <Text style={styles.required}>{t.required}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(v) => updateField('city', v)}
                placeholder={t.cityPlaceholder}
                placeholderTextColor={UIColors.textSecondary}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>{t.district}</Text>
              <TextInput
                style={styles.input}
                value={formData.district}
                onChangeText={(v) => updateField('district', v)}
                placeholder={t.districtPlaceholder}
                placeholderTextColor={UIColors.textSecondary}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.field}>
            <Text style={styles.label}>{t.address}</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(v) => updateField('address', v)}
              placeholder={t.addressPlaceholder}
              placeholderTextColor={UIColors.textSecondary}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>{t.description}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder={t.descriptionPlaceholder}
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
              <Text style={styles.submitButtonText}>{t.submit}</Text>
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
