/**
 * SOSContactsScreen - SOS 緊急聯絡人管理畫面
 *
 * 功能說明：
 * - 顯示緊急聯絡人列表（最多 3 位）
 * - 新增緊急聯絡人
 * - 編輯現有聯絡人
 * - 刪除聯絡人
 * - 支援下拉刷新
 *
 * 串接的 API：
 * - GET /api/sos/contacts - 取得緊急聯絡人列表
 * - POST /api/sos/contacts - 新增緊急聯絡人
 * - PUT /api/sos/contacts/:id - 更新緊急聯絡人
 * - DELETE /api/sos/contacts/:id - 刪除緊急聯絡人
 *
 * @see 後端合約: contracts/APP.md Phase 5
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { commonApi } from '../../../services/commonApi';
import { MibuBrand } from '../../../../constants/Colors';
import { SOSContact, CreateSOSContactParams } from '../../../types/sos';

// ============ 常數定義 ============

/** 最大聯絡人數量 */
const MAX_CONTACTS = 3;

/** 關係選項 */
const RELATIONSHIP_OPTIONS = [
  { value: 'family', label: { zh: '家人', en: 'Family' } },
  { value: 'friend', label: { zh: '朋友', en: 'Friend' } },
  { value: 'colleague', label: { zh: '同事', en: 'Colleague' } },
  { value: 'other', label: { zh: '其他', en: 'Other' } },
];

// ============ 元件本體 ============

