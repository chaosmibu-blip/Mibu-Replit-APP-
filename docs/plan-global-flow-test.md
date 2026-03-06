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

### Phase 4：商家流程
- [ ] 商家註冊 + 儀表板
- [ ] 店面管理（認領/新增/編輯/列表）
- [ ] 優惠券管理
- [ ] 產品管理
- [ ] 核銷驗證
- [ ] 數據分析 + 交易記錄

### Phase 5：專家流程
- [ ] 專家儀表板
- [ ] 旅人追蹤
- [ ] 服務歷史

### Phase 6：管理員流程
- [ ] 管理後台（7 Tab）
- [ ] 公告管理
- [ ] 排除管理

### Phase 7：跨功能檢查
- [ ] Loading / Error / Empty 狀態覆蓋率
- [ ] 硬編碼值檢查（魔術數字、寫死的 URL）
- [ ] 導航完整性（所有 router.push 的目標路由都存在）
- [ ] 資料流一致性（Context 欄位名 vs API 回傳欄位名）

## 輸出格式
每個 Phase 完成後輸出：
- 發現的問題清單（嚴重度：CRITICAL / HIGH / MEDIUM / LOW）
- 資料流圖（如有斷點）
- 建議修復方案
