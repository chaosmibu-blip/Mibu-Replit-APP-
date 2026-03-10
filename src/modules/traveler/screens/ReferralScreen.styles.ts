/**
 * ============================================================
 * ReferralScreen 樣式定義 (ReferralScreen.styles.ts)
 * ============================================================
 * 此模組提供: 邀請好友畫面的所有樣式
 *
 * 從 ReferralScreen.tsx 抽離，僅包含 StyleSheet，
 * 不包含任何業務邏輯。
 *
 * 更新日期：2026-03-09（替換硬編碼數值為 Design Token）
 */
import { StyleSheet } from 'react-native';
import { MibuBrand, UIColors, SemanticColors } from '../../../../constants/Colors';
import { BOTTOM_SPACER_HEIGHT } from '../../../constants/businessDefaults';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';

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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
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
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xl,
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
    padding: Spacing.lg,
  },
  // 推薦碼卡片 - 棕色背景、白色文字
  referralCodeCard: {
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: 20,
    shadowColor: UIColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  codeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  codeCardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: UIColors.white,
    opacity: 0.9,
  },
  codeDisplayArea: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeTextLarge: {
    fontSize: 32,
    fontWeight: '900',
    color: UIColors.white,
    letterSpacing: 6,
  },
  codeCardActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: UIColors.white,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
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
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: UIColors.white,
  },
  // 生成推薦碼卡片（尚未生成時顯示）
  generateCodeCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.xs,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    borderStyle: 'dashed',
  },
  generateCardInner: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  generateTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  generateSubtitle: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    textAlign: 'center',
    marginBottom: 20,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: MibuBrand.brown,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.md,
  },
  generateBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: UIColors.white,
  },
  // 統計數據列 - 帶圖示圓圈的 StatCard 風格
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    shadowColor: UIColors.black,
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
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    textAlign: 'center',
  },
  // 區段樣式
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  // 運作說明卡片
  howItWorksCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: 20,
    shadowColor: UIColors.black,
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
    borderRadius: Radius.lg,
    backgroundColor: MibuBrand.brown,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepNumberText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: UIColors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.xs,
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
    marginVertical: Spacing.sm,
  },
  // 排行榜
  leaderboardCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: UIColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
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
    marginRight: Spacing.md,
  },
  rankText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: MibuBrand.copper,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.xl,
    backgroundColor: MibuBrand.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  leaderboardAvatarText: {
    fontSize: FontSize.lg,
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
    gap: Spacing.xs,
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  inviteCountText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  emptyLeaderboard: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLeaderboardText: {
    marginTop: Spacing.md,
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  emptyLeaderboardSubtext: {
    marginTop: Spacing.xs,
    fontSize: 13,
    color: MibuBrand.tan,
  },
  myRankCard: {
    marginTop: Spacing.md,
    backgroundColor: MibuBrand.highlight,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: 'center',
  },
  myRankText: {
    fontSize: FontSize.md,
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
    borderRadius: Radius.lg,
    padding: 14,
    shadowColor: UIColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  rewardItemAchieved: {
    backgroundColor: SemanticColors.successLight,
    borderColor: SemanticColors.successDark,
  },
  rewardItemNext: {
    borderWidth: 2,
    borderColor: MibuBrand.brown,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
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
    color: SemanticColors.successDark,
  },
  achievedBadge: {
    backgroundColor: SemanticColors.successDark,
    paddingHorizontal: 10,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  achievedText: {
    fontSize: 11,
    fontWeight: '700',
    color: UIColors.white,
  },
  nextBadge: {
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: 10,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  nextText: {
    fontSize: 11,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  // 套用推薦碼區段
  applyCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: 20,
    shadowColor: UIColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  applyCardHint: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: Spacing.md,
  },
  applyInputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  applyInput: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    letterSpacing: 2,
    textAlign: 'center',
  },
  applyBtn: {
    backgroundColor: MibuBrand.brown,
    width: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: MibuBrand.tan,
  },
  // 邀請歷史列表
  referralsList: {
    gap: Spacing.sm,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.lg,
    padding: 14,
    shadowColor: UIColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.xl,
    backgroundColor: MibuBrand.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  referralAvatarText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  referralDate: {
    fontSize: FontSize.sm,
    color: MibuBrand.tan,
  },
  referralReward: {
    alignItems: 'flex-end',
  },
  referralXp: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: SemanticColors.successDark,
  },
  bottomSpacer: {
    height: BOTTOM_SPACER_HEIGHT,
  },
});

export default styles;
