# 前端程式碼品質健檢 — 執行計劃

> 建立日期：2026-03-09
> 狀態：確認待執行
> 方法論：按項目逐項掃全專案，修完一項再換下一項

---

## 執行原則

- **一次只處理一個項目**，掃過全專案所有相關檔案，全部修完再換下一個
- 每個項目用 `grep` / `glob` 批量搜出所有問題點，列出清單後逐一修復
- 每個項目修完後跑 `npx tsc --noEmit` 確認零錯誤
- 每個項目獨立 commit

---

## 掃描範圍

185 個 .ts/.tsx 檔案（app/ 57 個 + src/ 128 個），共 70,336 行

---

## 項目 1：Service 層吞錯誤

**問題**：Service 方法 try/catch 後回傳 `{ success: false, ... }` 而非讓錯誤冒泡，導致 React Query 的 isError/retry 全部失效

**掃描方式**：
```bash
grep -rn "catch.*error" src/services/ --include="*.ts" | grep -v "base.ts" | grep -v "node_modules"
```

**要檢查的檔案**：
- [ ] `src/services/itineraryApi.ts`（10+ 處）
- [ ] `src/services/collectionApi.ts`（3 處）
- [ ] `src/services/gachaApi.ts`（1 處）
- [ ] `src/services/commonApi.ts`
- [ ] `src/services/contributionApi.ts`
- [ ] `src/services/economyApi.ts`
- [ ] `src/services/inventoryApi.ts`
- [ ] `src/services/merchantApi.ts`
- [ ] `src/services/adminApi.ts`
- [ ] `src/services/mailboxApi.ts`
- [ ] `src/services/crowdfundingApi.ts`
- [ ] `src/services/referralApi.ts`
- [ ] `src/services/couponApi.ts`
- [ ] `src/services/specialistApi.ts`
- [ ] `src/services/miniApi.ts`
- [ ] `src/services/feedbackApi.ts`
- [ ] `src/services/eventApi.ts`
- [ ] `src/services/authApi.ts`
- [ ] `src/services/rulesApi.ts`
- [ ] `src/services/configApi.ts`
- [ ] `src/services/locationApi.ts`

**修復規則**：
- 移除 service 層的 try/catch，讓錯誤冒泡到 React Query
- 只保留格式轉換邏輯（如果需要）
- `base.ts` 的錯誤處理不動（那是統一的錯誤攔截層）

**驗證**：修完後 hooks 層的 `isError`、`error`、`retry` 應能正常運作

---

## 項目 2：login.tsx 重複邏輯合併

**問題**：三個 fetchUser 函數 80% 邏輯重複、setUser 組裝重複 5 次、直接 fetch 而非用 authApi

**掃描方式**：
```bash
grep -n "fetchUserWith\|fetchUserAfter\|setUser({" app/login.tsx
```

**要檢查的檔案**：
- [ ] `app/login.tsx`

**修復規則**：
- 合併三個 fetchUser 函數為一個 `processAuthToken(token, options)`
- 抽出 `buildUserObject(userData, provider)` 統一組裝 user 物件
- 將直接 fetch 改為使用 `authApi` 服務層
- 抽出 `switchRoleIfNeeded(token, portal, currentRole)` 去重
- 登入失敗加 Alert 提示用戶

**驗證**：所有登入路徑（Google/Apple/Guest/Web OAuth/Deep Link）都能正常運作

---

## 項目 3：paddingTop: 60 統一改用 useSafeAreaInsets

**問題**：10+ 個畫面硬編碼 `paddingTop: 60` 作為 safe area，不同機型高度不同會出問題

**掃描方式**：
```bash
grep -rn "paddingTop.*60\|paddingTop.*Platform" src/ app/ --include="*.tsx" --include="*.ts"
```

