import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { Announcement, AnnouncementType } from '../../../types';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';

type EditMode = 'create' | 'edit' | null;

const TYPE_OPTIONS: { value: AnnouncementType; label: { zh: string; en: string } }[] = [
  { value: 'announcement', label: { zh: '公告', en: 'Announcement' } },
  { value: 'flash_event', label: { zh: '快閃活動', en: 'Flash Event' } },
  { value: 'holiday_event', label: { zh: '節慶活動', en: 'Holiday Event' } },
];

export function AnnouncementManageScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState({
    type: 'announcement' as AnnouncementType,
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    priority: 0,
  });

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '公告管理' : 'Announcement Management',
    back: isZh ? '返回' : 'Back',
    add: isZh ? '新增' : 'Add',
    edit: isZh ? '編輯' : 'Edit',
    delete: isZh ? '刪除' : 'Delete',
    save: isZh ? '儲存' : 'Save',
    cancel: isZh ? '取消' : 'Cancel',
    type: isZh ? '類型' : 'Type',
    titleLabel: isZh ? '標題' : 'Title',
    contentLabel: isZh ? '內容' : 'Content',
    imageUrl: isZh ? '圖片網址' : 'Image URL',
    linkUrl: isZh ? '連結網址' : 'Link URL',
    active: isZh ? '啟用' : 'Active',
    priority: isZh ? '優先順序' : 'Priority',
    noData: isZh ? '尚無公告' : 'No announcements',
    loading: isZh ? '載入中...' : 'Loading...',
    confirmDelete: isZh ? '確定要刪除這則公告嗎？' : 'Delete this announcement?',
    createTitle: isZh ? '新增公告' : 'Create Announcement',
    editTitle: isZh ? '編輯公告' : 'Edit Announcement',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await apiService.getAdminAnnouncements(token);
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'announcement',
      title: '',
      content: '',
      imageUrl: '',
      linkUrl: '',
      isActive: true,
      priority: 0,
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingItem(null);
    setEditMode('create');
  };

  const handleEdit = (item: Announcement) => {
    setFormData({
      type: item.type,
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || '',
      linkUrl: item.linkUrl || '',
      isActive: item.isActive,
      priority: item.priority,
    });
    setEditingItem(item);
    setEditMode('edit');
  };

  const handleDelete = (item: Announcement) => {
    Alert.alert(translations.delete, translations.confirmDelete, [
      { text: translations.cancel, style: 'cancel' },
      {
        text: translations.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(true);
            const token = await getToken();
            if (!token) return;
            await apiService.deleteAnnouncement(token, item.id);
            loadData();
          } catch (error) {
            console.error('Failed to delete announcement:', error);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '請填寫標題和內容' : 'Please fill in title and content');
      return;
    }

    try {
      setActionLoading(true);
      const token = await getToken();
      if (!token) return;

      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
        linkUrl: formData.linkUrl.trim() || undefined,
        isActive: formData.isActive,
        priority: formData.priority,
      };

      if (editMode === 'create') {
        await apiService.createAnnouncement(token, payload);
      } else if (editMode === 'edit' && editingItem) {
        await apiService.updateAnnouncement(token, editingItem.id, payload);
      }

      setEditMode(null);
      loadData();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '儲存失敗' : 'Save failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeLabel = (type: AnnouncementType) => {
    const option = TYPE_OPTIONS.find(o => o.value === type);
    return option ? option.label[isZh ? 'zh' : 'en'] : type;
  };

  const getTypeColor = (type: AnnouncementType) => {
    switch (type) {
      case 'announcement': return MibuBrand.brown;
      case 'flash_event': return SemanticColors.starYellow;
      case 'holiday_event': return '#ec4899';
      default: return MibuBrand.tan;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brown} />
          <Text style={styles.backText}>{translations.back}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Ionicons name="add" size={24} color={MibuBrand.warmWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {announcements.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="megaphone-outline" size={48} color={MibuBrand.tan} />
            <Text style={styles.emptyText}>{translations.noData}</Text>
          </View>
        ) : (
          announcements.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                  <Text style={[styles.typeBadgeText, { color: getTypeColor(item.type) }]}>
                    {getTypeLabel(item.type)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, item.isActive ? styles.activeStatus : styles.inactiveStatus]}>
                  <Text style={styles.statusText}>{item.isActive ? (isZh ? '啟用' : 'Active') : (isZh ? '停用' : 'Inactive')}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                  <Ionicons name="pencil" size={16} color={MibuBrand.brown} />
                  <Text style={styles.editButtonText}>{translations.edit}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={16} color={SemanticColors.errorDark} />
                  <Text style={styles.deleteButtonText}>{translations.delete}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={editMode !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode === 'create' ? translations.createTitle : translations.editTitle}
              </Text>
              <TouchableOpacity onPress={() => setEditMode(null)}>
                <Ionicons name="close" size={24} color={MibuBrand.tan} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              <Text style={styles.label}>{translations.type}</Text>
              <View style={styles.typeSelector}>
                {TYPE_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.typeOption, formData.type === option.value && styles.typeOptionActive]}
                    onPress={() => setFormData(prev => ({ ...prev, type: option.value }))}
                  >
                    <Text style={[styles.typeOptionText, formData.type === option.value && styles.typeOptionTextActive]}>
                      {option.label[isZh ? 'zh' : 'en']}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>{translations.titleLabel}</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
                placeholder={isZh ? '輸入標題' : 'Enter title'}
              />

              <Text style={styles.label}>{translations.contentLabel}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.content}
                onChangeText={text => setFormData(prev => ({ ...prev, content: text }))}
                placeholder={isZh ? '輸入內容' : 'Enter content'}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>{translations.imageUrl}</Text>
              <TextInput
                style={styles.input}
                value={formData.imageUrl}
                onChangeText={text => setFormData(prev => ({ ...prev, imageUrl: text }))}
                placeholder="https://..."
              />

              <Text style={styles.label}>{translations.linkUrl}</Text>
              <TextInput
                style={styles.input}
                value={formData.linkUrl}
                onChangeText={text => setFormData(prev => ({ ...prev, linkUrl: text }))}
                placeholder="https://..."
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{translations.active}</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={value => setFormData(prev => ({ ...prev, isActive: value }))}
                  trackColor={{ false: MibuBrand.tanLight, true: MibuBrand.copper }}
                  thumbColor={formData.isActive ? MibuBrand.brown : MibuBrand.creamLight}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditMode(null)}>
                <Text style={styles.cancelButtonText}>{translations.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={actionLoading}>
                {actionLoading ? (
                  <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
                ) : (
                  <Text style={styles.saveButtonText}>{translations.save}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MibuBrand.creamLight },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: MibuBrand.creamLight },
  loadingText: { marginTop: 12, color: MibuBrand.copper, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: MibuBrand.warmWhite, borderBottomWidth: 1, borderBottomColor: MibuBrand.tanLight },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, color: MibuBrand.brown, marginLeft: 4 },
  title: { fontSize: 20, fontWeight: '800', color: MibuBrand.brownDark },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: MibuBrand.brown, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  emptyCard: { backgroundColor: MibuBrand.warmWhite, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 2, borderColor: MibuBrand.tanLight },
  emptyText: { fontSize: 16, color: MibuBrand.copper, marginTop: 12 },
  card: { backgroundColor: MibuBrand.warmWhite, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: MibuBrand.tanLight },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { fontSize: 12, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeStatus: { backgroundColor: SemanticColors.successLight },
  inactiveStatus: { backgroundColor: SemanticColors.errorLight },
  statusText: { fontSize: 11, fontWeight: '600', color: SemanticColors.successDark },
  cardTitle: { fontSize: 16, fontWeight: '700', color: MibuBrand.brownDark, marginBottom: 6 },
  cardContent: { fontSize: 14, color: MibuBrand.copper, lineHeight: 20, marginBottom: 12 },
  cardActions: { flexDirection: 'row', gap: 12 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: MibuBrand.highlight, borderRadius: 8 },
  editButtonText: { fontSize: 13, fontWeight: '600', color: MibuBrand.brown },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: SemanticColors.errorLight, borderRadius: 8 },
  deleteButtonText: { fontSize: 13, fontWeight: '600', color: SemanticColors.errorDark },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: MibuBrand.warmWhite, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: MibuBrand.tanLight },
  modalTitle: { fontSize: 18, fontWeight: '800', color: MibuBrand.brownDark },
  formScroll: { paddingHorizontal: 20, paddingTop: 16, maxHeight: 400 },
  label: { fontSize: 14, fontWeight: '600', color: MibuBrand.brownDark, marginBottom: 8, marginTop: 16 },
  typeSelector: { flexDirection: 'row', gap: 8 },
  typeOption: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: MibuBrand.creamLight, alignItems: 'center' },
  typeOptionActive: { backgroundColor: MibuBrand.brown },
  typeOptionText: { fontSize: 13, fontWeight: '600', color: MibuBrand.copper },
  typeOptionTextActive: { color: MibuBrand.warmWhite },
  input: { backgroundColor: MibuBrand.creamLight, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: MibuBrand.brownDark, borderWidth: 1, borderColor: MibuBrand.tanLight },
  textArea: { height: 100, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingVertical: 12 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: MibuBrand.brownDark },
  modalActions: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: MibuBrand.tanLight },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: MibuBrand.creamLight, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: MibuBrand.copper },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: MibuBrand.brown, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: MibuBrand.warmWhite },
});
