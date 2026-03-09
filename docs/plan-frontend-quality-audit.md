# 前端程式碼品質健檢報告

> 建立日期：2026-03-09
> 掃描範圍：16 個畫面 + 10 個服務/hooks 檔案（約 70,000 行）
> 掃描面向：8 大品質維度

---

## 掃描範圍總覽

| Phase | 掃描對象 | 檔案數 |
|-------|---------|--------|
| Phase 1 | ItineraryScreenV2, GachaScreen, CollectionScreen, HomeScreen, Login | 5 + styles |
| Phase 2 | ItemBoxScreen, EconomyScreen, ContributionScreen, ProfileScreen, SettingsScreen | 5 + styles |
| Phase 3 | AdminDashboard, AdminAnnouncements, MerchantCoupons, MerchantAnalytics, MerchantPlaces, SpecialistDashboard | 6 |
| Phase 4 | api.ts, base.ts, commonApi.ts, gachaApi.ts, collectionApi.ts, itineraryApi.ts, useHomeQueries, useCollectionQueries, useInventoryQueries, QueryProvider | 10 |

---

## 一、架構級問題（影響全專案）

### A1. Service 層吞掉錯誤，React Query error 狀態完全失效 ⚠️ 最高優先

**嚴重度：高 | 影響：全專案所有 API 呼叫**

幾乎所有 service 方法都 catch 錯誤後回傳 `{ success: false, ... }`，導致：
- React Query 的 `isError` 永遠 false（Promise 永遠 resolve）
- hooks 的 `error`、`retry` 全部失效
- 用戶無法區分「真的沒資料」和「API 掛了」
- `base.ts` 設計的 `ApiError`（含 status、serverMessage）全被吃掉

**影響檔案**：`itineraryApi.ts`（10+ 處）、`collectionApi.ts`（3 處）、`gachaApi.ts`（1 處）、`commonApi.ts`（1+ 處）

**修復方向**：移除 service 層的 try/catch，讓錯誤冒泡到 React Query 統一處理。

---

### A2. 核心畫面未使用 React Query，與專案模式不一致

**嚴重度：高 | 影響：3 個最重要畫面**

| 畫面 | 行數 | 問題 |
|------|------|------|
| ItineraryScreenV2 | 1843 | 全部用 useState + useEffect + useRef 手動快取 |
| GachaScreen | 1233 | 全部用 useState + useEffect，無快取、無重試、無去重 |
| ProfileScreen | 736 | 用 useEffect + 手動 fetch |

其他畫面（Collection、Economy、Contribution 等）已正確使用 React Query。

---

### A3. Design Token 使用率極低

**嚴重度：高 | 影響：全專案 80% 的樣式檔**

| 畫面 | Design Token 使用狀況 |
|------|---------------------|
| ItineraryScreenV2.styles.ts (1135行) | 部分使用 MibuBrand 色彩，但 Spacing/Radius/FontSize 未使用 |
| GachaScreen.styles.ts (530行) | 只用 MibuBrand，Spacing/Radius/FontSize 完全未用 |
| CollectionScreen.styles.ts (911行) | 同上 |
| ItemBoxScreen (1208行) | 大量 inline style，完全未用 Token |
| MerchantCoupons (891行) | StyleSheet 完全未用 Token |
| MerchantAnalytics (709行) | StyleSheet 完全未用 Token |
| MerchantPlaces (624行) | StyleSheet 完全未用 Token |
| SpecialistDashboard (493行) | StyleSheet 完全未用 Token |

**修復方向**：分批替換，從最大的 styles 檔開始。

---

### A4. `paddingTop: 60` safe area 硬編碼遍布全專案

**嚴重度：高 | 影響：10+ 個畫面**

出現在：ItineraryScreenV2、GachaScreen、ItemBoxScreen、ContributionScreen、AdminDashboard、AdminAnnouncements、MerchantCoupons、MerchantAnalytics、MerchantPlaces、SpecialistDashboard

**修復方向**：統一使用 `useSafeAreaInsets()` 或定義 `SAFE_AREA_TOP` 常數。

---

## 二、按畫面分組的詳細發現

---

