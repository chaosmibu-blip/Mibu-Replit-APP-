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
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useAuth, useI18n } from '../../../context/AppContext';
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
import styles from './ReferralScreen.styles';

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
  const { getToken } = useAuth();
  const { t, language } = useI18n();
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
                      {new Date(referral.joinedAt).toLocaleDateString(LOCALE_MAP[language])}
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