**要檢查的檔案**（所有畫面的 styles 和 tsx）：
- [ ] `src/modules/traveler/screens/GachaScreen.styles.ts`
- [ ] `src/modules/traveler/screens/ItemBoxScreen.tsx`
- [ ] `src/modules/traveler/screens/ContributionScreen.tsx`
- [ ] `src/modules/traveler/screens/EconomyScreen.tsx`
- [ ] `src/modules/traveler/screens/ItineraryScreenV2.styles.ts`
- [ ] `src/modules/admin/screens/AdminDashboardScreen.tsx`
- [ ] `src/modules/admin/screens/AdminAnnouncementsScreen.tsx`
- [ ] `src/modules/merchant/screens/MerchantCouponsScreen.tsx`
- [ ] `src/modules/merchant/screens/MerchantAnalyticsScreen.tsx`
- [ ] `src/modules/merchant/screens/MerchantPlacesScreen.tsx`
- [ ] `src/modules/specialist/screens/SpecialistDashboardScreen.tsx`
- [ ] 其他 grep 出的檔案

**修復規則**：
- 已用 SafeAreaView 的 → 不需要手動 paddingTop
- 未用 SafeAreaView 的 → 加上 `const insets = useSafeAreaInsets()` + `paddingTop: insets.top`
- `Platform.OS === 'ios' ? 60 : 40` 同樣替換

**驗證**：`grep -rn "paddingTop.*60" src/ app/` 回傳 0 結果

---

## 項目 4：硬編碼中文/英文字串改用 i18n

**問題**：Alert 訊息、tier label、status label、按鈕文字直接用中文/英文寫死，非對應語系用戶會看到亂碼

**掃描方式**：
```bash
# 找 Alert.alert 裡的中文
grep -rn "Alert\.alert.*'[^\x00-\x7F]" src/ app/ --include="*.tsx"
# 找 language === 'zh-TW' 的 inline 判斷
grep -rn "language === 'zh-TW'" src/ --include="*.tsx"
# 找硬編碼中文字串（在 JSX 中）
grep -rn "'[^']*[\u4e00-\u9fff][^']*'" src/modules/ --include="*.tsx" | grep -v "console\|comment\|//"
```

**要檢查的檔案**：
- [ ] `app/login.tsx`（副標題「今天去哪玩?老天說了算」）
- [ ] `src/modules/traveler/screens/ItineraryScreenV2.tsx`（Alert 中文）
- [ ] `src/modules/traveler/screens/GachaScreen.tsx`（i18n fallback 中文）
- [ ] `src/modules/traveler/screens/CollectionScreen.tsx`（15+ 處 language 判斷）
- [ ] `src/modules/traveler/screens/ItemBoxScreen.tsx`（tier label 英文）
- [ ] `src/modules/traveler/screens/EconomyScreen.tsx`（金幣中文）
- [ ] `src/modules/traveler/screens/ContributionScreen.tsx`（金幣中文）
- [ ] `src/modules/admin/screens/AdminDashboardScreen.tsx`（Error 英文）
- [ ] `src/modules/shared/screens/SettingsScreen.tsx`（版本號、App 名稱、版權年份）
- [ ] `src/modules/shared/screens/HomeScreen.tsx`（getLocalizedTitle 漏 ja/ko）
- [ ] 其他 grep 出的檔案

**修復規則**：
- 所有用戶可見文字必須走 `t.xxx` 翻譯 key
- 新增的 key 必須同時加入 4 個語系檔案（zh-TW、en、ja、ko）
- `language === 'zh-TW' ? '中文' : 'English'` 全部改為 `t.xxx`
- console.log/error 的文字不改（開發者看的）
- 特別注意 SettingsScreen 的 `Version 1.0.0` → 用 `Constants.expoConfig?.version`

**驗證**：`grep -rn "Alert\.alert.*'[^\x00-\x7F]" src/` 回傳 0 結果

---

## 項目 5：Query Key 統一 + Mutation invalidation 補齊

**問題**：部分用 queryKeys 常數、部分用原始字串；某些 mutation 沒有 invalidate 關聯查詢

**掃描方式**：
```bash
# 找原始字串 query key
grep -rn "queryKey.*\['" src/hooks/ --include="*.ts"
# 找 invalidateQueries
grep -rn "invalidateQueries" src/hooks/ --include="*.ts"
# 找 queryKeys 定義
grep -rn "queryKeys" src/hooks/ --include="*.ts"
```

**要檢查的檔案**：
- [ ] `src/hooks/useInventoryQueries.ts`（完全沒用 queryKeys）
- [ ] `src/hooks/useHomeQueries.ts`（用原始字串）
- [ ] `src/hooks/useCollectionQueries.ts`（混合使用）
- [ ] `src/hooks/useAuthQuery.ts`（queryKeys 定義）
- [ ] 其他所有 hooks 檔案