### ItineraryScreenV2.tsx（1843 行）— 全專案最大檔案

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 全檔 | 高 | 元件拆分 | 1843 行，含 renderLeftDrawer(158行)、renderRightDrawer(205行)、renderMainContent(205行) | 拆為 LeftDrawer、RightDrawer、ChatMainContent 子元件 |
| 2 | 111-138 | 高 | 資料請求 | 手動 useState + useRef 快取管理伺服器狀態，未用 React Query | 遷移至 React Query |
| 3 | 445+852 | 中 | 資料請求 | activeItineraryId 變更觸發重複請求（handleSelectItinerary 呼叫 + useEffect 自動觸發） | 統一由一處管理 |
| 4 | 907-916 | 高 | 硬編碼 | Alert.alert 用硬編碼中文（'需要權限'、'儲存成功'、'儲存失敗'） | 改用 i18n |
| 5 | 829-831 | 高 | 錯誤處理 | 刪除行程失敗只有 console.error，無用戶提示 | 加 showToastMessage |
| 6 | 233,312 | 中 | 錯誤處理 | 載入行程失敗卻顯示「建立失敗」的訊息（用錯 i18n key） | 用正確的 key |
| 7 | 1264-1321 | 高 | 重複邏輯 | AI 訊息頭像+名稱區塊完全重複（正常訊息 vs loading） | 抽為 AiMessageRow 元件 |
| 8 | 681-713 | 中 | 重複邏輯 | handleSaveTitle 回滾邏輯重複兩段 | 抽為 rollbackTitle 函數 |
| 9 | 1347 | 中 | Loading | sendAiMessage 按鈕在 async getToken 期間仍可點擊 | 開頭立即 setAiLoading(true) |
| 10 | 755-788 | 中 | Loading | 批量刪除行程期間無 loading 指示 | 加 loading overlay |

---

### GachaScreen.tsx（1233 行）

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 118-171 | 高 | 資料請求 | 全部用 useState + useEffect，未用 React Query | 遷移至 React Query |
| 2 | 478-660 | 高 | 元件拆分 | handleGacha 函數 182 行 | 拆分為多個小函數 |
| 3 | 1001-1016 | 高 | Loading | 扭蛋按鈕無防連點，可觸發重複 API | 加 useRef 鎖或 disabled |
| 4 | 1068,1081 | 高 | 硬編碼 | `color="#6366f1"` 不屬於品牌色系（Indigo） | 改用 MibuBrand |
| 5 | styles L350-416 | 高 | 硬編碼 | 大量硬編碼紫色系（#ddd6fe, #8b5cf6, #a855f7） | 定義為 Design Token |
| 6 | 258-260 | 中 | 錯誤處理 | 道具箱容量檢查失敗只 console.error | 加用戶提示 |
| 7 | 462-464 | 中 | 錯誤處理 | 獎池載入失敗顯示「無優惠券」而非錯誤提示 | 區分空狀態和錯誤 |
| 8 | 493+644 | 中 | 重複邏輯 | 登入提示 Alert 重複兩處 | 抽為函數 |
| 9 | styles 全檔 | 中 | 硬編碼 | Spacing/Radius/FontSize 完全未用 Design Token | 全面替換 |
| 10 | 305 | 中 | 魔術數字 | setTimeout 10000ms 無常數名 | 定義 REGION_LOAD_TIMEOUT |

---

### CollectionScreen.tsx（1377 行）

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 全檔 | 高 | 元件拆分 | 1377 行，PlaceDetailModal 約 400 行 | 拆為獨立元件 |
| 2 | 15+ 處 | 高 | 硬編碼 | 大量用 `language === 'zh-TW'` inline 判斷而非 t.xxx | 統一用 i18n |
| 3 | 3 處 | 高 | 資料請求 | 檢查 response.success（違反教訓 #002） | HTTP 200 即成功 |
| 4 | - | 高 | 硬編碼 | 預設國家 '台灣' 硬編碼 | 用 i18n 或常數 |
| 5 | styles 全檔 | 中 | 硬編碼 | Spacing/Radius/FontSize 未用 Token | 全面替換 |

---

