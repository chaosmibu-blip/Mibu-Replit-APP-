/**
 * ReferralScreen - 邀請好友畫面
 *
 * 功能：
 * - 顯示/生成個人推薦碼
 * - 複製/分享推薦碼
 * - 輸入好友推薦碼
 * - 顯示邀請獎勵等級說明
 * - 顯示已邀請好友列表
 * - 推薦排行榜（週/月/全部）
 * - 獎勵餘額查詢
 *
 * 串接 API：
 * - referralApi.getMyCode() - 取得推薦碼
 * - referralApi.generateCode() - 生成推薦碼
 * - referralApi.applyCode() - 套用推薦碼
 * - referralApi.getMyReferrals() - 取得邀請列表
 * - referralApi.getBalance() - 取得獎勵餘額
 * - referralApi.getLeaderboard() - 取得排行榜
 * - referralApi.getMyRank() - 取得我的排名
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
import { tFormat, LOCALE_MAP } from '../../../utils/i18n';
import { referralApi } from '../../../services/referralApi';
import { MibuBrand } from '../../../../constants/Colors';
import {
  ReferralCode,
  Referral,
  ReferralBalance,
  LeaderboardEntry,
  LeaderboardPeriod,
} from '../../../types/referral';

// ============================================================
// 常數定義
// ============================================================

/**
 * 獎勵等級介面
 */
interface RewardTier {
  count: number;                         // 達成邀請數
  reward: string;                        // 獎勵說明
  icon: keyof typeof Ionicons.glyphMap;  // 獎勵圖示
  color: string;                         // 顏色
}

/**
 * 邀請獎勵等級設定
 * 根據邀請人數給予不同獎勵
 */
const REWARD_TIERS: RewardTier[] = [
  { count: 1, reward: '雙方各得 50 XP', icon: 'star', color: '#D97706' },
  { count: 3, reward: '額外獎勵 200 XP', icon: 'star', color: '#6366f1' },
  { count: 5, reward: '免費扭蛋券 x3', icon: 'ticket', color: '#059669' },
  { count: 10, reward: '專屬優惠券禮包', icon: 'gift', color: '#DC2626' },
];


// ============================================================
// 主元件
// ============================================================

