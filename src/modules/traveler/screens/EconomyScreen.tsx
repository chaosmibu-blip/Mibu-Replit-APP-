/**
 * EconomyScreen - 經濟系統畫面
 * 顯示用戶等級、經驗值、成就徽章
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
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { economyApi } from '../../../services/economyApi';
import { MibuBrand } from '../../../../constants/Colors';
import {
  LevelInfo,
  Achievement,
  AchievementCategory,
  AchievementTier,
  ExperienceRecord,
} from '../../../types/economy';

const TIER_COLORS: Record<AchievementTier, { bg: string; border: string; text: string }> = {
  bronze: { bg: '#F5E6D3', border: '#D4A574', text: '#8B5A2B' },
  silver: { bg: '#F0F0F0', border: '#A0A0A0', text: '#505050' },
  gold: { bg: '#FFF8E1', border: '#FFD700', text: '#8B7500' },
  platinum: { bg: '#E8F4F8', border: '#00CED1', text: '#008B8B' },
};

const CATEGORY_ICONS: Record<AchievementCategory, string> = {
  collector: 'albums',
  investor: 'trending-up',
  promoter: 'megaphone',
  business: 'business',
  specialist: 'star',
};

const CATEGORY_LABELS: Record<AchievementCategory, { zh: string; en: string }> = {
  collector: { zh: '收藏家', en: 'Collector' },
  investor: { zh: '投資者', en: 'Investor' },
  promoter: { zh: '推廣者', en: 'Promoter' },
  business: { zh: '商業', en: 'Business' },
  specialist: { zh: '策劃師', en: 'Specialist' },
};

const SOURCE_LABELS: Record<string, { zh: string; en: string }> = {
  gacha: { zh: '扭蛋', en: 'Gacha' },
  collection: { zh: '收藏', en: 'Collection' },
  referral: { zh: '推薦', en: 'Referral' },
  contribution: { zh: '貢獻', en: 'Contribution' },
  crowdfund: { zh: '募資', en: 'Crowdfund' },
  achievement: { zh: '成就', en: 'Achievement' },
  daily_login: { zh: '每日登入', en: 'Daily Login' },
  trip_submit: { zh: '行程提交', en: 'Trip Submit' },
};

export function EconomyScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      const [levelData, achievementsData] = await Promise.all([
        economyApi.getLevelInfo(token),
        economyApi.getAchievements(token),
      ]);

      setLevelInfo(levelData);
      setAchievements(achievementsData.achievements);
    } catch (error) {
      console.error('Failed to load economy data:', error);
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

  const handleClaimAchievement = async (achievement: Achievement) => {
    if (claimingId || !achievement.isUnlocked || achievement.isClaimed) return;

    setClaimingId(achievement.id);
    try {
      const token = await getToken();
      if (!token) return;

      const result = await economyApi.claimAchievement(token, achievement.id);

      if (result.success) {
        // Update local state
        setAchievements(prev =>
          prev.map(a =>
            a.id === achievement.id ? { ...a, isClaimed: true } : a
          )
        );

        // Update level info if provided
        if (result.newLevel || result.newExp) {
          setLevelInfo(prev => prev ? {
            ...prev,
            currentExp: result.newExp,
            level: result.newLevel || prev.level,
          } : prev);
        }

        Alert.alert(
          isZh ? '領取成功' : 'Claimed!',
          isZh
            ? `獲得 ${result.reward.exp} 經驗值${result.reward.credits ? ` 和 ${result.reward.credits} 點數` : ''}`
            : `You earned ${result.reward.exp} XP${result.reward.credits ? ` and ${result.reward.credits} credits` : ''}`
        );
      }
    } catch (error) {
      console.error('Failed to claim achievement:', error);
      Alert.alert(
        isZh ? '錯誤' : 'Error',
        isZh ? '領取失敗，請稍後再試' : 'Failed to claim, please try again'
      );
    } finally {
      setClaimingId(null);
    }
  };

  const filteredAchievements = selectedCategory
    ? achievements.filter(a => a.category === selectedCategory)
    : achievements;

  const expProgress = levelInfo
    ? (levelInfo.currentExp / levelInfo.nextLevelExp) * 100
    : 0;

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
          {isZh ? '等級與成就' : 'Level & Achievements'}
        </Text>
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
        {/* Level Card */}
        {levelInfo && (
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{levelInfo.level}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelLabel}>
                  {isZh ? '等級' : 'Level'} {levelInfo.level}
                </Text>
                <Text style={styles.expText}>
                  {levelInfo.currentExp.toLocaleString()} / {levelInfo.nextLevelExp.toLocaleString()} XP
                </Text>
              </View>
              <View style={styles.quotaBox}>
                <Text style={styles.quotaNumber}>{levelInfo.dailyQuota}</Text>
                <Text style={styles.quotaLabel}>
                  {isZh ? '日配額' : 'Daily'}
                </Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(expProgress, 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {Math.round(expProgress)}%
              </Text>
            </View>

            {/* Recent Experience */}
            {levelInfo.recentExp && levelInfo.recentExp.length > 0 && (
              <View style={styles.recentExpSection}>
                <Text style={styles.recentExpTitle}>
                  {isZh ? '近期經驗' : 'Recent XP'}
                </Text>
                {levelInfo.recentExp.slice(0, 3).map((record: ExperienceRecord) => (
                  <View key={record.id} style={styles.expRecord}>
                    <Text style={styles.expSource}>
                      {SOURCE_LABELS[record.source]?.[isZh ? 'zh' : 'en'] || record.source}
                    </Text>
                    <Text style={[styles.expAmount, record.amount > 0 && styles.expPositive]}>
                      {record.amount > 0 ? '+' : ''}{record.amount} XP
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
              {isZh ? '全部' : 'All'}
            </Text>
          </TouchableOpacity>
          {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Ionicons
                name={CATEGORY_ICONS[cat] as any}
                size={14}
                color={selectedCategory === cat ? MibuBrand.warmWhite : MibuBrand.copper}
              />
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                {CATEGORY_LABELS[cat][isZh ? 'zh' : 'en']}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements Grid */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>
            {isZh ? '成就徽章' : 'Achievement Badges'}
          </Text>

          {filteredAchievements.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={48} color={MibuBrand.tan} />
              <Text style={styles.emptyText}>
                {isZh ? '尚無成就' : 'No achievements yet'}
              </Text>
            </View>
          ) : (
            <View style={styles.achievementsGrid}>
              {filteredAchievements.map(achievement => {
                const tierStyle = TIER_COLORS[achievement.tier];
                const progress = (achievement.progress / achievement.requirement) * 100;
                const canClaim = achievement.isUnlocked && !achievement.isClaimed;

                return (
                  <TouchableOpacity
                    key={achievement.id}
                    style={[
                      styles.achievementCard,
                      { borderColor: achievement.isUnlocked ? tierStyle.border : MibuBrand.tanLight },
                      !achievement.isUnlocked && styles.achievementLocked,
                    ]}
                    onPress={() => canClaim && handleClaimAchievement(achievement)}
                    disabled={!canClaim || claimingId === achievement.id}
                    activeOpacity={canClaim ? 0.7 : 1}
                  >
                    <View style={[styles.achievementIcon, { backgroundColor: tierStyle.bg }]}>
                      {achievement.iconUrl ? (
                        <Text style={styles.achievementEmoji}>🏆</Text>
                      ) : (
                        <Ionicons
                          name={CATEGORY_ICONS[achievement.category] as any}
                          size={24}
                          color={tierStyle.text}
                        />
                      )}
                      {!achievement.isUnlocked && (
                        <View style={styles.lockOverlay}>
                          <Ionicons name="lock-closed" size={16} color="#ffffff" />
                        </View>
                      )}
                    </View>

                    <Text style={styles.achievementTitle} numberOfLines={2}>
                      {achievement.title}
                    </Text>

                    <View style={styles.achievementProgressBar}>
                      <View
                        style={[
                          styles.achievementProgressFill,
                          { width: `${Math.min(progress, 100)}%`, backgroundColor: tierStyle.border }
                        ]}
                      />
                    </View>
                    <Text style={styles.achievementProgressText}>
                      {achievement.progress} / {achievement.requirement}
                    </Text>

                    {achievement.isClaimed ? (
                      <View style={styles.claimedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={MibuBrand.success} />
                        <Text style={styles.claimedText}>
                          {isZh ? '已領取' : 'Claimed'}
                        </Text>
                      </View>
                    ) : canClaim ? (
                      <TouchableOpacity
                        style={styles.claimButton}
                        onPress={() => handleClaimAchievement(achievement)}
                        disabled={claimingId === achievement.id}
                      >
                        {claimingId === achievement.id ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.claimButtonText}>
                            {isZh ? '領取獎勵' : 'Claim'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.rewardPreview}>
                        +{achievement.reward.exp} XP
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  levelCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MibuBrand.brown,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  levelInfo: {
    flex: 1,
    marginLeft: 16,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  expText: {
    fontSize: 14,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  quotaBox: {
    alignItems: 'center',
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  quotaNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: MibuBrand.brown,
  },
  quotaLabel: {
    fontSize: 11,
    color: MibuBrand.copper,
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: MibuBrand.brown,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: MibuBrand.copper,
    minWidth: 40,
    textAlign: 'right',
  },
  recentExpSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
  },
  recentExpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: MibuBrand.copper,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  expRecord: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  expSource: {
    fontSize: 14,
    color: MibuBrand.brownDark,
  },
  expAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  expPositive: {
    color: MibuBrand.success,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: MibuBrand.warmWhite,
    borderWidth: 1.5,
    borderColor: MibuBrand.tanLight,
  },
  categoryChipActive: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  categoryChipTextActive: {
    color: MibuBrand.warmWhite,
  },
  achievementsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 12,
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
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '47%',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  achievementEmoji: {
    fontSize: 24,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 32,
  },
  achievementProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: 11,
    color: MibuBrand.copper,
    marginBottom: 8,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimedText: {
    fontSize: 12,
    color: MibuBrand.success,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  claimButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  rewardPreview: {
    fontSize: 12,
    color: MibuBrand.copper,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 100,
  },
});
