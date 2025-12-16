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
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { MerchantTransaction } from '../types';

export function MerchantTransactionsScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const [transactions, setTransactions] = useState<MerchantTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '交易記錄' : 'Transaction History',
    noTransactions: isZh ? '暫無交易記錄' : 'No transactions yet',
    loading: isZh ? '載入中...' : 'Loading...',
    purchase: isZh ? '購買點數' : 'Purchase',
    usage: isZh ? '使用點數' : 'Usage',
    refund: isZh ? '退款' : 'Refund',
    back: isZh ? '返回' : 'Back',
  };

  useEffect(() => {
    loadTransactions();
  }, []);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase': return translations.purchase;
      case 'usage': return translations.usage;
      case 'refund': return translations.refund;
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return '#22c55e';
      case 'usage': return '#ef4444';
      case 'refund': return '#f59e0b';
      default: return '#64748b';
    }
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>{translations.noTransactions}</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map(tx => (
              <View key={tx.id} style={styles.transactionCard}>
                <View style={styles.transactionIcon}>
                  <Ionicons
                    name={tx.type === 'purchase' ? 'add-circle' : tx.type === 'refund' ? 'refresh-circle' : 'remove-circle'}
                    size={32}
                    color={getTypeColor(tx.type)}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>{getTypeLabel(tx.type)}</Text>
                  <Text style={styles.transactionDate}>{formatDate(tx.createdAt)}</Text>
                  {tx.description && (
                    <Text style={styles.transactionDesc}>{tx.description}</Text>
                  )}
                </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
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
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
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
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#64748b',
  },
  transactionDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
});
