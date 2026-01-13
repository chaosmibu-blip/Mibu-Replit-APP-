import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { Announcement, AnnouncementType, CreateAnnouncementParams } from '../../../types';

export function AdminAnnouncementsScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<CreateAnnouncementParams>({
    type: 'announcement',
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    startDate: '',
    endDate: '',
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
    loading: isZh ? '載入中...' : 'Loading...',
    noData: isZh ? '沒有公告' : 'No announcements',
    announcement: isZh ? '一般公告' : 'Announcement',
    flashEvent: isZh ? '快閃活動' : 'Flash Event',
    holidayEvent: isZh ? '節日限定' : 'Holiday Event',
    typeLabel: isZh ? '類型' : 'Type',
    titleLabel: isZh ? '標題' : 'Title',
    contentLabel: isZh ? '內容' : 'Content',
    imageUrlLabel: isZh ? '圖片網址' : 'Image URL',
    linkUrlLabel: isZh ? '連結網址' : 'Link URL',
    startDateLabel: isZh ? '開始日期' : 'Start Date',
    endDateLabel: isZh ? '結束日期' : 'End Date',
    priorityLabel: isZh ? '優先順序' : 'Priority',
    isActiveLabel: isZh ? '啟用' : 'Active',
    confirmDelete: isZh ? '確定要刪除這則公告嗎？' : 'Delete this announcement?',
    addTitle: isZh ? '新增公告' : 'Add Announcement',
    editTitle: isZh ? '編輯公告' : 'Edit Announcement',
    active: isZh ? '啟用中' : 'Active',
    inactive: isZh ? '已停用' : 'Inactive',
    datePlaceholder: isZh ? 'YYYY-MM-DD' : 'YYYY-MM-DD',
  };

  const typeLabels: Record<AnnouncementType, string> = {
    announcement: translations.announcement,
    flash_event: translations.flashEvent,
    holiday_event: translations.holidayEvent,
  };

  const typeColors: Record<AnnouncementType, string> = {
    announcement: '#3b82f6',
    flash_event: '#f59e0b',
    holiday_event: '#ef4444',
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
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openAddModal = () => {
    setEditingAnnouncement(null);
    setFormData({
      type: 'announcement',
      title: '',
      content: '',
      imageUrl: '',
      linkUrl: '',
      startDate: '',
      endDate: '',
      isActive: true,
      priority: 0,
    });
    setModalVisible(true);
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      type: announcement.type,
      title: announcement.title,
      content: announcement.content,
      imageUrl: announcement.imageUrl || '',
      linkUrl: announcement.linkUrl || '',
      startDate: announcement.startDate?.split('T')[0] || '',
      endDate: announcement.endDate?.split('T')[0] || '',
      isActive: announcement.isActive,
      priority: announcement.priority,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      if (!formData.title.trim() || !formData.content.trim()) {
        Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '請填寫標題和內容' : 'Please fill in title and content');
        return;
      }

      const params: CreateAnnouncementParams = {
        type: formData.type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        isActive: formData.isActive,
        priority: formData.priority,
      };

      if (formData.imageUrl?.trim()) params.imageUrl = formData.imageUrl.trim();
      if (formData.linkUrl?.trim()) params.linkUrl = formData.linkUrl.trim();
      if (formData.startDate?.trim()) params.startDate = formData.startDate.trim();
      if (formData.endDate?.trim()) params.endDate = formData.endDate.trim();

      if (editingAnnouncement) {
        await apiService.updateAnnouncement(token, editingAnnouncement.id, params);
      } else {
        await apiService.createAnnouncement(token, params);
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '儲存失敗' : 'Failed to save');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      isZh ? '確認刪除' : 'Confirm Delete',
      translations.confirmDelete,
      [
        { text: translations.cancel, style: 'cancel' },
        {
          text: translations.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(id);
              const token = await getToken();
              if (!token) return;

              await apiService.deleteAnnouncement(token, id);
              loadData();
            } catch (error) {
              console.error('Failed to delete:', error);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (announcement: Announcement) => {
    try {
      setActionLoading(announcement.id);
      const token = await getToken();
      if (!token) return;

      await apiService.updateAnnouncement(token, announcement.id, {
        isActive: !announcement.isActive,
      });
      loadData();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const renderAnnouncementCard = (item: Announcement) => (
    <View key={item.id} style={[styles.card, !item.isActive && styles.cardInactive]}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: typeColors[item.type] }]}>
          <Text style={styles.typeBadgeText}>{typeLabels[item.type]}</Text>
        </View>
        <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusInactive]}>
          <Text style={[styles.statusText, item.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
            {item.isActive ? translations.active : translations.inactive}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>

      {(item.startDate || item.endDate) && (
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={styles.dateText}>
            {item.startDate?.split('T')[0] || '—'} ~ {item.endDate?.split('T')[0] || '—'}
          </Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.priorityText}>P{item.priority}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleActive(item)}
            disabled={actionLoading === item.id}
          >
            <Ionicons
              name={item.isActive ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#64748b"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil-outline" size={18} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
            disabled={actionLoading === item.id}
          >
            {actionLoading === item.id ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingAnnouncement ? translations.editTitle : translations.addTitle}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>{translations.typeLabel}</Text>
            <View style={styles.typeButtons}>
              {(['announcement', 'flash_event', 'holiday_event'] as AnnouncementType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && { backgroundColor: typeColors[type] },
                  ]}
                  onPress={() => setFormData({ ...formData, type })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {typeLabels[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>{translations.titleLabel} *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder={translations.titleLabel}
            />

            <Text style={styles.inputLabel}>{translations.contentLabel} *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              placeholder={translations.contentLabel}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>{translations.imageUrlLabel}</Text>
            <TextInput
              style={styles.input}
              value={formData.imageUrl}
              onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
              placeholder="https://..."
            />

            <Text style={styles.inputLabel}>{translations.linkUrlLabel}</Text>
            <TextInput
              style={styles.input}
              value={formData.linkUrl}
              onChangeText={(text) => setFormData({ ...formData, linkUrl: text })}
              placeholder="https://..."
            />

            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>{translations.startDateLabel}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.startDate}
                  onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                  placeholder={translations.datePlaceholder}
                />
              </View>
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>{translations.endDateLabel}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.endDate}
                  onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                  placeholder={translations.datePlaceholder}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>{translations.priorityLabel}</Text>
            <TextInput
              style={styles.input}
              value={String(formData.priority || 0)}
              onChangeText={(text) => setFormData({ ...formData, priority: parseInt(text) || 0 })}
              keyboardType="numeric"
              placeholder="0"
            />

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>{translations.isActiveLabel}</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                trackColor={{ false: '#e2e8f0', true: '#86efac' }}
                thumbColor={formData.isActive ? '#22c55e' : '#94a3b8'}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>{translations.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{translations.save}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations.title}</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>{translations.loading}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {announcements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>{translations.noData}</Text>
            </View>
          ) : (
            announcements.map(renderAnnouncementCard)
          )}
        </ScrollView>
      )}

      {renderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#16a34a',
  },
  statusTextInactive: {
    color: '#64748b',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  dateInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