**修復規則**：
- 在 queryKeys 補齊所有缺失的 key（inventory、home 等）
- 全面替換原始字串為 queryKeys 常數
- 每個 mutation 的 onSuccess 檢查：是否 invalidate 了所有被影響的關聯查詢
  - deleteCollection → 補 invalidate collectionStats、collectionUnread
  - redeemItem → 補 invalidate collection
  - markAllRead → 補 invalidate 通知

**驗證**：`grep -rn "queryKey.*\['" src/hooks/` 回傳 0 結果（全部用 queryKeys）

---

## 項目 6：Service 層重複重試移除

**問題**：base.ts 已有重試 + QueryProvider 已有 retry:1 → 疊加後最多 4-6 次重試

**掃描方式**：
```bash
grep -rn "retry\|MAX_RETRIES\|RETRY_DELAY\|maxAttempts" src/services/ src/context/QueryProvider.tsx --include="*.ts" --include="*.tsx"
```

**要檢查的檔案**：
- [ ] `src/services/base.ts`（base 層重試邏輯）
- [ ] `src/services/itineraryApi.ts`（aiChat 自建重試）
- [ ] `src/context/QueryProvider.tsx`（React Query retry 設定）

**修復規則**：
- 移除 `itineraryApi.aiChat` 的自建重試邏輯
- 評估 base.ts 的重試是否與 React Query 重複 → 選一層留
- 記錄最終的重試策略到文件

**驗證**：確認每個 API 呼叫的最大重試次數合理（不超過 3 次）

---

## 項目 7：硬編碼色彩替換為 Design Token

**問題**：大量 `'#fff'`、`'#6366f1'`、`'#ef4444'` 等散落在 styles 和 inline styles 中

**掃描方式**：
```bash
# 找所有 hex 色碼
grep -rn "'#[0-9a-fA-F]\{3,8\}'" src/modules/ app/ --include="*.tsx" --include="*.ts"
# 找 rgba 色碼
grep -rn "rgba(" src/modules/ --include="*.tsx" --include="*.ts"
# 找 color="#
grep -rn 'color="#' src/modules/ --include="*.tsx"
```

**要檢查的檔案**：所有 screens/ 和 components/ 下的 .tsx 和 .styles.ts 檔案

**修復規則**：
- `'#fff'` / `'#ffffff'` / `'#FFFFFF'` → `UIColors.white`
- `'#000'` / `'#000000'` → `UIColors.black`
- `'#6366f1'` / `'#8b5cf6'` 等非品牌色 → 評估是否需要加入 Token 或改用現有 Token
- `rgba(0,0,0,0.7)` → `UIColors.overlayDark`
- `MibuBrand.error + '15'` 這類拼接 → 建立 `withOpacity()` 工具函數
- 品牌色用 `MibuBrand.xxx`，語意色用 `SemanticColors.xxx`

**驗證**：硬編碼 hex 色碼數量大幅降低（允許少量合理的 inline 色彩）

---

## 項目 8：Magic Number 替換為命名常數

**問題**：`setTimeout(xxx, 3000)`、`maxLength={200}`、`inventorySlots ?? 30` 等無語意數字散落各處

**掃描方式**：
```bash
# 找 setTimeout 的延遲值
grep -rn "setTimeout.*[0-9]\{3,\}" src/modules/ app/ --include="*.tsx"
# 找 fallback 值
grep -rn "?? [0-9]" src/modules/ app/ --include="*.tsx"
# 找 maxLength
grep -rn "maxLength=" src/modules/ --include="*.tsx"
# 找 height: 100（bottomSpacer）
grep -rn "height.*100" src/modules/ --include="*.tsx" --include="*.ts"
```

**要檢查的檔案**：所有 screens/ 下的 .tsx 檔案

**修復規則**：
- setTimeout 延遲 → 定義常數如 `TOAST_DISPLAY_MS = 3000`
- API fallback 值 → 定義常數如 `DEFAULT_DAILY_PULL_LIMIT = 36`
- maxLength → 定義常數如 `GRAFFITI_MAX_LENGTH = 200`
- bottomSpacer `height: 100` → 定義共用常數 `BOTTOM_SPACER_HEIGHT`
- `<= 5`（inventoryRemaining）→ `INVENTORY_ALMOST_FULL_THRESHOLD`
- 動畫 duration → 集中定義 `ANIMATION.xxx` 常數組

