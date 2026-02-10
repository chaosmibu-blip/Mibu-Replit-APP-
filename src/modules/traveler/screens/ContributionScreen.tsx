/**
 * ContributionScreen - 用戶貢獻畫面
 *
 * 功能：
 * - 三個 Tab：回報、建議、投票
 * - 回報 Tab：檢舉景點歇業/搬遷/資訊錯誤
 * - 建議 Tab：建議新增景點
 * - 投票 Tab：對待審核景點/建議進行投票
 * - 查看自己的回報/建議記錄
 * - 獎勵經驗值機制
 *
 * 串接 API：
 * - contributionApi.getMyReports() - 取得我的回報
 * - contributionApi.getMySuggestions() - 取得我的建議
 * - contributionApi.getPendingVotes() - 取得待投票景點
 * - contributionApi.getPendingSuggestions() - 取得待投票建議
 * - contributionApi.submitReport() - 提交回報
 * - contributionApi.submitSuggestion() - 提交建議
 * - contributionApi.submitVote() - 提交投票
 *
 * @see 後端合約: contracts/APP.md Phase 6
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { tFormat, LOCALE_MAP } from '../../../utils/i18n';
import { contributionApi } from '../../../services/contributionApi';
import { MibuBrand, UIColors, SemanticColors } from '../../../../constants/Colors';
import {
  MyReport,
  MySuggestion,
  PendingVotePlace,
  PendingSuggestion,
  ReportReason,
} from '../../../types/contribution';

// ============================================================
// 常數定義
// ============================================================

/**
 * Tab 類型
 * - report: 回報
 * - suggest: 建議
 * - vote: 投票
 */
type TabType = 'report' | 'suggest' | 'vote';

/**
 * 回報原因選項
 */
const REPORT_REASONS: { value: ReportReason; labelKey: string }[] = [
  { value: 'closed', labelKey: 'contribution_reasonClosed' },
  { value: 'relocated', labelKey: 'contribution_reasonRelocated' },
  { value: 'wrong_info', labelKey: 'contribution_reasonWrongInfo' },
  { value: 'other', labelKey: 'contribution_reasonOther' },
];

// ============================================================
// 主元件
// ============================================================

