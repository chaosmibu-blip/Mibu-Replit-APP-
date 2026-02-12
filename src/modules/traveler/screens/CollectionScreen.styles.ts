/**
 * ============================================================
 * CollectionScreen.styles.ts
 * ============================================================
 * 圖鑑畫面的樣式定義
 *
 * 從 CollectionScreen.tsx 提取所有 inline styles
 * 集中管理，方便維護與複用
 *
 * 更新日期：2026-02-12（Phase 2E - 提取 StyleSheet）
 */
import { StyleSheet, Dimensions } from 'react-native';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';

// ============================================================
// 匯出常數（供元件邏輯使用）
// ============================================================

/** 網格卡片寬度（2 欄佈局） */
const screenWidth = Dimensions.get('window').width;
export const CARD_WIDTH = (screenWidth - Spacing.lg * 2 - Spacing.md) / 2;

// ============================================================
// 樣式定義
// ============================================================

const styles = StyleSheet.create({
  // ========== 共用容器 ==========

  /** SafeAreaView 根容器 */
  safeArea: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },

  /** 載入/錯誤/空狀態的居中容器 */
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: MibuBrand.warmWhite,
  },

  /** 載入中狀態的居中容器（多加 alignItems） */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
  },

  // ========== PlaceDetailModal ==========

  /** Modal 背景遮罩 */
  modalOverlay: {
    flex: 1,
    backgroundColor: UIColors.overlayLight,
    justifyContent: 'flex-end',
  },

  /** Modal 內容容器 */
  modalContent: {
    backgroundColor: MibuBrand.warmWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },

  /** Modal 頂部色塊區域 */
  modalHeader: {
    height: 120,
    position: 'relative',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  /** Modal 右上角按鈕區域 */
  modalTopRight: {
    position: 'absolute',
    top: 16,
    right: 16,
  },

  /** Modal 圓形按鈕（關閉/收藏/黑名單） */
  modalCircleButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** Modal 按鈕橫排容器 */
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },

  /** Modal 底部分類標籤 */
  modalCategoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  /** Modal 分類標籤文字 */
  modalCategoryText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /** Modal 內容滾動區域 */
  modalScrollContent: {
    padding: 20,
  },

  /** Modal 景點名稱 */
  modalPlaceName: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.dark,
    marginBottom: 8,
  },

  /** Modal 日期 + 地點列 */
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  /** Modal 日期/地點文字 */
  modalMetaText: {
    fontSize: 14,
    color: MibuBrand.brownLight,
  },

  /** Modal 分隔點 */
  modalMetaDot: {
    marginHorizontal: 8,
    color: MibuBrand.tanLight,
  },

  /** Modal 描述文字 */
  modalDescription: {
    fontSize: 16,
    color: MibuBrand.brownLight,
    lineHeight: 24,
    marginBottom: 20,
  },

  /** Modal 底部 Google 搜尋按鈕 */
  modalNavigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingVertical: 16,
    borderRadius: 16,
  },

  /** Modal 按鈕文字 */
  modalNavigateText: {
    fontSize: 16,
    fontWeight: '700',
    color: UIColors.white,
  },

  // ========== Header 區塊 ==========

  /** 標題列容器 */
  headerTitleContainer: {
    marginBottom: Spacing.xl,
  },

  /** 標題列（裝飾條 + 文字） */
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  /** 標題左側裝飾條 */
  headerAccentBar: {
    width: 4,
    height: 28,
    backgroundColor: MibuBrand.brown,
    borderRadius: 2,
  },

  /** 標題文字 */
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },

  // ========== 統計卡片 ==========

  /** 統計區塊容器 */
  statsCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: MibuBrand.brownDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  /** 統計項目容器 */
  statsItem: {
    alignItems: 'center',
  },

  /** 統計數字 - 已收集 */
  statsNumberBrown: {
    fontSize: 32,
    fontWeight: '800',
    color: MibuBrand.brown,
  },

  /** 統計數字 - 城市 */
  statsNumberCopper: {
    fontSize: 32,
    fontWeight: '800',
    color: MibuBrand.copper,
  },

  /** 統計數字 - 類別 */
  statsNumberTan: {
    fontSize: 32,
    fontWeight: '800',
    color: MibuBrand.tan,
  },

  /** 統計標籤文字 */
  statsLabel: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
    marginTop: 2,
  },

  /** 統計分隔線 */
  statsDivider: {
    width: 1,
    backgroundColor: MibuBrand.tanLight,
    marginVertical: Spacing.xs,
  },

  // ========== 搜尋框 ==========

  /** 搜尋框容器 */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    gap: Spacing.sm,
  },

  /** 搜尋輸入框 */
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
    padding: 0,
  },

  // ========== 麵包屑導航 ==========

  /** 麵包屑容器 */
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },

  /** 麵包屑：當前層級文字 */
  breadcrumbActive: {
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
    fontWeight: '700',
  },

  /** 麵包屑：可點擊的上層文字（非當前） */
  breadcrumbLink: {
    fontSize: FontSize.md,
    color: MibuBrand.brown,
    fontWeight: '500',
  },

  /** 麵包屑：最終層級文字（不可點） */
  breadcrumbCurrent: {
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
    fontWeight: '700',
  },

  // ========== Level 2 景點網格模式 ==========

  /** Level 2 外層容器 */
  gridModeContainer: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },

  /** Level 2 固定頂部區域 */
  gridFixedHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  /** 分類 Tab 橫向滾動容器 */
  categoryTabScroll: {
    marginBottom: Spacing.sm,
  },

  /** 分類 Tab 內容間距 */
  categoryTabContent: {
    gap: Spacing.sm,
  },

  /** 分類 Tab 按鈕（通用部分） */
  categoryTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },

  /** 分類 Tab 文字 */
  categoryTabText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  /** 全部已讀按鈕 */
  markAllReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },

  /** 全部已讀文字 */
  markAllReadText: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    fontWeight: '500',
  },

  /** FlatList 樣式 */
  gridList: {
    flex: 1,
  },

  /** FlatList 內容容器 */
  gridListContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  /** FlatList 欄間距 */
  gridColumnWrapper: {
    gap: Spacing.md,
  },

  /** FlatList 列間距 */
  gridRowSeparator: {
    height: Spacing.md,
  },

  // ========== ScrollView（非 Level 2） ==========

  /** ScrollView 樣式 */
  scrollView: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },

  /** ScrollView 內容容器 */
  scrollViewContent: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  // ========== 景點卡片（grid 模式） ==========

  /** 網格卡片容器 */
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
  },

  /** 網格卡片分類色條 */
  gridCardStripe: {
    height: 4,
  },

  /** 網格卡片內容區域 */
  gridCardBody: {
    padding: Spacing.md,
  },

  /** 網格卡片頂部行（未讀紅點 + 分類標籤） */
  gridCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },

  /** 未讀紅點 */
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MibuBrand.tierSP,
  },

  /** 分類標籤容器 */
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginLeft: 'auto',
  },

  /** 分類標籤文字 */
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  /** 網格卡片景點名稱 */
  gridCardName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.xs,
  },

  /** 網格卡片描述 */
  gridCardDescription: {
    fontSize: FontSize.xs,
    color: MibuBrand.brownLight,
    lineHeight: 16,
  },

  /** 網格卡片地區 */
  gridCardDistrict: {
    fontSize: FontSize.xs,
    color: MibuBrand.copper,
    marginTop: Spacing.xs,
  },

  // ========== 景點卡片（list 模式，搜尋結果用） ==========

  /** 列表卡片容器 */
  listCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
  },

  /** 列表卡片頂部行（日期 + 分類） */
  listCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  /** 列表卡片日期 */
  listCardDate: {
    fontSize: FontSize.xs,
    color: MibuBrand.brownLight,
  },

  /** 列表卡片分類標籤 */
  listCardBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },

  /** 列表卡片分類標籤文字 */
  listCardBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  /** 列表卡片景點名稱 */
  listCardName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },

  /** 列表卡片描述 */
  listCardDescription: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
    lineHeight: 20,
  },

  /** 列表卡片城市 */
  listCardCity: {
    fontSize: FontSize.xs,
    color: MibuBrand.copper,
    marginTop: Spacing.xs,
  },

  // ========== 搜尋結果 ==========

  /** 搜尋結果計數文字 */
  searchResultCount: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
    marginBottom: Spacing.md,
  },

  /** 搜尋結果空狀態容器 */
  searchEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },

  /** 搜尋結果空狀態文字 */
  searchEmptyText: {
    fontSize: FontSize.md,
    color: MibuBrand.brownLight,
    marginTop: Spacing.md,
  },

  /** 搜尋結果列表容器 */
  searchResultList: {
    gap: Spacing.md,
  },

  // ========== Level 0：國家列表 ==========

  /** 國家/城市列表容器 */
  levelListContainer: {
    gap: Spacing.md,
  },

  /** 國家/城市卡片 */
  levelCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },

  /** 國家/城市卡片左側（圖示+文字） */
  levelCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  /** 國家圖示容器（含未讀紅點的 relative 容器） */
  levelIconWrapper: {
    position: 'relative',
  },

  /** 國家圖示背景 */
  countryIcon: {
    width: 44,
    height: 44,
    backgroundColor: MibuBrand.cream,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** 國家未讀紅點 */
  countryUnreadDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    backgroundColor: MibuBrand.tierSP,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: MibuBrand.warmWhite,
  },

  /** 國家名稱 */
  countryName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },

  /** 國家次要資訊 */
  countrySubtext: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
  },

  // ========== Level 1：城市列表 ==========

  /** Level 1 全部已讀按鈕（多了水平 padding） */
  markAllReadButtonLevel1: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },

  /** 城市圖示背景 */
  cityIcon: {
    width: 40,
    height: 40,
    backgroundColor: MibuBrand.cream,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** 城市首字母文字 */
  cityInitial: {
    color: MibuBrand.copper,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },

  /** 城市未讀紅點 */
  cityUnreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: MibuBrand.tierSP,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: MibuBrand.warmWhite,
  },

  /** 城市名稱 */
  cityName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },

  /** 城市次要資訊 */
  citySubtext: {
    fontSize: FontSize.xs,
    color: MibuBrand.brownLight,
  },
});

export default styles;