**驗證**：核心邏輯值都有命名常數（純 UI 微調值如 padding 可保留）

---

## 項目 9：Design Token 全面導入（Spacing / Radius / FontSize）

**問題**：80% 的 styles 檔只用了 MibuBrand 色彩，Spacing/Radius/FontSize 全硬編碼

**掃描方式**：
```bash
# 找未 import Spacing 的 styles 檔
grep -rL "Spacing" src/modules/ --include="*.styles.ts"
# 找未 import FontSize 的 styles 檔
grep -rL "FontSize" src/modules/ --include="*.styles.ts"
# 找裸數字 padding/margin/fontSize/borderRadius
grep -rn "padding.*[0-9]\|margin.*[0-9]\|fontSize.*[0-9]\|borderRadius.*[0-9]" src/modules/ --include="*.styles.ts" | head -50
```

**要檢查的檔案**（按大小排序優先處理）：
- [ ] `src/modules/traveler/screens/ItineraryScreenV2.styles.ts` (1134)
- [ ] `src/modules/traveler/screens/CollectionScreen.styles.ts` (911)
- [ ] `src/modules/traveler/screens/ReferralScreen.styles.ts` (560)
- [ ] `src/modules/traveler/screens/GachaScreen.styles.ts` (530)
- [ ] `src/modules/shared/screens/ProfileScreen.styles.ts` (237)
- [ ] 所有 screen 中的 `StyleSheet.create` 區塊（未分離 styles 的檔案）

**修復規則**：
- `padding: 16` → `Spacing.lg`
- `borderRadius: 12` → `Radius.md`
- `fontSize: 14` → `FontSize.md`
- 值不完全對應 Token 的 → 取最近的 Token 或新增合理的 Token
- Token 對照表：

| 數值 | Spacing | Radius | FontSize |
|------|---------|--------|----------|
| 4 | xs | xs | - |
| 8 | sm | sm | - |
| 10 | - | - | xs |
| 12 | md | md | sm |
| 14 | - | - | md |
| 16 | lg | lg | lg |
| 18 | - | - | xl |
| 20 | - | xl | - |
| 22 | - | - | xxl |
| 24 | xl | xxl | - |
| 32 | xxl | - | - |

**驗證**：styles 檔案中的裸數字大幅減少

---

## 項目 10：共用元件抽取

**問題**：ScreenHeader、TabBar、bottomSpacer、formatDate、Modal 結構在 8+ 個畫面重複

**掃描方式**：
```bash
# 找 header 返回按鈕模式
grep -rn "backButton\|goBack\|router.back" src/modules/ --include="*.tsx" | head -20
# 找 tab 切換器模式
grep -rn "activeTab\|selectedTab" src/modules/ --include="*.tsx"
# 找 formatDate 定義
grep -rn "formatDate\|format.*Date" src/modules/ --include="*.tsx"
# 找 bottomSpacer
grep -rn "bottomSpacer\|height.*100.*spacer" src/modules/ --include="*.tsx" --include="*.ts"
```

**要抽取的元件**：
- [ ] `ScreenHeader` — 返回按鈕 + 標題 + 右側 action
- [ ] `TabBar` — tab 陣列 map → TouchableOpacity → active style
- [ ] `bottomSpacer` 常數 — 統一為 `BOTTOM_SPACER_HEIGHT`
- [ ] `formatDate` 工具函數 — 搬到 `src/utils/formatDate.ts`
- [ ] `BottomSheetModal` — overlay + content + header + body 結構

**修復規則**：
- 先建共用元件 → 再逐畫面替換 → 確認功能不變
- 不改功能，只抽共用

**驗證**：重複的 header/tab/modal 結構被共用元件取代

---

## 執行順序

```
項目 1 → 項目 2 → 項目 3 → 項目 4 → 項目 5
→ 項目 6 → 項目 7 → 項目 8 → 項目 9 → 項目 10
```

每項完成後：
1. `npx tsc --noEmit` 確認零錯誤
2. 獨立 commit（訊息標明項目編號）
3. 更新本文件勾選 checkbox
4. 進入下一項

---

*最後更新：2026-03-09*
