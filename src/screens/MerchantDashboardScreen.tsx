import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { MerchantDailyCode, MerchantCredits } from '../types';

export function MerchantDashboardScreen() {
  const { state, getToken } = useApp();
  const [dailyCode, setDailyCode] = useState<MerchantDailyCode | null>(null);
  const [credits, setCredits] = useState<MerchantCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '商家後台' : 'Merchant Dashboard',
    dailyCode: isZh ? '今日核銷碼' : "Today's Verification Code",
    expiresAt: isZh ? '有效期至' : 'Valid until',
    credits: isZh ? '點數餘額' : 'Credit Balance',
    points: isZh ? '點' : 'pts',
    topUp: isZh ? '儲值' : 'Top Up',
    useStripe: isZh ? '使用 Stripe 付款' : 'Pay with Stripe',
    useRecur: isZh ? '使用 Recur 付款' : 'Pay with Recur',
    purchaseAmount: isZh ? '購買點數' : 'Purchase Credits',
    min100: isZh ? '最低 100 點' : 'Minimum 100 points',
    loading: isZh ? '載入中...' : 'Loading...',
    error: isZh ? '載入失敗' : 'Failed to load',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const [codeData, creditsData] = await Promise.all([
        apiService.getMerchantDailyCode(token).catch(() => null),
        apiService.getMerchantCredits(token).catch(() => null),
      ]);

      setDailyCode(codeData);
      setCredits(creditsData);
    } catch (error) {
      console.error('Failed to load merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (provider: 'stripe' | 'recur', amount: number) => {
    try {
      setPurchasing(true);
      const token = await getToken();
      if (!token) return;

      const response = await apiService.purchaseCredits(token, amount, provider);
      
      if (response.checkoutUrl) {
        await Linking.openURL(response.checkoutUrl);
      } else {
        Alert.alert(
          isZh ? '成功' : 'Success',
          response.message || (isZh ? '交易已建立' : 'Transaction created')
        );
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '購買失敗' : 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const formatExpiry = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(isZh ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{translations.title}</Text>

      <View style={styles.codeCard}>
        <Text style={styles.cardLabel}>{translations.dailyCode}</Text>
        {dailyCode ? (
          <>
            <Text style={styles.codeText}>{dailyCode.code}</Text>
            <Text style={styles.expiryText}>
              {translations.expiresAt}: {formatExpiry(dailyCode.expiresAt)}
            </Text>
          </>
        ) : (
          <Text style={styles.errorText}>{translations.error}</Text>
        )}
      </View>

      <View style={styles.creditsCard}>
        <View style={styles.creditsHeader}>
          <Ionicons name="wallet-outline" size={24} color="#6366f1" />
          <Text style={styles.cardLabel}>{translations.credits}</Text>
        </View>
        <Text style={styles.creditsAmount}>
          {credits?.creditBalance ?? 0}
          <Text style={styles.creditsUnit}> {translations.points}</Text>
        </Text>
      </View>

      <View style={styles.topUpSection}>
        <Text style={styles.sectionTitle}>{translations.topUp}</Text>
        <Text style={styles.sectionSubtitle}>{translations.min100}</Text>

        <View style={styles.amountButtons}>
          {[100, 500, 1000].map(amount => (
            <TouchableOpacity
              key={amount}
              style={styles.amountButton}
              onPress={() => handlePurchase('stripe', amount)}
              disabled={purchasing}
            >
              <Text style={styles.amountButtonText}>{amount} {translations.points}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.paymentButtons}>
          <TouchableOpacity
            style={[styles.paymentButton, styles.stripeButton]}
            onPress={() => handlePurchase('stripe', 500)}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="card-outline" size={20} color="#ffffff" />
                <Text style={styles.paymentButtonText}>{translations.useStripe}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentButton, styles.recurButton]}
            onPress={() => handlePurchase('recur', 500)}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="repeat-outline" size={20} color="#ffffff" />
                <Text style={styles.paymentButtonText}>{translations.useRecur}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 24,
  },
  codeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#6366f1',
    letterSpacing: 8,
    marginBottom: 8,
  },
  expiryText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  creditsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  creditsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  creditsAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1e293b',
  },
  creditsUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  topUpSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  amountButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  amountButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  amountButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  paymentButtons: {
    gap: 12,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  stripeButton: {
    backgroundColor: '#6366f1',
  },
  recurButton: {
    backgroundColor: '#10b981',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
