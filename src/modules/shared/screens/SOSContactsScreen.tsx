/**
 * SOSContactsScreen - 緊急聯絡人管理
 * 新增、編輯、刪除緊急聯絡人
 *
 * @see 後端合約: contracts/APP.md
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

const MAX_CONTACTS = 3;

const RELATIONSHIP_OPTIONS = [
  { value: 'family', label: { zh: '家人', en: 'Family' } },
  { value: 'friend', label: { zh: '朋友', en: 'Friend' } },
  { value: 'colleague', label: { zh: '同事', en: 'Colleague' } },
  { value: 'other', label: { zh: '其他', en: 'Other' } },
];

export function SOSContactsScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contacts, setContacts] = useState<SOSContact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<SOSContact | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRelationship, setFormRelationship] = useState('family');

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

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
    setEditingContact(null);
    setFormName('');
    setFormPhone('');
    setFormRelationship('family');
    setModalVisible(true);
  };

  const openEditModal = (contact: SOSContact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormPhone(contact.phone);
    setFormRelationship(contact.relationship || 'other');
    setModalVisible(true);
  };

  const handleSave = async () => {
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
        // 更新
        const result = await commonApi.updateSOSContact(token, editingContact.id, params);
        if (result.success) {
          setContacts(prev =>
            prev.map(c => (c.id === editingContact.id ? result.contact : c))
          );
        }
      } else {
        // 新增
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

  const getRelationshipLabel = (value?: string) => {
    const option = RELATIONSHIP_OPTIONS.find(o => o.value === value);
    return option ? option.label[isZh ? 'zh' : 'en'] : value;
  };

  const renderItem = ({ item }: { item: SOSContact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactIcon}>
        <Ionicons name="person" size={24} color={MibuBrand.brown} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <View style={styles.contactDetails}>
          <Ionicons name="call-outline" size={14} color={MibuBrand.tan} />
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
        {item.relationship && (
          <View style={styles.relationshipBadge}>
            <Text style={styles.relationshipText}>
              {getRelationshipLabel(item.relationship)}
            </Text>
          </View>
        )}
      </View>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color={MibuBrand.copper} />
        <Text style={styles.infoText}>
          {isZh
            ? `最多可新增 ${MAX_CONTACTS} 位緊急聯絡人，發送 SOS 時將同時通知他們`
            : `Add up to ${MAX_CONTACTS} emergency contacts. They will be notified when you send SOS.`}
        </Text>
      </View>

      {/* List */}
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

      {/* Add/Edit Modal */}
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
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
