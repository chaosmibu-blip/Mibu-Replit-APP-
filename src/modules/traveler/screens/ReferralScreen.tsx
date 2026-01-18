/**
 * ReferralScreen - 邀請好友
 * 推薦碼分享、獎勵說明、好友列表
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
} from '../../../types/referral';

// 獎勵等級設定
interface RewardTier {
  count: number;
  reward: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const REWARD_TIERS: RewardTier[] = [
  { count: 1, reward: '50 XP', icon: 'star', color: '#D97706' },
  { count: 3, reward: '200 XP', icon: 'star', color: '#6366f1' },
  { count: 5, reward: '免費扭蛋券 x3', icon: 'ticket', color: '#059669' },
  { count: 10, reward: 'NT$ 100 現金回饋', icon: 'cash', color: '#DC2626' },
];

// 排行榜用戶資料
interface LeaderboardUser {
  rank: number;
  name: string;
  inviteCount: number;
  isCurrentUser?: boolean;
}

// 模擬本週排行榜資料（未來可接 API）
const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: '旅遊達人小明', inviteCount: 23 },
  { rank: 2, name: 'Adventure王', inviteCount: 18 },
  { rank: 3, name: '背包客阿花', inviteCount: 15 },
  { rank: 4, name: '環遊世界小美', inviteCount: 12 },
  { rank: 5, name: '探險家Jason', inviteCount: 9 },
];

export function ReferralScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State
  const [myCode, setMyCode] = useState<ReferralCode | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalRewardEarned: 0
  });
  const [balance, setBalance] = useState<ReferralBalance | null>(null);

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      // 載入所有資料
      const [codeData, referralsData, balanceData] = await Promise.all([
        referralApi.getMyCode(token).catch(() => null),
        referralApi.getMyReferrals(token).catch(() => ({ referrals: [], stats: { totalReferrals: 0, activeReferrals: 0, totalRewardEarned: 0 } })),
        referralApi.getBalance(token).catch(() => null),
      ]);

      if (codeData) setMyCode(codeData);
      setReferrals(referralsData.referrals);
      setReferralStats(referralsData.stats);
      if (balanceData) setBalance(balanceData);

    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router]);

  useEffect(() => {
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
    Alert.alert(
      isZh ? '已複製!' : 'Copied!',
      isZh ? '推薦碼已複製到剪貼簿' : 'Code copied to clipboard'
    );
  };

  const handleShareCode = async () => {
    if (!myCode) return;
    try {
      await Share.share({
        message: isZh
          ? `用我的推薦碼 ${myCode.code} 加入 Mibu，一起探索旅遊新體驗！下載 APP: https://mibu.app`
          : `Use my code ${myCode.code} to join Mibu and discover new travel experiences! Download: https://mibu.app`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleApplyCode = async () => {
    if (!inputCode.trim()) return;

    setApplyingCode(true);
    try {
      const token = await getToken();
      if (!token) return;

      const validation = await referralApi.validateCode(token, inputCode.trim());
      if (!validation.valid) {
        Alert.alert(
          isZh ? '無效的推薦碼' : 'Invalid Code',
          validation.message || (isZh ? '此推薦碼無效' : 'This code is not valid')
        );
        return;
      }

      const result = await referralApi.applyCode(token, { code: inputCode.trim() });
      if (result.success) {
        setInputCode('');
        Alert.alert(
          isZh ? '套用成功!' : 'Success!',
          isZh
            ? `已成功使用推薦碼！獲得 ${result.expEarned} 經驗值`
            : `Referral code applied! You earned ${result.expEarned} XP`
        );
        loadData();
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

  // 計算當前獎勵進度
  const getNextRewardTier = () => {
    const count = referralStats.totalReferrals;
    for (const tier of REWARD_TIERS) {
      if (count < tier.count) return tier;
    }
    return null;
  };

  const nextTier = getNextRewardTier();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="people" size={24} color={MibuBrand.brownDark} />
          <Text style={styles.headerTitle}>
            {isZh ? '邀請好友' : 'Invite Friends'}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
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
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrapper}>
            <Ionicons name="gift" size={48} color={MibuBrand.brown} />
          </View>
          <Text style={styles.heroTitle}>
            {isZh ? '邀請好友，一起賺獎勵！' : 'Invite & Earn Together!'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {isZh
              ? '每邀請一位好友成功註冊，你們都能獲得豐富獎勵'
              : 'Both you and your friend earn rewards when they sign up'}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{referralStats.totalReferrals}</Text>
            <Text style={styles.statLabel}>{isZh ? '已邀請' : 'Invited'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#059669' }]}>
              {referralStats.activeReferrals}
            </Text>
            <Text style={styles.statLabel}>{isZh ? '活躍好友' : 'Active'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#6366f1' }]}>
              {balance?.totalEarned || 0}
            </Text>
            <Text style={styles.statLabel}>{isZh ? '累計 XP' : 'Total XP'}</Text>
          </View>
        </View>

        {/* Weekly Leaderboard */}
        <View style={styles.section}>
          <View style={styles.leaderboardHeader}>
            <Ionicons name="trophy" size={20} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {isZh ? '本週邀請排行榜' : 'Weekly Invite Leaders'}
            </Text>
          </View>
          <View style={styles.leaderboardCard}>
            {MOCK_LEADERBOARD.map((user, index) => {
              // 前三名的徽章顏色
              const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // 金銀銅
              const isTopThree = user.rank <= 3;

              return (
                <View
                  key={user.rank}
                  style={[
                    styles.leaderboardItem,
                    index < MOCK_LEADERBOARD.length - 1 && styles.leaderboardItemBorder,
                    user.isCurrentUser && styles.leaderboardItemHighlight,
                  ]}
                >
                  {/* 排名 */}
                  <View
                    style={[
                      styles.rankBadge,
                      isTopThree && { backgroundColor: rankColors[user.rank - 1] },
                    ]}
                  >
                    {isTopThree ? (
                      <Ionicons name="medal" size={16} color="#fff" />
                    ) : (
                      <Text style={styles.rankText}>{user.rank}</Text>
                    )}
                  </View>

                  {/* 頭像 */}
                  <View
                    style={[
                      styles.leaderboardAvatar,
                      isTopThree && { borderColor: rankColors[user.rank - 1], borderWidth: 2 },
                    ]}
                  >
                    <Text style={styles.leaderboardAvatarText}>
                      {user.name.charAt(0)}
                    </Text>
                  </View>

                  {/* 名稱 */}
                  <Text
                    style={[
                      styles.leaderboardName,
                      user.isCurrentUser && styles.leaderboardNameHighlight,
                    ]}
                    numberOfLines={1}
                  >
                    {user.name}
                  </Text>

                  {/* 邀請數 */}
                  <View style={styles.inviteCountBadge}>
                    <Ionicons name="person-add" size={12} color={MibuBrand.brown} />
                    <Text style={styles.inviteCountText}>{user.inviteCount}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* My Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isZh ? '我的推薦碼' : 'My Referral Code'}
          </Text>

          {myCode ? (
            <View style={styles.codeCard}>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeText}>{myCode.code}</Text>
              </View>
              <View style={styles.codeActions}>
                <TouchableOpacity
                  style={styles.codeActionBtn}
                  onPress={handleCopyCode}
                >
                  <Ionicons name="copy-outline" size={20} color={MibuBrand.brown} />
                  <Text style={styles.codeActionText}>
                    {isZh ? '複製' : 'Copy'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.codeActionBtn, styles.shareBtn]}
                  onPress={handleShareCode}
                >
                  <Ionicons name="share-social" size={20} color="#fff" />
                  <Text style={[styles.codeActionText, { color: '#fff' }]}>
                    {isZh ? '分享給好友' : 'Share'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.codeUsage}>
                {isZh
                  ? `已有 ${myCode.usageCount} 位好友使用`
                  : `${myCode.usageCount} friends used this code`}
              </Text>
            </View>
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
                    {isZh ? '生成我的推薦碼' : 'Generate My Code'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Apply Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isZh ? '輸入好友推薦碼' : 'Enter Friend\'s Code'}
          </Text>
          <View style={styles.applyCard}>
            <View style={styles.applyInputRow}>
              <TextInput
                style={styles.applyInput}
                value={inputCode}
                onChangeText={setInputCode}
                placeholder={isZh ? '輸入推薦碼' : 'Enter code'}
                placeholderTextColor={MibuBrand.tan}
                autoCapitalize="characters"
                maxLength={8}
              />
              <TouchableOpacity
                style={[
                  styles.applyBtn,
                  !inputCode.trim() && styles.applyBtnDisabled
                ]}
                onPress={handleApplyCode}
                disabled={applyingCode || !inputCode.trim()}
              >
                {applyingCode ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="checkmark" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Rewards Tiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isZh ? '邀請獎勵' : 'Invite Rewards'}
          </Text>
          <View style={styles.rewardsList}>
            {REWARD_TIERS.map((tier, index) => {
              const isAchieved = referralStats.totalReferrals >= tier.count;
              const isNext = nextTier?.count === tier.count;

              return (
                <View
                  key={index}
                  style={[
                    styles.rewardItem,
                    isAchieved && styles.rewardItemAchieved,
                    isNext && styles.rewardItemNext,
                  ]}
                >
                  <View style={[styles.rewardIcon, { backgroundColor: tier.color + '20' }]}>
                    <Ionicons
                      name={isAchieved ? 'checkmark-circle' : tier.icon}
                      size={20}
                      color={isAchieved ? '#059669' : tier.color}
                    />
                  </View>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardCount}>
                      {isZh ? `邀請 ${tier.count} 位好友` : `Invite ${tier.count} friends`}
                    </Text>
                    <Text style={[styles.rewardValue, isAchieved && styles.rewardValueAchieved]}>
                      {tier.reward}
                    </Text>
                  </View>
                  {isAchieved && (
                    <View style={styles.achievedBadge}>
                      <Text style={styles.achievedText}>
                        {isZh ? '已達成' : 'Done'}
                      </Text>
                    </View>
                  )}
                  {isNext && (
                    <View style={styles.nextBadge}>
                      <Text style={styles.nextText}>
                        {isZh ? `還差 ${tier.count - referralStats.totalReferrals} 位` : `${tier.count - referralStats.totalReferrals} more`}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Referrals */}
        {referrals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isZh ? '邀請紀錄' : 'Invite History'}
            </Text>
            <View style={styles.referralsList}>
              {referrals.slice(0, 5).map(referral => (
                <View key={referral.id} style={styles.referralItem}>
                  <View style={styles.referralAvatar}>
                    <Text style={styles.referralAvatarText}>
                      {referral.userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.referralInfo}>
                    <Text style={styles.referralName}>{referral.userName}</Text>
                    <Text style={styles.referralDate}>
                      {new Date(referral.joinedAt).toLocaleDateString(isZh ? 'zh-TW' : 'en-US')}
                    </Text>
                  </View>
                  <View style={styles.referralReward}>
                    <Text style={styles.referralXp}>+{referral.rewardEarned} XP</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    marginBottom: 16,
  },
  heroIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MibuBrand.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: MibuBrand.copper,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: MibuBrand.copper,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: MibuBrand.tanLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 12,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  leaderboardCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    overflow: 'hidden',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  leaderboardItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  leaderboardItemHighlight: {
    backgroundColor: MibuBrand.highlight,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MibuBrand.creamLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
    color: MibuBrand.copper,
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MibuBrand.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  leaderboardAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  leaderboardNameHighlight: {
    color: MibuBrand.brown,
    fontWeight: '700',
  },
  inviteCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  inviteCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  codeCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
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
    gap: 12,
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
  shareBtn: {
    backgroundColor: MibuBrand.brown,
  },
  codeActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  codeUsage: {
    fontSize: 13,
    color: MibuBrand.tan,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  applyCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
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
    fontSize: 18,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    letterSpacing: 2,
    textAlign: 'center',
  },
  applyBtn: {
    backgroundColor: MibuBrand.brown,
    width: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: MibuBrand.tan,
  },
  rewardsList: {
    gap: 10,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  rewardItemAchieved: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  rewardItemNext: {
    borderWidth: 2,
    borderColor: MibuBrand.brown,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardCount: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 2,
  },
  rewardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  rewardValueAchieved: {
    color: '#059669',
  },
  achievedBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  achievedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  nextBadge: {
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nextText: {
    fontSize: 11,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  referralsList: {
    gap: 8,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MibuBrand.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  referralAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  referralDate: {
    fontSize: 12,
    color: MibuBrand.tan,
  },
  referralReward: {
    alignItems: 'flex-end',
  },
  referralXp: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  bottomSpacer: {
    height: 100,
  },
});
