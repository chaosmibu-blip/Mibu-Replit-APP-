# 計劃：#074 商家後台完整重做

> 建立日期：2026-03-10
> 狀態：確認待執行

## 背景

APP 端目前的商家後台呼叫了多個不存在或路徑錯誤的端點，導致全面性故障。
需丟掉現有商家後台的所有實作，完全依照後端 #074 規格重做。

## 影響範圍

- 型別定義：`src/types/merchant.ts`
- API 服務：`src/services/merchantApi.ts`
- React Query Hooks：`src/hooks/useMerchantQueries.ts`
- 畫面（重寫 6 個，刪除 3 個）
- 路由（刪除多餘路由，新增缺少的）
- 翻譯（4 語系）

## Phase 分解

### Phase 0：基礎建設（型別 + API + Hooks）
**不改不行的，後續所有畫面都依賴這些**

1. **重寫 `src/types/merchant.ts`** — 對齊 #074 全部 23 個 API 的請求/回應型別
   - 刪除不存在的型別：MerchantCredits、MerchantProduct、MerchantTransaction
   - 新增缺少的型別：MerchantPermissions、MerchantSubscription、RedemptionHistory、RedemptionStats、MerchantAnalyticsSummary
   - 修正欄位名：businessName（非 name）、MerchantPlace 欄位對齊

2. **重寫 `src/services/merchantApi.ts`** — 全部 23 個 API 端點
   - 修正路徑（優惠券 `/api/coupons/...`、核銷記錄 `/api/merchant/redemption-history`）
   - 刪除不存在的 API（credits、products、transactions）
   - 新增缺少的 API（permissions、subscription、redemption-history、resolve-url、places/new）

3. **重寫 `src/hooks/useMerchantQueries.ts`** — 全部 React Query hooks
   - 刪除不存在的 hooks（useMerchantCredits、usePurchaseCredits、useMerchantProducts 等）
   - 新增缺少的 hooks（useMerchantPermissions、useMerchantSubscription、useRedemptionHistory 等）
   - 確保 error 處理區分 403 類型

4. **審查 + tsc 驗證**

### Phase 1：商家首頁 + 初始化流程
**用戶進入商家後台的第一個畫面**

1. **重寫 `MerchantDashboardScreen.tsx`** — 三態顯示（pending/approved/rejected）
   - pending：審核中卡片 + 四宮格（鎖定 3 個 + 商家資料可進）
   - approved：核銷碼 + 方案 + 四宮格（全開放）
   - rejected：拒絕原因 + 重新申請按鈕
   - 初始化流程：GET /me → 根據狀態分流

2. **修正路由 `app/merchant-dashboard.tsx`**

3. **審查 + tsc 驗證**

### Phase 2：商家申請問卷（畫面 F）
**新用戶 / 重新申請者的入口**

1. **重寫 `MerchantApplyScreen.tsx`** — 4 段 12 題分步表單
   - 第一段：基本資料（Q1-Q4）
   - 第二段：經營現況（Q5-Q8）
   - 第三段：合作意願（Q9-Q10）
   - 第四段：聯絡方式 + 店家綁定 + 送出（Q11-Q12 + 綁定）
   - 店家綁定三模式：搜尋系統景點、Google Maps 連結、手動輸入
   - 預帶 displayName → Q1、email → Q12
   - 組裝 POST /api/merchant/apply 送出

2. **審查 + tsc 驗證**

### Phase 3：數據分析（畫面 B）+ 店家管理（畫面 C）

1. **重寫 `MerchantAnalyticsScreen.tsx`**
   - 時間篩選（7d/30d/90d/all）
   - 店家篩選
   - 四格摘要卡片
   - 趨勢折線圖
   - 熱門優惠券排行
   - 各店家分佈
   - 403 處理：區分審核中 vs 方案限制

2. **重寫 `MerchantPlacesScreen.tsx`**
   - 已認領景點列表
   - +新增按鈕 → 三種模式
   - 單一景點詳情（點進可編輯）

3. **整合子畫面**：ClaimPlaceScreen、NewPlaceScreen、PlaceEditScreen

4. **審查 + tsc 驗證**

### Phase 4：優惠券管理（畫面 D）+ 商家資料（畫面 E）

1. **重寫 `MerchantCouponsScreen.tsx`**
   - 列表：稀有度、剩餘數量、啟用狀態
   - +新增 / 編輯 / 刪除
   - ⚠️ 路徑 `/api/coupons/...`

2. **重寫 `MerchantProfileScreen.tsx`**
   - businessName、email、方案、加入時間
   - 訂閱管理（升級按鈕）
   - 危險區域（刪除帳號）

3. **審查 + tsc 驗證**

### Phase 5：清理 + 錯誤處理 + 收尾

1. **刪除多餘檔案**：
   - `MerchantProductsScreen.tsx` + `app/merchant/products.tsx`
   - `MerchantTransactionsScreen.tsx` + `app/merchant/transactions.tsx`
   - `MerchantVerifyScreen.tsx` + `app/merchant/verify.tsx`
   - `app/merchant-register.tsx`、`app/register-merchant.tsx`

2. **統一錯誤處理**（403 區分、401 導登入）

3. **更新路由 `app/merchant/_layout.tsx`**

4. **更新翻譯（4 語系）**

5. **更新 memory 文件**

6. **最終 tsc 驗證 + 全面審查**

## 注意事項

- 不實作點數/餘額/充值相關功能（專案採訂閱制）
- 優惠券 API 路徑前綴是 `/api/coupons`，不是 `/api/merchant/coupons`
- 商家 ID 欄位是 `businessName`，不是 `name`
- 403 絕不顯示為「載入失敗」，要區分業務限制
- `@chaosmibu-blip/mibu-shared` 目前未安裝（token 過期），型別先在本地定義
