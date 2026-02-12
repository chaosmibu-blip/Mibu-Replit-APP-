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
 * 更新日期：2026-02-12（從主檔拆出）
 */
import { StyleSheet, Dimensions } from 'react-native';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

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
    paddingTop: 60,
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
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
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brown,
    marginLeft: 8,
  },
  regionSelectWrapper: {
    marginTop: 12,
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
    fontSize: 12,
    fontWeight: '800',
    color: MibuBrand.warmWhite,
  },
  /** Tooltip（淡入淡出）— 顯示在標題行上方 */
  infoTooltip: {
    position: 'absolute',
    left: 0,
    // bottom: '100%' 需要在 inline style 中處理（StyleSheet 不支援百分比 bottom）
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 10,
    minWidth: 180,
  },
  infoTooltipText: {
    fontSize: 13,
    color: UIColors.white,
    fontWeight: '500',
  },
  pullCountValue: {
    fontSize: 28,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },
  pullCountUnit: {
    fontSize: 16,
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
    marginTop: 4,
    paddingHorizontal: 4,
  },
  sliderLabelText: {
    fontSize: 13,
    color: MibuBrand.tan,
  },

  // ===== 道具箱已滿警告 =====
  inventoryFullWarning: {
    backgroundColor: SemanticColors.errorLight,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
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
    marginLeft: 12,
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
    paddingVertical: 8,
    borderRadius: 12,
  },
  inventoryFullButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: UIColors.white,
  },

  // ===== 道具箱快滿提醒 =====
  inventoryAlmostFull: {
    backgroundColor: MibuBrand.highlight,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inventoryAlmostFullText: {
    fontSize: 14,
    color: MibuBrand.brown,
    marginLeft: 10,
    flex: 1,
  },

  // ===== 開始扭蛋按鈕 =====
  gachaButton: {
    borderRadius: 24,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '60%',
  },
  poolModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.creamLight,
  },
  poolModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: MibuBrand.dark,
  },
  poolModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    marginTop: 16,
    color: MibuBrand.tan,
    fontSize: 14,
  },

  // ===== Modal 內容 =====
  poolScrollView: {
    flex: 1,
  },
  poolContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  poolRegionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 12,
  },
  poolSectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: SemanticColors.warningDark,
    marginLeft: 6,
  },

  // ===== 獎品池優惠券卡片 =====
  prizeCouponCard: {
    borderRadius: 12,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  prizeCouponBadgeOther: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  prizeCouponBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: UIColors.white,
  },
  prizeCouponTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.dark,
    marginBottom: 4,
  },
  prizeCouponLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prizeCouponLocationText: {
    fontSize: 11,
    color: MibuBrand.tan,
    marginLeft: 4,
    flexShrink: 1,
  },

  // ===== 區域優惠券卡片 =====
  regionCouponCardSSR: {
    backgroundColor: SemanticColors.starBg,
    borderColor: '#fbbf24',
  },
  regionCouponCardOther: {
    backgroundColor: '#f3e8ff',
    borderColor: '#a855f7',
  },
  regionCouponBadgeSSR: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  regionCouponBadgeOther: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  regionCouponDiscountBadge: {
    backgroundColor: SemanticColors.errorDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  regionCouponDiscountText: {
    fontSize: 10,
    fontWeight: '700',
    color: UIColors.white,
  },
  regionCouponTitle: {
    fontSize: 14,
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
    marginLeft: 4,
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
    marginBottom: 16,
  },
  poolEmptyText: {
    fontSize: 14,
    color: MibuBrand.tan,
    textAlign: 'center',
  },

  // ===== 獎池項目卡片（renderPoolItem）=====
  poolItemCard: {
    backgroundColor: UIColors.white,
    borderRadius: 16,
    marginBottom: 12,
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
    padding: 12,
  },
  poolItemRarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  poolItemRarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  poolItemRarityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  poolItemCategoryText: {
    fontSize: 10,
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
    fontSize: 10,
    color: SemanticColors.warningDark,
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default styles;
