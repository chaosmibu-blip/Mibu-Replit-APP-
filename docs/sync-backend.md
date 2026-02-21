# 🔄 後端同步回報

> APP 完成後端同步指令後，在此記錄狀態

---

## 最新回報

### 2026-02-20 #052：推播通知完整串接

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #052 |
| 狀態 | ✅ 完成 |

**偵察結果：80% 已完成**
先前 #020/#025/#042 已建立完整推播通知基礎建設：
- [x] Push 服務（pushNotificationService.ts）：Token 註冊/取消、監聽、Badge 管理
- [x] 型別定義（notifications.ts）：完整 NotificationItem/Preferences/RegisterToken
- [x] API 層（commonApi.ts）：9 個端點全部串接
- [x] React Query Hooks（useNotificationQueries.ts）：5 個 hooks
- [x] 全域監聽（useNotificationHandler.ts）：前景/點擊/冷啟動導航
- [x] UI 頁面：NotificationListScreen（分頁歷史）+ NotificationPreferencesScreen（偏好設定）
- [x] 路由：/notifications + /notification-preferences
- [x] 登入/登出整合：registerTokenWithBackend / unregisterToken
- [x] 翻譯：4 語系 notifPref_* + notifList_* 完整

**本次補完**
- [x] NotificationPreferencesScreen：勿擾時段時間改為可編輯
  - 點擊時間 → TimePickerModal（小時 0-23 + 分鐘 15 分鐘為單位）
  - 樂觀 UI 更新 + API 儲存 + 失敗回滾
  - 純 RN 實作，無額外套件依賴

**注意事項**
- app.config.js 是禁止修改檔案，通知權限（POST_NOTIFICATIONS）需在下次 build 設定時處理
- expo-notifications 在 managed workflow 下會自動處理權限請求

---

### 2026-02-20 #053：自己人 + 商家申請系統（specialist→partner 改名 + 新申請流程）

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #053 |
| 狀態 | ✅ 完成 |

**Breaking Change — specialist→partner 改名**
- [x] `UserPerksResponse`：`canApplySpecialist` → `canApplyPartner`、`specialistInvitedAt` → `partnerInvited`
- [x] `SpecialistEligibilityResponse` → `PartnerEligibilityResponse`（新欄位：isEligible/hasApplied/isPartner）
- [x] 新增 `PartnerApplicationStatusResponse`（status + application 詳情）
- [x] API 路徑：4 條 `/api/user/specialist/*` → `/api/partner/*`

**自己人申請**
- [x] `economyApi.ts`：getPartnerEligibility / applyPartner / getPartnerApplicationStatus / markPartnerInvited
- [x] `useEconomyQueries.ts`：usePartnerEligibility / usePartnerApplicationStatus / useApplyPartner hooks
- [x] `PartnerApplyScreen.tsx`（新檔）：4 狀態頁面（none/pending/approved/rejected）+ 問卷式表單

**商家申請**
- [x] `MerchantApplyParams` 改為 businessName + email + surveyResponses（JSONB）
- [x] `merchantApi.ts`：新增 getMerchantApplicationStatus
- [x] `useMerchantQueries.ts`：useMerchantApplicationStatus / useApplyMerchant hooks
- [x] `MerchantApplyScreen.tsx`（新檔）：4 狀態頁面 + 商家名/email/問卷表單

**UI 整合**
- [x] `SettingsScreen.tsx`：新增自己人/商家申請入口（依狀態顯示 badge）
- [x] `ProfileResponse`：新增 partner/merchant 狀態區塊
- [x] `HomeScreen.tsx`、`EconomyScreen.tsx`：canApplySpecialist → canApplyPartner
- [x] `login.tsx`、`PlannerScreen.tsx`：策劃師/Specialist → 自己人/Partner

**翻譯**
- [x] 4 語系共 38+ 新 keys（partner_*、merchant_*、settings_*）
- [x] 全面 策劃師→自己人 文字替換

**路由**
- [x] `app/partner-apply.tsx` + `app/merchant-apply.tsx` 新增
- [x] `_layout.tsx` Stack.Screen 註冊

---

### 2026-02-15 #051：訪客升級提醒（關鍵功能觸發提示）

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #051 |
| 狀態 | ✅ 完成 |

**移除訪客硬擋**
- [x] `ItineraryScreenV2.tsx`：移除 `user?.provider === 'guest'` 條件，訪客可用行程功能
- [x] `ProfileScreen.tsx`：移除 `isGuest` 變數和整個訪客攔截區塊，訪客可查看/編輯個人資料

**新增基礎建設**
- [x] `storageKeys.ts`：新增 3 個 storage key（`GUEST_PROMPT_COLLECTION/AI_CHAT/LOGIN_STREAK`）
- [x] `useGuestUpgradePrompt.ts`（新檔）：中央邏輯 hook，管理 3 個觸發點
- [x] `UpgradePromptToast.tsx`（新檔）：非阻塞式底部 toast + CTA 按鈕

**觸發點整合**
- [x] `HomeScreen.tsx`：收集 ≥ 10 景點觸發（用 `useCollectionStats()` API 查詢）
- [x] `HomeScreen.tsx`：連續登入 ≥ 3 天觸發（用 `useCoins()` → `loginStreak`）
- [x] `ItineraryScreenV2.tsx`：首次 AI 對話觸發（`sendAiMessage` 成功後）

**翻譯**
- [x] 4 語系各 4 組 keys（guestPrompt_collectionMilestone/aiChat/loginStreak/bindAccount）

**設計決策**
- 每個提示最多顯示一次（AsyncStorage 記錄），登出自動清除（不在 keepKeys 白名單）
- 非 guest 用戶所有 check 函數為 no-op
- CTA「前往綁定」= `setUser(null)` 登出回登入頁（同 E1016 模式）
- 收集里程碑用 `useCollectionStats()` 而非 `gachaState.collection`（後者每次開 App 從 0 開始）
- 跳過「首次分享行程」觸發（分享功能尚未實作）

---

### 2026-02-15 #050：APP 金流頁面處理 E1016 錯誤（訪客金流限制）

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #050 |
| 狀態 | ✅ 完成 |

**錯誤碼定義** (`src/types/errors.ts`)
- [x] `AUTH_ERRORS` 新增 `E1016: 'VERIFIED_PROVIDER_REQUIRED'`
- [x] `ERROR_MESSAGES` 新增 E1016 中英文訊息

**API 基礎設施** (`src/services/base.ts`)
- [x] 新增 E1016 攔截器（仿 401 模式）
  - `setOnVerifiedProviderRequired()` — 註冊回調
  - `resetVerifiedProviderFlag()` — 重置防重入旗標
- [x] `request()` 方法偵測 403 + `code === 'E1016'` → 觸發回調
- [x] 防重入機制（多個併發 403 只觸發一次）

**AuthContext 回調** (`src/context/AuthContext.tsx`)
- [x] 註冊 E1016 回調 → Alert 提示用戶綁定帳號
- [x] 「前往綁定」→ 登出（`setUser(null)`）→ 回到登入頁
- [x] 「稍後再說」→ 取消（本次不綁定）
- [x] 登入時呼叫 `resetVerifiedProviderFlag()` 重置旗標
- [x] Alert 文字使用翻譯系統（`useI18n()`）

