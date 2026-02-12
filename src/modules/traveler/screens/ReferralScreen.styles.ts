/**
 * ============================================================
 * ReferralScreen 樣式定義 (ReferralScreen.styles.ts)
 * ============================================================
 * 此模組提供: 邀請好友畫面的所有樣式
 *
 * 從 ReferralScreen.tsx 抽離，僅包含 StyleSheet，
 * 不包含任何業務邏輯。
 *
 * 更新日期：2026-02-12（從主檔案抽離樣式）
 */
import { StyleSheet, Platform } from 'react-native';
import { MibuBrand } from '../../../../constants/Colors';

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
  // 推薦碼卡片 - 棕色背景、白色文字
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
  // 生成推薦碼卡片（尚未生成時顯示）
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
  // 統計數據列 - 帶圖示圓圈的 StatCard 風格
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
  // 區段樣式
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
  // 運作說明卡片
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
  // 排行榜
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
  // 獎勵列表
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
  // 套用推薦碼區段
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
  // 邀請歷史列表
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

export default styles;