export function SOSContactsScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  // ============ 狀態管理 ============

  const [loading, setLoading] = useState(true); // 頁面載入中
  const [refreshing, setRefreshing] = useState(false); // 下拉刷新中
  const [contacts, setContacts] = useState<SOSContact[]>([]); // 聯絡人列表
  const [modalVisible, setModalVisible] = useState(false); // 新增/編輯 Modal 是否顯示
  const [editingContact, setEditingContact] = useState<SOSContact | null>(null); // 正在編輯的聯絡人
  const [saving, setSaving] = useState(false); // 儲存中

  // 表單欄位狀態
  const [formName, setFormName] = useState(''); // 姓名
  const [formPhone, setFormPhone] = useState(''); // 電話
  const [formRelationship, setFormRelationship] = useState('family'); // 關係

  // ============ 資料載入 ============

  /**
   * 載入緊急聯絡人列表
   */
  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      const data = await commonApi.getSOSContacts(token);
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Failed to load SOS contacts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 下拉刷新處理
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // ============ 事件處理 ============

  /**
   * 開啟新增 Modal
   * 檢查是否已達上限
   */
  const openAddModal = () => {
    if (contacts.length >= MAX_CONTACTS) {
      Alert.alert(
        isZh ? '已達上限' : 'Limit Reached',
        isZh
          ? `最多只能新增 ${MAX_CONTACTS} 位緊急聯絡人`
          : `You can only add up to ${MAX_CONTACTS} emergency contacts`
      );
      return;
    }
    // 重置表單
    setEditingContact(null);
    setFormName('');
    setFormPhone('');
    setFormRelationship('family');
    setModalVisible(true);
  };

  /**
   * 開啟編輯 Modal
   * 填入現有資料
   */
  const openEditModal = (contact: SOSContact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormPhone(contact.phone);
    setFormRelationship(contact.relationship || 'other');
    setModalVisible(true);
  };

  /**
   * 處理儲存（新增或更新）
   */
  const handleSave = async () => {
    // 驗證必填欄位
    if (!formName.trim() || !formPhone.trim()) {
      Alert.alert(
        isZh ? '請填寫完整' : 'Incomplete',
        isZh ? '請輸入姓名和電話' : 'Please enter name and phone'
      );
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      const params: CreateSOSContactParams = {
        name: formName.trim(),
        phone: formPhone.trim(),
        relationship: formRelationship,
      };

      if (editingContact) {
        // 更新現有聯絡人
        const result = await commonApi.updateSOSContact(token, editingContact.id, params);
        if (result.success) {
          setContacts(prev =>
            prev.map(c => (c.id === editingContact.id ? result.contact : c))
          );
        }
      } else {
        // 新增聯絡人
        const result = await commonApi.addSOSContact(token, params);
        if (result.success) {
          setContacts(prev => [...prev, result.contact]);
        }
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Failed to save contact:', error);
      Alert.alert(
        isZh ? '錯誤' : 'Error',
        isZh ? '無法儲存聯絡人' : 'Failed to save contact'
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * 處理刪除聯絡人
   */
  const handleDelete = (contact: SOSContact) => {
    Alert.alert(
      isZh ? '刪除聯絡人' : 'Delete Contact',
      isZh
        ? `確定要刪除「${contact.name}」嗎？`
        : `Delete "${contact.name}"?`,
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '刪除' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) return;

              const result = await commonApi.deleteSOSContact(token, contact.id);
              if (result.success) {
                setContacts(prev => prev.filter(c => c.id !== contact.id));
              }
            } catch (error) {
              console.error('Failed to delete contact:', error);
              Alert.alert(
                isZh ? '錯誤' : 'Error',
                isZh ? '無法刪除聯絡人' : 'Failed to delete contact'
              );
            }
          },
        },
      ]
    );
  };

  // ============ 輔助函數 ============

  /**
   * 取得關係的顯示文字
   */
  const getRelationshipLabel = (value?: string) => {
    const option = RELATIONSHIP_OPTIONS.find(o => o.value === value);
    return option ? option.label[isZh ? 'zh' : 'en'] : value;
  };

  // ============ 列表項目渲染 ============

  /**
   * 渲染單一聯絡人卡片
   */
  const renderItem = ({ item }: { item: SOSContact }) => (
    <View style={styles.contactCard}>
      {/* 聯絡人頭像 */}
      <View style={styles.contactIcon}>
        <Ionicons name="person" size={24} color={MibuBrand.brown} />
      </View>

      {/* 聯絡人資訊 */}
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <View style={styles.contactDetails}>
          <Ionicons name="call-outline" size={14} color={MibuBrand.tan} />
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
        {/* 關係標籤 */}
        {item.relationship && (
          <View style={styles.relationshipBadge}>
            <Text style={styles.relationshipText}>
              {getRelationshipLabel(item.relationship)}
            </Text>
          </View>
        )}
      </View>

      {/* 操作按鈕 */}
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={18} color={MibuBrand.copper} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============ 載入狀態 ============

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  // ============ 主要渲染 ============

  return (
    <View style={styles.container}>
      {/* ===== 頂部導航列 ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="shield-checkmark" size={24} color="#EF4444" />
          <Text style={styles.headerTitle}>
            {isZh ? '緊急聯絡人' : 'Emergency Contacts'}
          </Text>
        </View>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color={MibuBrand.brown} />
        </TouchableOpacity>
      </View>

      {/* ===== 說明橫幅 ===== */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color={MibuBrand.copper} />
        <Text style={styles.infoText}>
          {isZh
            ? `最多可新增 ${MAX_CONTACTS} 位緊急聯絡人，發送 SOS 時將同時通知他們`
            : `Add up to ${MAX_CONTACTS} emergency contacts. They will be notified when you send SOS.`}
        </Text>
      </View>

      {/* ===== 聯絡人列表 / 空狀態 ===== */}
      {contacts.length > 0 ? (
        <FlatList
          data={contacts}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={MibuBrand.brown}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        // 空狀態
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={MibuBrand.tan} />
          <Text style={styles.emptyTitle}>
            {isZh ? '尚無緊急聯絡人' : 'No emergency contacts'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isZh
              ? '點擊右上角 + 新增聯絡人'
              : 'Tap + to add your first contact'}
          </Text>
          <TouchableOpacity style={styles.addFirstBtn} onPress={openAddModal}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addFirstBtnText}>
              {isZh ? '新增聯絡人' : 'Add Contact'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ===== 新增/編輯 Modal ===== */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal 標題 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingContact
                  ? isZh ? '編輯聯絡人' : 'Edit Contact'
                  : isZh ? '新增聯絡人' : 'Add Contact'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={MibuBrand.brownDark} />
              </TouchableOpacity>
            </View>

            {/* 姓名欄位 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{isZh ? '姓名' : 'Name'}</Text>
              <TextInput
                style={styles.formInput}
                value={formName}
                onChangeText={setFormName}
                placeholder={isZh ? '輸入姓名' : 'Enter name'}
                placeholderTextColor={MibuBrand.tan}
              />
            </View>

            {/* 電話欄位 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{isZh ? '電話' : 'Phone'}</Text>
              <TextInput
                style={styles.formInput}
                value={formPhone}
                onChangeText={setFormPhone}
                placeholder={isZh ? '輸入電話號碼' : 'Enter phone number'}
                placeholderTextColor={MibuBrand.tan}
                keyboardType="phone-pad"
              />
            </View>

            {/* 關係選擇 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{isZh ? '關係' : 'Relationship'}</Text>
              <View style={styles.relationshipOptions}>
                {RELATIONSHIP_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.relationshipOption,
                      formRelationship === option.value && styles.relationshipOptionActive,
                    ]}
                    onPress={() => setFormRelationship(option.value)}
                  >
                    <Text
                      style={[
                        styles.relationshipOptionText,
                        formRelationship === option.value && styles.relationshipOptionTextActive,
                      ]}
                    >
                      {option.label[isZh ? 'zh' : 'en']}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 儲存按鈕 */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {isZh ? '儲存' : 'Save'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  // 載入狀態
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  // 頂部導航列
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 說明橫幅
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: MibuBrand.highlight,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: MibuBrand.copper,
    lineHeight: 18,
  },
  // 列表內容
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  // 聯絡人卡片
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MibuBrand.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  contactDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: MibuBrand.tan,
  },
  relationshipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: MibuBrand.creamLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  relationshipText: {
    fontSize: 11,
    color: MibuBrand.copper,
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MibuBrand.creamLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 空狀態
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: MibuBrand.tan,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addFirstBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Modal 樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: MibuBrand.warmWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  // 表單
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: MibuBrand.brownDark,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  // 關係選項
  relationshipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationshipOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: MibuBrand.creamLight,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  relationshipOptionActive: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  relationshipOptionText: {
    fontSize: 14,
    color: MibuBrand.copper,
    fontWeight: '500',
  },
  relationshipOptionTextActive: {
    color: '#fff',
  },
  // 儲存按鈕
  saveBtn: {
    backgroundColor: MibuBrand.brown,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