**翻譯**
- [x] 4 語系各 4 組 keys（e1016_title、e1016_message、e1016_later、e1016_goToBind）

**設計決策**
- 集中攔截（base.ts）而非分散到各元件，所有 403 + E1016 統一處理
- 「前往綁定」= 登出回登入頁，用戶用 Google/Apple 登入後 #046 deviceId 機制自動升級帳號
- 不需要前端對每個金流端點個別處理，攔截器自動生效

---

### 2026-02-15 #049：訪客登入改為呼叫後端 API（伺服器端建帳）

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #049 |
| 狀態 | ✅ 完成 |

**型別定義** (`src/types/auth.ts`)
- [x] `GuestLoginResponse` — 訪客登入回應（token、user、isNewAccount、existingAccount）

**API 層** (`src/services/authApi.ts`)
- [x] `POST /api/auth/guest` — 訪客登入（後端建帳 + 發 JWT）
- [x] `api.ts` proxy binding 同步新增

**登入流程** (`app/login.tsx`)
- [x] `handleGuestLogin()` 從純前端 UUID 改為呼叫 `POST /api/auth/guest`
- [x] 帶 `deviceId` 參數（iOS: vendorId、Android: androidId、Web: 持久化 UUID）
- [x] 成功後用 `setUser(user, token)` 儲存 JWT（跟 OAuth 登入一致）
- [x] `existingAccount` 偵測 — 同裝置已有正式帳號時 Alert 提示用戶
- [x] 錯誤處理（網路錯誤 → Alert 提示重試）

**認證查詢解鎖** (`src/hooks/useAuthQuery.ts`)
- [x] 移除 `useAuthQuery` 的 `isGuest` 停用（訪客現在有 JWT Token）
- [x] 移除 `useAuthInfiniteQuery` 的 `isGuest` 停用

**AuthContext 簡化** (`src/context/AuthContext.tsx`)
- [x] 移除舊 guest fallback 邏輯（「沒有 token 時檢查 guest 快取」）
- [x] 訪客走正常 token 驗證路徑

**翻譯**
- [x] 4 語系各 3 組 keys（guest_existingAccountTitle、guest_existingAccountDesc、guest_continueAsGuest）

**設計決策**
- 訪客帳號由後端統一管理，前端不再自行產生 UUID
- 同一 deviceId 重複呼叫為冪等操作（不重複建帳）
- `ItineraryScreenV2` 和 `ProfileScreen` 的 `provider === 'guest'` 檢查保留（留給 #051 升級提醒）

---

### 2026-02-13 #047（更新）：道具箱新增景點包（place_pack）類型支援

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #047（更新） |
| 狀態 | ✅ 完成 |

**型別定義** (`src/types/inventory.ts`)
- [x] `InventoryItemType` 新增 `'place_pack'`
- [x] `InventoryItem` 新增 `packCode`、`placeCount` 欄位
- [x] `PlacePackOptionsResponse` — 景點包開啟選項（packName、restricted、availableCities）
- [x] `OpenPlacePackResponse` — 開啟結果（addedPlaces、skippedPlaces、summary）

**API 層** (`src/services/inventoryApi.ts`)
- [x] `GET /api/inventory/:id/open-options` — 查詢景點包資訊
- [x] `POST /api/inventory/:id/open` — 開啟景點包
- [x] `InventoryFilter` 新增 `'place_pack'` 篩選

**React Query Hooks** (`src/hooks/useInventoryQueries.ts`)
- [x] `useOpenPlacePack()` — 開啟景點包 mutation

**UI** (`ItemBoxScreen.tsx`)
- [x] `InventorySlot` 支援 place_pack 類型渲染（地圖 icon + 景點數量）
- [x] 點擊景點包 → 查詢 open-options → 分流：
  - 限定城市 → Alert 確認後直接開
  - 非限定 → 城市選擇器 Modal
- [x] 開啟成功 → Alert 提示（新增/跳過數量）
- [x] 已開啟的包從列表移除（過濾 status=redeemed）
- [x] 開啟中顯示 loading 覆蓋層

**翻譯**
- [x] 4 語系各 9 組 keys（zh-TW / en / ja / ko）

**設計決策**
- 不使用結果彈窗（用 Alert 簡潔提示）
- 已開啟的景點包直接從列表移除（不顯示灰色已開啟狀態）

---

### 2026-02-13 #048：商城商品管理（管理員 CRUD）

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #048 |
| 狀態 | ✅ 完成 |

**型別定義** (`src/types/admin.ts`)
- [x] `ShopItemCategory` — 6 種分類（gacha_ticket / inventory_expand / cosmetic / boost / bundle / other）
- [x] `ShopItem` — 商品完整型別（id、code、category、nameZh/En、priceCoins、imageUrl、maxPerUser、isActive、sortOrder）
- [x] `ShopItemsResponse` — 商品列表回應
- [x] `CreateShopItemParams` / `UpdateShopItemParams` — 新增/更新參數

**API 層** (`src/services/adminApi.ts`)
- [x] `GET /api/admin/shop-items` — 商品列表
- [x] `GET /api/admin/shop-items/:id` — 商品詳情
- [x] `POST /api/admin/shop-items` — 新增商品
- [x] `PUT /api/admin/shop-items/:id` — 更新商品
- [x] `DELETE /api/admin/shop-items/:id` — 刪除商品

**React Query Hooks** (`src/hooks/useAdminQueries.ts`)
- [x] `useAdminShopItems()` — 查詢商品列表
- [x] `useCreateShopItem()` — 新增商品 mutation
- [x] `useUpdateShopItem()` — 更新商品 mutation
- [x] `useDeleteShopItem()` — 刪除商品 mutation

**UI** (`AdminDashboardScreen.tsx`)
- [x] 新增「商城商品」Tab
- [x] 商品列表（卡片式、狀態 badge、分類標籤）
- [x] 新增/編輯 Modal（完整 CRUD 表單）
- [x] 刪除確認（Alert）

**翻譯**
- [x] 4 語系各 ~25 組 keys（zh-TW / en / ja / ko）

---

### 2026-02-13 #047：獎勵發送 API 升級（支援全體廣播）

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #047 |
| 狀態 | ✅ 完成 |

**型別定義** (`src/types/admin.ts`)
- [x] `RewardItem` — 獎勵項目（type: coins/gacha_ticket/inventory_expand/shop_item、amount、shopItemCode）
- [x] `SendRewardAllParams` — 全體發送參數（target: 'all'）
- [x] `SendRewardUsersParams` — 指定用戶發送參數（target: 'users' + userIds）
- [x] `SendRewardParams` — 聯合型別
- [x] `SendRewardResponse` — 發送結果（totalUsers、sent、batches、mailboxItemIds）

**API 層** (`src/services/adminApi.ts`)
- [x] `POST /api/admin/rewards` — 發送獎勵

**React Query Hooks** (`src/hooks/useAdminQueries.ts`)
- [x] `useSendReward()` — 發送獎勵 mutation