### HomeScreen.tsx（1036 行）

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 414-429 | 高 | 命名 | getLocalizedTitle/Desc 漏掉日韓語系 | 補上 ja/ko 判斷 |
| 2 | 562 | 中 | 硬編碼 | `color="#F97316"` 火焰 icon 橘色 | 定義 Token |
| 3 | 260-264 | 中 | 魔術數字 | 稱號等級門檻 5000/2000/500/100 硬編碼 | 定義常數 |
| 4 | 277 | 中 | 魔術數字 | dailyPullLimit fallback 36、inventorySlots fallback 30 | 定義常數 |
| 5 | 485 | 低 | 硬編碼 | `MibuBrand.error + '15'` 透明度字串拼接 | 建 withOpacity 工具函數 |

---

### login.tsx（1108 行）

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 172-585 | 高 | 重複邏輯 | 三個 fetchUser 函數 80% 邏輯重複 | 合併為 processAuthToken |
| 2 | 全檔 | 高 | 資料請求 | 全部直接 fetch() 而非用 authApi | 統一使用 authApi |
| 3 | 237-584 | 高 | 錯誤處理 | 多處 API 失敗只 console.error | 加 Alert 提示 |
| 4 | 827 | 高 | 硬編碼 | 副標題「今天去哪玩?老天說了算」硬編碼繁中 | 改用 i18n |
| 5 | 345-757 | 高 | 重複邏輯 | setUser({...}) 物件組裝重複 5 次 | 抽為 buildUserObject |
| 6 | 375 | 中 | 錯誤處理 | `error.message === '使用者取消登入'` 用中文比對 | 改用 error code |
| 7 | 640-641 | 高 | 硬編碼 | Version 1.0.0 寫死 | 用 Constants.expoConfig?.version |
| 8 | 612 | 中 | 硬編碼 | `'@mibu_web_device_id'` 未統一到 STORAGE_KEYS | 搬到 storageKeys.ts |

---

### ItemBoxScreen.tsx（1208 行）

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 747-1192 | 高 | 元件拆分 | 4 個 Modal 共 460 行 JSX 全部內聯 | 拆為獨立 Modal 元件 |
| 2 | 553-554 | 高 | 錯誤處理 | 開啟景點包失敗直接隱藏 item，無用戶提示 | 加 Alert |
| 3 | 160-353 | 高 | 硬編碼 | InventorySlot 全部 inline style，每次 render 重建 | 移至 StyleSheet |
| 4 | 690-697 | 中 | 硬編碼 | getTierLabel 回傳英文硬編碼 | 改用 i18n |
| 5 | 623 | 中 | 魔術數字 | setCountdown(180) 無常數名 | 定義 REDEEM_COUNTDOWN_SECONDS |

---

### EconomyScreen.tsx（858 行）

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 165-169 | 中 | 硬編碼 | handleClaim 成功訊息用硬編碼中文 | 改用 i18n |
| 2 | 140-143 | 中 | 魔術數字 | fallback 36/30/999 無常數名 | 定義常數 |
| 3 | 268,651,741 | 中 | 硬編碼 | '#fff'、'#ffffff' 未用 UIColors.white | 替換 |

---

### ContributionScreen.tsx（974 行）

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 150-188 | 高 | 重複邏輯 | handleVotePlace 與 handleVoteSuggestion 幾乎完全一樣 | 抽為通用 handleVote |
| 2 | 197 | 高 | 硬編碼 | getStatusStyle 回傳硬編碼色值 | 改用 SemanticColors |
| 3 | 430-543 | 高 | 重複邏輯 | 投票按鈕組 JSX 結構完全相同 | 抽為 VoteButtonPair |
| 4 | 150-168 | 中 | 防呆 | useState 做防重複鎖（教訓 #006） | 改用 useRef |

---

### ProfileScreen.tsx（736 行）

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 161 | 高 | Timer | setTimeout 未清理（教訓 #004） | 用 useRef + cleanup |
| 2 | 175-180 | 中 | 資料請求 | 手動 fetch 而非 React Query | 遷移 |
| 3 | 293-303 | 高 | 重複邏輯 | 表單欄位設定邏輯重複（loadProfile vs handleSave） | 抽為函數 |

