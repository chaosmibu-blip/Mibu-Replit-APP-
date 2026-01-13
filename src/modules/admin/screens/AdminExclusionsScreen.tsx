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
import { useApp } from '../../../context/AppContext';
import { GlobalExclusion } from '../../../types';
import { apiService } from '../../../services/api';

export function AdminExclusionsScreen() {
  const router = useRouter();
  const { state } = useApp();
  const [exclusions, setExclusions] = useState<GlobalExclusion[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');

  const isAdmin = state.user?.role === 'admin';
  const token = state.user?.id || '';

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

  const t = translations[state.language] || translations['zh-TW'];

  useEffect(() => {
    loadExclusions();
  }, []);

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

  const handleAdd = async () => {
    if (!placeName.trim() || !city.trim()) {
      Alert.alert('Error', 'Place name and city are required');
      return;
    }

    try {
      setAdding(true);
      const newExclusion = await apiService.addGlobalExclusion(token, {
        placeName: placeName.trim(),
        district: district.trim(),
        city: city.trim(),
      });
      setExclusions([newExclusion, ...exclusions]);
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

  const handleRemove = (exclusion: GlobalExclusion) => {
    Alert.alert(t.confirmRemove, t.confirmRemoveMsg, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.remove,
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.removeGlobalExclusion(token, exclusion.id);
            setExclusions(exclusions.filter(e => e.id !== exclusion.id));
          } catch (error) {
            console.error('Failed to remove exclusion:', error);
            Alert.alert('Error', 'Failed to remove exclusion');
          }
        },
      },
    ]);
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.title}>{t.title}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#94a3b8" />
          <Text style={styles.emptyText}>{t.noPermission}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>
      </View>

      {showAddForm ? (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder={t.placeName}
            value={placeName}
            onChangeText={setPlaceName}
            placeholderTextColor="#94a3b8"
          />
          <TextInput
            style={styles.input}
            placeholder={t.district}
            value={district}
            onChangeText={setDistrict}
            placeholderTextColor="#94a3b8"
          />
          <TextInput
            style={styles.input}
            placeholder={t.city}
            value={city}
            onChangeText={setCity}
            placeholderTextColor="#94a3b8"
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>{t.cancel}</Text>
            </TouchableOpacity>
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
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#6366f1" />
          <Text style={styles.addNewButtonText}>{t.addNew}</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      ) : exclusions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ban-outline" size={64} color="#94a3b8" />
          <Text style={styles.emptyText}>{t.empty}</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {exclusions.map(exclusion => (
            <View key={exclusion.id} style={styles.exclusionCard}>
              <View style={styles.exclusionInfo}>
                <Text style={styles.exclusionName}>{exclusion.placeName}</Text>
                <Text style={styles.exclusionLocation}>
                  {exclusion.district && `${exclusion.district}, `}{exclusion.city}
                </Text>
                <Text style={styles.exclusionDate}>
                  {new Date(exclusion.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(exclusion)}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#c7d2fe',
    borderStyle: 'dashed',
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 8,
  },
  addForm: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  exclusionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  exclusionInfo: {
    flex: 1,
  },
  exclusionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  exclusionLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  exclusionDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  removeButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fef2f2',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