**UI** (`AdminDashboardScreen.tsx`)
- [x] 新增「獎勵發送」Tab
- [x] 發送目標切換（全體 / 指定用戶）
- [x] 獎勵項目動態新增/移除
- [x] 信件標題、訊息、有效天數輸入
- [x] 發送確認 Alert

**翻譯**
- [x] 4 語系各 ~25 組 keys（zh-TW / en / ja / ko）

---

### 2026-02-13 #046：訪客自動升級（登入帶 deviceId）

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #046 |
| 狀態 | ✅ 完成 |

**型別更新** (`src/types/auth.ts`)
- [x] `AuthResponse` 新增 `suggestMerge` 欄位（existingAccountId、existingName、sharedDeviceWarning）

**API 層** (`src/services/authApi.ts`)
- [x] `mobileAuth()` 新增 `deviceId` 可選參數

**登入流程** (`app/login.tsx`)
- [x] Google 原生登入 — 取得 `deviceId` 並帶入 request body
- [x] Apple 登入 — 取得 `deviceId` 並帶入 request body
- [x] 複用既有 `getDeviceId()`（來自 `gachaApi.ts`，使用 `expo-application`）

**注意**：`suggestMerge` UI（彈窗提示用戶合併帳號）尚未實作，需後端確認是否已啟用此邏輯後再做。

---

### 2026-02-10 #045：信箱系統（統一收件箱 + 優惠碼）

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #045 |
| 狀態 | ✅ 完成 |

**API 層**
- [x] `src/types/mailbox.ts` — 完整型別定義（列表/詳情/領取/優惠碼）
- [x] `src/services/mailboxApi.ts` — 7 個端點全部串接
  - `GET /api/mailbox` — 信箱列表（分頁 + 狀態篩選）
  - `GET /api/mailbox/unread-count` — 未讀數量
  - `GET /api/mailbox/:id` — 項目詳情（自動標記已讀）
  - `POST /api/mailbox/:id/claim` — 領取單一項目
  - `POST /api/mailbox/claim-all` — 一鍵全部領取
  - `POST /api/promo-code/redeem` — 兌換優惠碼
  - `GET /api/promo-code/validate` — 驗證優惠碼
- [x] 註冊到 `types/index.ts` + `api.ts`（import、re-export、proxy bindings）

**UI 頁面**
- [x] `MailboxScreen.tsx` — 信箱列表頁
  - 三 tab 篩選：未領取 / 已領取 / 已過期
  - 下拉重新整理 + 分頁載入（FlatList）
  - 一鍵全部領取按鈕
  - 優惠碼兌換輸入框
  - 未讀紅點 + 左側高亮條
- [x] `MailboxDetailScreen.tsx` — 信箱詳情頁
  - 完整獎勵清單（coins / shop_item / coupon / place_pack / perk）
  - 底部固定領取按鈕（unclaimed 狀態）
  - 狀態顯示（已領取 / 已過期 / 到期倒數）
- [x] 路由 `/mailbox` + `/mailbox/[id]` 註冊到 `_layout.tsx`

**全域整合**
- [x] `AppState` 新增 `unreadMailboxCount`
- [x] `refreshUnreadCount()` 同時拉取物品箱 + 信箱未讀
- [x] `SettingsScreen` 新增信箱群組（含未讀 badge + 優惠碼入口）

**翻譯**
- [x] 4 語系共 36 組 keys（zh-TW 完整、en 完整、ja/ko TODO 標記）

---

### 2026-02-10 #043：規則引擎（統一成就/任務/獎勵）

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #043 |
| 狀態 | ✅ 完成 |

**API 層**
- [x] `src/types/rules.ts` — 完整型別（RuleItem、RewardPayload、ConditionResult 等）
- [x] `src/services/rulesApi.ts` — 4 個端點
  - `GET /api/rules` — 規則列表（成就 + 任務 + 獎勵觸發）
  - `GET /api/rules/chains/:chainId` — 任務鏈詳情
  - `GET /api/rules/:id` — 規則詳情
  - `POST /api/rules/:id/claim` — 領取獎勵
- [x] 註冊到 `types/index.ts` + `api.ts`

**UI 整合**
- [x] `EconomyScreen.tsx` 全面重寫
  - 移除靜態 mock（DAILY_TASKS、ONETIME_TASKS）
  - 改用 `rulesApi.getRules()` 動態載入
  - 領取功能（`claimReward`）+ 成功提示
  - 導航按鈕（`navigateTo` → gacha/collection/vote/shop/referral/crowdfund）
  - Tab 映射：daily/weekly → 每日、none → 一次性、achievement → 累計
  - 待領取數量卡片（綠色高亮）
- [x] 8 組翻譯 keys（4 語系）

---

### 2026-02-10 #044：移除廢棄密碼認證 API

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #044 |
| 狀態 | ✅ 完成 |

**移除項目**
- [x] 刪除 `AuthScreen.tsx`（559 行密碼登入/註冊畫面）
- [x] `authApi.ts` 移除 `register()`、`login()`、`mergeAccount()`、`getMergeHistory()`
- [x] `api.ts` 移除 register/login proxy bindings
- [x] `shared/index.ts` 移除 AuthScreen export
- [x] 相關型別（MergeSummary、MergeAccountResponse 等）一併移除

**保留項目**
- OAuth 登入（`authApi.mobileAuth()`）不受影響
- `app/login.tsx` Google/Apple 登入流程正常

---

### 2026-02-10 #042：推播通知偏好設定開通

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #042 |
| 狀態 | ✅ 完成 |

**實作內容**
- [x] `SettingsScreen.tsx` 取消隱藏 3 個設定群組
  - 探索：成就與任務
  - 偏好設定：我的最愛/黑名單 + 推播通知
  - 更多功能：帳號綁定 + 社群貢獻
- [x] 推播通知開關連接 `pushNotificationService`
  - 開啟 → `registerTokenWithBackend()`
  - 關閉 → `unregisterToken()`
- [x] 通知偏好持久化到 AsyncStorage

---

### 2026-02-10 📋 請求：Token Refresh API

| 項目 | 內容 |
|------|------|
| 來源 | APP 端 1000 DAU 架構審查 |
| 狀態 | 🟡 等後端提供 |
| 優先級 | 中（有 401 攔截器兜底，但用戶體驗不夠無縫） |

**需求說明**
- 目前 Token 過期後，401 攔截器會自動登出用戶，需重新登入
- 理想做法：Token 快過期時自動 refresh，用戶無感
- 需要後端提供 `POST /api/auth/refresh` endpoint

**建議 API 規格**
```
POST /api/auth/refresh
Authorization: Bearer {expiring-token}

Response:
{
  "token": "new-jwt-token",
  "expiresIn": 86400
}
```

**前端已準備**
- `base.ts` 已有 401 攔截器（`setOnUnauthorized`），可擴展為先嘗試 refresh 再登出
- 收到 refresh endpoint 後，前端預估 1-2 小時可完成串接

---

### 2026-02-08 🔧 技術債：多語系 isZh 全面遷移到 t 字典

| 項目 | 內容 |
|------|------|
| 來源 | APP 端截圖審查發現 |
| 狀態 | ✅ 已完成（剩餘 TutorialOverlay 特殊案例保留） |
| 嚴重度 | 中（日/韓語系完全無效，中/英切換部分有效） |