---

### SettingsScreen.tsx（902 行）

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 640-641 | 高 | 硬編碼 | 'Mibu 旅行扭蛋'、'Version 1.0.0'、'© 2025' 全硬編碼 | 動態取版本、i18n 翻譯 |
| 2 | 397-468 | 中 | 重複邏輯 | 「關於」群組在已登入/未登入各寫一份相同配置 | 抽為共用 aboutItems |
| 3 | 533-547 | 中 | 錯誤處理 | 任一 query 錯誤就整頁 ErrorState，過於激進 | 局部降級 |

---

### AdminDashboardScreen.tsx（1418 行）

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 全檔 | 高 | 元件拆分 | 1418 行含 7 個分頁 | 每個分頁拆為獨立子元件 |
| 2 | 332,397 | 高 | 錯誤處理 | Alert 用英文硬編碼 'Error'、'Failed to save' | 改用 i18n |
| 3 | 多處 | 中 | 硬編碼 | '#ffffff'、'#FFFEFA'、'#fce7f3' 等非 Token 色彩 | 統一 Token |

---

### Merchant 畫面群（Coupons 891行 / Analytics 709行 / Places 624行）

| # | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|--------|------|------|---------|
| 1 | 高 | 硬編碼 | 三個檔案的 StyleSheet 完全未用 Design Token | 全面替換 |
| 2 | 中 | 錯誤處理 | MerchantPlaces 自行處理 401（應由全域 interceptor） | 移除本地處理 |
| 3 | 中 | 元件拆分 | MerchantAnalytics 的 StatCard 定義在 render 內 | 提取為獨立元件 |

---

### SpecialistDashboardScreen.tsx（493 行）

| # | 行號 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | 81 | 高 | 型別 | `mutate(undefined as any)` 繞過型別檢查 | 修正 hook 型別 |
| 2 | 多處 | 高 | 硬編碼 | '#ef4444'、'#94a3b8'、'#22c55e' 等非 Token 色彩 | 統一 Token |
| 3 | 180-237 | 中 | 重複邏輯 | 四個 menuItem 結構完全一致 | 用陣列 + .map() |

---

### 服務層與 Hooks

| # | 檔案 | 嚴重度 | 面向 | 問題 | 建議修復 |
|---|------|--------|------|------|---------|
| 1 | itineraryApi 等多檔 | 高 | 錯誤處理 | Service 吞錯誤回傳假成功（見 A1） | 移除 try/catch |
| 2 | gachaApi + collectionApi | 中 | 重複 | getPlacePromo 在兩處實作打不同端點 | 確認契約，移除重複 |
| 3 | itineraryApi L409 | 中 | 重複 | aiChat 自建重試與 base.ts 重試疊加（最多 6 次） | 移除自建重試 |
| 4 | useInventoryQueries | 中 | 命名 | Query Key 用原始字串，未統一用 queryKeys 常數 | 補齊 queryKeys |
| 5 | useCollectionQueries | 中 | 資料請求 | deleteCollection 未 invalidate collectionStats/Unread | 補齊 invalidation |
| 6 | gachaApi L151 | 中 | 安全 | pullGacha 未帶認證 Token | 確認契約，加 auth header |
| 7 | translations/index.ts | 低 | 命名 | API_BASE_URL 放在翻譯檔裡 | 搬到 constants/config.ts |

---

## 三、跨畫面共通問題

| # | 問題 | 影響範圍 | 嚴重度 |
|---|------|---------|--------|
| 1 | `bottomSpacer: { height: 100 }` 重複定義 | Economy、Contribution、Profile、ItemBox 等 | 中 |
| 2 | Header 返回按鈕 + 標題結構重複 | 8+ 個畫面 | 中 |
| 3 | Tab 切換器 UI 重複 | Economy、Contribution 等 | 中 |
| 4 | `formatDate` 函數各自定義 | Admin、Specialist、MerchantCoupons | 中 |
| 5 | Modal 結構（overlay + content + header + body）重複 | 5+ 個畫面 | 中 |
| 6 | `'#fff'` / `'#ffffff'` 散落各處 | 10+ 個檔案 | 中 |
| 7 | base.ts + QueryProvider 雙重重試 | 全專案 | 低 |

