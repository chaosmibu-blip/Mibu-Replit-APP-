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
  LeaderboardEntry,
  LeaderboardPeriod,
} from '../../../types/referral';

// 獎勵等級設定
interface RewardTier {
  count: number;
  reward: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const REWARD_TIERS: RewardTier[] = [
  { count: 1, reward: '雙方各得 50 XP', icon: 'star', color: '#D97706' },
  { count: 3, reward: '額外獎勵 200 XP', icon: 'star', color: '#6366f1' },
  { count: 5, reward: '免費扭蛋券 x3', icon: 'ticket', color: '#059669' },
  { count: 10, reward: '專屬優惠券禮包', icon: 'gift', color: '#DC2626' },
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; isOnLeaderboard: boolean } | null>(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('weekly');

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      // 載入所有資料
      const [codeData, referralsData, balanceData, leaderboardData, myRankData] = await Promise.all([
        referralApi.getMyCode(token).catch(() => null),
        referralApi.getMyReferrals(token).catch(() => ({ referrals: [], stats: { totalReferrals: 0, activeReferrals: 0, totalRewardEarned: 0 } })),
        referralApi.getBalance(token).catch(() => null),
        referralApi.getLeaderboard(token, { period: leaderboardPeriod }).catch(() => ({ success: false, leaderboard: [], period: 'weekly' as LeaderboardPeriod })),
        referralApi.getMyRank(token).catch(() => null),
      ]);

      // 如果還沒有推薦碼，自動生成一個
      if (codeData) {
        setMyCode(codeData);
      } else {
        // 自動生成推薦碼
        try {
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
        } catch {
          // 靜默處理錯誤
        }
      }

      setReferrals(referralsData.referrals);
      setReferralStats(referralsData.stats);
      if (balanceData) setBalance(balanceData);
      if (leaderboardData.success) setLeaderboard(leaderboardData.leaderboard);
      if (myRankData) setMyRank({ rank: myRankData.rank, isOnLeaderboard: myRankData.isOnLeaderboard });

    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router, leaderboardPeriod]);

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
          ? `用我的推薦碼 ${myCode.code} 加入 Mibu 旅行扭蛋，一起探索旅遊新體驗！\n\n下載 APP: https://mibu.app`
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
        {/* Prominent Referral Code Card */}
        {myCode ? (
          <View style={styles.referralCodeCard}>
            <View style={styles.codeCardHeader}>
              <Ionicons name="gift" size={24} color="#fff" />
              <Text style={styles.codeCardTitle}>
                {isZh ? '我的專屬推薦碼' : 'My Referral Code'}
              </Text>
            </View>
            <View style={styles.codeDisplayArea}>
              <Text style={styles.codeTextLarge}>{myCode.code}</Text>
            </View>
            <View style={styles.codeCardActions}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyCode}
              >
                <Ionicons name="copy-outline" size={20} color={MibuBrand.brown} />
                <Text style={styles.copyButtonText}>
                  {isZh ? '複製' : 'Copy'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareCode}
              >
                <Ionicons name="share-social" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>
                  {isZh ? '分享給好友' : 'Share'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.codeUsageText}>
              {isZh
                ? `已有 ${myCode.usageCount} 位好友使用此推薦碼`
                : `${myCode.usageCount} friends used this code`}
            </Text>
            <Text style={styles.codeFormatHint}>
              {isZh
                ? '推薦碼格式：G 開頭 = Google 登入、A 開頭 = Apple 登入'
                : 'Code format: G = Google login, A = Apple login'}
            </Text>
          </View>
        ) : (
          <View style={styles.generateCodeCard}>
            <View style={styles.generateCardInner}>
              <Ionicons name="gift-outline" size={48} color={MibuBrand.brown} />
              <Text style={styles.generateTitle}>
                {isZh ? '生成你的專屬推薦碼' : 'Generate Your Code'}
              </Text>
              <Text style={styles.generateSubtitle}>
                {isZh ? '分享給好友，一起賺取豐富獎勵' : 'Share with friends and earn rewards together'}
              </Text>
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
                      {isZh ? '立即生成' : 'Generate Now'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Stats Row - 邀請人數, 成功推薦, 獲得獎勵 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: MibuBrand.highlight }]}>
              <Ionicons name="person-add" size={20} color={MibuBrand.brown} />
            </View>
            <Text style={styles.statNumber}>{referralStats.totalReferrals}</Text>
            <Text style={styles.statLabel}>{isZh ? '邀請人數' : 'Invited'}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
            </View>
            <Text style={[styles.statNumber, { color: '#059669' }]}>
              {referralStats.activeReferrals}
            </Text>
            <Text style={styles.statLabel}>{isZh ? '成功推薦' : 'Successful'}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="diamond" size={20} color="#6366f1" />
            </View>
            <Text style={[styles.statNumber, { color: '#6366f1' }]}>
              {balance?.totalEarned || 0}
            </Text>
            <Text style={styles.statLabel}>{isZh ? '獲得獎勵' : 'XP Earned'}</Text>
          </View>
        </View>

        {/* Reward Mechanism Explanation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {isZh ? '獎勵機制說明' : 'How It Works'}
            </Text>
          </View>
          <View style={styles.howItWorksCard}>
            <View style={styles.howItWorksStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>
                  {isZh ? '分享推薦碼' : 'Share Your Code'}
                </Text>
                <Text style={styles.stepDesc}>
                  {isZh ? '複製你的專屬推薦碼分享給好友' : 'Copy and share your unique referral code'}
                </Text>
              </View>
            </View>
            <View style={styles.stepConnector} />
            <View style={styles.howItWorksStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>
                  {isZh ? '好友註冊' : 'Friend Signs Up'}
                </Text>
                <Text style={styles.stepDesc}>
                  {isZh ? '好友使用你的推薦碼完成註冊' : 'Your friend registers using your code'}
                </Text>
              </View>
            </View>
            <View style={styles.stepConnector} />
            <View style={styles.howItWorksStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>
                  {isZh ? '雙方獲得獎勵' : 'Both Earn Rewards'}
                </Text>
                <Text style={styles.stepDesc}>
                  {isZh ? '你和好友都能獲得 50 XP 獎勵' : 'You and your friend each earn 50 XP'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Leaderboard - Top 5 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={20} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {isZh ? '本週邀請排行榜' : 'Weekly Leaderboard'}
            </Text>
          </View>
          <View style={styles.leaderboardCard}>
            {leaderboard.length > 0 ? (
              leaderboard.slice(0, 5).map((user, index) => {
                const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // 金銀銅
                const isTopThree = user.rank <= 3;
                const isCurrentUser = myRank?.rank === user.rank && myRank?.isOnLeaderboard;

                return (
                  <View
                    key={user.rank}
                    style={[
                      styles.leaderboardItem,
                      index < Math.min(leaderboard.length, 5) - 1 && styles.leaderboardItemBorder,
                      isCurrentUser && styles.leaderboardItemHighlight,
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
                        {user.nickname.charAt(0)}
                      </Text>
                    </View>

                    {/* 名稱 */}
                    <Text
                      style={[
                        styles.leaderboardName,
                        isCurrentUser && styles.leaderboardNameHighlight,
                      ]}
                      numberOfLines={1}
                    >
                      {user.nickname}
                      {isCurrentUser && (
                        <Text style={styles.youBadge}> ({isZh ? '你' : 'You'})</Text>
                      )}
                    </Text>

                    {/* 邀請數 */}
                    <View style={styles.inviteCountBadge}>
                      <Ionicons name="person-add" size={12} color={MibuBrand.brown} />
                      <Text style={styles.inviteCountText}>{user.referralCount}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyLeaderboard}>
                <Ionicons name="people-outline" size={40} color={MibuBrand.tan} />
                <Text style={styles.emptyLeaderboardText}>
                  {isZh ? '暫無排行資料' : 'No ranking data yet'}
                </Text>
                <Text style={styles.emptyLeaderboardSubtext}>
                  {isZh ? '成為第一個邀請好友的人！' : 'Be the first to invite friends!'}
                </Text>
              </View>
            )}
          </View>
          {myRank && !myRank.isOnLeaderboard && myRank.rank > 0 && (
            <View style={styles.myRankCard}>
              <Text style={styles.myRankText}>
                {isZh ? `你目前排名第 ${myRank.rank} 名` : `Your current rank: #${myRank.rank}`}
              </Text>
            </View>
          )}
        </View>

        {/* Rewards Tiers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="gift" size={20} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {isZh ? '邀請獎勵' : 'Invite Rewards'}
            </Text>
          </View>
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

        {/* Apply Code Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="enter-outline" size={20} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {isZh ? '輸入好友推薦碼' : "Enter Friend's Code"}
            </Text>
          </View>
          <View style={styles.applyCard}>
            <Text style={styles.applyCardHint}>
              {isZh ? '有好友推薦碼？輸入獲取獎勵' : 'Have a referral code? Enter to earn rewards'}
            </Text>
            <View style={styles.applyInputRow}>
              <TextInput
                style={styles.applyInput}
                value={inputCode}
                onChangeText={setInputCode}
                placeholder={isZh ? '輸入推薦碼' : 'Enter code'}
                placeholderTextColor={MibuBrand.tan}
                autoCapitalize="characters"
                maxLength={12}
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

        {/* Recent Referrals */}
        {referrals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color={MibuBrand.brown} />
              <Text style={styles.sectionTitle}>
                {isZh ? '邀請紀錄' : 'Invite History'}
              </Text>
            </View>
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
  // Prominent Referral Code Card - Brown background, white text
  referralCodeCard: {
    backgroundColor: MibuBrand.brown,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  codeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  codeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  codeDisplayArea: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeTextLarge: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 6,
  },
  codeCardActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
  },
  copyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  codeUsageText: {
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  codeFormatHint: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  // Generate Code Card (when no code exists)
  generateCodeCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    borderStyle: 'dashed',
  },
  generateCardInner: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  generateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginTop: 16,
    marginBottom: 8,
  },
  generateSubtitle: {
    fontSize: 14,
    color: MibuBrand.copper,
    textAlign: 'center',
    marginBottom: 20,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Stats Row - StatCard style with icon circle
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: MibuBrand.copper,
    textAlign: 'center',
  },
  // Section styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  // How It Works Card
  howItWorksCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  howItWorksStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MibuBrand.brown,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: MibuBrand.copper,
    lineHeight: 18,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: MibuBrand.tanLight,
    marginLeft: 15,
    marginVertical: 8,
  },
  // Leaderboard
  leaderboardCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  leaderboardItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  leaderboardItemHighlight: {
    backgroundColor: MibuBrand.highlight,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: MibuBrand.creamLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.copper,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MibuBrand.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  leaderboardNameHighlight: {
    color: MibuBrand.brown,
    fontWeight: '700',
  },
  youBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  inviteCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  inviteCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  emptyLeaderboard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLeaderboardText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  emptyLeaderboardSubtext: {
    marginTop: 4,
    fontSize: 13,
    color: MibuBrand.tan,
  },
  myRankCard: {
    marginTop: 12,
    backgroundColor: MibuBrand.highlight,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  myRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  // Rewards list
  rewardsList: {
    gap: 10,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
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
  // Apply code section
  applyCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  applyCardHint: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 12,
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
  // Referrals history
  referralsList: {
    gap: 8,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
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