**問題描述**
- 設定頁支援 4 國語系（zh-TW、en、ja、ko）
- `setLanguage()` 機制正常，`t` 翻譯字典正確更新
- 但全 app **43 個檔案共 963 處** 使用 `isZh ? '中文' : 'English'` 硬判斷
- 等同只支援中/英，日/韓語系全部 fallback 到英文

**影響範圍**
- 43 個檔案（幾乎所有畫面）
- Tab layout 用 `t` 字典（✅ 正常）
- 其餘畫面用 `isZh ?`（❌ 只有中/英）

**修復方案**
1. 確認 `translations.ts` 四國字典 key 完整覆蓋所有文字
2. 逐檔替換 `isZh ? '...' : '...'` → `t.key`
3. 需獨立開一輪批次執行（預估工作量大）

---

### 2026-02-07 🐛 BUG：Apple 登入的超管帳號不被識別為 isSuperAdmin

| 項目 | 內容 |
|------|------|
| 來源 | APP 端測試發現 |
| 狀態 | ✅ 後端已修復 |
| 嚴重度 | 中（超管無法使用無限扭蛋等特權） |

**問題描述**
- 超管使用 Apple Sign-In 登入
- 扭蛋仍被限制每日 36 次，未被識別為超級管理員
- `state.user?.isSuperAdmin` 為 `undefined` 或 `false`

**技術分析**

| 層級 | 狀態 | 說明 |
|------|------|------|
| 前端 checkDailyLimit() | ✅ 正確 | `if (state.user?.isSuperAdmin) return true` |
| 前端 UNLIMITED_EMAILS | ❌ 失效 | Apple relay email 不是 `s8869420@gmail.com` |
| 後端 GET /api/auth/user | ❓ 待確認 | 是否回傳 `isSuperAdmin: true` |

**根本原因推測**

Apple Sign-In 產生的是隱藏 email（如 `xxxxx@privaterelay.appleid.com`），後端可能用 email 判斷超管身份，導致 Apple 帳號無法匹配。

**前端防線（兩層都失效）**
```
1. isSuperAdmin 判斷 → 後端沒回傳 true → 失效
2. UNLIMITED_EMAILS 白名單 → Apple relay email 不匹配 → 失效
```

**建議修復**

後端請確認以下任一方案：

1. **方案 A（推薦）**：在 `GET /api/auth/user` 回傳中，確保 Apple 登入的超管帳號也帶 `isSuperAdmin: true`
   - 可能需要用 user ID 而非 email 判斷超管身份
   - 或在資料庫中手動設定該 Apple 帳號的 `isSuperAdmin = true`

2. **方案 B**：提供超管帳號的 Apple relay email，讓前端加入 `UNLIMITED_EMAILS` 白名單
   - 不推薦：relay email 可能會變

**前端已準備**
- `GachaScreen.tsx:339-341` — `isSuperAdmin` 判斷已就位
- `AppContext.tsx:209-212` — `getUserWithToken` 回傳的 user 直接存入 state
- 只要後端回傳 `isSuperAdmin: true`，前端立即生效

---

### 2026-02-07 #041：超管無限額度支援

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #041 |
| 狀態 | ✅ 完成 |

**實作內容**
- [x] EconomyScreen：`dailyPullLimit === -1` 時顯示「∞」和「無限抽」
- [x] EconomyScreen：`inventorySlots >= 999` 時顯示「∞」和「背包無限」
- [x] 所有 4 個顯示位置統一處理（權益標籤、底部權益行、統計卡片、權益 Tab 詳情）
- [x] `||` 改 `??` 避免 `0` 值被錯誤 fallback

**注意**：GachaScreen 的 `checkDailyLimit()` 已在先前版本支援 `isSuperAdmin` 無限抽卡，無需額外修改。

---

### 2026-02-07 #040-B：PATCH profile 回應欄位補齊

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #040 |
| 狀態 | ✅ 完成 |

**型別更新** (`src/types/auth.ts`)
- [x] `UserProfile` 新增 `roles?: string[]` — 角色陣列
- [x] `UserProfile` 新增 `isSuperAdmin?: boolean` — 超管標記
- [x] `UserProfile` 新增 `createdAt?: string` — 帳號建立時間
- [x] `ProfileResponse` 新增 `token?: string` — 更新 name/email 時回傳新 token

**ProfileScreen 更新** (`ProfileScreen.tsx`)
- [x] `handleSave` merge 完整欄位：email、profileImageUrl、role、isSuperAdmin、roles
- [x] 回傳新 token 時正確儲存（`setUser(updatedUser, response.token)`）
- [x] 修正 `profileImageUrl` 使用直接賦值（允許後端回傳 null 清除頭像）

---

### 2026-02-05 #040：AI 對話體驗優化

| 項目 | 內容 |
|------|------|
| 來源 | APP 端自主優化 |
| 狀態 | ✅ 完成 |

**打字機效果** (`ItineraryScreenV2.tsx`)
- [x] AI 回覆文字逐字顯示，模擬真人打字
- [x] 打字速度：每字 30ms
- [x] 打字中顯示游標閃爍效果
- [x] 組件卸載時自動清理 timer

**V2.3 API 支援** (`itineraryApi.ts`)
- [x] `AiChatRequest` 新增 `previousSuggestions` 欄位
- [x] 傳遞上一輪推薦給 AI，讓 AI 理解「好」「第一個」等確認回覆
- [x] 改善 AI 對話的上下文理解能力

**UI 修復**
- [x] 修復建立行程後抽屜無法自動關閉的問題
- [x] 空狀態頁面新增「建立行程」按鈕
- [x] Toast 樣式改為扭蛋說明風格（底部顯示）
- [x] 用戶操作成功時不跳通知（減少干擾）
- [x] Google Maps 按鈕改用名稱+經緯度精確定位
- [x] 鍵盤彈出時自動滾動聊天到底部

---

### 2026-02-05 #039：經濟系統重構（等級 → 金幣）

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #039 |
| 狀態 | ✅ 完成 |

**破壞性變更**
- 等級系統移除，改為金幣系統
- 經驗值（XP）改為金幣（Coins）

**型別更新** (`src/types/economy.ts`)
- [x] 新增 `UserCoinsResponse` - 金幣餘額資訊
- [x] 新增 `UserPerksResponse` - 用戶權益資訊
- [x] 新增 `CoinTransaction` - 金幣交易記錄
- [x] 新增 `CoinHistoryResponse` - 金幣歷史回應
- [x] 新增 `SpecialistEligibilityResponse` - 策劃師申請資格
- [x] 新增 `PerksReward` - 權益獎勵內容
- [x] 更新 `AchievementReward`：`exp` → `coinReward`，新增 `perksReward`
- [x] 更新 `ClaimAchievementResponse`：改為回傳 `coins` + `perks`

**API 服務更新** (`src/services/economyApi.ts`)
- [x] 新增 `getCoins()` - `GET /api/user/coins`
- [x] 新增 `getCoinsHistory()` - `GET /api/user/coins/history`
- [x] 新增 `getPerks()` - `GET /api/user/perks`
- [x] 新增 `getSpecialistEligibility()` - `GET /api/user/specialist/eligibility`
- [x] 保留 `getLevelInfo()` 向後兼容（已標記 @deprecated）