---

## 四、Top 10 優先處理清單

| 優先序 | 問題 | 嚴重度 | 影響範圍 | 預估工作量 | 說明 |
|--------|------|--------|---------|-----------|------|
| **#1** | Service 層吞錯誤 | 高 | 全專案 | 中 | 架構級問題，修了之後 React Query 的 error/retry/loading 才能正常運作。影響所有 API 呼叫。先改這個，其他 error handling 問題自動改善 |
| **#2** | login.tsx 重複邏輯合併 | 高 | 登入流程 | 中 | 三個 fetchUser 函數 80% 重複 + setUser 組裝重複 5 次 + 直接 fetch 而非用 authApi。登入是核心流程，一改忘改就出 bug |
| **#3** | GachaScreen + ItineraryScreenV2 遷移 React Query | 高 | 2 核心畫面 | 大 | 兩個最大畫面仍用 useState+useEffect 管理伺服器狀態，與專案模式不一致且缺少快取/重試/去重 |
| **#4** | paddingTop: 60 統一改用 useSafeAreaInsets | 高 | 10+ 畫面 | 小 | 批量搜尋替換即可，風險低效果大。不同裝置 safe area 高度不同，硬編碼 60 在某些機型會出問題 |
| **#5** | 巨型元件拆分（Top 5 最大檔案） | 高 | 5 個畫面 | 大 | ItineraryV2(1843)、AdminDashboard(1418)、CollectionScreen(1377)、GachaScreen(1233)、ItemBoxScreen(1208) |
| **#6** | 硬編碼中文/英文字串改用 i18n | 高 | 8+ 畫面 | 中 | login 副標題、Alert 訊息、tier label、status label 等。非中文用戶會看到亂碼 |
| **#7** | SettingsScreen 版本號硬編碼 | 高 | 設定頁 | 小 | 'Version 1.0.0' 寫死 + '© 2025' 年份過期。5 分鐘可修，影響用戶感知 |
| **#8** | Query Key 統一 + Mutation invalidation 補齊 | 中 | hooks 層 | 小 | inventory、home 用原始字串；deleteCollection 沒 invalidate stats。靜默 bug，不修會在特定操作後顯示過時資料 |
| **#9** | Design Token 全面導入（Spacing/Radius/FontSize） | 高 | 80% styles | 大 | 目前大部分樣式檔只用了 MibuBrand 色彩，間距/圓角/字體全硬編碼。先從 Merchant 4 個檔案開始（完全沒用 Token） |
| **#10** | 共用元件抽取（ScreenHeader、TabBar、bottomSpacer） | 中 | 8+ 畫面 | 中 | 多畫面重複相同的 UI 結構。抽一次，受益 8+ 處 |

---

## 五、嚴重度統計

| 嚴重度 | 發現數量 | 說明 |
|--------|---------|------|
| 高 | ~35 | 架構缺陷、核心流程缺錯誤處理、巨型元件、i18n 遺漏 |
| 中 | ~55 | Design Token 未用、魔術數字、重複邏輯、命名不一致 |
| 低 | ~20 | 微調項目、註解、minor style issues |

---

## 六、建議執行順序

```
Phase 0（基礎建設）：#1 Service 層錯誤修復 + #8 Query Key 統一
  ↓ 這兩個改完，React Query 才能正常發揮作用
Phase 1（核心流程）：#2 Login 重構 + #7 版本號修復
  ↓ 登入是第一印象，版本號是 5 分鐘的事
Phase 2（一致性）：#4 Safe Area + #6 i18n 硬編碼
  ↓ 批量搜尋替換，風險低
Phase 3（架構改善）：#3 React Query 遷移 + #5 元件拆分
  ↓ 最大工程量，但長期維護性提升最大
Phase 4（打磨）：#9 Design Token + #10 共用元件
  ↓ 錦上添花，但量大
```

---

*報告結束。如需針對任一項目展開詳細修復計劃或直接開始修復，請告知。*
