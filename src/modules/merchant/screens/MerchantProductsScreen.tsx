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
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { MerchantProduct } from '../types';

export function MerchantProductsScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MerchantProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
  });

  const isZh = state.language === 'zh-TW';

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

  useEffect(() => {
    loadProducts();
  }, []);

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

  const openModal = (product?: MerchantProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price?.toString() || '',
        discountPrice: product.discountPrice?.toString() || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', discountPrice: '' });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    try {
      setSaving(true);
      const token = await getToken();
      if (!token) return;

      const params = {
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
      };

      if (editingProduct) {
        await apiService.updateMerchantProduct(token, editingProduct.id, params);
      } else {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.title}>{translations.title}</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>{translations.addNew}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{translations.myProducts}</Text>

        {products.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="cube-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>{translations.noProducts}</Text>
          </View>
        ) : (
          <View style={styles.productsList}>
            {products.map(product => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  {product.description && (
                    <Text style={styles.productDesc} numberOfLines={2}>
                      {product.description}
                    </Text>
                  )}
                  <View style={styles.priceRow}>
                    {product.discountPrice ? (
                      <>
                        <Text style={styles.discountPrice}>
                          ${product.discountPrice}
                        </Text>
                        <Text style={styles.originalPrice}>
                          ${product.price}
                        </Text>
                      </>
                    ) : product.price ? (
                      <Text style={styles.price}>${product.price}</Text>
                    ) : null}
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
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openModal(product)}
                  >
                    <Ionicons name="pencil-outline" size={20} color="#6366f1" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(product)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? translations.edit : translations.addNew}
            </Text>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>{translations.name}</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                placeholder={translations.name}
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.inputLabel}>{translations.description}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={text => setFormData({ ...formData, description: text })}
                placeholder={translations.description}
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
              />

              <View style={styles.priceInputRow}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.inputLabel}>{translations.price}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.price}
                    onChangeText={text => setFormData({ ...formData, price: text })}
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
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
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

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
                  <ActivityIndicator size="small" color="#ffffff" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  productsList: {
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  originalPrice: {
    fontSize: 14,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  inactiveBadge: {
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeText: {
    color: '#16a34a',
  },
  inactiveText: {
    color: '#64748b',
  },
  productActions: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    color: '#1e293b',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priceInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