**UI 更新** (`EconomyScreen.tsx`)
- [x] User Card：等級 → 金幣餘額
- [x] Stats Cards：等級/階段 → 金幣/成就/每日抽數
- [x] Tab：「等級」 → 「權益」
- [x] 權益 Tab：顯示每日扭蛋上限、背包格數、策劃師資格
- [x] 任務獎勵：XP → 金幣圖示
- [x] 成就獎勵：`exp` → `coinReward`

---

### 2026-02-02 🐛 BUG：AI 對話時間錯誤

| 項目 | 內容 |
|------|------|
| 來源 | APP 端測試發現 |
| 狀態 | ✅ 已解決 |
| 嚴重度 | 低（不影響功能，但體驗不佳） |

**問題描述**
- 今天是禮拜二，但 AI 說今天是禮拜一
- AI 不知道當前的日期時間

**建議修復**

在呼叫 AI 時，將當前日期時間作為 system prompt 的一部分傳給 AI：

```typescript
// 後端 AI prompt 範例
const systemPrompt = `
你是一個旅遊助手。
當前時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
今天是：${new Date().toLocaleDateString('zh-TW', { weekday: 'long', timeZone: 'Asia/Taipei' })}
...其他 prompt
`;
```

這樣 AI 就能正確知道今天是什麼日期、星期幾。

---

### 2026-02-02 #038：頭像上傳功能

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #038 |
| 狀態 | ✅ 完成 |

**實作內容**
- [x] 安裝 `expo-image-picker` 套件
- [x] `authApi.ts` 新增 `uploadAvatar()` 方法（Base64 JSON 格式）
- [x] `authApi.ts` 新增 `UploadAvatarResponse` 型別
- [x] `ProfileScreen.tsx` 實作圖片選擇和上傳功能
- [x] ImagePicker 設定 `base64: true` 直接取得 base64
- [x] 支援正方形裁切（1:1）和壓縮（0.8 品質）
- [x] 自訂頭像 URL 儲存到 AsyncStorage
- [x] 頭像區塊支援顯示自訂頭像圖片

**API 端點**
```
POST /api/avatar/upload
Content-Type: application/json

Request:
{
  "image": "base64字串...",
  "mimeType": "image/jpeg"  // 可選，支援 jpeg/png/webp
}

Response:
{
  "success": true,
  "avatarUrl": "https://..."
}
```

**限制**：最大 2MB

---

### 2026-01-30 📱 請求：上傳頭像 API（舊記錄）

| 項目 | 內容 |
|------|------|
| 來源 | APP 端需求（截圖 19-21） |
| 狀態 | ✅ 已由 #038 實作 |
| 優先級 | 中 |

**需求說明**

用戶想要上傳自訂頭像，目前 `UserProfile.profileImageUrl` 欄位已存在，但缺少上傳圖片的 API。

**建議 API 規格**

```
POST /api/avatar/upload
Content-Type: multipart/form-data

Request:
- file: 圖片檔案（建議限制 5MB、支援 jpg/png/webp）

Response:
{
  "success": true,
  "avatarUrl": "https://storage.example.com/avatars/user123.jpg"
}
```

**前端已準備**
- `ProfileScreen.tsx` 已預留上傳按鈕
- 型別 `UserProfile.profileImageUrl` 已存在
- 等 API 就緒後，前端使用 `expo-image-picker` 選擇圖片並上傳

**可選：預設頭像列表 API**

如果想讓用戶從預設頭像中選擇（而非只能上傳），可提供：
```
GET /api/avatars
Response:
{
  "avatars": [
    { "id": "cat", "imageUrl": "https://...", "color": "#F59E0B" },
    { "id": "star", "imageUrl": "https://...", "color": "#8B5CF6" }
  ]
}
```

---

### 2026-01-30 #037：個人資料頁面 UI 調整

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #037 |
| 狀態 | ✅ 完成 |

**實作內容**

1. **用戶 ID 截斷顯示**
   - 原本：`apple_001841.4e76a5ef7a914a4694d7ae760d3bd943.1507`
   - 現在：`apple_001841`（只顯示第一個點之前）
   - 新增 `displayUserId()` 輔助函數

2. **Email 欄位可編輯**
   - 從唯讀欄位改為 TextInput
   - 新增 `email` 到 `UpdateProfileParams` 型別
   - 儲存時傳送 email 給後端 API（後端已支援唯一性驗證）

**修改檔案**
- `src/modules/shared/screens/ProfileScreen.tsx`
- `src/types/auth.ts`

---

### 2026-01-30 🐛 BUG：AI 對話無法自動加入景點到行程

| 項目 | 內容 |
|------|------|
| 來源 | APP 端測試發現 |
| 狀態 | ✅ 已解決 |
| 嚴重度 | 中（功能可用但體驗不佳） |

**問題描述**
- 用戶對 AI 說「幫我加入 XX 餐廳到行程」
- 預期：AI 直接執行，回傳 `itineraryUpdated: true`
- 實際：AI 回覆「請從圖鑑手動選擇景點加入」

**技術分析**

| 層級 | 狀態 | 說明 |
|------|------|------|
| API 規格 | ✅ 支援 | `AiChatResponse` 有 `itineraryUpdated` + `updatedItinerary` 欄位 |
| 前端處理 | ✅ 有做 | 偵測到 `itineraryUpdated: true` 會刷新行程（`ItineraryScreenV2.tsx:269`） |
| 後端 AI | ❌ 未啟用 | AI prompt 只設定為「推薦」模式，不會主動執行操作 |

**前端程式碼確認**
```typescript
// ItineraryScreenV2.tsx:269
if (res.itineraryUpdated) {
  await fetchItineraryDetail(currentItinerary.id);  // ✅ 正確處理
}
```

**建議修復**

更新後端 AI prompt，讓 AI 在以下情況**直接執行**並回傳 `itineraryUpdated: true`：
- 用戶說「加入 XX」「把 XX 排進去」「我要去 XX」
- 用戶說「幫我安排 XX」「加這個」
- 用戶說「把 XX 移到最後」「重新排序」

AI 應該只在**模糊需求**時才進入推薦模式（回傳 `suggestions`）：
- 「推薦一些餐廳」「有什麼好玩的」

---

### 2026-01-30 #027-V2.2：AI 對話升級 V2.2

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #027 V2.2 升級 |
| 狀態 | ✅ 完成 |

**新增型別定義**
```typescript
// src/types/itinerary.ts
export type AiDetectedIntent = 'plan' | 'modify' | 'detail' | 'route' | 'chitchat' | 'unsupported';
export type AiNextAction = 'ask_preference' | 'show_suggestions' | 'confirm_add' | 'show_detail' | 'optimize_route' | null;
export interface AiActionTaken { type: string; result?: unknown; }
```

**AiChatResponse 新增欄位**
- `detectedIntent` - AI 偵測到的意圖
- `nextAction` - 建議的下一步動作
- `actionTaken` - Function Calling 執行結果

