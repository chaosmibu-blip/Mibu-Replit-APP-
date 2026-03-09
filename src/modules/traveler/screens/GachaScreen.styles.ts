/**
 * ============================================================
 * GachaScreen 樣式表 (GachaScreen.styles.ts)
 * ============================================================
 * 從 GachaScreen.tsx 拆出的 StyleSheet，提升可維護性。
 *
 * 樣式分類：
 * - 主畫面：ScrollView 容器、Logo 區
 * - 選擇區域卡片：國家/城市選擇
 * - 抽取張數卡片：Slider 區、Tooltip
 * - 道具箱警告：已滿 / 快滿
 * - 開始扭蛋按鈕
 * - 獎池預覽 Modal：標題列、優惠券列表、空狀態
 *
 * 更新日期：2026-03-09（Design Token 標準化）
 */
import { StyleSheet, Dimensions } from 'react-native';
import { MibuBrand, SemanticColors, UIColors, RoleColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';

// 螢幕寬度（用於計算獎池項目寬度）
export const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  // ===== 主畫面 =====
  scrollView: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  scrollContent: {
    padding: 20,
  },

  // ===== 頂部 Logo 區 =====
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: MibuBrand.brown,
    letterSpacing: 3,
  },
  logoSubtitle: {
    fontSize: 15,
    color: MibuBrand.brownLight,
    marginTop: 6,
    fontWeight: '500',
  },

  // ===== 選擇區域卡片 =====
  sectionCard: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitleText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brown,
    marginLeft: Spacing.sm,
  },
  regionSelectWrapper: {
    marginTop: Spacing.md,
  },

  // ===== 抽取張數卡片 =====
  pullCountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pullCountLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  pullCountLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  infoButton: {
    marginLeft: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: MibuBrand.tan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: MibuBrand.warmWhite,
  },
  /** Tooltip（淡入淡出）— 顯示在標題行上方 */
  infoTooltip: {
    position: 'absolute',
    left: 0,
    // bottom: '100%' 需要在 inline style 中處理（StyleSheet 不支援百分比 bottom）
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    zIndex: 10,
    minWidth: 180,
  },
  infoTooltipText: {
    fontSize: 13,
    color: UIColors.white,
    fontWeight: '500',
  },
  pullCountValue: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },
  pullCountUnit: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderContainer: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  sliderLabelText: {
    fontSize: 13,
    color: MibuBrand.tan,
  },

  // ===== 道具箱已滿警告 =====
  inventoryFullWarning: {
    backgroundColor: SemanticColors.errorLight,
    borderRadius: Radius.xl,
    padding: 18,
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SemanticColors.errorLight,
  },
  inventoryFullIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SemanticColors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inventoryFullTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  inventoryFullTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SemanticColors.errorDark,
  },
  inventoryFullDesc: {
    fontSize: 13,
    color: SemanticColors.errorDark,
    marginTop: 2,
  },
  inventoryFullButton: {
    backgroundColor: SemanticColors.errorDark,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  inventoryFullButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: UIColors.white,
  },

  // ===== 道具箱快滿提醒 =====
  inventoryAlmostFull: {
    backgroundColor: MibuBrand.highlight,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inventoryAlmostFullText: {
    fontSize: FontSize.md,
    color: MibuBrand.brown,
    marginLeft: 10,
    flex: 1,
  },

  // ===== 開始扭蛋按鈕 =====
  gachaButton: {
    borderRadius: Radius.xxl,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  gachaButtonEnabled: {
    backgroundColor: MibuBrand.brown,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  gachaButtonDisabled: {
    backgroundColor: MibuBrand.cream,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0,
    shadowRadius: 16,
    elevation: 0,
  },
  gachaButtonText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  gachaButtonTextEnabled: {
    color: MibuBrand.warmWhite,
  },
  gachaButtonTextDisabled: {
    color: MibuBrand.brownLight,
  },

  // ===== 獎池預覽 Modal =====
  poolModalOverlay: {
    flex: 1,
    backgroundColor: UIColors.overlayMedium,
    justifyContent: 'flex-end',
  },
  poolModalContainer: {
    backgroundColor: UIColors.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    maxHeight: '85%',
    minHeight: '60%',
  },
  poolModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.creamLight,
  },
  poolModalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: MibuBrand.dark,
  },
  poolModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.lg,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ===== Modal 載入中 =====
  poolLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  poolLoadingText: {
    marginTop: Spacing.lg,
    color: MibuBrand.tan,
    fontSize: FontSize.md,
  },

  // ===== Modal 內容 =====
  poolScrollView: {
    flex: 1,
  },
  poolContentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
  poolRegionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  poolRegionText: {
    fontSize: 13,
    color: '#6366f1',
    marginLeft: 6,
    fontWeight: '600',
  },
  poolSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  poolSectionTitleText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: SemanticColors.warningDark,
    marginLeft: 6,
  },

  // ===== 獎品池優惠券卡片 =====
  prizeCouponCard: {
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
  },
  prizeCouponCardSP: {
    backgroundColor: SemanticColors.starBg,
    borderColor: SemanticColors.starYellow,
  },
  prizeCouponCardOther: {
    backgroundColor: '#ddd6fe',
    borderColor: '#8b5cf6',
  },
  prizeCouponBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  prizeCouponBadgeSP: {
    backgroundColor: SemanticColors.starYellow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  prizeCouponBadgeOther: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  prizeCouponBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: UIColors.white,
  },
  prizeCouponTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: MibuBrand.dark,
    marginBottom: Spacing.xs,
  },
  prizeCouponLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prizeCouponLocationText: {
    fontSize: 11,
    color: MibuBrand.tan,
    marginLeft: Spacing.xs,
    flexShrink: 1,
  },

  // ===== 區域優惠券卡片 =====
  regionCouponCardSSR: {
    backgroundColor: SemanticColors.starBg,
    borderColor: '#fbbf24',
  },
  regionCouponCardOther: {
    backgroundColor: RoleColors.specialist.light,
    borderColor: '#a855f7',
  },
  regionCouponBadgeSSR: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  regionCouponBadgeOther: {
    backgroundColor: '#a855f7',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  regionCouponDiscountBadge: {
    backgroundColor: SemanticColors.errorDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  regionCouponDiscountText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: UIColors.white,
  },
  regionCouponTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: MibuBrand.dark,
    marginBottom: 2,
  },
  regionCouponMerchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionCouponMerchantText: {
    fontSize: 11,
    color: MibuBrand.tan,
    marginLeft: Spacing.xs,
    flexShrink: 1,
  },

  // ===== Modal 空狀態 =====
  poolEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  poolEmptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SemanticColors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  poolEmptyText: {
    fontSize: FontSize.md,
    color: MibuBrand.tan,
    textAlign: 'center',
  },

  // ===== 獎池項目卡片（renderPoolItem）=====
  poolItemCard: {
    backgroundColor: UIColors.white,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    marginHorizontal: 6,
    overflow: 'hidden',
    borderWidth: 2,
  },
  poolItemImagePlaceholder: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolItemImage: {
    width: '100%',
    height: 100,
  },
  poolItemInfoContainer: {
    padding: Spacing.md,
  },
  poolItemRarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  poolItemRarityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginRight: 6,
  },
  poolItemRarityText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  poolItemCategoryText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  poolItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: MibuBrand.dark,
  },
  poolItemMerchantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: SemanticColors.starBg,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  poolItemMerchantText: {
    fontSize: FontSize.xs,
    color: SemanticColors.warningDark,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
});

export default styles;