export function ContributionScreen() {
  const { state, getToken, t } = useApp();
  const router = useRouter();


  // ============================================================
  // 狀態管理
  // ============================================================

  // 載入狀態
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 當前選中的 Tab
  const [activeTab, setActiveTab] = useState<TabType>('report');

  // 回報 Tab 狀態
  const [myReports, setMyReports] = useState<MyReport[]>([]);

  // 建議 Tab 狀態
  const [mySuggestions, setMySuggestions] = useState<MySuggestion[]>([]);

  // 投票 Tab 狀態
  const [pendingVotes, setPendingVotes] = useState<PendingVotePlace[]>([]);
  const [pendingSuggestions, setPendingSuggestions] = useState<PendingSuggestion[]>([]);
  const [votingId, setVotingId] = useState<string | null>(null); // 正在投票的項目 ID

  // ============================================================
  // API 呼叫
  // ============================================================

  /**
   * 根據當前 Tab 載入對應資料
   */
  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      if (activeTab === 'report') {
        const data = await contributionApi.getMyReports(token);
        setMyReports(data.reports ?? []);
      } else if (activeTab === 'suggest') {
        const data = await contributionApi.getMySuggestions(token);
        setMySuggestions(data.suggestions ?? []);
      } else if (activeTab === 'vote') {
        const [votesData, suggestionsData] = await Promise.all([
          contributionApi.getPendingVotes(token),
          contributionApi.getPendingSuggestions(token),
        ]);
        setPendingVotes(votesData.places ?? []);
        setPendingSuggestions(suggestionsData.suggestions ?? []);
      }
    } catch (error) {
      console.error('Failed to load contribution data:', error);
      Alert.alert(t.contribution_loadFailed, t.contribution_loadFailedDesc);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router, activeTab]);

  // 切換 Tab 或初始載入時重新載入資料
  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  /**
   * 下拉重新整理
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleVotePlace = async (placeId: string, vote: 'exclude' | 'keep') => {
    if (votingId) return;
    setVotingId(placeId);

    try {
      const token = await getToken();
      if (!token) return;

      const result = await contributionApi.votePlace(token, placeId, { vote });
      if (result.success) {
        setPendingVotes(prev => prev.filter(p => p.placeId !== placeId));
        Alert.alert(
          t.contribution_voteSuccess,
          tFormat(t.contribution_voteEarned, { amount: result.expEarned })
        );
      }
    } catch (error) {
      console.error('Vote failed:', error);
      Alert.alert(t.contribution_voteFailed, t.contribution_voteTryAgain);
    } finally {
      setVotingId(null);
    }
  };

  const handleVoteSuggestion = async (suggestionId: string, vote: 'approve' | 'reject') => {
    if (votingId) return;
    setVotingId(suggestionId);

    try {
      const token = await getToken();
      if (!token) return;

      const result = await contributionApi.voteSuggestion(token, suggestionId, { vote });
      if (result.success) {
        setPendingSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        Alert.alert(
          t.contribution_voteSuccess,
          tFormat(t.contribution_voteEarned, { amount: result.expEarned })
        );
      }
    } catch (error) {
      console.error('Vote failed:', error);
      Alert.alert(t.contribution_voteFailed, t.contribution_voteTryAgain);
    } finally {
      setVotingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
      case 'voting':
        return { bg: SemanticColors.warningLight, text: SemanticColors.warningDark };
      case 'verified':
      case 'approved':
        return { bg: SemanticColors.successLight, text: '#059669' };
      case 'rejected':
        return { bg: SemanticColors.errorLight, text: '#DC2626' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const renderReportTab = () => (
    <View style={styles.tabContent}>
      {/* Quick Report Button */}
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => Alert.alert(t.contribution_reportFeature, t.contribution_reportFeatureDesc)}
      >
        <View style={styles.actionIcon}>
          <Ionicons name="flag" size={24} color={MibuBrand.brown} />
        </View>
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>
            {t.contribution_reportClosure}
          </Text>
          <Text style={styles.actionDesc}>
            {t.contribution_reportClosureDesc}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
      </TouchableOpacity>

      {/* My Reports */}
      <Text style={styles.sectionTitle}>
        {t.contribution_myReports} ({myReports.length})
      </Text>

      {myReports.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="flag-outline" size={48} color={MibuBrand.tan} />
          <Text style={styles.emptyText}>
            {t.contribution_noReports}
          </Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {myReports.map(report => {
            const statusStyle = getStatusStyle(report.status);
            const reasonLabelKey = REPORT_REASONS.find(r => r.value === report.reason)?.labelKey;

            return (
              <View key={report.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {report.placeName}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {report.status === 'pending' && t.contribution_statusPending}
                      {report.status === 'verified' && t.contribution_statusVerified}
                      {report.status === 'rejected' && t.contribution_statusRejected}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemMetaText}>
                    {(reasonLabelKey ? t[reasonLabelKey] : report.reason)}
                  </Text>
                  <Text style={styles.itemMetaText}>•</Text>
                  <Text style={styles.itemMetaText}>
                    {new Date(report.createdAt).toLocaleDateString(LOCALE_MAP[state.language])}
                  </Text>
                  {report.expEarned > 0 && (
                    <>
                      <Text style={styles.itemMetaText}>•</Text>
                      <Text style={styles.itemCoins}>+{report.expEarned} 金幣</Text>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderSuggestTab = () => (
    <View style={styles.tabContent}>
      {/* Quick Suggest Button */}
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => Alert.alert(t.contribution_suggestFeature, t.contribution_suggestFeatureDesc)}
      >
        <View style={styles.actionIcon}>
          <Ionicons name="add-circle" size={24} color={MibuBrand.brown} />
        </View>
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>
            {t.contribution_suggestPlace}
          </Text>
          <Text style={styles.actionDesc}>
            {t.contribution_suggestPlaceDesc}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
      </TouchableOpacity>

      {/* My Suggestions */}
      <Text style={styles.sectionTitle}>
        {t.contribution_mySuggestions} ({mySuggestions.length})
      </Text>

      {mySuggestions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bulb-outline" size={48} color={MibuBrand.tan} />
          <Text style={styles.emptyText}>
            {t.contribution_noSuggestions}
          </Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {mySuggestions.map(suggestion => {
            const statusStyle = getStatusStyle(suggestion.status);

            return (
              <View key={suggestion.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {suggestion.name}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {suggestion.status === 'pending' && t.contribution_statusPending}
                      {suggestion.status === 'voting' && t.contribution_statusVoting}
                      {suggestion.status === 'approved' && t.contribution_statusApproved}
                      {suggestion.status === 'rejected' && t.contribution_statusRejected}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemAddress} numberOfLines={1}>
                  {suggestion.address}
                </Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemMetaText}>{suggestion.category}</Text>
                  <Text style={styles.itemMetaText}>•</Text>
                  <Text style={styles.itemMetaText}>
                    {new Date(suggestion.createdAt).toLocaleDateString(LOCALE_MAP[state.language])}
                  </Text>
                  {suggestion.expEarned > 0 && (
                    <>
                      <Text style={styles.itemMetaText}>•</Text>
                      <Text style={styles.itemCoins}>+{suggestion.expEarned} 金幣</Text>
                    </>
                  )}
                </View>
                {suggestion.voteCount && (
                  <View style={styles.voteProgress}>
                    <Text style={styles.voteText}>
                      👍 {suggestion.voteCount.approve} / 👎 {suggestion.voteCount.reject}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderVoteTab = () => (
    <View style={styles.tabContent}>
      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={MibuBrand.info} />
        <Text style={styles.infoText}>
          {t.contribution_voteInfo}
        </Text>
      </View>

      {/* Pending Place Votes */}
      {pendingVotes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            {t.contribution_exclusionVotes} ({pendingVotes.length})
          </Text>
          <View style={styles.itemsList}>
            {pendingVotes.map(place => (
              <View key={place.placeId} style={styles.voteCard}>
                <View style={styles.voteCardHeader}>
                  <Text style={styles.voteCardTitle} numberOfLines={1}>
                    {place.placeName}
                  </Text>
                  <View style={styles.reportCountBadge}>
                    <Ionicons name="flag" size={12} color={MibuBrand.error} />
                    <Text style={styles.reportCountText}>{place.reportCount}</Text>
                  </View>
                </View>
                <Text style={styles.voteCardAddress} numberOfLines={1}>
                  {place.placeAddress}
                </Text>
                <View style={styles.voteCardReasons}>
                  {place.reportReasons.slice(0, 3).map((reason, i) => (
                    <View key={i} style={styles.reasonTag}>
                      <Text style={styles.reasonText}>
                        {REPORT_REASONS.find(r => r.value === reason)?.labelKey ? t[REPORT_REASONS.find(r => r.value === reason)!.labelKey] : reason}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={styles.voteBarContainer}>
                  <View style={styles.voteBar}>
                    <View
                      style={[
                        styles.voteBarExclude,
                        { flex: place.currentVotes.exclude || 1 }
                      ]}
                    />
                    <View
                      style={[
                        styles.voteBarKeep,
                        { flex: place.currentVotes.keep || 1 }
                      ]}
                    />
                  </View>
                  <View style={styles.voteBarLabels}>
                    <Text style={styles.voteBarLabel}>
                      {t.contribution_exclude} {place.currentVotes.exclude}
                    </Text>
                    <Text style={styles.voteBarLabel}>
                      {place.currentVotes.keep} {t.contribution_keep}
                    </Text>
                  </View>
                </View>
                <View style={styles.voteActions}>
                  <TouchableOpacity
                    style={[styles.voteBtn, styles.voteBtnExclude]}
                    onPress={() => handleVotePlace(place.placeId, 'exclude')}
                    disabled={votingId === place.placeId}
                  >
                    {votingId === place.placeId ? (
                      <ActivityIndicator size="small" color={UIColors.white} />
                    ) : (
                      <>
                        <Ionicons name="close" size={18} color={UIColors.white} />
                        <Text style={styles.voteBtnText}>{t.contribution_exclude}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.voteBtn, styles.voteBtnKeep]}
                    onPress={() => handleVotePlace(place.placeId, 'keep')}
                    disabled={votingId === place.placeId}
                  >
                    {votingId === place.placeId ? (
                      <ActivityIndicator size="small" color={UIColors.white} />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={18} color={UIColors.white} />
                        <Text style={styles.voteBtnText}>{t.contribution_keep}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Pending Suggestion Votes */}
      {pendingSuggestions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            {t.contribution_newPlaceReviews} ({pendingSuggestions.length})
          </Text>
          <View style={styles.itemsList}>
            {pendingSuggestions.map(suggestion => (
              <View key={suggestion.id} style={styles.voteCard}>
                <View style={styles.voteCardHeader}>
                  <Text style={styles.voteCardTitle} numberOfLines={1}>
                    {suggestion.name}
                  </Text>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{suggestion.category}</Text>
                  </View>
                </View>
                <Text style={styles.voteCardAddress} numberOfLines={1}>
                  {suggestion.address}
                </Text>
                {suggestion.description && (
                  <Text style={styles.voteCardDesc} numberOfLines={2}>
                    {suggestion.description}
                  </Text>
                )}
                <View style={styles.voteBarContainer}>
                  <View style={styles.voteBar}>
                    <View
                      style={[
                        styles.voteBarApprove,
                        { flex: suggestion.currentVotes.approve || 1 }
                      ]}
                    />
                    <View
                      style={[
                        styles.voteBarReject,
                        { flex: suggestion.currentVotes.reject || 1 }
                      ]}
                    />
                  </View>
                  <View style={styles.voteBarLabels}>
                    <Text style={styles.voteBarLabel}>
                      👍 {suggestion.currentVotes.approve}
                    </Text>
                    <Text style={styles.voteBarLabel}>
                      {suggestion.currentVotes.reject} 👎
                    </Text>
                  </View>
                </View>
                <View style={styles.voteActions}>
                  <TouchableOpacity
                    style={[styles.voteBtn, styles.voteBtnApprove]}
                    onPress={() => handleVoteSuggestion(suggestion.id, 'approve')}
                    disabled={votingId === suggestion.id}
                  >
                    {votingId === suggestion.id ? (
                      <ActivityIndicator size="small" color={UIColors.white} />
                    ) : (
                      <>
                        <Ionicons name="thumbs-up" size={18} color={UIColors.white} />
                        <Text style={styles.voteBtnText}>{t.contribution_approve}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.voteBtn, styles.voteBtnReject]}
                    onPress={() => handleVoteSuggestion(suggestion.id, 'reject')}
                    disabled={votingId === suggestion.id}
                  >
                    {votingId === suggestion.id ? (
                      <ActivityIndicator size="small" color={UIColors.white} />
                    ) : (
                      <>
                        <Ionicons name="thumbs-down" size={18} color={UIColors.white} />
                        <Text style={styles.voteBtnText}>{t.contribution_reject}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {pendingVotes.length === 0 && pendingSuggestions.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="thumbs-up-outline" size={48} color={MibuBrand.tan} />
          <Text style={styles.emptyText}>
            {t.contribution_noPendingVotes}
          </Text>
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
        <View style={styles.headerCenter}>
          <Ionicons name="heart" size={24} color={MibuBrand.brownDark} />
          <Text style={styles.headerTitle}>
            {t.contribution_title}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(['report', 'suggest', 'vote'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'report' && t.contribution_tabReport}
              {tab === 'suggest' && t.contribution_tabSuggest}
              {tab === 'vote' && t.contribution_tabVote}
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
        {activeTab === 'report' && renderReportTab()}
        {activeTab === 'suggest' && renderSuggestTab()}
        {activeTab === 'vote' && renderVoteTab()}

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
    color: UIColors.white,
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
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    gap: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MibuBrand.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.copper,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: MibuBrand.tanLight,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemAddress: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemMetaText: {
    fontSize: 12,
    color: MibuBrand.tan,
  },
  itemCoins: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.success,
  },
  voteProgress: {
    marginTop: 8,
  },
  voteText: {
    fontSize: 12,
    color: MibuBrand.copper,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EEF6FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C7DEFF',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  voteCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  voteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  voteCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginRight: 8,
  },
  reportCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: SemanticColors.errorLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reportCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.error,
  },
  categoryTag: {
    backgroundColor: MibuBrand.cream,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  voteCardAddress: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 8,
  },
  voteCardDesc: {
    fontSize: 13,
    color: MibuBrand.brownDark,
    lineHeight: 18,
    marginBottom: 8,
  },
  voteCardReasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  reasonTag: {
    backgroundColor: SemanticColors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reasonText: {
    fontSize: 11,
    fontWeight: '600',
    color: SemanticColors.warningDark,
  },
  voteBarContainer: {
    marginBottom: 12,
  },
  voteBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  voteBarExclude: {
    backgroundColor: MibuBrand.error,
  },
  voteBarKeep: {
    backgroundColor: MibuBrand.success,
  },
  voteBarApprove: {
    backgroundColor: MibuBrand.success,
  },
  voteBarReject: {
    backgroundColor: MibuBrand.error,
  },
  voteBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voteBarLabel: {
    fontSize: 11,
    color: MibuBrand.tan,
  },
  voteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  voteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  voteBtnExclude: {
    backgroundColor: MibuBrand.error,
  },
  voteBtnKeep: {
    backgroundColor: MibuBrand.success,
  },
  voteBtnApprove: {
    backgroundColor: MibuBrand.success,
  },
  voteBtnReject: {
    backgroundColor: MibuBrand.error,
  },
  voteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: UIColors.white,
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
  bottomSpacer: {
    height: 100,
  },
});