**AiChatContext 新增欄位**
- `userPreferences` - 用戶偏好（favoriteCategories, recentDistricts, collectionCount）

**前端處理邏輯**
- `detectedIntent === 'chitchat' | 'unsupported'` 時不顯示推薦卡片
- `actionTaken.type === 'add_place' | 'remove_place'` 時顯示成功訊息
- 傳送 `userPreferences` 給後端用於個人化推薦

---

### 2026-01-29 #036：帳號合併功能

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #036 |
| 狀態 | ✅ 完成 |

**實作內容**
- [x] `authApi.ts` 新增帳號合併 API
  - `mergeAccount(token, secondaryToken)` - 執行帳號合併
  - `getMergeHistory(token)` - 查詢合併歷史
- [x] 新增型別定義
  - `MergeSummary` - 合併結果摘要
  - `MergeAccountResponse` - 合併回應
  - `MergeHistoryItem` / `MergeHistoryResponse` - 歷史記錄
- [x] `SettingsScreen.tsx` 新增「合併帳號」功能
  - 設定 > 帳號管理 > 合併帳號
  - 四步驟流程：警告 → 登入副帳號 → 處理中 → 結果
  - 顯示合併摘要（圖鑑、行程、成就、經驗值等）
- [x] `AuthScreen.tsx` 支援嵌入模式
  - 新增 `embedded` prop（不顯示 Modal 外殼）
  - 新增 `onLoginSuccess` callback（回傳 token）
  - 新增 `title` prop（自訂標題）

**錯誤碼處理**
| 錯誤碼 | 說明 |
|--------|------|
| E15001 | 副帳號 token 無效 |
| E15002 | 不能合併同一個帳號 |
| E15003 | 副帳號已被合併過 |
| E15004 | 合併過程錯誤 |

---

### 2026-01-29 #034：共用型別套件

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #034 |
| 狀態 | ✅ 完成 |

**實作內容**
- [x] 建立 `shared/` 資料夾（從後端複製）
- [x] `shared/index.ts` - 主入口，匯出所有模組
- [x] `shared/errors.ts` - 100+ 錯誤碼定義 + ErrorMessages + helper functions
- [x] `shared/constants.ts` - 七大分類、扭蛋配額、成就類別等共用常數
- [x] `shared/response.ts` - API 回應格式規範 + `API_RESPONSE_FORMAT` 對照表
- [x] `shared/id-conventions.ts` - ID 命名規範（placeId vs collectionId vs itemId）
- [x] `shared/api-types.ts` - 所有 API 的 Request/Response 型別定義
- [x] 更新 `tsconfig.json` 加入 `@shared/*` 和 `@shared` 路徑映射

**使用方式**
```typescript
import {
  ErrorCode, isAuthError,
  SEVEN_CATEGORIES, GACHA_CONFIG,
  API_RESPONSE_FORMAT, isApiError,
  CollectionId, ItineraryItemId,
  V2GachaPullResponse, ItineraryDetailResponse,
} from '@shared';
```

**型別一致性修正**
- [x] `src/types/common.ts` - re-export from `@shared`，保持向後兼容
- [x] `src/types/itinerary.ts` - `PlaceCategory` 改為使用 `MibuCategory`
- [x] `src/types/errors.ts` - 新增 `@shared` 錯誤碼匯出
- [x] `src/shared/errors.ts` - 完全改為 re-export from `@shared`
- [x] `GachaScreen.tsx` - 修正 `GACHA_DAILY_LIMIT` → `GACHA_RATE_LIMITED`
- [x] 新增 `LEGACY_ERROR_MAPPING` 映射舊英文錯誤碼到新格式
- [x] `isAuthError()` 向後兼容，接受 `string | undefined`

---

### 2026-01-29 🐛 BUG：行程「選擇景點」顯示空（圖鑑有資料）【已修復】

| 項目 | 內容 |
|------|------|
| 來源 | APP 端發現 |
| 狀態 | ✅ 已修復（#035） |
| 嚴重度 | **緊急**（核心功能完全失效） |
| 修復日期 | 2026-02-05 確認後端已部署模糊比對修復 |

**問題描述**
- 用戶圖鑑有 **1023 個景點**（宜蘭縣 442、台北市 367、高雄市 112、新北市 35...）
- 但在行程「從圖鑑加入景點」Modal 顯示「圖鑑中沒有可加入的景點」

**根本原因（已確認）**

資料流程不一致：
```
places.city (原始資料) → collections.city (抽卡複製)
                              ↓
                         精確比對 eq()
                              ↓
itinerary.city (建立行程) ← regions.nameZh (選擇器)
```

問題出在 `places.city` 和 `regions.nameZh` 是**兩個獨立的資料來源**，格式可能不一致：
- `collections.city`（來自 `places.city`）：可能是 "台北"、"Taipei"、"臺北市"
- `itinerary.city`（來自 `regions.nameZh`）：可能是 "台北市"

後端 `available-places` 使用**精確匹配**：
```typescript
const cityCondition = eq(collections.city, itinerary.city as string);
```

兩邊名稱不一致 → 查詢結果永遠為空

**Schema 確認**
```typescript
// collections 表
city: text("city").notNull(),  // 無外鍵，直接存文字

// places 表
city: text("city").notNull(),  // 無外鍵，直接存文字

// regions 表
nameZh: text("name_zh").notNull(),  // 用於 UI 選擇器
```

三個表的 city 都是獨立的 text 欄位，沒有關聯約束，導致格式不一致。

**建議修復方案**

**方案 A（推薦，最快）**：移除城市篩選
```typescript
// 讓用戶可以從所有圖鑑收藏中選擇，不限城市
const availablePlaces = await db
  .select(...)
  .from(collections)
  .where(and(
    eq(collections.userId, userId),
    or(eq(collections.isCoupon, false), isNull(collections.isCoupon))
  ));
```
理由：用戶可能想把別的城市景點加入行程（例如一日遊跨城市）

**方案 B**：模糊匹配
```typescript
// 使用 LIKE 或 ILIKE 做模糊比對
const cityCondition = sql`${collections.city} ILIKE ${'%' + baseCity + '%'}`;
```

**方案 C（長期）**：資料標準化
- `collections.city` 改為外鍵關聯 `regions.id`
- 或在存入時統一轉換為 `regions.nameZh` 格式

---

### 2026-01-28 #033：行程詳情新增景點座標與描述欄位 + V2 API 串接

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #033 |
| 狀態 | ✅ 完成 |

**#033 實作內容**
- [x] `types/itinerary.ts` 新增 `description`, `locationLat`, `locationLng` 欄位
- [x] 支援後端新結構（`place` 巢狀物件）
- [x] `ItineraryScreenV2.tsx` 新增 `openInMaps()` 函數
- [x] 地圖按鈕：有座標時開啟原生地圖導航（iOS/Android/Web）
- [x] 無座標時按鈕顯示為禁用狀態

