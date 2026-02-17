/**
 * ============================================================
 * SOSContactsScreen - SOS 緊急聯絡人管理畫面
 * ============================================================
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
 * 更新日期：2026-02-12（Phase 3 遷移至 React Query）
 * @see 後端合約: contracts/APP.md Phase 5
 */
import React, { useState } from 'react';
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
import { useI18n } from '../../../context/AppContext';
import { useSOSContacts, useAddSOSContact, useUpdateSOSContact, useDeleteSOSContact } from '../../../hooks/useSOSQueries';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { SOSContact } from '../../../types/sos';
import { tFormat } from '../../../utils/i18n';

// ============ 常數定義 ============

/** 最大聯絡人數量 */
const MAX_CONTACTS = 3;

/** 關係選項（使用 labelKey 對應 translations key） */
const RELATIONSHIP_OPTIONS = [
  { value: 'family', labelKey: 'sos_relFamily' },
  { value: 'friend', labelKey: 'sos_relFriend' },
  { value: 'colleague', labelKey: 'sos_relColleague' },
  { value: 'other', labelKey: 'sos_relOther' },
] as const;

// ============ 元件本體 ============

export function SOSContactsScreen() {
  const { t } = useI18n();
  const router = useRouter();

  // ============ React Query Hooks ============

  const contactsQuery = useSOSContacts();
  const addContactMutation = useAddSOSContact();
  const updateContactMutation = useUpdateSOSContact();
  const deleteContactMutation = useDeleteSOSContact();

  // 從查詢結果衍生狀態
  const loading = contactsQuery.isLoading;
  const contacts: SOSContact[] = contactsQuery.data?.contacts || [];

  // ============ UI 狀態管理 ============

  const [modalVisible, setModalVisible] = useState(false); // 新增/編輯 Modal 是否顯示
  const [editingContact, setEditingContact] = useState<SOSContact | null>(null); // 正在編輯的聯絡人
  const [saving, setSaving] = useState(false); // 儲存中

  // 表單欄位狀態
  const [formName, setFormName] = useState(''); // 姓名
  const [formPhone, setFormPhone] = useState(''); // 電話
  const [formRelationship, setFormRelationship] = useState('family'); // 關係

  // ============ 事件處理 ============

  /**
   * 開啟新增 Modal
   * 檢查是否已達上限
   */
  const openAddModal = () => {
    if (contacts.length >= MAX_CONTACTS) {
      Alert.alert(
        t.sos_limitReached,
        tFormat(t.sos_limitReachedDesc, { max: MAX_CONTACTS })
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
        t.sos_incomplete,
        t.sos_enterNamePhone
      );
      return;
    }

    setSaving(true);
    try {
      const params = {
        name: formName.trim(),
        phone: formPhone.trim(),
        relationship: formRelationship,
      };

      if (editingContact) {
        // 更新現有聯絡人
        await updateContactMutation.mutateAsync({
          contactId: editingContact.id,
          name: params.name,
          phone: params.phone,
          relationship: params.relationship,
        });
      } else {
        // 新增聯絡人
        await addContactMutation.mutateAsync(params);
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Failed to save contact:', error);
      Alert.alert(
        t.common_error,
        t.sos_saveFailed
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
      t.sos_deleteContact,
      tFormat(t.sos_deleteContactConfirm, { name: contact.name }),
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.common_delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContactMutation.mutateAsync(contact.id);
            } catch (error) {
              console.error('Failed to delete contact:', error);
              Alert.alert(
                t.common_error,
                t.sos_deleteContactFailed
              );
            }
          },
        },
      ]
    );
  };

  // ============ 輔助函數 ============

  /**
   * 取得關係的顯示文字（透過 labelKey 查詢翻譯字典）
   */
  const getRelationshipLabel = (value?: string) => {
    const option = RELATIONSHIP_OPTIONS.find(o => o.value === value);
    return option ? t[option.labelKey] : value;
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
            {t.sos_emergencyContacts}
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
          {tFormat(t.sos_infoBanner, { max: MAX_CONTACTS })}
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
              refreshing={contactsQuery.isRefetching}
              onRefresh={() => contactsQuery.refetch()}
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
            {t.sos_noContacts}
          </Text>
          <Text style={styles.emptySubtitle}>
            {t.sos_tapToAdd}
          </Text>
          <TouchableOpacity style={styles.addFirstBtn} onPress={openAddModal}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addFirstBtnText}>
              {t.sos_addContact}
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
                {editingContact ? t.sos_editContact : t.sos_addContact}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={MibuBrand.brownDark} />
              </TouchableOpacity>
            </View>

            {/* 姓名欄位 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t.common_name}</Text>
              <TextInput
                style={styles.formInput}
                value={formName}
                onChangeText={setFormName}
                placeholder={t.sos_enterName}
                placeholderTextColor={MibuBrand.tan}
              />
            </View>

            {/* 電話欄位 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t.common_phone}</Text>
              <TextInput
                style={styles.formInput}
                value={formPhone}
                onChangeText={setFormPhone}
                placeholder={t.sos_enterPhone}
                placeholderTextColor={MibuBrand.tan}
                keyboardType="phone-pad"
              />
            </View>

            {/* 關係選擇 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t.sos_relationship}</Text>
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
                      {t[option.labelKey]}
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
                  {t.common_save}
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
    backgroundColor: UIColors.overlayMedium,
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
