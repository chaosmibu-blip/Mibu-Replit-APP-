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

### Phase 1：認證流程
- [ ] 登入流程（Apple OAuth → Token → Context）
- [ ] 登出流程（清理 Token + State + AsyncStorage → 重導登入）
- [ ] Token 過期處理（401 攔截 → 重新登入）
- [ ] 角色切換（user/merchant/specialist/admin）
- [ ] 帳號合併流程

### Phase 2：旅人核心流程
- [ ] 首頁（等級卡 + 每日任務 + 活動公告）資料流
- [ ] 扭蛋流程（選國家 → 選城市 → 扭蛋 → 結果展示 → 收藏）
- [ ] 圖鑑/收藏庫（分類瀏覽 + 搜尋 + PlaceDetailModal + 塗鴉牆 + 筆記）
- [ ] 物品箱（容量管理 + 使用/刪除道具）
- [ ] 行程規劃（建立 → 編輯 → AI 對話 → 定位）

### Phase 3：旅人支線流程
- [ ] 經濟系統（等級/經驗/成就/每日任務）
- [ ] 信箱系統（獎勵列表 + 領取）
- [ ] 通知系統（紅點 + 列表 + 已讀 + 偏好設定）
- [ ] 推薦好友
- [ ] 社群貢獻
- [ ] 募資活動
- [ ] SOS 緊急求助
- [ ] MINI 貓咪系統（Profile + 塗鴉牆 + 筆記）
- [ ] 個人資料（頭像 + 名稱編輯）

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
