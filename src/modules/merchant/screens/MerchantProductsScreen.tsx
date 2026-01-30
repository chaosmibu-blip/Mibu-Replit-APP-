/**
 * MerchantProductsScreen - 產品管理
 *
 * 功能說明：
 * - 顯示商家所有產品列表
 * - 支援新增、編輯、刪除產品
 * - 顯示產品價格、優惠價、上架狀態
 *
 * 串接的 API：
 * - GET /merchant/products - 取得產品列表
 * - POST /merchant/products - 建立產品
 * - PUT /merchant/products/:id - 更新產品
 * - DELETE /merchant/products/:id - 刪除產品
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { MerchantProduct } from '../../../types';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';

// ============ 主元件 ============
export function MerchantProductsScreen() {
  // ============ Hooks ============
  const { state, getToken } = useApp();
  const router = useRouter();

  // ============ 狀態變數 ============
  // products: 產品列表
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  // loading: 初始載入狀態
  const [loading, setLoading] = useState(true);
  // saving: 儲存中狀態
  const [saving, setSaving] = useState(false);
  // modalVisible: 是否顯示新增/編輯彈窗
  const [modalVisible, setModalVisible] = useState(false);
  // editingProduct: 正在編輯的產品（null 表示新增模式）
  const [editingProduct, setEditingProduct] = useState<MerchantProduct | null>(null);
  // formData: 表單資料
  const [formData, setFormData] = useState({
    name: '',           // 產品名稱
    description: '',    // 產品描述
    price: '',          // 原價
    discountPrice: '',  // 優惠價
  });

  // isZh: 判斷是否為中文語系
  const isZh = state.language === 'zh-TW';

  // ============ 多語系翻譯 ============
  const translations = {
    title: isZh ? '商品管理' : 'Product Management',
    myProducts: isZh ? '我的商品' : 'My Products',
    noProducts: isZh ? '尚未建立任何商品' : 'No products yet',
    addNew: isZh ? '新增商品' : 'Add Product',
    edit: isZh ? '編輯' : 'Edit',
    delete: isZh ? '刪除' : 'Delete',
    name: isZh ? '商品名稱' : 'Product Name',
    description: isZh ? '商品描述' : 'Description',
    price: isZh ? '原價' : 'Price',
    discountPrice: isZh ? '優惠價' : 'Discount Price',
    save: isZh ? '儲存' : 'Save',
    cancel: isZh ? '取消' : 'Cancel',
    active: isZh ? '上架中' : 'Active',
    inactive: isZh ? '已下架' : 'Inactive',
    loading: isZh ? '載入中...' : 'Loading...',
    deleteConfirm: isZh ? '確定要刪除此商品？' : 'Delete this product?',
    deleteSuccess: isZh ? '已刪除' : 'Deleted',
    saveSuccess: isZh ? '已儲存' : 'Saved',
    saveFailed: isZh ? '儲存失敗' : 'Save failed',
  };

  // ============ Effect Hooks ============
  // 元件載入時取得產品列表
  useEffect(() => {
    loadProducts();
  }, []);

  // ============ 資料載入函數 ============

  /**
   * loadProducts - 載入產品列表
   */
  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await apiService.getMerchantProducts(token);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ 彈窗操作函數 ============

  /**
   * openModal - 開啟新增/編輯彈窗
   * @param product - 要編輯的產品（不傳則為新增模式）
   */
  const openModal = (product?: MerchantProduct) => {
    if (product) {
      // 編輯模式：填入現有資料
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price?.toString() || '',
        discountPrice: product.discountPrice?.toString() || '',
      });
    } else {
      // 新增模式：清空表單
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', discountPrice: '' });
    }
    setModalVisible(true);
  };

  // ============ 事件處理函數 ============

  /**
   * handleSave - 處理儲存產品
   */
  const handleSave = async () => {
    // 驗證必填欄位
    if (!formData.name.trim()) return;
    try {
      setSaving(true);
      const token = await getToken();
      if (!token) return;

      // 組裝參數
      const params = {
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
      };

      if (editingProduct) {
        // 更新模式
        await apiService.updateMerchantProduct(token, editingProduct.id, params);
      } else {
        // 新增模式
        await apiService.createMerchantProduct(token, params);
      }

      setModalVisible(false);
      loadProducts();
      Alert.alert(isZh ? '成功' : 'Success', translations.saveSuccess);
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', translations.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  /**
   * handleDelete - 處理刪除產品
   * @param product - 要刪除的產品
   */
  const handleDelete = (product: MerchantProduct) => {
    Alert.alert(
      isZh ? '確認刪除' : 'Confirm Delete',
      translations.deleteConfirm,
      [
        { text: translations.cancel, style: 'cancel' },
        {
          text: translations.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) return;
              await apiService.deleteMerchantProduct(token, product.id);
              loadProducts();
              Alert.alert(isZh ? '成功' : 'Success', translations.deleteSuccess);
            } catch (error) {
              console.error('Delete failed:', error);
            }
          },
        },
      ]
    );
  };

  // ============ 載入中畫面 ============
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{translations.loading}</Text>
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
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* ============ 頂部標題區 ============ */}
        <View style={styles.header}>
          {/* 返回按鈕 */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
          </TouchableOpacity>
          <Text style={styles.title}>{translations.title}</Text>
        </View>

        {/* ============ 新增按鈕 ============ */}
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add-circle-outline" size={24} color={MibuBrand.warmWhite} />
          <Text style={styles.addButtonText}>{translations.addNew}</Text>
        </TouchableOpacity>

        {/* ============ 區塊標題 ============ */}
        <Text style={styles.sectionTitle}>{translations.myProducts}</Text>

        {/* ============ 產品列表 ============ */}
        {products.length === 0 ? (
          // 空狀態
          <View style={styles.emptyCard}>
            <Ionicons name="cube-outline" size={48} color={MibuBrand.tan} />
            <Text style={styles.emptyText}>{translations.noProducts}</Text>
          </View>
        ) : (
          // 產品卡片列表
          <View style={styles.productsList}>
            {products.map(product => (
              <View key={product.id} style={styles.productCard}>
                {/* 產品資訊區 */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  {product.description && (
                    <Text style={styles.productDesc} numberOfLines={2}>
                      {product.description}
                    </Text>
                  )}
                  {/* 價格與狀態 */}
                  <View style={styles.priceRow}>
                    {product.discountPrice ? (
                      <>
                        {/* 有優惠價時顯示優惠價和原價刪除線 */}
                        <Text style={styles.discountPrice}>
                          ${product.discountPrice}
                        </Text>
                        <Text style={styles.originalPrice}>
                          ${product.price}
                        </Text>
                      </>
                    ) : product.price ? (
                      // 只有原價
                      <Text style={styles.price}>${product.price}</Text>
                    ) : null}
                    {/* 上架狀態標籤 */}
                    <View style={[
                      styles.statusBadge,
                      product.isActive ? styles.activeBadge : styles.inactiveBadge
                    ]}>
                      <Text style={[
                        styles.statusText,
                        product.isActive ? styles.activeText : styles.inactiveText
                      ]}>
                        {product.isActive ? translations.active : translations.inactive}
                      </Text>
                    </View>
                  </View>
                </View>
                {/* 操作按鈕 */}
                <View style={styles.productActions}>
                  {/* 編輯按鈕 */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openModal(product)}
                  >
                    <Ionicons name="pencil-outline" size={20} color={MibuBrand.copper} />
                  </TouchableOpacity>
                  {/* 刪除按鈕 */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(product)}
                  >
                    <Ionicons name="trash-outline" size={20} color={MibuBrand.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ============ 新增/編輯彈窗 ============ */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            {/* 彈窗標題 */}
            <Text style={styles.modalTitle}>
              {editingProduct ? translations.edit : translations.addNew}
            </Text>

            {/* 表單內容 */}
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* 產品名稱 */}
              <Text style={styles.inputLabel}>{translations.name}</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                placeholder={translations.name}
                placeholderTextColor={MibuBrand.tan}
              />

              {/* 產品描述 */}
              <Text style={styles.inputLabel}>{translations.description}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={text => setFormData({ ...formData, description: text })}
                placeholder={translations.description}
                placeholderTextColor={MibuBrand.tan}
                multiline
                numberOfLines={3}
              />

              {/* 價格欄位（並排） */}
              <View style={styles.priceInputRow}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.inputLabel}>{translations.price}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.price}
                    onChangeText={text => setFormData({ ...formData, price: text })}
                    placeholder="0"
                    placeholderTextColor={MibuBrand.tan}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.inputLabel}>{translations.discountPrice}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.discountPrice}
                    onChangeText={text => setFormData({ ...formData, discountPrice: text })}
                    placeholder="0"
                    placeholderTextColor={MibuBrand.tan}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            {/* 彈窗底部按鈕 */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>{translations.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
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
  // 內容區
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  // 載入中容器
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  // 載入中文字
  loadingText: {
    marginTop: 12,
    color: MibuBrand.copper,
    fontSize: 16,
  },
  // 頂部標題區
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  // 返回按鈕
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MibuBrand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 頁面標題
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.brownDark,
  },
  // 新增按鈕
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  // 新增按鈕文字
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },
  // 區塊標題
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 16,
  },
  // 空狀態卡片
  emptyCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 空狀態文字
  emptyText: {
    fontSize: 16,
    color: MibuBrand.copper,
    marginTop: 12,
  },
  // 產品列表
  productsList: {
    gap: 12,
  },
  // 產品卡片
  productCard: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 產品資訊區
  productInfo: {
    flex: 1,
  },
  // 產品名稱
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  // 產品描述
  productDesc: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 8,
  },
  // 價格列
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // 原價
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  // 優惠價
  discountPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.error,
  },
  // 原價（刪除線）
  originalPrice: {
    fontSize: 14,
    color: MibuBrand.tan,
    textDecorationLine: 'line-through',
  },
  // 狀態標籤
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // 上架中標籤
  activeBadge: {
    backgroundColor: SemanticColors.successLight,
  },
  // 已下架標籤
  inactiveBadge: {
    backgroundColor: MibuBrand.tanLight,
  },
  // 狀態文字
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // 上架中文字
  activeText: {
    color: SemanticColors.successDark,
  },
  // 已下架文字
  inactiveText: {
    color: MibuBrand.copper,
  },
  // 產品操作按鈕區
  productActions: {
    flexDirection: 'column',
    gap: 8,
  },
  // 操作按鈕
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 24,
    paddingBottom: 40,
  },
  // 彈窗標題
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 20,
  },
  // 輸入標籤
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginBottom: 8,
  },
  // 輸入框
  input: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    color: MibuBrand.brownDark,
    marginBottom: 16,
  },
  // 多行輸入框
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // 價格輸入列
  priceInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  // 價格輸入容器
  priceInputContainer: {
    flex: 1,
  },
  // 彈窗底部按鈕區
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  // 取消按鈕
  cancelModalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: MibuBrand.tanLight,
    alignItems: 'center',
  },
  // 取消按鈕文字
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  // 儲存按鈕
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
  },
  // 儲存按鈕文字
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
});
