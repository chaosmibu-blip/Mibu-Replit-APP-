/**
 * MerchantTransactionsScreen - 交易紀錄
 *
 * 功能說明：
 * - 顯示商家點數交易歷史
 * - 支援下拉刷新
 * - 顯示購買、使用、退款等不同類型的交易
 *
 * 串接的 API：
 * - GET /merchant/transactions - 取得交易紀錄列表
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { MerchantTransaction } from '../../../types';

// ============ 主元件 ============
export function MerchantTransactionsScreen() {
  // ============ Hooks ============
  const { state, getToken } = useApp();
  const router = useRouter();

  // ============ 狀態變數 ============
  // transactions: 交易紀錄列表
  const [transactions, setTransactions] = useState<MerchantTransaction[]>([]);
  // loading: 初始載入狀態
  const [loading, setLoading] = useState(true);
  // refreshing: 下拉刷新狀態
  const [refreshing, setRefreshing] = useState(false);

  // isZh: 判斷是否為中文語系
  const isZh = state.language === 'zh-TW';

  // ============ 多語系翻譯 ============
  const translations = {
    title: isZh ? '交易記錄' : 'Transaction History',
    noTransactions: isZh ? '暫無交易記錄' : 'No transactions yet',
    loading: isZh ? '載入中...' : 'Loading...',
    purchase: isZh ? '購買點數' : 'Purchase',
    usage: isZh ? '使用點數' : 'Usage',
    refund: isZh ? '退款' : 'Refund',
    back: isZh ? '返回' : 'Back',
  };

  // ============ Effect Hooks ============
  // 元件載入時取得交易紀錄
  useEffect(() => {
    loadTransactions();
  }, []);

  // ============ 資料載入函數 ============

  /**
   * loadTransactions - 載入交易紀錄列表
   */
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await apiService.getMerchantTransactions(token);
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ 事件處理函數 ============

  /**
   * handleRefresh - 處理下拉刷新
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  // ============ 工具函數 ============

  /**
   * formatDate - 格式化日期時間
   * @param dateStr - ISO 日期字串
   * @returns 格式化後的日期時間字串
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(isZh ? 'zh-TW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * getTypeLabel - 取得交易類型標籤
   * @param type - 交易類型
   * @returns 交易類型顯示名稱
   */
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase': return translations.purchase;
      case 'usage': return translations.usage;
      case 'refund': return translations.refund;
      default: return type;
    }
  };

  /**
   * getTypeColor - 取得交易類型對應顏色
   * @param type - 交易類型
   * @returns 顏色代碼
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return '#22c55e'; // 綠色：購買
      case 'usage': return '#ef4444';    // 紅色：使用
      case 'refund': return '#f59e0b';   // 橘色：退款
      default: return '#64748b';
    }
  };

  // ============ 載入中畫面 ============
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  // ============ 主要 JSX 渲染 ============
  return (
    <View style={styles.container}>
      {/* ============ 頂部標題區 ============ */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      {/* ============ 主要內容區 ============ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 空狀態或交易列表 */}
        {transactions.length === 0 ? (
          // 空狀態
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>{translations.noTransactions}</Text>
          </View>
        ) : (
          // 交易卡片列表
          <View style={styles.transactionsList}>
            {transactions.map(tx => (
              <View key={tx.id} style={styles.transactionCard}>
                {/* 交易類型圖示 */}
                <View style={styles.transactionIcon}>
                  <Ionicons
                    name={tx.type === 'purchase' ? 'add-circle' : tx.type === 'refund' ? 'refresh-circle' : 'remove-circle'}
                    size={32}
                    color={getTypeColor(tx.type)}
                  />
                </View>
                {/* 交易資訊 */}
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>{getTypeLabel(tx.type)}</Text>
                  <Text style={styles.transactionDate}>{formatDate(tx.createdAt)}</Text>
                  {/* 交易說明（如有） */}
                  {tx.description && (
                    <Text style={styles.transactionDesc}>{tx.description}</Text>
                  )}
                </View>
                {/* 交易金額 */}
                <Text style={[styles.transactionAmount, { color: getTypeColor(tx.type) }]}>
                  {tx.type === 'usage' ? '-' : '+'}{tx.amount}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ============ 樣式定義 ============
const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // 頂部標題區
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  // 返回按鈕
  backButton: {
    marginRight: 16,
  },
  // 頁面標題
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  // 捲動區域
  scrollView: {
    flex: 1,
  },
  // 內容區
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  // 載入中容器
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 載入中文字
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  // 空狀態卡片
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  // 空狀態文字
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  // 交易列表
  transactionsList: {
    gap: 12,
  },
  // 交易卡片
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  // 交易圖示容器
  transactionIcon: {
    marginRight: 12,
  },
  // 交易資訊區
  transactionInfo: {
    flex: 1,
  },
  // 交易類型文字
  transactionType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  // 交易日期
  transactionDate: {
    fontSize: 13,
    color: '#64748b',
  },
  // 交易說明
  transactionDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  // 交易金額
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
});