**ItineraryScreenV2 完整 API 串接**
- [x] 載入行程列表 `GET /api/itinerary`
- [x] 載入行程詳情 `GET /api/itinerary/:id`
- [x] AI 對話 `POST /api/itinerary/:id/ai-chat`
- [x] 移除景點 `DELETE /api/itinerary/:id/places/:itemId`
- [x] 排序景點 `PUT /api/itinerary/:id/places/reorder`
- [x] 加入景點 `POST /api/itinerary/:id/places`
- [x] 取得可用景點 `GET /api/itinerary/:id/available-places`
- [x] 行程切換（左側邊欄）
- [x] 未登入/載入中/無行程狀態處理
- [x] AI 建議景點顯示
- [x] 多語言支援（中/英）

**新增 UI 功能**
- [x] 上/下箭頭排序景點（右側行程表）
- [x] 從圖鑑加入景點 Modal（多選、分類顯示）

---

### 2026-01-28 #030-#032：API 回應格式修正 + 扭蛋防刷 + 契約對齊

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #030-#032 |
| 狀態 | ✅ 完成 |

**#030 API 回應格式自檢與修正**
- [x] `itineraryApi.ts` - 所有方法已包裝 `success: true/false`
- [x] `collectionApi.ts` - `getFavorites`, `getPromoUpdates` 已包裝
- [x] `inventoryApi.ts` - `getInventory` 已包裝
- [x] `referralApi.ts` - `getLeaderboard` 已包裝
- [x] 確認其他 API（referral, contribution, inventory）類型定義有 `success`

**#031 扭蛋 API 新增 deviceId 參數**
- [x] 安裝 `expo-application` 套件
- [x] `gachaApi.ts` 新增 `getDeviceId()` helper function
- [x] `generateItinerary()` 參數新增 `deviceId`
- [x] `GachaScreen.tsx` 呼叫時帶入 `deviceId`
- [x] 新增 `DEVICE_LIMIT_EXCEEDED` 錯誤處理

**#032 全面契約對齊檢查**
- [x] 系統性驗證 22 個 API 服務檔案
- [x] 端點覆蓋率：100%
- [x] HTTP 方法一致性：99%
- [x] 認證處理：100% 正確
- [x] Success 欄位處理：100%（#030 問題已完全解決）

**#032 發現的輕微問題（不影響功能）**
- 地點促銷 API 端點有兩個版本（`/api/place/promo` vs `/api/collections/place/promo`）
- `PUT /api/itinerary/:id` 回傳格式在契約中未定義（需與後端確認）

---

### 2026-01-26 #026-#029：行程規劃 + AI 助手 + 優惠通知 + 用詞統一

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #026-#029 |
| 狀態 | ✅ 完成 |

**#026 行程安排 API V2 Breaking Change**
- [x] 建立 `src/types/itinerary.ts` - 行程相關型別定義
- [x] 建立 `src/services/itineraryApi.ts` - 行程管理 API 服務
- [x] 更新 `ItineraryScreen.tsx` - 使用 `collectionIds` 而非 `placeIds`
- [x] 刪除/排序使用 `itemId` (itinerary_places.id)

**#027 AI 對話式排程**
- [x] 實作 `POST /api/itinerary/:id/ai-chat` - AI 對話推薦
- [x] 實作 `POST /api/itinerary/:id/ai-add-places` - 加入 AI 建議
- [x] `ItineraryScreen.tsx` 新增 AI 助手對話介面

**#028 圖鑑優惠更新通知**
- [x] 新增 `PromoUpdatesResponse` 型別
- [x] 實作 `GET /api/collections/promo-updates`
- [x] 實作 `PATCH /api/collections/:id/promo-read`
- [x] `CollectionScreen.tsx` 顯示「優惠更新」紅點標籤

**#029 用詞統一**
- [x] `AchievementCategory`: `investor` → `sponsor`
- [x] 註解更新：投資者 → 贊助者

---

### 2026-01-23 #025：APP 改善計劃全面實作

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #025 |
| 狀態 | ✅ 完成 |

**11 個功能全部完成**（多語言切換暫緩除外）

| # | 功能 | 實作位置 |
|---|------|----------|
| 1 | 首頁活動區塊 | `HomeScreen.tsx` 整合 `eventApi` |
| 2 | 成就觸發 | `GachaScreen.tsx` 成就解鎖彈窗 |
| 3 | 扭蛋頁面 UI | 純前端已完成 |
| 4 | 圖鑑未讀 | `collectionApi.ts` `sort=unread` + `markCollectionItemRead` |
| 5 | Profile 更新 | `authApi.ts` `GET/PATCH /api/profile` |
| 6 | 推薦碼 G/A 格式 | `ReferralScreen.tsx` 已使用新格式 |
| 7 | 多語言切換 | ⏸️ 暫緩 |
| 8 | RevenueCat 募資 | `revenueCatService.ts` |
| 9 | 每日任務導航 | `economyApi.ts` |
| 10 | 推播通知 | `pushNotificationService.ts` |
| 11 | 社群貢獻 | `contributionApi.ts` |

---

### 2026-01-21 #024：Google 原生登入

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #024 |
| 狀態 | ✅ 完成 |

**完成項目**
- [x] 安裝 `expo-auth-session`, `expo-crypto`, `expo-web-browser`
- [x] 建立 `hooks/useGoogleAuth.ts` Hook
- [x] 更新 `app/login.tsx`（iOS/Android 原生登入、Web 保留 OAuth）

**注意**：需重新 build APP 才能測試（Expo Go 無法使用原生登入）

---

### 2026-01-21 #023：登入 API 回傳用戶姓名

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #023 |
| 狀態 | ✅ 後端已修復，APP 端已對應 |

**修復內容**
- JWT Token 現包含 `firstName`, `lastName`, `profileImageUrl`
- `app/login.tsx` 已從 `response.user.firstName` 取得姓名

---

### 2026-01-21 #021-022：Push Token API + Profile API

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #021-022 |
| 狀態 | ✅ 完成 |

**完成項目**
- [x] `commonApi.registerPushToken()` → `POST /api/notifications/register-token`
- [x] Profile API 統一為 `GET/PATCH /api/profile`

---

## 歷史回報摘要

