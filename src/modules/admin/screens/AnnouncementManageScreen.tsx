/**
 * ============================================================
 * 公告管理畫面 (AnnouncementManageScreen.tsx)
 * ============================================================
 * 功能說明：
 * - 顯示所有公告列表（使用 Mibu 品牌設計系統）
 * - 新增、編輯、刪除公告
 * - 支援三種公告類型：一般公告、快閃活動、節慶活動
 * - 可設定公告啟用/停用狀態
 *
 * 串接的 API：
 * - GET /admin/announcements - 取得公告列表
 * - POST /admin/announcements - 新增公告
 * - PUT /admin/announcements/:id - 更新公告
 * - DELETE /admin/announcements/:id - 刪除公告
 *
 * 設計規範：
 * - 使用 MibuBrand 品牌色彩
 * - 使用 SemanticColors 狀態色彩
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
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useI18n } from '../../../context/AppContext';
import {
  useAdminAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from '../../../hooks/useAdminQueries';
import { Announcement, AnnouncementType } from '../../../types';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

// ============ 型別定義 ============

/** 編輯模式：新增 | 編輯 | 無（關閉 Modal） */
type EditMode = 'create' | 'edit' | null;

// ============ 常數定義 ============

/** 公告類型選項（翻譯 key 對應） */
const TYPE_OPTIONS: { value: AnnouncementType; labelKey: string }[] = [
  { value: 'announcement', labelKey: 'admin_typeAnnouncement' },
  { value: 'flash_event', labelKey: 'admin_typeFlashEvent' },
  { value: 'holiday_event', labelKey: 'admin_typeHolidayEvent' },
];

// ============ 主元件 ============

/**
 * 公告管理畫面元件
 * 使用 Mibu 品牌設計系統，提供公告的 CRUD 操作
 */
