/**
 * @fileoverview 管理公告畫面
 *
 * 功能說明：
 * - 顯示所有公告列表
 * - 新增、編輯、刪除公告
 * - 切換公告啟用/停用狀態
 * - 支援三種公告類型：一般公告、快閃活動、節日限定
 *
 * 串接的 API：
 * - GET /admin/announcements - 取得公告列表
 * - POST /admin/announcements - 新增公告
 * - PUT /admin/announcements/:id - 更新公告
 * - DELETE /admin/announcements/:id - 刪除公告
 */

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
import { useAuth, useI18n } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { Announcement, AnnouncementType, CreateAnnouncementParams } from '../../../types';
import { UIColors, MibuBrand } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize, FontWeight, SemanticColors } from '../../../theme/designTokens';

// ============ 主元件 ============

/**
 * 管理公告畫面元件
 * 提供公告的 CRUD 操作及啟用/停用切換
 */
export function AdminAnnouncementsScreen() {
  // ============ Hooks & Context ============
  const { getToken } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  // ============ 狀態管理 ============

  /** 公告列表 */
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  /** 資料載入中狀態 */
  const [loading, setLoading] = useState(true);

  /** 下拉刷新中狀態 */
  const [refreshing, setRefreshing] = useState(false);

  /** 操作進行中的公告 ID（用於顯示該公告的 loading） */
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  /** 新增/編輯 Modal 是否顯示 */
  const [modalVisible, setModalVisible] = useState(false);

  /** 正在編輯的公告（null 表示新增模式） */
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  /** 表單資料 */
  const [formData, setFormData] = useState<CreateAnnouncementParams>({
    type: 'announcement',      // 公告類型
    title: '',                 // 標題
    content: '',               // 內容
    imageUrl: '',              // 圖片網址（選填）
    linkUrl: '',               // 連結網址（選填）
    startDate: '',             // 開始日期（選填）
    endDate: '',               // 結束日期（選填）
    isActive: true,            // 是否啟用
    priority: 0,               // 優先順序
  });

  /** 公告類型標籤對照表 */
  const typeLabels: Record<AnnouncementType, string> = {
    announcement: t.admin_typeAnnouncement,
    flash_event: t.admin_typeFlashEvent,
    holiday_event: t.admin_typeHolidayEvent,
  };

  /** 公告類型顏色對照表 */
  const typeColors: Record<AnnouncementType, string> = {
    announcement: MibuBrand.info,      // 藍色 - 一般公告
    flash_event: MibuBrand.warning,    // 橘色 - 快閃活動
    holiday_event: MibuBrand.error,    // 紅色 - 節日限定
  };

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
      setRefreshing(false);
    }
  };

  /**
   * 處理下拉刷新
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ============ Modal 操作 ============

  /**
   * 開啟新增公告 Modal
   * 重置表單並設定為新增模式
   */
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

  /**
   * 開啟編輯公告 Modal
   * 載入該公告的現有資料到表單
   * @param announcement - 要編輯的公告
   */
  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      type: announcement.type,
      title: announcement.title,
      content: announcement.content,
      imageUrl: announcement.imageUrl || '',
      linkUrl: announcement.linkUrl || '',
      startDate: announcement.startDate?.split('T')[0] || '',  // 只取日期部分
      endDate: announcement.endDate?.split('T')[0] || '',      // 只取日期部分
      isActive: announcement.isActive,
      priority: announcement.priority,
    });
    setModalVisible(true);
  };

  // ============ CRUD 操作 ============

  /**
   * 儲存公告（新增或更新）
   * 根據 editingAnnouncement 是否存在決定是新增還是更新
   */
  const handleSave = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // 驗證必填欄位
      if (!formData.title.trim() || !formData.content.trim()) {
        Alert.alert(t.common_error, t.admin_fillTitleContent);
        return;
      }

      // 組裝請求參數
      const params: CreateAnnouncementParams = {
        type: formData.type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        isActive: formData.isActive,
        priority: formData.priority,
      };

      // 選填欄位只在有值時才加入
      if (formData.imageUrl?.trim()) params.imageUrl = formData.imageUrl.trim();
      if (formData.linkUrl?.trim()) params.linkUrl = formData.linkUrl.trim();
      if (formData.startDate?.trim()) params.startDate = formData.startDate.trim();
      if (formData.endDate?.trim()) params.endDate = formData.endDate.trim();

      // 根據模式執行新增或更新
      if (editingAnnouncement) {
        await apiService.updateAnnouncement(token, editingAnnouncement.id, params);
      } else {
        await apiService.createAnnouncement(token, params);
      }

      setModalVisible(false);
      loadData(); // 重新載入列表
    } catch (error) {
      console.error('Failed to save announcement:', error);
      Alert.alert(t.common_error, t.common_saveFailed);
    }
  };

  /**
   * 刪除公告
   * 顯示確認對話框後執行刪除
   * @param id - 公告 ID
   */
  const handleDelete = (id: number) => {
    Alert.alert(
      t.common_confirmDelete,
      t.admin_confirmDeleteAnnouncement,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.common_delete,
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(id);
              const token = await getToken();
              if (!token) return;

              await apiService.deleteAnnouncement(token, id);
              loadData(); // 重新載入列表
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

  /**
   * 切換公告啟用/停用狀態
   * @param announcement - 要切換的公告
   */
  const toggleActive = async (announcement: Announcement) => {
    try {
      setActionLoading(announcement.id);
      const token = await getToken();
      if (!token) return;

      await apiService.updateAnnouncement(token, announcement.id, {
        isActive: !announcement.isActive,
      });
      loadData(); // 重新載入列表
    } catch (error) {
      console.error('Failed to toggle active:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // ============ 渲染函數：公告卡片 ============

  /**
   * 渲染單一公告卡片
   * @param item - 公告資料
   */
  const renderAnnouncementCard = (item: Announcement) => (
    <View key={item.id} style={[styles.card, !item.isActive && styles.cardInactive]}>
      {/* 卡片頂部：類型標籤 + 狀態標籤 */}
      <View style={styles.cardHeader}>
        {/* 類型標籤 */}
        <View style={[styles.typeBadge, { backgroundColor: typeColors[item.type] }]}>
          <Text style={styles.typeBadgeText}>{typeLabels[item.type]}</Text>
        </View>
        {/* 狀態標籤 */}
        <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusInactive]}>
          <Text style={[styles.statusText, item.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
            {item.isActive ? t.common_active : t.common_inactive}
          </Text>
        </View>
      </View>

      {/* 公告標題 */}
      <Text style={styles.cardTitle}>{item.title}</Text>

      {/* 公告內容（最多顯示 2 行） */}
      <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>

      {/* 日期範圍（如果有設定） */}
      {(item.startDate || item.endDate) && (
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={UIColors.textSecondary} />
          <Text style={styles.dateText}>
            {item.startDate?.split('T')[0] || '—'} ~ {item.endDate?.split('T')[0] || '—'}
          </Text>
        </View>
      )}

      {/* 卡片底部：優先順序 + 操作按鈕 */}
      <View style={styles.cardFooter}>
        {/* 優先順序 */}
        <Text style={styles.priorityText}>P{item.priority}</Text>

        {/* 操作按鈕群組 */}
        <View style={styles.cardActions}>
          {/* 切換啟用/停用按鈕 */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleActive(item)}
            disabled={actionLoading === item.id}
          >
            <Ionicons
              name={item.isActive ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={UIColors.textSecondary}
            />
          </TouchableOpacity>

          {/* 編輯按鈕 */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil-outline" size={18} color={MibuBrand.info} />
          </TouchableOpacity>

          {/* 刪除按鈕 */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
            disabled={actionLoading === item.id}
          >
            {actionLoading === item.id ? (
              <ActivityIndicator size="small" color={MibuBrand.error} />
            ) : (
              <Ionicons name="trash-outline" size={18} color={MibuBrand.error} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ============ 渲染函數：新增/編輯 Modal ============

  /**
   * 渲染新增/編輯公告的 Modal
   * 包含表單輸入欄位和操作按鈕
   */
  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal 標題列 */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingAnnouncement ? t.admin_editAnnouncement : t.admin_createAnnouncement}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={UIColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Modal 表單內容 */}
          <ScrollView style={styles.modalBody}>
            {/* 類型選擇 */}
            <Text style={styles.inputLabel}>{t.admin_type}</Text>
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

            {/* 標題輸入 */}
            <Text style={styles.inputLabel}>{t.admin_titleLabel} *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder={t.admin_titleLabel}
            />

            {/* 內容輸入 */}
            <Text style={styles.inputLabel}>{t.admin_contentLabel} *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              placeholder={t.admin_contentLabel}
              multiline
              numberOfLines={4}
            />

            {/* 圖片網址輸入 */}
            <Text style={styles.inputLabel}>{t.admin_imageUrl}</Text>
            <TextInput
              style={styles.input}
              value={formData.imageUrl}
              onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
              placeholder="https://..."
            />

            {/* 連結網址輸入 */}
            <Text style={styles.inputLabel}>{t.admin_linkUrl}</Text>
            <TextInput
              style={styles.input}
              value={formData.linkUrl}
              onChangeText={(text) => setFormData({ ...formData, linkUrl: text })}
              placeholder="https://..."
            />

            {/* 日期範圍輸入 */}
            <View style={styles.dateRow}>
              {/* 開始日期 */}
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>{t.admin_startDateLabel}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.startDate}
                  onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                  placeholder={t.admin_datePlaceholder}
                />
              </View>
              {/* 結束日期 */}
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>{t.admin_endDateLabel}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.endDate}
                  onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                  placeholder={t.admin_datePlaceholder}
                />
              </View>
            </View>

            {/* 優先順序輸入 */}
            <Text style={styles.inputLabel}>{t.admin_priority}</Text>
            <TextInput
              style={styles.input}
              value={String(formData.priority || 0)}
              onChangeText={(text) => setFormData({ ...formData, priority: parseInt(text) || 0 })}
              keyboardType="numeric"
              placeholder="0"
            />

            {/* 啟用開關 */}
            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>{t.admin_isActiveLabel}</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                trackColor={{ false: MibuBrand.tanLight, true: SemanticColors.success.light }}
                thumbColor={formData.isActive ? MibuBrand.success : UIColors.textSecondary}
              />
            </View>
          </ScrollView>

          {/* Modal 底部按鈕 */}
          <View style={styles.modalFooter}>
            {/* 取消按鈕 */}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>{t.cancel}</Text>
            </TouchableOpacity>
            {/* 儲存按鈕 */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{t.common_save}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ============ 主渲染 ============

  return (
    <View style={styles.container}>
      {/* 頂部標題列 */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
        </TouchableOpacity>
        {/* 標題 */}
        <Text style={styles.headerTitle}>{t.admin_announcementManage}</Text>
        {/* 新增按鈕 */}
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 主要內容區 */}
      {loading ? (
        // 載入中狀態
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MibuBrand.info} />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      ) : (
        // 公告列表
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {announcements.length === 0 ? (
            // 空狀態
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={48} color={UIColors.textSecondary} />
              <Text style={styles.emptyText}>{t.admin_noAnnouncements}</Text>
            </View>
          ) : (
            // 公告卡片列表
            announcements.map(renderAnnouncementCard)
          )}
        </ScrollView>
      )}

      {/* 新增/編輯 Modal */}
      {renderModal()}
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 容器樣式
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },

  // 頂部標題列樣式
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: MibuBrand.dark,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MibuBrand.info,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 載入中樣式
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: UIColors.textSecondary,
  },

  // 內容區樣式
  content: {
    flex: 1,
    padding: Spacing.lg,
  },

  // 空狀態樣式
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: UIColors.textSecondary,
  },

  // 卡片樣式
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  cardInactive: {
    opacity: 0.6,  // 停用的公告顯示較淡
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },

  // 類型標籤樣式
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  typeBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#fff',
  },

  // 狀態標籤樣式
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  statusActive: {
    backgroundColor: SemanticColors.success.light,
  },
  statusInactive: {
    backgroundColor: MibuBrand.creamLight,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  statusTextActive: {
    color: SemanticColors.success.dark,
  },
  statusTextInactive: {
    color: UIColors.textSecondary,
  },

  // 卡片內容樣式
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: MibuBrand.dark,
    marginBottom: Spacing.sm,
  },
  cardContent: {
    fontSize: FontSize.md,
    color: UIColors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  // 日期列樣式
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  dateText: {
    fontSize: FontSize.sm,
    color: UIColors.textSecondary,
  },

  // 卡片底部樣式
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: MibuBrand.creamLight,
    paddingTop: Spacing.md,
  },
  priorityText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: UIColors.textSecondary,
  },

  // 操作按鈕樣式
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal 樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: UIColors.overlayMedium,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: MibuBrand.dark,
  },
  modalBody: {
    padding: 20,
  },

  // 表單輸入樣式
  inputLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: UIColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: MibuBrand.creamLight,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    borderRadius: Radius.md,
    padding: 14,
    fontSize: 15,
    color: MibuBrand.dark,
    marginBottom: Spacing.lg,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // 類型選擇按鈕樣式
  typeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: UIColors.textSecondary,
  },
  typeButtonTextActive: {
    color: UIColors.white,
  },

  // 日期輸入樣式
  dateInput: {
    flex: 1,
  },

  // 開關列樣式
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  // Modal 底部按鈕樣式
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: UIColors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: MibuBrand.info,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: '#fff',
  },
});