| # | 日期 | 主題 | 狀態 |
|---|------|------|------|
| 053 | 02-20 | specialist→partner 改名 + 自己人/商家申請系統 | ✅ |
| 052 | 02-20 | 推播通知完整串接（補完勿擾時段時間編輯） | ✅ |
| 050 | 02-15 | APP 金流頁面處理 E1016 錯誤（訪客金流限制攔截器） | ✅ |
| 049 | 02-15 | 訪客登入改為呼叫後端 API（後端建帳 + 發 JWT） | ✅ |
| 048 | 02-13 | 商城商品管理（管理員 CRUD）型別 + API + Hooks + UI | ✅ |
| 047 | 02-13 | 獎勵發送 API 升級（全體廣播）型別 + API + Hooks + UI | ✅ |
| 046 | 02-13 | 訪客自動升級（登入帶 deviceId）型別 + API + 登入流程 | ✅ |
| 045 | 02-10 | 信箱系統（統一收件箱 + 優惠碼）API + UI + 路由 | ✅ |
| 043 | 02-10 | 規則引擎 API + EconomyScreen 動態整合 | ✅ |
| 044 | 02-10 | 移除廢棄密碼認證 API（register/login/merge） | ✅ |
| 042 | 02-10 | 推播通知偏好設定開通 + 取消隱藏設定群組 | ✅ |
| 技術債 | 02-08 | 多語系 isZh→t 字典遷移（963處→4處，僅剩 TutorialOverlay 特殊案例） | ✅ |
| BUG | 02-07 | Apple 登入超管帳號 isSuperAdmin 未被識別 | ✅ |
| 041 | 02-07 | 超管無限額度支援（dailyPullLimit=-1、inventorySlots=999） | ✅ |
| 040-B | 02-07 | PATCH profile 回應欄位補齊（isSuperAdmin、roles、createdAt、token） | ✅ |
| 040 | 02-05 | AI 對話體驗優化（打字機效果 + V2.3 API） | ✅ |
| 039 | 02-05 | 經濟系統重構（等級 → 金幣） | ✅ |
| 038 | 02-02 | 頭像上傳功能 | ✅ |
| BUG | 02-02 | AI 對話時間錯誤（星期幾判斷錯誤） | ✅ |
| 035 | 02-05 | 選擇景點空白修復（後端模糊比對） | ✅ |
| 027-V2.2 | 01-30 | AI 對話升級 V2.2（意圖識別 + Function Calling） | ✅ |
| BUG | 01-30 | AI 對話無法自動加入景點到行程 | ✅ |
| 036 | 01-29 | 帳號合併功能 | ✅ |
| 034 | 01-29 | 共用型別套件（@shared 模組） | ✅ |
| 033 | 01-28 | 行程詳情新增景點座標與描述 + V2 完整功能 | ✅ |
| 030-032 | 01-28 | API 回應格式修正 + 扭蛋防刷 + 契約對齊 | ✅ |
| 026-029 | 01-26 | 行程規劃 V2 + AI 助手 + 優惠通知 + 用詞統一 | ✅ |
| 025 | 01-23 | APP 改善計劃全面實作（11 功能） | ✅ |
| 024 | 01-21 | Google 原生登入 | ✅ |
| 023 | 01-21 | 登入 API 回傳用戶姓名 | ✅ |
| 021-022 | 01-21 | Push Token API + Profile API | ✅ |
| 020 | 01-20 | Phase 2 後端完成（推播、圖鑑未讀、成就、RevenueCat） | ✅ |
| 019 | 01-19 | UI 調整（背景/卡片顏色調換、設定頁整理） | ✅ |
| 018 | 01-19 | Lovable 設計系統實作（FilterChips、SearchInput 等 4 元件） | ✅ |
| 017 | 01-19 | Bug 修復（EconomyScreen 渲染、用戶名消失）+ 設計標準化 | ✅ |
| 013 | 01-19 | API 補齊（E10xxx-E13xxx 錯誤碼、優惠券驗證、SOS 取消） | ✅ |
| 012 | 01-19 | 六層架構一致性比對（50+ 端點對齊） | ✅ |
| 011 | 01-19 | 低優先級 API（SOS status/location、背包 add） | ✅ |
| 010 | 01-19 | 中優先級 API（config、推播、行程提交、地區端點對齊） | ✅ |
| 009 | 01-19 | 高優先級 API（每日任務、最愛、扭蛋額度）| ✅ |
| 008 | 01-19 | API 服務層補齊（排行榜、緊急聯絡人 CRUD） | ✅ |
| 007 | 01-18 | UI 風格更新（EconomyScreen、CrowdfundingScreen、ReferralScreen） | ✅ |
| 006 | 01-17 | Phase 2-4 畫面（募資、推薦、貢獻） | ✅ |
| 005 | 01-17 | Phase 1+5 畫面（經濟系統、帳號綁定） | ✅ |
| 004 | 01-17 | CLAUDE.md 更新（Phase 5-6 服務、契約版本） | ✅ |
| 003 | 01-17 | 型別+API 服務建立（economy、crowdfunding、referral、contribution） | ✅ |
| 002 | 01-16 | 記憶庫整理、歸檔舊文件 | ✅ |
| 001 | 01-16 | 建立同步機制、三端協作段落 | ✅ |

---

## 詳細歷史（需要時展開）

<details>
<summary>點擊展開 #020 Phase 2 後端完成</summary>

### 2026-01-20 #020：Phase 2 後端完成

**任務 1：推播通知對接**
- 安裝 `expo-notifications`、`expo-device`
- 建立 `pushNotificationService.ts`
- 登入成功後註冊 Token、登出時取消註冊

**任務 2：圖鑑未讀標記**
- `collectionApi.getCollections()` 新增 `sort` 參數
- 新增 `markCollectionItemRead()` 方法
- 城市卡片顯示未讀計數紅點

**任務 3：推薦碼改版**
- 新增 G/A 格式說明文字

**任務 4：成就追蹤對接**
- `EconomyScreen.tsx` 新增「累計」Tab
- 扭蛋後顯示成就解鎖 Alert

**任務 5：RevenueCat 募資購買**
- 建立 `revenueCatService.ts`

</details>

<details>
<summary>點擊展開 #018 Lovable 設計系統</summary>

### 2026-01-19 #018：Lovable 設計系統實作

**新增元件**
- `FilterChips.tsx` - 篩選晶片
- `SearchInput.tsx` - 搜尋框
- `CtaButton.tsx` - CTA 按鈕
- `StatCard.tsx` - 統計卡片

**頁面更新**
- `EconomyScreen.tsx` - 任務分組卡片
- `HapticTab.tsx` - Tab Bar 選中背景
- `MerchantDashboardScreen.tsx` - 簡化選單

</details>

<details>
<summary>點擊展開 #012 六層架構一致性比對</summary>

### 2026-01-19 #012：六層架構一致性比對

**比對結果**
- 完全匹配端點：50+
- 前端缺失端點：2（已補齊）
- 缺失錯誤碼範圍：4（E10xxx-E13xxx，已補齊）

**完全匹配的服務**
- economyApi.ts (5)、crowdfundingApi.ts (4)、referralApi.ts (11)
- contributionApi.ts (11)、gachaApi.ts (6)、collectionApi.ts (6)
- inventoryApi.ts (4)、authApi.ts (8)、commonApi.ts (12)

</details>

<details>
<summary>點擊展開 #006 Phase 2-4 畫面</summary>

### 2026-01-17 #006：Phase 2-4 畫面

**Phase 2：眾籌**
- `CrowdfundingScreen.tsx` - 活動列表
- `CrowdfundingDetailScreen.tsx` - 活動詳情

**Phase 3：推薦**
- `ReferralScreen.tsx` - 推薦碼、好友列表、餘額

**Phase 4：貢獻**
- `ContributionScreen.tsx` - 回報、建議、投票

</details>

<details>
<summary>點擊展開 #003 型別+API 服務建立</summary>

### 2026-01-17 #003：型別+API 服務建立

**新增檔案**
- `src/types/economy.ts`, `crowdfunding.ts`, `referral.ts`, `contribution.ts`
- `src/services/economyApi.ts` (5 APIs)
- `src/services/crowdfundingApi.ts` (4 APIs)
- `src/services/referralApi.ts` (9 APIs)
- `src/services/contributionApi.ts` (11 APIs)

**總計**：32 個新 API

</details>
