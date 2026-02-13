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
import React from 'react';
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
import { useI18n } from '../../../context/I18nContext';
import { useMerchantTransactions } from '../../../hooks/useMerchantQueries';
import { LOCALE_MAP } from '../../../utils/i18n';
import { MerchantTransaction } from '../../../types';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

// ============ 主元件 ============
export function MerchantTransactionsScreen() {
  // ============ Hooks ============
  const { t, language } = useI18n();
  const router = useRouter();

  // ============ React Query：交易紀錄 ============
  const {
    data: transactionsData,
    isLoading,
    isRefetching,
    refetch,
  } = useMerchantTransactions();

  // 從 API 回傳取出交易列表，預設空陣列
  const transactions: MerchantTransaction[] = transactionsData?.transactions ?? [];

  // ============ 工具函數 ============

  /**
   * formatDate - 格式化日期時間
   * @param dateStr - ISO 日期字串
   * @returns 格式化後的日期時間字串
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(LOCALE_MAP[language], {
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
      case 'purchase': return t.merchant_purchase;
      case 'usage': return t.merchant_usage;
      case 'refund': return t.merchant_refund;
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
      case 'purchase': return SemanticColors.successDark; // 綠色：購買
      case 'usage': return SemanticColors.errorDark;    // 紅色：使用
      case 'refund': return '#f59e0b';   // 橘色：退款
      default: return UIColors.textSecondary;
    }
  };

  // ============ 載入中畫面 ============
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  // ============ 主要 JSX 渲染 ============
  return (
    <View style={styles.container}>
      {/* ============ 頂部標題區 ============ */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="返回">
          <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.merchant_transactionHistory}</Text>
      </View>

      {/* ============ 主要內容區 ============ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      >
        {/* 空狀態或交易列表 */}
        {transactions.length === 0 ? (
          // 空狀態
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={48} color={UIColors.textSecondary} />
            <Text style={styles.emptyText}>{t.merchant_noTransactions}</Text>
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
    backgroundColor: MibuBrand.warmWhite,
  },
  // 頂部標題區
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: UIColors.white,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  // 返回按鈕
  backButton: {
    marginRight: 16,
  },
  // 頁面標題
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.dark,
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
    color: UIColors.textSecondary,
    fontSize: 16,
  },
  // 空狀態卡片
  emptyCard: {
    backgroundColor: UIColors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 空狀態文字
  emptyText: {
    fontSize: 16,
    color: UIColors.textSecondary,
    marginTop: 12,
  },
  // 交易列表
  transactionsList: {
    gap: 12,
  },
  // 交易卡片
  transactionCard: {
    backgroundColor: UIColors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
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
    color: MibuBrand.dark,
    marginBottom: 4,
  },
  // 交易日期
  transactionDate: {
    fontSize: 13,
    color: UIColors.textSecondary,
  },
  // 交易說明
  transactionDesc: {
    fontSize: 12,
    color: UIColors.textSecondary,
    marginTop: 4,
  },
  // 交易金額
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
});