export function ReferralScreen() {
  const { state, getToken, t } = useApp();
  const router = useRouter();


  // ============================================================
  // 狀態管理
  // ============================================================

  // 載入狀態
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 我的推薦碼
  const [myCode, setMyCode] = useState<ReferralCode | null>(null);

  // 輸入的推薦碼
  const [inputCode, setInputCode] = useState('');

  // 操作中狀態
  const [applyingCode, setApplyingCode] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

  // 邀請列表
  const [referrals, setReferrals] = useState<Referral[]>([]);

  // 邀請統計
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,      // 總邀請數
    activeReferrals: 0,     // 有效邀請數
    totalRewardEarned: 0    // 總獎勵
  });

  // 獎勵餘額
  const [balance, setBalance] = useState<ReferralBalance | null>(null);

  // 排行榜
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; isOnLeaderboard: boolean } | null>(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('weekly');

  // ============================================================
  // API 呼叫
  // ============================================================

  /**
   * 載入所有資料
   * 包含：推薦碼、邀請列表、餘額、排行榜
   */
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
        t.common_error,
        t.referral_generateError
      );
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (!myCode) return;
    await Clipboard.setStringAsync(myCode.code);
    Alert.alert(
      t.referral_copied,
      t.referral_copiedDesc
    );
  };

  const handleShareCode = async () => {
    if (!myCode) return;
    try {
      await Share.share({
        message: tFormat(t.referral_shareMessage, { code: myCode.code }),
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
          t.referral_invalidCode,
          validation.message || t.referral_invalidCodeDesc
        );
        return;
      }

      const result = await referralApi.applyCode(token, { code: inputCode.trim() });
      if (result.success) {
        setInputCode('');
        Alert.alert(
          t.referral_applySuccess,
          tFormat(t.referral_applySuccessDesc, { amount: result.expEarned })
        );
        loadData();
      }
    } catch (error: any) {
      console.error('Apply code failed:', error);
      Alert.alert(
        t.common_error,
        error.message || t.referral_applyError
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
            {t.referral_inviteFriends}
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
                {t.referral_myCode}
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
                  {t.referral_copy}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareCode}
              >
                <Ionicons name="share-social" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>
                  {t.referral_share}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.generateCodeCard}>
            <View style={styles.generateCardInner}>
              <Ionicons name="gift-outline" size={48} color={MibuBrand.brown} />
              <Text style={styles.generateTitle}>
                {t.referral_generateTitle}
              </Text>
              <Text style={styles.generateSubtitle}>
                {t.referral_generateSubtitle}
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
                      {t.referral_generateNow}
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
            <Text style={styles.statLabel}>{t.referral_invited}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
            </View>
            <Text style={[styles.statNumber, { color: '#059669' }]}>
              {referralStats.activeReferrals}
            </Text>
            <Text style={styles.statLabel}>{t.referral_successful}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="diamond" size={20} color="#6366f1" />
            </View>
            <Text style={[styles.statNumber, { color: '#6366f1' }]}>
              {balance?.totalEarned || 0}
            </Text>
            <Text style={styles.statLabel}>{t.referral_xpEarned}</Text>
          </View>
        </View>

        {/* Reward Mechanism Explanation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {t.referral_howItWorks}
            </Text>
          </View>
          <View style={styles.howItWorksCard}>
            <View style={styles.howItWorksStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>
                  {t.referral_step1Title}
                </Text>
                <Text style={styles.stepDesc}>
                  {t.referral_step1Desc}
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
                  {t.referral_step2Title}
                </Text>
                <Text style={styles.stepDesc}>
                  {t.referral_step2Desc}
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
                  {t.referral_step3Title}
                </Text>
                <Text style={styles.stepDesc}>
                  {t.referral_step3Desc}
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
              {t.referral_weeklyLeaderboard}
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
                        <Text style={styles.youBadge}> ({t.referral_you})</Text>
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
                  {t.referral_noRanking}
                </Text>
                <Text style={styles.emptyLeaderboardSubtext}>
                  {t.referral_beFirst}
                </Text>
              </View>
            )}
          </View>
          {myRank && !myRank.isOnLeaderboard && myRank.rank > 0 && (
            <View style={styles.myRankCard}>
              <Text style={styles.myRankText}>
                {tFormat(t.referral_yourRank, { rank: myRank.rank })}
              </Text>
            </View>
          )}
        </View>

        {/* Rewards Tiers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="gift" size={20} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {t.referral_inviteRewards}
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
                      {tFormat(t.referral_inviteCount, { count: tier.count })}
                    </Text>
                    <Text style={[styles.rewardValue, isAchieved && styles.rewardValueAchieved]}>
                      {tier.reward}
                    </Text>
                  </View>
                  {isAchieved && (
                    <View style={styles.achievedBadge}>
                      <Text style={styles.achievedText}>
                        {t.referral_achieved}
                      </Text>
                    </View>
                  )}
                  {isNext && (
                    <View style={styles.nextBadge}>
                      <Text style={styles.nextText}>
                        {tFormat(t.referral_remaining, { count: tier.count - referralStats.totalReferrals })}
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
              {t.referral_enterCode}
            </Text>
          </View>
          <View style={styles.applyCard}>
            <Text style={styles.applyCardHint}>
              {t.referral_enterCodeHint}
            </Text>
            <View style={styles.applyInputRow}>
              <TextInput
                style={styles.applyInput}
                value={inputCode}
                onChangeText={setInputCode}
                placeholder={t.referral_enterCodePlaceholder}
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
                {t.referral_inviteHistory}
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
                      {new Date(referral.joinedAt).toLocaleDateString(LOCALE_MAP[state.language])}
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
