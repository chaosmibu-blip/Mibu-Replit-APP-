import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { TagInput } from '../components/TagInput';
import { UserProfile, Gender } from '../../../types';
import { MibuBrand } from '../../../../constants/Colors';

const GENDER_OPTIONS: { value: Gender; labelZh: string; labelEn: string }[] = [
  { value: 'male', labelZh: '男', labelEn: 'Male' },
  { value: 'female', labelZh: '女', labelEn: 'Female' },
  { value: 'other', labelZh: '其他', labelEn: 'Other' },
];

const RELATION_OPTIONS = [
  { value: 'spouse', labelZh: '配偶', labelEn: 'Spouse' },
  { value: 'parent', labelZh: '父母', labelEn: 'Parent' },
  { value: 'sibling', labelZh: '兄弟姊妹', labelEn: 'Sibling' },
  { value: 'friend', labelZh: '朋友', labelEn: 'Friend' },
  { value: 'other', labelZh: '其他', labelEn: 'Other' },
];

export function ProfileScreen() {
  const { state, getToken, setUser } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showRelationPicker, setShowRelationPicker] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      const data = await apiService.getProfile(token);
      setProfile(data);
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setGender(data.gender);
      setBirthDate(data.birthDate || '');
      setPhone(data.phone || '');
      setDietaryRestrictions(data.dietaryRestrictions || []);
      setMedicalHistory(data.medicalHistory || []);
      setEmergencyContactName(data.emergencyContactName || '');
      setEmergencyContactPhone(data.emergencyContactPhone || '');
      setEmergencyContactRelation(data.emergencyContactRelation || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert(
        isZh ? '錯誤' : 'Error',
        isZh ? '無法載入個人資料' : 'Failed to load profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await apiService.updateProfile(token, {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        gender: gender || undefined,
        birthDate: birthDate || undefined,
        phone: phone || undefined,
        dietaryRestrictions,
        medicalHistory,
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactPhone: emergencyContactPhone || undefined,
        emergencyContactRelation: emergencyContactRelation || undefined,
      });

      // 用回傳的新資料更新本地狀態
      if (response && response.profile) {
        const data = response.profile;
        setProfile(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setGender(data.gender);
        setBirthDate(data.birthDate || '');
        setPhone(data.phone || '');
        setDietaryRestrictions(data.dietaryRestrictions || []);
        setMedicalHistory(data.medicalHistory || []);
        setEmergencyContactName(data.emergencyContactName || '');
        setEmergencyContactPhone(data.emergencyContactPhone || '');
        setEmergencyContactRelation(data.emergencyContactRelation || '');

        // 同步更新全域用戶狀態（修復 #017 用戶名消失問題）
        if (state.user) {
          const updatedUser = {
            ...state.user,
            firstName: data.firstName || state.user.firstName,
            lastName: data.lastName || state.user.lastName,
            name: data.firstName && data.lastName
              ? `${data.firstName} ${data.lastName}`
              : data.firstName || data.lastName || state.user.name,
          };
          setUser(updatedUser);
        }
      }

      Alert.alert(
        isZh ? '成功' : 'Success',
        isZh ? '個人資料已更新' : 'Profile updated successfully'
      );
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert(
        isZh ? '錯誤' : 'Error',
        isZh ? '儲存失敗' : 'Failed to save'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
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
        <Text style={styles.headerTitle}>{isZh ? '個人資料' : 'Profile'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
          {saving ? (
            <ActivityIndicator size="small" color={MibuBrand.brown} />
          ) : (
            <Text style={styles.saveButtonText}>{isZh ? '儲存' : 'Save'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '用戶 ID' : 'User ID'}</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{profile?.id || '-'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{profile?.email || '-'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>{isZh ? '姓' : 'Last Name'}</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder={isZh ? '請輸入姓氏' : 'Enter last name'}
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.sectionTitle}>{isZh ? '名' : 'First Name'}</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={isZh ? '請輸入名字' : 'Enter first name'}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '性別' : 'Gender'}</Text>
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowGenderPicker(!showGenderPicker)}
          >
            <Text style={gender ? styles.pickerText : styles.pickerPlaceholder}>
              {gender 
                ? GENDER_OPTIONS.find(g => g.value === gender)?.[isZh ? 'labelZh' : 'labelEn'] || gender
                : isZh ? '請選擇' : 'Select'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748b" />
          </TouchableOpacity>
          {showGenderPicker && (
            <View style={styles.pickerOptions}>
              {GENDER_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.pickerOption, gender === option.value && styles.pickerOptionActive]}
                  onPress={() => {
                    setGender(option.value);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, gender === option.value && styles.pickerOptionTextActive]}>
                    {isZh ? option.labelZh : option.labelEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '出生年月日' : 'Birth Date'}</Text>
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '手機' : 'Phone'}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={isZh ? '請輸入手機號碼' : 'Enter phone number'}
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '飲食禁忌' : 'Dietary Restrictions'}</Text>
          <TagInput
            value={dietaryRestrictions}
            onChange={setDietaryRestrictions}
            placeholder={isZh ? '輸入飲食禁忌，如：素食、海鮮過敏' : 'e.g., Vegetarian, Seafood allergy'}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '疾病史' : 'Medical History'}</Text>
          <TagInput
            value={medicalHistory}
            onChange={setMedicalHistory}
            placeholder={isZh ? '輸入疾病史，如：糖尿病、高血壓' : 'e.g., Diabetes, Hypertension'}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.groupTitle}>{isZh ? '緊急聯絡人' : 'Emergency Contact'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '姓名' : 'Name'}</Text>
          <TextInput
            style={styles.input}
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
            placeholder={isZh ? '請輸入姓名' : 'Enter name'}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '電話' : 'Phone'}</Text>
          <TextInput
            style={styles.input}
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
            placeholder={isZh ? '請輸入電話' : 'Enter phone'}
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '關係' : 'Relationship'}</Text>
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowRelationPicker(!showRelationPicker)}
          >
            <Text style={emergencyContactRelation ? styles.pickerText : styles.pickerPlaceholder}>
              {emergencyContactRelation 
                ? RELATION_OPTIONS.find(r => r.value === emergencyContactRelation)?.[isZh ? 'labelZh' : 'labelEn'] || emergencyContactRelation
                : isZh ? '請選擇' : 'Select'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748b" />
          </TouchableOpacity>
          {showRelationPicker && (
            <View style={styles.pickerOptions}>
              {RELATION_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.pickerOption, emergencyContactRelation === option.value && styles.pickerOptionActive]}
                  onPress={() => {
                    setEmergencyContactRelation(option.value);
                    setShowRelationPicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, emergencyContactRelation === option.value && styles.pickerOptionTextActive]}>
                    {isZh ? option.labelZh : option.labelEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.cream,
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
    color: MibuBrand.brown,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.brownLight,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    color: MibuBrand.dark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  readOnlyField: {
    backgroundColor: MibuBrand.cream,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  readOnlyText: {
    fontSize: 16,
    color: MibuBrand.brownLight,
  },
  row: {
    flexDirection: 'row',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerText: {
    fontSize: 16,
    color: MibuBrand.dark,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: MibuBrand.tan,
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.cream,
  },
  pickerOptionActive: {
    backgroundColor: MibuBrand.highlight,
  },
  pickerOptionText: {
    fontSize: 16,
    color: MibuBrand.brownLight,
  },
  pickerOptionTextActive: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: MibuBrand.cream,
    marginVertical: 24,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brown,
    marginBottom: 16,
  },
});
