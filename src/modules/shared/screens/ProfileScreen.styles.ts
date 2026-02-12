/**
 * ============================================================
 * ProfileScreen 樣式定義 (ProfileScreen.styles.ts)
 * ============================================================
 * 從 ProfileScreen.tsx 拆分出來的 StyleSheet，
 * 包含個人資料畫面的所有樣式（頭像 Modal 樣式除外）。
 *
 * 更新日期：2026-02-12（Phase 2C 拆分）
 */
import { StyleSheet, Platform } from 'react-native';
import { MibuBrand, UIColors } from '../../../../constants/Colors';

const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  // 載入狀態容器
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
  },
  // 頭像區塊
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: MibuBrand.creamLight,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: UIColors.white,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MibuBrand.copper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: MibuBrand.warmWhite,
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 13,
    color: MibuBrand.copper,
  },
  // 頂部導航列
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: MibuBrand.creamLight,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.cream,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  // 內容區
  content: {
    flex: 1,
    padding: 20,
  },
  // 欄位區塊
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.brownLight,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  // 輸入框
  input: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    color: MibuBrand.dark,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  // 唯讀欄位
  readOnlyField: {
    backgroundColor: MibuBrand.cream,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  readOnlyText: {
    fontSize: 16,
    color: MibuBrand.brownLight,
  },
  // 橫向排列
  row: {
    flexDirection: 'row',
  },
  // 選擇器按鈕
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  pickerText: {
    fontSize: 16,
    color: MibuBrand.dark,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: MibuBrand.tan,
  },
  // 選擇器選項
  pickerOptions: {
    marginTop: 8,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.cream,
  },
  pickerOptionActive: {
    backgroundColor: MibuBrand.highlight,
  },
  pickerOptionText: {
    fontSize: 16,
    color: MibuBrand.brownLight,
  },
  pickerOptionTextActive: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
  // 分隔線
  divider: {
    height: 1,
    backgroundColor: MibuBrand.cream,
    marginVertical: 24,
  },
  // 群組標題
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brown,
    marginBottom: 16,
  },
  // 【截圖 19】Toast 樣式
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: MibuBrand.brownDark,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600',
    color: UIColors.white,
    textAlign: 'center',
  },
});

export default styles;
