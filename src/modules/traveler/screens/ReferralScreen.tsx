/**
 * ReferralScreen - 推薦系統畫面
 * 顯示推薦碼、推薦列表、餘額與提領
 *
 * @see 後端合約: contracts/APP.md Phase 5
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../../../context/AppContext';
import { referralApi } from '../../../services/referralApi';
import { MibuBrand } from '../../../../constants/Colors';
import {
  ReferralCode,
  Referral,
  ReferralBalance,
  ReferralTransaction,
} from '../../../types/referral';

type TabType = 'code' | 'referrals' | 'balance';

export function ReferralScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('code');

  // Code tab state
  const [myCode, setMyCode] = useState<ReferralCode | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Referrals tab state
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralStats, setReferralStats] = useState({ totalReferrals: 0, activeReferrals: 0, totalRewardEarned: 0 });

  // Balance tab state
  const [balance, setBalance] = useState<ReferralBalance | null>(null);
  const [transactions, setTransactions] = useState<ReferralTransaction[]>([]);

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      if (activeTab === 'code') {
        const codeData = await referralApi.getMyCode(token);
        setMyCode(codeData);
      } else if (activeTab === 'referrals') {
        const data = await referralApi.getMyReferrals(token);
        setReferrals(data.referrals);
        setReferralStats(data.stats);
      } else if (activeTab === 'balance') {
        const [balanceData, txData] = await Promise.all([
          referralApi.getBalance(token),
          referralApi.getTransactions(token, { limit: 20 }),
        ]);
        setBalance(balanceData);
        setTransactions(txData.transactions);
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router, activeTab]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleGenerateCode = async () => {
    if (generatingCode) return;
    setGeneratingCode(true);

    try {
      const token = await getToken();
      if (!token) return;

      const result = await referralApi.generateCode(token);
      if (result.success) {
        setMyCode({
          code: result.code,
          createdAt: new Date().toISOString(),
          usageCount: 0,
          maxUsage: null,
          isActive: true,
        });
        Alert.alert(
          isZh ? '生成成功' : 'Code Generated',
          isZh ? `您的推薦碼是：${result.code}` : `Your referral code is: ${result.code}`
        );
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
      Alert.alert(
        isZh ? '錯誤' : 'Error',
        isZh ? '無法生成推薦碼' : 'Failed to generate code'
      );
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (!myCode) return;
    await Clipboard.setStringAsync(myCode.code);
    Alert.alert(isZh ? '已複製' : 'Copied', isZh ? '推薦碼已複製到剪貼簿' : 'Code copied to clipboard');
  };

  const handleShareCode = async () => {
    if (!myCode) return;
    try {
      await Share.share({
        message: isZh
          ? `使用我的推薦碼 ${myCode.code} 加入 Mibu，一起探索旅遊新體驗！`
          : `Use my referral code ${myCode.code} to join Mibu and discover new travel experiences!`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleApplyCode = async () => {
    if (!inputCode.trim()) {
      Alert.alert(
        isZh ? '請輸入推薦碼' : 'Enter Code',
        isZh ? '請輸入有效的推薦碼' : 'Please enter a valid referral code'
      );
      return;
    }

    setApplyingCode(true);
    try {
      const token = await getToken();
      if (!token) return;

      // First validate
      const validation = await referralApi.validateCode(token, inputCode.trim());
      if (!validation.valid) {
        Alert.alert(
          isZh ? '無效的推薦碼' : 'Invalid Code',
          validation.message || (isZh ? '此推薦碼無效' : 'This code is not valid')
        );
        return;
      }

      // Then apply
      const result = await referralApi.applyCode(token, { code: inputCode.trim() });
      if (result.success) {
        setInputCode('');
        Alert.alert(
          isZh ? '套用成功' : 'Success!',
          isZh
            ? `已成功使用推薦碼！獲得 ${result.expEarned} 經驗值`
            : `Referral code applied! You earned ${result.expEarned} XP`
        );
      } else {
        Alert.alert(
          isZh ? '套用失敗' : 'Failed',
          result.message || (isZh ? '無法套用推薦碼' : 'Failed to apply code')
        );
      }
    } catch (error: any) {
      console.error('Apply code failed:', error);
      Alert.alert(
        isZh ? '錯誤' : 'Error',
        error.message || (isZh ? '無法套用推薦碼' : 'Failed to apply code')
      );
    } finally {
      setApplyingCode(false);
    }
  };

  const formatCurrency = (amount: number) => `NT$ ${amount.toLocaleString()}`;

  const renderCodeTab = () => (
    <View style={styles.tabContent}>
      {/* My Referral Code */}
      <View style={styles.codeCard}>
        <Text style={styles.cardTitle}>
          {isZh ? '我的推薦碼' : 'My Referral Code'}
        </Text>
        {myCode ? (
          <>
            <View style={styles.codeDisplay}>
              <Text style={styles.codeText}>{myCode.code}</Text>
            </View>
            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.codeActionBtn} onPress={handleCopyCode}>
                <Ionicons name="copy" size={18} color={MibuBrand.brown} />
                <Text style={styles.codeActionText}>{isZh ? '複製' : 'Copy'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.codeActionBtn} onPress={handleShareCode}>
                <Ionicons name="share-social" size={18} color={MibuBrand.brown} />
                <Text style={styles.codeActionText}>{isZh ? '分享' : 'Share'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.codeStats}>
              {isZh ? `已使用 ${myCode.usageCount} 次` : `Used ${myCode.usageCount} times`}
            </Text>
          </>
        ) : (
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={handleGenerateCode}
            disabled={generatingCode}
          >
            {generatingCode ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#ffffff" />
                <Text style={styles.generateBtnText}>
                  {isZh ? '生成推薦碼' : 'Generate Code'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Apply Code */}
      <View style={styles.applyCard}>
        <Text style={styles.cardTitle}>
          {isZh ? '輸入推薦碼' : 'Enter Referral Code'}
        </Text>
        <Text style={styles.applyDesc}>
          {isZh ? '使用朋友的推薦碼可獲得獎勵' : 'Use a friend\'s code to earn rewards'}
        </Text>
        <View style={styles.applyInputRow}>
          <TextInput
            style={styles.applyInput}
            value={inputCode}
            onChangeText={setInputCode}
            placeholder={isZh ? '輸入推薦碼' : 'Enter code'}
            placeholderTextColor={MibuBrand.tan}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.applyBtn, !inputCode.trim() && styles.applyBtnDisabled]}
            onPress={handleApplyCode}
            disabled={applyingCode || !inputCode.trim()}
          >
            {applyingCode ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.applyBtnText}>{isZh ? '套用' : 'Apply'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderReferralsTab = () => (
    <View style={styles.tabContent}>
      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{referralStats.totalReferrals}</Text>
          <Text style={styles.statLabel}>{isZh ? '總推薦' : 'Total'}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{referralStats.activeReferrals}</Text>
          <Text style={styles.statLabel}>{isZh ? '活躍' : 'Active'}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{formatCurrency(referralStats.totalRewardEarned)}</Text>
          <Text style={styles.statLabel}>{isZh ? '累計獎勵' : 'Earned'}</Text>
        </View>
      </View>

      {/* Referrals List */}
      {referrals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={MibuBrand.tan} />
          <Text style={styles.emptyText}>
            {isZh ? '尚無推薦好友' : 'No referrals yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {isZh ? '分享您的推薦碼邀請朋友加入' : 'Share your code to invite friends'}
          </Text>
        </View>
      ) : (
        <View style={styles.referralsList}>
          {referrals.map(referral => (
            <View key={referral.id} style={styles.referralCard}>
              <View style={styles.referralAvatar}>
                <Text style={styles.referralAvatarText}>
                  {referral.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.referralInfo}>
                <Text style={styles.referralName}>{referral.userName}</Text>
                <Text style={styles.referralMeta}>
                  Lv.{referral.level} • {new Date(referral.joinedAt).toLocaleDateString(isZh ? 'zh-TW' : 'en-US')}
                </Text>
              </View>
              <View style={styles.referralReward}>
                <Text style={styles.referralRewardAmount}>
                  +{formatCurrency(referral.rewardEarned)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderBalanceTab = () => (
    <View style={styles.tabContent}>
      {/* Balance Card */}
      {balance && (
        <View style={styles.balanceCard}>
          <View style={styles.balanceMain}>
            <Text style={styles.balanceLabel}>{isZh ? '可提領餘額' : 'Available'}</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance.available)}</Text>
          </View>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetail}>
              <Text style={styles.balanceDetailLabel}>{isZh ? '待確認' : 'Pending'}</Text>
              <Text style={styles.balanceDetailValue}>{formatCurrency(balance.pending)}</Text>
            </View>
            <View style={styles.balanceDetail}>
              <Text style={styles.balanceDetailLabel}>{isZh ? '累計收入' : 'Total Earned'}</Text>
              <Text style={styles.balanceDetailValue}>{formatCurrency(balance.totalEarned)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.withdrawBtn, balance.available <= 0 && styles.withdrawBtnDisabled]}
            disabled={balance.available <= 0}
            onPress={() => Alert.alert(isZh ? '功能開發中' : 'Coming Soon', isZh ? '提領功能即將推出' : 'Withdrawal feature coming soon')}
          >
            <Text style={styles.withdrawBtnText}>{isZh ? '申請提領' : 'Withdraw'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Transactions */}
      <Text style={styles.sectionTitle}>{isZh ? '交易記錄' : 'Transactions'}</Text>
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={48} color={MibuBrand.tan} />
          <Text style={styles.emptyText}>{isZh ? '尚無交易記錄' : 'No transactions'}</Text>
        </View>
      ) : (
        <View style={styles.transactionsList}>
          {transactions.map(tx => (
            <View key={tx.id} style={styles.transactionCard}>
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={tx.type === 'withdrawal' ? 'arrow-up' : 'arrow-down'}
                  size={20}
                  color={tx.type === 'withdrawal' ? MibuBrand.error : MibuBrand.success}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDesc}>{tx.description}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(tx.createdAt).toLocaleDateString(isZh ? 'zh-TW' : 'en-US')}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                tx.type === 'withdrawal' ? styles.transactionNegative : styles.transactionPositive
              ]}>
                {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isZh ? '推薦好友' : 'Referrals'}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(['code', 'referrals', 'balance'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'code' && (isZh ? '推薦碼' : 'Code')}
              {tab === 'referrals' && (isZh ? '好友' : 'Friends')}
              {tab === 'balance' && (isZh ? '餘額' : 'Balance')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={MibuBrand.brown}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'code' && renderCodeTab()}
        {activeTab === 'referrals' && renderReferralsTab()}
        {activeTab === 'balance' && renderBalanceTab()}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: MibuBrand.warmWhite,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: MibuBrand.creamLight,
  },
  tabActive: {
    backgroundColor: MibuBrand.brown,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  tabContent: {
    gap: 16,
  },
  codeCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.copper,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  codeDisplay: {
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '900',
    color: MibuBrand.brown,
    letterSpacing: 4,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  codeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: MibuBrand.creamLight,
  },
  codeActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  codeStats: {
    fontSize: 13,
    color: MibuBrand.tan,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  applyCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  applyDesc: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 16,
  },
  applyInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  applyInput: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    letterSpacing: 2,
  },
  applyBtn: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: MibuBrand.tan,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: MibuBrand.copper,
  },
  referralsList: {
    gap: 12,
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: MibuBrand.tanLight,
    gap: 12,
  },
  referralAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MibuBrand.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  referralAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  referralMeta: {
    fontSize: 12,
    color: MibuBrand.copper,
  },
  referralReward: {
    alignItems: 'flex-end',
  },
  referralRewardAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.success,
  },
  balanceCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  balanceMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: MibuBrand.brownDark,
  },
  balanceDetails: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  balanceDetail: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDetailLabel: {
    fontSize: 12,
    color: MibuBrand.tan,
    marginBottom: 2,
  },
  balanceDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  withdrawBtn: {
    backgroundColor: MibuBrand.brown,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawBtnDisabled: {
    backgroundColor: MibuBrand.tan,
  },
  withdrawBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.copper,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  transactionsList: {
    gap: 10,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    gap: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MibuBrand.creamLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: MibuBrand.tan,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  transactionPositive: {
    color: MibuBrand.success,
  },
  transactionNegative: {
    color: MibuBrand.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: MibuBrand.tan,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: MibuBrand.tan,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 100,
  },
});