export function AnnouncementManageScreen() {
  // ============ Hooks & Context ============
  const { getToken } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  // ============ 狀態管理 ============

  /** 公告列表 */
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  /** 資料載入中狀態 */
  const [loading, setLoading] = useState(true);

  /** 操作進行中狀態（儲存、刪除等） */
  const [actionLoading, setActionLoading] = useState(false);

  /** 編輯模式：create（新增）、edit（編輯）、null（關閉） */
  const [editMode, setEditMode] = useState<EditMode>(null);

  /** 正在編輯的公告（edit 模式時使用） */
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  /** 表單資料 */
  const [formData, setFormData] = useState({
    type: 'announcement' as AnnouncementType,  // 公告類型
    title: '',                                  // 標題
    content: '',                                // 內容
    imageUrl: '',                               // 圖片網址（選填）
    linkUrl: '',                                // 連結網址（選填）
    isActive: true,                             // 是否啟用
    priority: 0,                                // 優先順序
  });

  // ============ 多國語系（使用全域 t 翻譯字典） ============

  // ============ 副作用 ============

  /** 元件掛載時載入資料 */
  useEffect(() => {
    loadData();
  }, []);

  // ============ 資料載入函數 ============

  /**
   * 載入公告列表
   * 呼叫 API 取得所有公告
   */
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

  // ============ 表單操作 ============

  /**
   * 重置表單為初始值
   */
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

  /**
   * 開啟新增公告 Modal
   */
  const handleCreate = () => {
    resetForm();
    setEditingItem(null);
    setEditMode('create');
  };

  /**
   * 開啟編輯公告 Modal
   * @param item - 要編輯的公告
   */
  const handleEdit = (item: Announcement) => {
    // 將公告資料填入表單
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

  // ============ CRUD 操作 ============

  /**
   * 刪除公告
   * @param item - 要刪除的公告
   */
  const handleDelete = (item: Announcement) => {
    Alert.alert(t.common_delete, t.admin_confirmDeleteAnnouncement, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.common_delete,
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(true);
            const token = await getToken();
            if (!token) return;
            await apiService.deleteAnnouncement(token, item.id);
            loadData(); // 重新載入列表
          } catch (error) {
            console.error('Failed to delete announcement:', error);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  /**
   * 儲存公告（新增或更新）
   */
  const handleSave = async () => {
    // 驗證必填欄位
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert(t.common_error, t.admin_fillTitleContent);
      return;
    }

    try {
      setActionLoading(true);
      const token = await getToken();
      if (!token) return;

      // 組裝請求參數
      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
        linkUrl: formData.linkUrl.trim() || undefined,
        isActive: formData.isActive,
        priority: formData.priority,
      };

      // 根據模式執行新增或更新
      if (editMode === 'create') {
        await apiService.createAnnouncement(token, payload);
      } else if (editMode === 'edit' && editingItem) {
        await apiService.updateAnnouncement(token, editingItem.id, payload);
      }

      setEditMode(null);  // 關閉 Modal
      loadData();          // 重新載入列表
    } catch (error) {
      console.error('Failed to save announcement:', error);
      Alert.alert(t.common_error, t.common_saveFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // ============ 工具函數 ============

  /**
   * 取得公告類型的顯示標籤
   * @param type - 公告類型
   * @returns 對應語言的標籤文字
   */
  const getTypeLabel = (type: AnnouncementType) => {
    const option = TYPE_OPTIONS.find(o => o.value === type);
    return option ? t[option.labelKey] : type;
  };

  /**
   * 取得公告類型的顯示顏色
   * @param type - 公告類型
   * @returns 對應的顏色值
   */
  const getTypeColor = (type: AnnouncementType) => {
    switch (type) {
      case 'announcement': return MibuBrand.brown;         // 棕色 - 一般公告
      case 'flash_event': return SemanticColors.starYellow; // 金色 - 快閃活動
      case 'holiday_event': return '#ec4899';               // 粉色 - 節慶活動
      default: return MibuBrand.tan;
    }
  };

  // ============ 載入中畫面 ============

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  // ============ 主渲染 ============

  return (
    <View style={styles.container}>
      {/* 頂部標題列 */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brown} />
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        {/* 標題 */}
        <Text style={styles.title}>{t.admin_announcementManage}</Text>
        {/* 新增按鈕 */}
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Ionicons name="add" size={24} color={MibuBrand.warmWhite} />
        </TouchableOpacity>
      </View>

      {/* 公告列表 */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {announcements.length === 0 ? (
          // 空狀態
          <View style={styles.emptyCard}>
            <Ionicons name="megaphone-outline" size={48} color={MibuBrand.tan} />
            <Text style={styles.emptyText}>{t.admin_noAnnouncements}</Text>
          </View>
        ) : (
          // 公告卡片列表
          announcements.map(item => (
            <View key={item.id} style={styles.card}>
              {/* 卡片頂部：類型標籤 + 狀態標籤 */}
              <View style={styles.cardHeader}>
                {/* 類型標籤 */}
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                  <Text style={[styles.typeBadgeText, { color: getTypeColor(item.type) }]}>
                    {getTypeLabel(item.type)}
                  </Text>
                </View>
                {/* 狀態標籤 */}
                <View style={[styles.statusBadge, item.isActive ? styles.activeStatus : styles.inactiveStatus]}>
                  <Text style={styles.statusText}>{item.isActive ? t.common_active : t.common_inactive}</Text>
                </View>
              </View>

              {/* 公告標題 */}
              <Text style={styles.cardTitle}>{item.title}</Text>

              {/* 公告內容（最多顯示 2 行） */}
              <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>

              {/* 操作按鈕 */}
              <View style={styles.cardActions}>
                {/* 編輯按鈕 */}
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                  <Ionicons name="pencil" size={16} color={MibuBrand.brown} />
                  <Text style={styles.editButtonText}>{t.common_edit}</Text>
                </TouchableOpacity>
                {/* 刪除按鈕 */}
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={16} color={SemanticColors.errorDark} />
                  <Text style={styles.deleteButtonText}>{t.common_delete}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 新增/編輯 Modal */}
      <Modal visible={editMode !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal 標題列 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode === 'create' ? t.admin_createAnnouncement : t.admin_editAnnouncement}
              </Text>
              <TouchableOpacity onPress={() => setEditMode(null)}>
                <Ionicons name="close" size={24} color={MibuBrand.tan} />
              </TouchableOpacity>
            </View>

            {/* 表單內容 */}
            <ScrollView style={styles.formScroll}>
              {/* 類型選擇 */}
              <Text style={styles.label}>{t.admin_type}</Text>
              <View style={styles.typeSelector}>
                {TYPE_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.typeOption, formData.type === option.value && styles.typeOptionActive]}
                    onPress={() => setFormData(prev => ({ ...prev, type: option.value }))}
                  >
                    <Text style={[styles.typeOptionText, formData.type === option.value && styles.typeOptionTextActive]}>
                      {t[option.labelKey]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 標題輸入 */}
              <Text style={styles.label}>{t.admin_titleLabel}</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
                placeholder={t.admin_enterTitle}
              />

              {/* 內容輸入 */}
              <Text style={styles.label}>{t.admin_contentLabel}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.content}
                onChangeText={text => setFormData(prev => ({ ...prev, content: text }))}
                placeholder={t.admin_enterContent}
                multiline
                numberOfLines={4}
              />

              {/* 圖片網址輸入 */}
              <Text style={styles.label}>{t.admin_imageUrl}</Text>
              <TextInput
                style={styles.input}
                value={formData.imageUrl}
                onChangeText={text => setFormData(prev => ({ ...prev, imageUrl: text }))}
                placeholder="https://..."
              />

              {/* 連結網址輸入 */}
              <Text style={styles.label}>{t.admin_linkUrl}</Text>
              <TextInput
                style={styles.input}
                value={formData.linkUrl}
                onChangeText={text => setFormData(prev => ({ ...prev, linkUrl: text }))}
                placeholder="https://..."
              />

              {/* 啟用開關 */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t.common_active}</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={value => setFormData(prev => ({ ...prev, isActive: value }))}
                  trackColor={{ false: MibuBrand.tanLight, true: MibuBrand.copper }}
                  thumbColor={formData.isActive ? MibuBrand.brown : MibuBrand.creamLight}
                />
              </View>
            </ScrollView>

            {/* Modal 底部按鈕 */}
            <View style={styles.modalActions}>
              {/* 取消按鈕 */}
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditMode(null)}>
                <Text style={styles.cancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
              {/* 儲存按鈕 */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={actionLoading}>
                {actionLoading ? (
                  <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
                ) : (
                  <Text style={styles.saveButtonText}>{t.common_save}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 容器樣式
  container: { flex: 1, backgroundColor: MibuBrand.creamLight },

  // 載入中樣式
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: MibuBrand.creamLight },
  loadingText: { marginTop: 12, color: MibuBrand.copper, fontSize: 16 },

  // 頂部標題列樣式
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: MibuBrand.warmWhite, borderBottomWidth: 1, borderBottomColor: MibuBrand.tanLight },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, color: MibuBrand.brown, marginLeft: 4 },
  title: { fontSize: 20, fontWeight: '800', color: MibuBrand.brownDark },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: MibuBrand.brown, alignItems: 'center', justifyContent: 'center' },

  // 滾動區域樣式
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },

  // 空狀態卡片樣式
  emptyCard: { backgroundColor: MibuBrand.warmWhite, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 2, borderColor: MibuBrand.tanLight },
  emptyText: { fontSize: 16, color: MibuBrand.copper, marginTop: 12 },

  // 公告卡片樣式
  card: { backgroundColor: MibuBrand.warmWhite, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: MibuBrand.tanLight },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },

  // 類型標籤樣式
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { fontSize: 12, fontWeight: '600' },

  // 狀態標籤樣式
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeStatus: { backgroundColor: SemanticColors.successLight },
  inactiveStatus: { backgroundColor: SemanticColors.errorLight },
  statusText: { fontSize: 11, fontWeight: '600', color: SemanticColors.successDark },

  // 卡片內容樣式
  cardTitle: { fontSize: 16, fontWeight: '700', color: MibuBrand.brownDark, marginBottom: 6 },
  cardContent: { fontSize: 14, color: MibuBrand.copper, lineHeight: 20, marginBottom: 12 },

  // 卡片操作按鈕樣式
  cardActions: { flexDirection: 'row', gap: 12 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: MibuBrand.highlight, borderRadius: 8 },
  editButtonText: { fontSize: 13, fontWeight: '600', color: MibuBrand.brown },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: SemanticColors.errorLight, borderRadius: 8 },
  deleteButtonText: { fontSize: 13, fontWeight: '600', color: SemanticColors.errorDark },

  // Modal 樣式
  modalOverlay: { flex: 1, backgroundColor: UIColors.overlayLight, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: MibuBrand.warmWhite, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: MibuBrand.tanLight },
  modalTitle: { fontSize: 18, fontWeight: '800', color: MibuBrand.brownDark },

  // 表單樣式
  formScroll: { paddingHorizontal: 20, paddingTop: 16, maxHeight: 400 },
  label: { fontSize: 14, fontWeight: '600', color: MibuBrand.brownDark, marginBottom: 8, marginTop: 16 },

  // 類型選擇器樣式
  typeSelector: { flexDirection: 'row', gap: 8 },
  typeOption: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: MibuBrand.creamLight, alignItems: 'center' },
  typeOptionActive: { backgroundColor: MibuBrand.brown },
  typeOptionText: { fontSize: 13, fontWeight: '600', color: MibuBrand.copper },
  typeOptionTextActive: { color: MibuBrand.warmWhite },

  // 輸入框樣式
  input: { backgroundColor: MibuBrand.creamLight, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: MibuBrand.brownDark, borderWidth: 1, borderColor: MibuBrand.tanLight },
  textArea: { height: 100, textAlignVertical: 'top' },

  // 開關列樣式
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingVertical: 12 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: MibuBrand.brownDark },

  // Modal 底部按鈕樣式
  modalActions: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: MibuBrand.tanLight },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: MibuBrand.creamLight, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: MibuBrand.copper },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: MibuBrand.brown, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: MibuBrand.warmWhite },
});
