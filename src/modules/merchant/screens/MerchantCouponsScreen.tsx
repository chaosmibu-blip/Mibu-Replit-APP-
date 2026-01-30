/**
 * MerchantCouponsScreen - 優惠券管理
 *
 * 功能說明：
 * - 顯示商家所有優惠券列表
 * - 支援新增、編輯、刪除優惠券
 * - 支援啟用/停用優惠券
 * - 顯示各稀有度等級的抽中機率
 *
 * 串接的 API：
 * - GET /merchant/coupons - 取得優惠券列表
 * - POST /merchant/coupons - 建立優惠券
 * - PUT /merchant/coupons/:id - 更新優惠券
 * - DELETE /merchant/coupons/:id - 刪除優惠券
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { MerchantCoupon, MerchantCouponTier, CreateMerchantCouponParams, UpdateMerchantCouponParams } from '../../../types';
import { TierBadge } from '../../shared/components/TierBadge';
import { TIER_ORDER, getTierStyle } from '../../../constants/tierStyles';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';

// ============ 主元件 ============
export function MerchantCouponsScreen() {
  // ============ Hooks ============
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  // ============ 狀態變數 ============
  // loading: 資料載入狀態
  const [loading, setLoading] = useState(true);
  // coupons: 優惠券列表
  const [coupons, setCoupons] = useState<MerchantCoupon[]>([]);
  // showModal: 是否顯示新增/編輯彈窗
  const [showModal, setShowModal] = useState(false);
  // editingCoupon: 正在編輯的優惠券（null 表示新增模式）
  const [editingCoupon, setEditingCoupon] = useState<MerchantCoupon | null>(null);
  // saving: 儲存中狀態
  const [saving, setSaving] = useState(false);

  // formData: 表單資料
  const [formData, setFormData] = useState<{
    name: string;           // 優惠券名稱
    tier: MerchantCouponTier; // 稀有度等級
    content: string;        // 優惠內容
    terms: string;          // 使用條款
    quantity: string;       // 發放數量
    validUntil: string;     // 有效期限
  }>({
    name: '',
    tier: 'R',
    content: '',
    terms: '',
    quantity: '100',
    validUntil: '',
  });

  // ============ 多語系翻譯 ============
  const translations = {
    title: isZh ? '優惠券管理' : 'Coupon Management',
    addCoupon: isZh ? '新增優惠券' : 'Add Coupon',
    editCoupon: isZh ? '編輯優惠券' : 'Edit Coupon',
    name: isZh ? '優惠券名稱' : 'Coupon Name',
    tier: isZh ? '稀有度等級' : 'Rarity Tier',
    content: isZh ? '優惠內容' : 'Discount Content',
    terms: isZh ? '使用條款' : 'Terms & Conditions',
    quantity: isZh ? '發放數量' : 'Quantity',
    validUntil: isZh ? '有效期限 (YYYY-MM-DD)' : 'Valid Until (YYYY-MM-DD)',
    save: isZh ? '儲存' : 'Save',
    cancel: isZh ? '取消' : 'Cancel',
    delete: isZh ? '刪除' : 'Delete',
    remaining: isZh ? '剩餘' : 'Remaining',
    active: isZh ? '啟用中' : 'Active',
    inactive: isZh ? '已停用' : 'Inactive',
    expired: isZh ? '已過期' : 'Expired',
    noCoupons: isZh ? '尚未創建優惠券' : 'No coupons yet',
    confirmDelete: isZh ? '確定要刪除此優惠券嗎？' : 'Delete this coupon?',
    tierProbability: isZh ? '抽中機率' : 'Draw Probability',
  };

  // ============ Effect Hooks ============
  // 元件載入時取得優惠券列表
  useEffect(() => {
    loadCoupons();
  }, []);

  // ============ 資料載入函數 ============

  /**
   * loadCoupons - 載入優惠券列表
   */
  const loadCoupons = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await apiService.getMerchantCoupons(token);
      setCoupons(response.coupons || []);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ 彈窗操作函數 ============

  /**
   * openCreateModal - 開啟新增優惠券彈窗
   */
  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      name: '',
      tier: 'R',
      content: '',
      terms: '',
      quantity: '100',
      validUntil: '',
    });
    setShowModal(true);
  };

  /**
   * openEditModal - 開啟編輯優惠券彈窗
   * @param coupon - 要編輯的優惠券
   */
  const openEditModal = (coupon: MerchantCoupon) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name,
      tier: coupon.tier,
      content: coupon.content,
      terms: coupon.terms || '',
      quantity: String(coupon.quantity),
      validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
    });
    setShowModal(true);
  };

  // ============ 事件處理函數 ============

  /**
   * handleSave - 處理儲存優惠券
   * 根據 editingCoupon 判斷是新增還是更新
   */
  const handleSave = async () => {
    // 驗證必填欄位
    if (!formData.name.trim() || !formData.content.trim()) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '請填寫必要欄位' : 'Please fill required fields');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      // 解析數量，預設為 100
      const parsedQuantity = parseInt(formData.quantity, 10);
      const quantity = isNaN(parsedQuantity) || parsedQuantity < 1 ? 100 : parsedQuantity;

      if (editingCoupon) {
        // 更新模式：只傳送有變更的欄位
        const updateParams: UpdateMerchantCouponParams = {};
        if (formData.name.trim() !== editingCoupon.name) {
          updateParams.name = formData.name.trim();
        }
        if (formData.tier !== editingCoupon.tier) {
          updateParams.tier = formData.tier;
        }
        if (formData.content.trim() !== editingCoupon.content) {
          updateParams.content = formData.content.trim();
        }
        if (formData.terms.trim() !== (editingCoupon.terms || '')) {
          updateParams.terms = formData.terms.trim() || undefined;
        }
        if (quantity !== editingCoupon.quantity) {
          updateParams.quantity = quantity;
        }
        const validUntilVal = formData.validUntil || undefined;
        const existingValidUntil = editingCoupon.validUntil ? editingCoupon.validUntil.split('T')[0] : undefined;
        if (validUntilVal !== existingValidUntil) {
          updateParams.validUntil = validUntilVal;
        }

        // 只有有變更才呼叫 API
        if (Object.keys(updateParams).length > 0) {
          await apiService.updateMerchantCoupon(token, editingCoupon.id, updateParams);
        }
      } else {
        // 新增模式
        const createParams: CreateMerchantCouponParams = {
          name: formData.name.trim(),
          tier: formData.tier,
          content: formData.content.trim(),
          terms: formData.terms.trim() || undefined,
          quantity,
          validUntil: formData.validUntil || undefined,
          isActive: true,
        };
        await apiService.createMerchantCoupon(token, createParams);
      }

      setShowModal(false);
      loadCoupons();
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '儲存失敗' : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  /**
   * handleDelete - 處理刪除優惠券
   * @param couponId - 優惠券 ID
   */
  const handleDelete = async (couponId: number) => {
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
              const token = await getToken();
              if (!token) return;

              await apiService.deleteMerchantCoupon(token, couponId);
              loadCoupons();
            } catch (error) {
              Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '刪除失敗' : 'Delete failed');
            }
          },
        },
      ]
    );
  };

  /**
   * toggleActive - 切換優惠券啟用/停用狀態
   * @param coupon - 優惠券
   */
  const toggleActive = async (coupon: MerchantCoupon) => {
    try {
      const token = await getToken();
      if (!token) return;

      await apiService.updateMerchantCoupon(token, coupon.id, { isActive: !coupon.isActive });
      loadCoupons();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  // ============ 工具函數 ============

  /**
   * formatDate - 格式化日期
   * @param dateStr - ISO 日期字串
   * @returns 格式化後的日期字串
   */
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(isZh ? 'zh-TW' : 'en-US');
  };

  /**
   * isExpired - 檢查是否已過期
   * @param dateStr - ISO 日期字串
   * @returns 是否已過期
   */
  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  // ============ 載入中畫面 ============
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  // ============ 主要 JSX 渲染 ============
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* ============ 頂部標題區 ============ */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations.title}</Text>
        {/* 新增按鈕 */}
        <TouchableOpacity onPress={openCreateModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color={MibuBrand.warmWhite} />
        </TouchableOpacity>
      </View>

      {/* ============ 主要內容區 ============ */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* ============ 抽中機率資訊卡 ============ */}
        <View style={styles.probabilityInfo}>
          <Text style={styles.probabilityTitle}>{translations.tierProbability}</Text>
          <View style={styles.probabilityGrid}>
            {TIER_ORDER.map(tier => {
              const style = getTierStyle(tier);
              return (
                <View key={tier} style={styles.probabilityItem}>
                  <TierBadge tier={tier} isZh={isZh} size="small" />
                  <Text style={[styles.probabilityValue, { color: style.textColor }]}>
                    {style.probability}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ============ 優惠券列表 ============ */}
        {coupons.length === 0 ? (
          // 空狀態
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={64} color={MibuBrand.tan} />
            <Text style={styles.emptyText}>{translations.noCoupons}</Text>
            <TouchableOpacity style={styles.emptyAddButton} onPress={openCreateModal}>
              <Ionicons name="add" size={20} color={MibuBrand.warmWhite} />
              <Text style={styles.emptyAddText}>{translations.addCoupon}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // 優惠券卡片列表
          coupons.map(coupon => (
            <TouchableOpacity
              key={coupon.id}
              style={[
                styles.couponCard,
                !coupon.isActive && styles.couponCardInactive,
              ]}
              onPress={() => openEditModal(coupon)}
            >
              {/* 卡片頂部：稀有度 + 狀態 */}
              <View style={styles.couponHeader}>
                <TierBadge tier={coupon.tier} isZh={isZh} />
                <View style={[
                  styles.statusBadge,
                  coupon.isActive
                    ? (isExpired(coupon.validUntil) ? styles.statusExpired : styles.statusActive)
                    : styles.statusInactive
                ]}>
                  <Text style={styles.statusText}>
                    {coupon.isActive
                      ? (isExpired(coupon.validUntil) ? translations.expired : translations.active)
                      : translations.inactive}
                  </Text>
                </View>
              </View>

              {/* 優惠券名稱與內容 */}
              <Text style={styles.couponName}>{coupon.name}</Text>
              <Text style={styles.couponContent}>{coupon.content}</Text>

              {/* 數量與有效期資訊 */}
              <View style={styles.couponMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="layers-outline" size={14} color={MibuBrand.copper} />
                  <Text style={styles.metaText}>
                    {translations.remaining}: {coupon.remainingQuantity}/{coupon.quantity}
                  </Text>
                </View>
                {coupon.validUntil && (
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={MibuBrand.copper} />
                    <Text style={styles.metaText}>{formatDate(coupon.validUntil)}</Text>
                  </View>
                )}
              </View>

              {/* 操作按鈕 */}
              <View style={styles.couponActions}>
                {/* 啟用/停用切換 */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleActive(coupon)}
                >
                  <Ionicons
                    name={coupon.isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                    size={20}
                    color={coupon.isActive ? SemanticColors.warningDark : SemanticColors.successDark}
                  />
                </TouchableOpacity>
                {/* 刪除按鈕 */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(coupon.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={SemanticColors.errorDark} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* 底部間距 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ============ 新增/編輯彈窗 ============ */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            {/* 彈窗標題 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCoupon ? translations.editCoupon : translations.addCoupon}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={MibuBrand.copper} />
              </TouchableOpacity>
            </View>

            {/* 表單內容 */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* 優惠券名稱 */}
              <Text style={styles.inputLabel}>{translations.name} *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                placeholder={isZh ? '例：九折優惠' : 'e.g., 10% Off'}
                placeholderTextColor={MibuBrand.tan}
              />

              {/* 稀有度等級選擇 */}
              <Text style={styles.inputLabel}>{translations.tier}</Text>
              <View style={styles.tierGrid}>
                {TIER_ORDER.map(tier => {
                  const tierStyle = getTierStyle(tier);
                  return (
                    <TouchableOpacity
                      key={tier}
                      style={[
                        styles.tierOption,
                        formData.tier === tier && {
                          backgroundColor: tierStyle.backgroundColor,
                          borderColor: tierStyle.borderColor,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, tier })}
                    >
                      <Text style={[
                        styles.tierOptionText,
                        formData.tier === tier && { color: tierStyle.textColor, fontWeight: '700' },
                      ]}>
                        {tier} ({tierStyle.probability}%)
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 優惠內容 */}
              <Text style={styles.inputLabel}>{translations.content} *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.content}
                onChangeText={text => setFormData({ ...formData, content: text })}
                placeholder={isZh ? '優惠詳細內容' : 'Discount details'}
                placeholderTextColor={MibuBrand.tan}
                multiline
                numberOfLines={3}
              />

              {/* 使用條款 */}
              <Text style={styles.inputLabel}>{translations.terms}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.terms}
                onChangeText={text => setFormData({ ...formData, terms: text })}
                placeholder={isZh ? '使用條款（選填）' : 'Terms (optional)'}
                placeholderTextColor={MibuBrand.tan}
                multiline
                numberOfLines={2}
              />

              {/* 數量與有效期限 */}
              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>{translations.quantity}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.quantity}
                    onChangeText={text => setFormData({ ...formData, quantity: text.replace(/[^0-9]/g, '') })}
                    keyboardType="number-pad"
                    placeholder="100"
                    placeholderTextColor={MibuBrand.tan}
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>{translations.validUntil}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.validUntil}
                    onChangeText={text => setFormData({ ...formData, validUntil: text })}
                    placeholder="2025-12-31"
                    placeholderTextColor={MibuBrand.tan}
                  />
                </View>
              </View>
            </ScrollView>

            {/* 彈窗底部按鈕 */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>{translations.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={MibuBrand.warmWhite} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{translations.save}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ============ 樣式定義 ============
const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  // 載入中容器
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  // 頂部標題區
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
  // 返回按鈕
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 標題文字
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  // 新增按鈕
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: MibuBrand.brown,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 主要內容區
  content: {
    flex: 1,
    padding: 16,
  },
  // 機率資訊卡
  probabilityInfo: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  // 機率資訊標題
  probabilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginBottom: 12,
  },
  // 機率網格
  probabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // 機率項目
  probabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // 機率數值
  probabilityValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  // 空狀態容器
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  // 空狀態文字
  emptyText: {
    fontSize: 16,
    color: MibuBrand.tan,
    marginTop: 16,
    marginBottom: 24,
  },
  // 空狀態新增按鈕
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  // 空狀態新增按鈕文字
  emptyAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
  // 優惠券卡片
  couponCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  // 優惠券卡片（停用狀態）
  couponCardInactive: {
    opacity: 0.6,
  },
  // 優惠券卡片頂部
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  // 狀態標籤
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  // 狀態標籤（啟用中）
  statusActive: {
    backgroundColor: SemanticColors.successLight,
  },
  // 狀態標籤（已停用）
  statusInactive: {
    backgroundColor: MibuBrand.tanLight,
  },
  // 狀態標籤（已過期）
  statusExpired: {
    backgroundColor: SemanticColors.errorLight,
  },
  // 狀態標籤文字
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  // 優惠券名稱
  couponName: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 6,
  },
  // 優惠券內容
  couponContent: {
    fontSize: 14,
    color: MibuBrand.copper,
    lineHeight: 20,
    marginBottom: 12,
  },
  // 優惠券資訊區
  couponMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  // 資訊項目
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // 資訊文字
  metaText: {
    fontSize: 12,
    color: MibuBrand.copper,
  },
  // 操作按鈕區
  couponActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
    paddingTop: 12,
  },
  // 操作按鈕
  actionButton: {
    padding: 8,
  },
  // 彈窗遮罩
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  // 彈窗內容
  modalContent: {
    backgroundColor: MibuBrand.warmWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  // 彈窗頂部
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  // 彈窗標題
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  // 彈窗主體
  modalBody: {
    padding: 20,
  },
  // 輸入標籤
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 8,
  },
  // 輸入框
  input: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: MibuBrand.brownDark,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    marginBottom: 16,
  },
  // 多行輸入框
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // 等級選擇網格
  tierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  // 等級選項
  tierOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    backgroundColor: MibuBrand.creamLight,
  },
  // 等級選項文字
  tierOptionText: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  // 輸入框並排
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  // 半寬輸入框
  inputHalf: {
    flex: 1,
  },
  // 彈窗底部
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
  },
  // 取消按鈕
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: MibuBrand.tanLight,
    alignItems: 'center',
  },
  // 取消按鈕文字
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  // 儲存按鈕
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
  },
  // 儲存按鈕（停用狀態）
  saveButtonDisabled: {
    opacity: 0.7,
  },
  // 儲存按鈕文字
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
});
