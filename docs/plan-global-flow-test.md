# 計劃：全域用戶使用流程測試 + 資料流測試

> 建立日期：2026-02-27
> 狀態：已完成

## 背景
系統性檢查全 App 的用戶使用流程與資料流，找出斷點、缺失狀態、資料流錯誤。

## 測試範圍

### Phase 0：基礎建設檢查 ✅
- [x] TypeScript 編譯錯誤盤點 — 零錯誤
- [x] 共用套件版本確認 — @chaosmibu-blip/mibu-shared@1.0.10（最新）
- [x] 路由完整性檢查 — 修復 4 個問題：
  - 刪除孤兒路由 app/map.tsx（指向 CrowdfundingScreen，無人引用）
  - 刪除死碼 PlaceListScreen.tsx / CouponListScreen.tsx（無引用的重複 Screen）
  - 搬移 TypewriterText.tsx 從 screens/ 到 components/（位置不當）
  - 清理 merchant/index.ts 移除死碼 export

### Phase 1：認證流程 ✅（95/100）
- [x] 登入流程（Google/Apple/訪客 → Token → Context）— 完整
- [x] 登出流程（所有路徑 await setUser(null)，符合 #009 教訓）— 無競態條件
- [x] Token 過期處理（401 攔截 + 防重入旗標）— 堅牢
- [x] 角色切換（activeRole 追蹤 + 路由導向正確）— 完整
- [x] 帳號合併流程 → 已改為 #049 訪客自動升級 — 完整

### Phase 2：旅人核心流程 ✅
- [x] 首頁 — 修復：API 失敗時顯示 error banner + 點擊重試
- [x] 扭蛋 — 修復：扭蛋後重新檢查背包容量（checkInventoryCapacity）
- [x] 圖鑑 — 修復：#028 優惠更新徽章（promoUpdateBadge）顯示於卡片
- [x] 物品箱 — ✅ 核銷/景點包 UI 已在 ItemBoxScreen 完整實作（偵察誤報）
- [x] 行程規劃 — ✅ 100% 完整，無問題

### Phase 3：旅人支線流程 ✅（94/100）
- [x] 經濟系統 — ✅ 完整
- [x] 信箱系統 — ✅ 完整（分頁、領取、優惠碼、部分成功處理）
- [x] 通知系統 — ✅ 完整（樂觀已讀、勿擾時段、偏好設定）
- [x] 推薦好友 — ✅ 完整
- [x] 社群貢獻 — ✅ 完整
- [x] 募資活動 — ✅ 完整（含 IAP + test mode fallback）
- [x] SOS 緊急求助 — ✅ 完整
- [x] MINI 貓咪系統 — 修復：加入 RefreshControl
- [x] 個人資料 — 修復：加入 RefreshControl

### Phase 4：商家流程 ✅
- [x] 8 Screen 功能完整 — 修復：批量加入 ErrorState（6 Screen）
- [x] MerchantCoupons Modal maxHeight → height（#012 教訓）
- [x] MerchantPlaces error banner 改善

### Phase 5：專家流程 ✅
- [x] Dashboard + History + Profile — ✅ 完整
- [x] Tracking — 修復：WebSocket connectionError + reconnect
- [x] Travelers — 修復：遷移至 React Query（移除 useState+useEffect）

### Phase 6：管理員流程 ✅（技術債記錄）
- [x] Announcements + Exclusions — ✅ 完整
- [ ] ⏳ AdminDashboard 1418 行需拆分（技術債，暫不動）
- [ ] ⏳ 49 處 `as any` router casting（Expo Router 已知限制，暫不動）

### Phase 7：跨功能檢查 ✅
- [x] Loading / Error / Empty 狀態覆蓋率 — 修復：16 Screen 加入 ErrorState
- [x] 硬編碼值檢查（魔術數字、寫死的 URL）— 修復：8 檔案共 ~130 硬編碼色值改 Design Token
- [x] 導航完整性（所有 router.push 的目標路由都存在）— Phase 0 已修復
- [x] 資料流一致性 — 修復：LocationScreen 補 Authorization token（CRITICAL）+ SOSScreen 改用 useAuth()

#### Phase 7 修復清單：
1. **CRITICAL**：LocationScreen.tsx + LocationScreen.web.tsx — fetch 缺少 Authorization header → 加入 useAuth() + Bearer token
2. **HIGH**：16 Screen 加入 ErrorState（ContributionScreen、CrowdfundingScreen、CrowdfundingDetailScreen、EconomyScreen、ReferralScreen、ItemBoxScreen、NotificationListScreen、SettingsScreen、SOSScreen、SOSContactsScreen、NotificationPreferencesScreen、MerchantApplyScreen、PartnerApplyScreen、SpecialistDashboardScreen、SpecialistHistoryScreen、CouponFormScreen）
3. **MEDIUM**：8 檔案硬編碼色值改 Design Token（SpecialistProfileScreen、SpecialistHistoryScreen、SpecialistTravelersScreen、ItemBoxScreen、CrowdfundingScreen、ReferralScreen、ReferralScreen.styles、SOSScreen）+ 商家 2 檔修色（MerchantVerifyScreen、ClaimPlaceScreen）
4. **LOW**：SOSScreen — AsyncStorage.getItem(TOKEN) → useAuth().getToken()

## 輸出格式
每個 Phase 完成後輸出：
- 發現的問題清單（嚴重度：CRITICAL / HIGH / MEDIUM / LOW）
- 資料流圖（如有斷點）
- 建議修復方案
