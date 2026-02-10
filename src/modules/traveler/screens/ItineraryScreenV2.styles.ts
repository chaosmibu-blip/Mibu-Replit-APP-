/**
 * ============================================================
 * ItineraryScreenV2 樣式表 (ItineraryScreenV2.styles.ts)
 * ============================================================
 * 從 ItineraryScreenV2.tsx 拆出的 StyleSheet，提升可維護性。
 *
 * 樣式分類：
 * - Empty/Loading States：空狀態、載入中
 * - 主畫面：Header、Chat Area、Input Area
 * - Messages：對話氣泡
 * - Drawer：左右抽屜共用 + 各自專用
 * - Place Cards：景點卡片（右抽屜）
 * - Add Places Modal：從圖鑑加入景點
 * - Create Modal：建立行程表單
 * - Toast / Tooltip：通知提示
 *
 * 更新日期：2026-02-10（從主檔拆出）
 */
import { StyleSheet, Dimensions } from 'react-native';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize, Shadow } from '../../../theme/designTokens';

// 螢幕寬度
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 抽屜寬度（螢幕的 88%）
export const DRAWER_WIDTH = SCREEN_WIDTH * 0.88;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },

  // ===== Empty/Loading States =====
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.creamLight,
    padding: Spacing.xl,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: MibuBrand.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyTipsCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    width: '100%',
    maxWidth: 280,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  emptyTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyTipText: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
    flex: 1,
  },
  emptyCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyCreateButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    marginTop: Spacing.lg,
  },
  loginButton: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.xl,
  },
  loginButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },

  // ===== 主畫面 =====
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  // 【截圖 9-15 #12】標題列（含編輯圖示）
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    letterSpacing: -0.3,
  },
  // 【截圖 9-15 #12】標題編輯輸入框
  titleEditContainer: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  titleEditInput: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    textAlign: 'center',
    minWidth: 120,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  itineraryBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  itineraryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },

  // ===== Chat Area =====
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingLeft: 0,
    paddingRight: Spacing.sm,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  welcomeCard: {
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.xl,
    position: 'relative',
    ...Shadow.md,
  },
  // 【截圖 9】左上角說明按鈕
  helpButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
  },

  // ===== Messages =====
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginRight: 0,
  },
  avatarIcon: {
    width: '100%',
    height: '100%',
  },
  /** Mini 頭像放大預覽 - 半透黑背景 */
  avatarPreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  /** Mini 頭像放大預覽 - 內容容器 */
  avatarPreviewContainer: {
    alignItems: 'center',
  },
  /** Mini 頭像放大預覽 - 名稱 */
  avatarPreviewName: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: Spacing.md,
  },
  /** Mini 頭像放大預覽 - 大圖 */
  avatarPreviewImage: {
    width: 256,
    height: 256,
    borderRadius: 128,
  },
  /** Mini 頭像放大預覽 - 右下角儲存按鈕 */
  avatarSaveButton: {
    position: 'absolute',
    bottom: 48,
    right: 32,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  userBubble: {
    backgroundColor: MibuBrand.brown,
    borderBottomRightRadius: Radius.xs,
  },
  assistantBubble: {
    backgroundColor: MibuBrand.warmWhite,
    borderBottomLeftRadius: Radius.xs,
    ...Shadow.sm,
  },
  messageText: {
    fontSize: FontSize.md,
    lineHeight: 22,
    color: MibuBrand.brownDark,
  },
  userMessageText: {
    color: MibuBrand.warmWhite,
  },

  // ===== AI Suggestions (已移除 UI，保留樣式供未來使用) =====

  // ===== Input Area =====
  inputArea: {
    backgroundColor: MibuBrand.warmWhite,
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.xl,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: MibuBrand.tanLight,
  },

  // ===== Drawer Common =====
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: MibuBrand.warmWhite,
    zIndex: 100,
    ...Shadow.lg,
  },
  leftDrawer: {
    left: 0,
    borderTopRightRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  rightDrawer: {
    right: 0,
    borderTopLeftRadius: Radius.xxl,
    borderBottomLeftRadius: Radius.xxl,
  },
  drawerInner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  drawerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    letterSpacing: -0.5,
  },
  drawerSubtitle: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginTop: Spacing.xs,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 【截圖 9-15 #2】Drawer header actions
  drawerHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectModeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.xs,
  },
  selectModeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  // 【截圖 9-15 #2】批量刪除按鈕
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.error,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  deleteSelectedText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
    marginLeft: Spacing.xs,
  },
  // 【截圖 9-15 #2】行程勾選框
  tripCheckbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  tripCheckboxSelected: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  tripCardSelectMode: {
    flex: 1,
  },
  drawerScroll: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(90, 56, 32, 0.4)',
    zIndex: 50,
  },

  // ===== Trip List (Left Drawer) =====
  tripCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tripCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  tripDeleteButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  tripCardActive: {
    backgroundColor: MibuBrand.highlight,
    borderWidth: 2,
    borderColor: MibuBrand.brown,
  },
  tripIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: MibuBrand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  tripInfo: {
    flex: 1,
  },
  tripTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  tripTitleActive: {
    color: MibuBrand.brown,
    fontWeight: '700',
  },
  tripMeta: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  tripBadgeRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  tripCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  tripCountText: {
    fontSize: FontSize.xs,
    color: MibuBrand.copper,
    marginLeft: 4,
  },
  activeIndicator: {
    marginLeft: Spacing.sm,
  },
  addTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    borderStyle: 'dashed',
    marginTop: Spacing.md,
  },
  addTripText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brown,
    marginLeft: Spacing.sm,
  },

  // ===== Place Cards (Right Drawer) - 對齊扭蛋卡片樣式 =====
  placeCard: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16, // 對齊扭蛋卡片
    marginBottom: 12, // 對齊扭蛋卡片
    overflow: 'hidden',
    // 對齊扭蛋卡片陰影
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  // 【截圖 9-15 #9】拖曳時的卡片樣式
  placeCardDragging: {
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  placeStripe: {
    width: 4, // 對齊扭蛋卡片（從 5 改為 4）
  },
  reorderButtonsContainer: {
    width: 32,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButton: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButtonDisabled: {
    opacity: 0.4,
  },
  placeContent: {
    flex: 1,
    padding: 20, // 對齊扭蛋卡片（從 Spacing.lg 改為 20）
    position: 'relative',
  },
  // 【截圖 9-15 #11】右上角刪除按鈕
  placeDeleteX: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  placeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 12, // 對齊扭蛋卡片
    flexWrap: 'wrap',
    gap: 8,
  },
  // 【對齊扭蛋】時間預估 badge
  placeDurationBadge: {
    backgroundColor: MibuBrand.creamLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  placeDurationText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  placeOrderBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },
  placeCategoryBadge: {
    paddingHorizontal: 12, // 對齊扭蛋卡片
    paddingVertical: 5, // 對齊扭蛋卡片
    borderRadius: 12, // 對齊扭蛋卡片
  },
  placeCategoryText: {
    fontSize: 12, // 對齊扭蛋卡片
    fontWeight: '600',
  },
  placeName: {
    fontSize: 20, // 對齊扭蛋卡片（從 16 改為 20）
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 8, // 對齊扭蛋卡片
    letterSpacing: -0.3,
  },
  placeDescription: {
    fontSize: 14, // 對齊扭蛋卡片（從 12 改為 14）
    color: MibuBrand.brownLight,
    lineHeight: 22, // 對齊扭蛋卡片
    marginBottom: 16, // 對齊扭蛋卡片
  },
  // 【對齊扭蛋】地圖按鈕樣式
  placeMapButton: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeMapButtonDisabled: {
    opacity: 0.5,
  },
  placeMapText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginLeft: 6,
  },
  // 舊的 placeActions 保留以防其他地方使用
  placeActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
  placeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  placeActionDisabled: {
    opacity: 0.5,
  },
  placeActionText: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginLeft: 4,
  },
  emptyPlaces: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyPlacesText: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 22,
  },
  addFromCollectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: MibuBrand.highlight,
    marginTop: Spacing.md,
  },
  addFromCollectionText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brown,
    marginLeft: Spacing.sm,
  },

  // ===== Add Places Modal =====
  modalContainer: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.warmWhite,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  modalConfirmButton: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  modalConfirmButtonDisabled: {
    backgroundColor: MibuBrand.tanLight,
  },
  modalConfirmText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
  modalLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingText: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    marginTop: Spacing.md,
  },
  modalEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalEmptyText: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 22,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  // 【截圖 9-15 #7】搜索輸入框
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
    marginLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  modalCategorySection: {
    marginBottom: Spacing.md,
  },
  modalCategoryTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  // 【截圖 9-15 #6】手風琴樣式
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Shadow.sm,
  },
  accordionHeaderExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionStripe: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  accordionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    flex: 1,
  },
  accordionCountBadge: {
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginRight: Spacing.md,
  },
  accordionCountText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  accordionContent: {
    backgroundColor: MibuBrand.warmWhite,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    maxHeight: 300,
    paddingVertical: Spacing.sm,
  },
  accordionMoreText: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    textAlign: 'center',
    paddingVertical: Spacing.md,
    fontStyle: 'italic',
  },
  modalPlaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  modalPlaceItemSelected: {
    borderWidth: 2,
    borderColor: MibuBrand.brown,
  },
  modalPlaceStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  modalPlaceInfo: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  modalPlaceName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  modalPlaceNameEn: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  modalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    marginRight: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCheckboxSelected: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },

  // ===== Create Modal（方案 A 卡片式）=====
  createModalContainer: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  createModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  createModalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  createCardScroll: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  createCard: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  createFieldGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  createFieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MibuBrand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  createFieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginBottom: Spacing.xs,
  },
  createFieldInput: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  createDivider: {
    height: 1,
    backgroundColor: MibuBrand.tanLight,
    marginVertical: Spacing.lg,
  },
  createLocationRow: {
    flexDirection: 'row',
  },
  createBottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: MibuBrand.warmWhite,
  },
  createBottomButton: {
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createBottomButtonDisabled: {
    backgroundColor: MibuBrand.tanLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  createBottomButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },
  // 相容舊 style 引用
  createInputLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  createInput: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  createLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  createLoadingText: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginLeft: Spacing.sm,
  },
  createChipScroll: {
    maxHeight: 50,
  },
  createChipContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  createChip: {
    backgroundColor: MibuBrand.warmWhite,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  createChipSelected: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  createChipText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: MibuBrand.brownDark,
  },
  createChipTextSelected: {
    color: MibuBrand.warmWhite,
  },

  // ===== 【截圖 9】使用說明 Tooltip 樣式（淡入淡出） =====
  helpTooltip: {
    backgroundColor: 'rgba(128, 128, 128, 0.5)',  // 灰色 50% 透明度
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  helpTooltipText: {
    fontSize: FontSize.sm,
    color: UIColors.white,  // 白色文字
    lineHeight: 20,
    textAlign: 'center',
  },

  // ===== Toast 通知樣式（參考扭蛋說明風格） =====
  toastContainer: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: 'rgba(128, 128, 128, 0.5)',  // 灰色半透明（同扭蛋說明）
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: UIColors.white,
    textAlign: 'center',
  },
});

export default styles;
