/**
 * @fileoverview 管理排除名單畫面
 *
 * 功能說明：
 * - 顯示全域排除的景點列表
 * - 新增排除景點（需填寫景點名稱、區域、城市）
 * - 移除排除項目
 * - 支援多國語系（繁中、英文、日文、韓文）
 *
 * 串接的 API：
 * - GET /exclusions - 取得全域排除名單
 * - POST /exclusions - 新增排除項目
 * - DELETE /exclusions/:id - 移除排除項目
 *
 * 權限控制：
 * - 僅限 admin 角色可存取此畫面
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth, useI18n } from '../../../context/AppContext';
import { GlobalExclusion } from '../../../types';
import { apiService } from '../../../services/api';
import { UIColors, MibuBrand } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize, FontWeight, SemanticColors } from '../../../theme/designTokens';

// ============ 主元件 ============

/**
 * 管理排除名單畫面元件
 * 提供全域排除景點的新增與移除功能
 */
export function AdminExclusionsScreen() {
  // ============ Hooks & Context ============
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useI18n();

  // ============ 狀態管理 ============

  /** 全域排除名單 */
  const [exclusions, setExclusions] = useState<GlobalExclusion[]>([]);

  /** 資料載入中狀態 */
  const [loading, setLoading] = useState(true);

  /** 新增排除項目中狀態 */
  const [adding, setAdding] = useState(false);

  /** 是否顯示新增表單 */
  const [showAddForm, setShowAddForm] = useState(false);

  /** 表單欄位：景點名稱 */
  const [placeName, setPlaceName] = useState('');

  /** 表單欄位：區域 */
  const [district, setDistrict] = useState('');

  /** 表單欄位：城市 */
  const [city, setCity] = useState('');

  // ============ 權限檢查 ============

  /** 判斷當前用戶是否為管理員 */
  const isAdmin = user?.role === 'admin';

  /** Token（用於 API 請求） */
  const token = user?.id || '';

  // ============ 多國語系 ============

  /** 翻譯文字對照表（支援繁中、英文、日文、韓文） */
  const translations = {
    'zh-TW': {
      title: '全域排除管理',
      subtitle: '這些地點所有使用者都不會抽到',
      addNew: '新增排除',
      placeName: '地點名稱',
      district: '區域',
      city: '城市',
      add: '新增',
      cancel: '取消',
      remove: '移除',
      empty: '尚無全域排除地點',
      loading: '載入中...',
      confirmRemove: '確認移除',
      confirmRemoveMsg: '確定要移除這個全域排除嗎？',
      noPermission: '您沒有管理權限',
      back: '返回',
    },
    'en': {
      title: 'Global Exclusions',
      subtitle: 'These places are excluded for all users',
      addNew: 'Add Exclusion',
      placeName: 'Place Name',
      district: 'District',
      city: 'City',
      add: 'Add',
      cancel: 'Cancel',
      remove: 'Remove',
      empty: 'No global exclusions yet',
      loading: 'Loading...',
      confirmRemove: 'Confirm Remove',
      confirmRemoveMsg: 'Are you sure you want to remove this exclusion?',
      noPermission: 'You do not have admin permission',
      back: 'Back',
    },
    'ja': {
      title: 'グローバル除外管理',
      subtitle: 'これらの場所はすべてのユーザーに除外されます',
      addNew: '除外を追加',
      placeName: '場所名',
      district: '地区',
      city: '都市',
      add: '追加',
      cancel: 'キャンセル',
      remove: '削除',
      empty: 'グローバル除外はまだありません',
      loading: '読み込み中...',
      confirmRemove: '削除確認',
      confirmRemoveMsg: 'この除外を削除してもよろしいですか？',
      noPermission: '管理者権限がありません',
      back: '戻る',
    },
    'ko': {
      title: '전역 제외 관리',
      subtitle: '이 장소들은 모든 사용자에게 제외됩니다',
      addNew: '제외 추가',
      placeName: '장소명',
      district: '지역',
      city: '도시',
      add: '추가',
      cancel: '취소',
      remove: '삭제',
      empty: '전역 제외가 없습니다',
      loading: '로딩 중...',
      confirmRemove: '삭제 확인',
      confirmRemoveMsg: '이 제외를 삭제하시겠습니까?',
      noPermission: '관리자 권한이 없습니다',
      back: '뒤로',
    },
  };

  /** 根據當前語言取得翻譯文字 */
  const t = translations[language] || translations['zh-TW'];

  // ============ 副作用 ============

  /** 元件掛載時載入排除名單 */
  useEffect(() => {
    loadExclusions();
  }, []);

  // ============ 資料載入函數 ============

  /**
   * 載入全域排除名單
   * 呼叫 API 取得所有排除項目
   */
  const loadExclusions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getGlobalExclusions(token);
      setExclusions(data);
    } catch (error) {
      console.error('Failed to load exclusions:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ CRUD 操作 ============

  /**
   * 處理新增排除項目
   * 驗證必填欄位後呼叫 API 新增
   */
  const handleAdd = async () => {
    // 驗證必填欄位
    if (!placeName.trim() || !city.trim()) {
      Alert.alert('Error', 'Place name and city are required');
      return;
    }

    try {
      setAdding(true);
      // 呼叫 API 新增排除項目
      const newExclusion = await apiService.addGlobalExclusion(token, {
        placeName: placeName.trim(),
        district: district.trim(),
        city: city.trim(),
      });

      // 將新項目加入列表頂部
      setExclusions([newExclusion, ...exclusions]);

      // 重置表單
      setPlaceName('');
      setDistrict('');
      setCity('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add exclusion:', error);
      Alert.alert('Error', 'Failed to add exclusion');
    } finally {
      setAdding(false);
    }
  };

  /**
   * 處理移除排除項目
   * 顯示確認對話框後執行移除
   * @param exclusion - 要移除的排除項目
   */
  const handleRemove = (exclusion: GlobalExclusion) => {
    Alert.alert(t.confirmRemove, t.confirmRemoveMsg, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.remove,
        style: 'destructive',
        onPress: async () => {
          try {
            // 呼叫 API 移除排除項目
            await apiService.removeGlobalExclusion(token, exclusion.id);
            // 從列表中移除該項目
            setExclusions(exclusions.filter(e => e.id !== exclusion.id));
          } catch (error) {
            console.error('Failed to remove exclusion:', error);
            Alert.alert('Error', 'Failed to remove exclusion');
          }
        },
      },
    ]);
  };

  // ============ 權限不足畫面 ============

  /** 非管理員顯示無權限提示 */
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        {/* 頂部標題列 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.title}</Text>
        </View>
        {/* 無權限提示 */}
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={UIColors.textSecondary} />
          <Text style={styles.emptyText}>{t.noPermission}</Text>
        </View>
      </View>
    );
  }

  // ============ 主渲染 ============

  return (
    <View style={styles.container}>
      {/* 頂部標題列 */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
        </TouchableOpacity>
        {/* 標題與副標題 */}
        <View style={styles.headerText}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>
      </View>

      {/* 新增表單區塊 */}
      {showAddForm ? (
        // 顯示新增表單
        <View style={styles.addForm}>
          {/* 景點名稱輸入 */}
          <TextInput
            style={styles.input}
            placeholder={t.placeName}
            value={placeName}
            onChangeText={setPlaceName}
            placeholderTextColor={UIColors.textSecondary}
          />
          {/* 區域輸入 */}
          <TextInput
            style={styles.input}
            placeholder={t.district}
            value={district}
            onChangeText={setDistrict}
            placeholderTextColor={UIColors.textSecondary}
          />
          {/* 城市輸入 */}
          <TextInput
            style={styles.input}
            placeholder={t.city}
            value={city}
            onChangeText={setCity}
            placeholderTextColor={UIColors.textSecondary}
          />
          {/* 表單按鈕 */}
          <View style={styles.formButtons}>
            {/* 取消按鈕 */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>{t.cancel}</Text>
            </TouchableOpacity>
            {/* 新增按鈕 */}
            <TouchableOpacity
              style={[styles.addButton, adding && styles.addButtonDisabled]}
              onPress={handleAdd}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.addButtonText}>{t.add}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // 顯示新增按鈕（虛線邊框樣式）
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={MibuBrand.info} />
          <Text style={styles.addNewButtonText}>{t.addNew}</Text>
        </TouchableOpacity>
      )}

      {/* 排除名單內容區 */}
      {loading ? (
        // 載入中狀態
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MibuBrand.info} />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      ) : exclusions.length === 0 ? (
        // 空狀態
        <View style={styles.emptyContainer}>
          <Ionicons name="ban-outline" size={64} color={UIColors.textSecondary} />
          <Text style={styles.emptyText}>{t.empty}</Text>
        </View>
      ) : (
        // 排除項目列表
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {exclusions.map(exclusion => (
            <View key={exclusion.id} style={styles.exclusionCard}>
              {/* 排除項目資訊 */}
              <View style={styles.exclusionInfo}>
                {/* 景點名稱 */}
                <Text style={styles.exclusionName}>{exclusion.placeName}</Text>
                {/* 地點（區域、城市） */}
                <Text style={styles.exclusionLocation}>
                  {exclusion.district && `${exclusion.district}, `}{exclusion.city}
                </Text>
                {/* 建立日期 */}
                <Text style={styles.exclusionDate}>
                  {new Date(exclusion.createdAt).toLocaleDateString()}
                </Text>
              </View>
              {/* 移除按鈕 */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(exclusion)}
              >
                <Ionicons name="trash-outline" size={20} color={MibuBrand.error} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.creamLight,
  },
  backButton: {
    marginRight: Spacing.lg,
    padding: Spacing.xs,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: FontWeight.extrabold,
    color: MibuBrand.dark,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: UIColors.textSecondary,
    marginTop: Spacing.xs,
  },

  // 新增按鈕樣式（虛線邊框）
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SemanticColors.info.light,
    marginHorizontal: 20,
    marginTop: 20,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: SemanticColors.info.light,
    borderStyle: 'dashed',
  },
  addNewButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: MibuBrand.info,
    marginLeft: Spacing.sm,
  },

  // 新增表單樣式
  addForm: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  input: {
    backgroundColor: MibuBrand.creamLight,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    fontSize: FontSize.lg,
    color: MibuBrand.dark,
    marginBottom: Spacing.md,
  },
  formButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: UIColors.textSecondary,
  },
  addButton: {
    flex: 1,
    backgroundColor: MibuBrand.info,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: '#ffffff',
  },

  // 載入中樣式
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FontSize.lg,
    color: UIColors.textSecondary,
    marginTop: Spacing.md,
  },

  // 空狀態樣式
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: UIColors.textSecondary,
    marginTop: Spacing.lg,
  },

  // 列表樣式
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // 排除項目卡片樣式
  exclusionCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fecaca',  // 紅色邊框表示排除
  },
  exclusionInfo: {
    flex: 1,
  },
  exclusionName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: MibuBrand.dark,
    marginBottom: Spacing.xs,
  },
  exclusionLocation: {
    fontSize: FontSize.md,
    color: UIColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  exclusionDate: {
    fontSize: FontSize.sm,
    color: UIColors.textSecondary,
  },

  // 移除按鈕樣式
  removeButton: {
    width: 44,
    height: 44,
    backgroundColor: SemanticColors.error.light,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
