# 🔄 後端同步回報

> APP 完成後端同步指令後，在此記錄狀態

---

## 最新回報

### 2026-01-19 #011：低優先級 API 補齊

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #011 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] `commonApi.ts` 新增 SOS 系統補齊
  - `getSOSStatus(token)` → `GET /api/sos/status`
  - `updateSOSLocation(token, sosId, location)` → `POST /api/sos/location`
- [x] `inventoryApi.ts` 新增背包系統補齊
  - `addInventoryItem(token, params)` → `POST /api/inventory/add`
- [x] 端點對齊修正
  - `collectionApi.saveToCollection`: `/api/collections` → `/api/collections/add`
  - `authApi.deleteAccount`: `/api/user/account` → `/api/auth/account`
  - `commonApi.sendSosAlert`: `/api/sos/alert` → `/api/sos/trigger`

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/sos/status` | 查詢 SOS 狀態 |
| `POST /api/sos/location` | 更新 SOS 位置 |
| `POST /api/inventory/add` | 新增物品到背包 |
| `POST /api/collections/add` | 新增收藏項目 |
| `DELETE /api/auth/account` | 刪除用戶帳號 |
| `POST /api/sos/trigger` | 發送緊急求救 |

### 異常回報
（無）

---

### 2026-01-19 #010：中優先級 API 補齊

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #010 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] `commonApi.ts` 新增設定 API
  - `getAppConfig()` → `GET /api/config/app`
  - `getMapboxToken()` → `GET /api/config/mapbox`
- [x] `commonApi.ts` 新增推播通知 API
  - `registerPushToken(token, params)` → `POST /api/notifications/register-token`
  - `markAllNotificationsRead(token)` → `POST /api/notifications/read-all`
  - `markNotificationRead(token, notificationId)` → `PATCH /api/notifications/:id/read`
- [x] `gachaApi.ts` 新增行程提交 API
  - `submitTrip(token, params)` → `POST /api/gacha/submit-trip`
- [x] `locationApi.ts` 端點對齊
  - `/api/locations/countries` → `/api/countries`
  - `/api/locations/regions/:id` → `/api/regions/:countryId`
  - `/api/locations/districts/:id` → `/api/districts/:regionId`
- [x] 新增型別定義
  - `src/types/gacha.ts`: `SubmitTripResponse`
  - `src/services/commonApi.ts`: `AppConfigResponse`

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/config/app` | 取得 App 設定 |
| `GET /api/config/mapbox` | 取得 Mapbox Token |
| `POST /api/notifications/register-token` | 註冊推播 Token |
| `POST /api/notifications/read-all` | 全部標記已讀 |
| `PATCH /api/notifications/:id/read` | 標記單一通知已讀 |
| `POST /api/gacha/submit-trip` | 提交行程至官網 SEO |
| `GET /api/countries` | 取得國家列表 |
| `GET /api/regions/:countryId` | 取得地區列表 |
| `GET /api/districts/:regionId` | 取得區域列表 |

### 異常回報
（無）

---

### 2026-01-19 #009：高優先級 API 補齊

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #009 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] `economyApi.ts` 每日任務 API（已有，確認無誤）
  - `getDailyTasks(token)` → `GET /api/user/daily-tasks`
  - `completeDailyTask(token, taskId)` → `POST /api/user/daily-tasks/:id/complete`
- [x] `collectionApi.ts` 我的最愛 API（已有，確認無誤）
  - `getFavorites(token)` → `GET /api/collections/favorites`
  - `addFavorite(token, placeId)` → `POST /api/collections/:placeId/favorite`
  - `removeFavorite(token, placeId)` → `DELETE /api/collections/:placeId/favorite`
  - `getFavoriteStatus(token, placeId)` → `GET /api/collections/:placeId/favorite/status`
- [x] `gachaApi.ts` 新增扭蛋額度 API
  - `getQuota(token)` → `GET /api/gacha/quota`
- [x] `gachaApi.ts` 端點對齊
  - `pullGacha`: `/api/gacha/pull` → `/api/gacha/pull/v3`
- [x] 更新型別定義
  - `src/types/gacha.ts`: 新增 `GachaQuotaResponse`
  - `src/types/economy.ts`: 更新 `DailyTask`, `DailyTasksResponse`, `CompleteDailyTaskResponse` 符合後端規格

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/user/daily-tasks` | 取得每日任務列表 |
| `POST /api/user/daily-tasks/:id/complete` | 領取每日任務獎勵 |
| `GET /api/collections/favorites` | 取得我的最愛列表 |
| `POST /api/collections/:placeId/favorite` | 加入我的最愛 |
| `DELETE /api/collections/:placeId/favorite` | 移除我的最愛 |
| `GET /api/collections/:placeId/favorite/status` | 檢查最愛狀態 |
| `GET /api/gacha/quota` | 取得今日扭蛋額度 |
| `POST /api/gacha/pull/v3` | 扭蛋抽獎 |

### 異常回報
（無）

---

### 2026-01-19 #009-前端審計

| 項目 | 內容 |
|------|------|
| 來源 | 前端 API 審計補齊（此為內部編號，非後端指令） |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] `collectionApi.ts` 新增我的最愛 API（4 個方法）
  - `getFavorites(token)` → `GET /api/collections/favorites`
  - `addFavorite(token, placeId)` → `POST /api/collections/:placeId/favorite`
  - `removeFavorite(token, placeId)` → `DELETE /api/collections/:placeId/favorite`
  - `getFavoriteStatus(token, placeId)` → `GET /api/collections/:placeId/favorite/status`
- [x] 新增 `configApi.ts` 服務（2 個方法）
  - `getAppConfig()` → `GET /api/config/app`
  - `getMapboxConfig(token)` → `GET /api/config/mapbox`
- [x] 新增 `couponApi.ts` 服務（2 個方法）
  - `getMyCoupons(token)` → `GET /api/coupons/my`
  - `redeemCoupon(token, params)` → `POST /api/coupons/redeem`
- [x] 新增型別定義
  - `src/types/collection.ts`: `FavoriteItem`, `FavoritesResponse`, `AddFavoriteResponse`
- [x] 新增 UI 頁面
  - `FavoritesScreen.tsx` - 我的最愛頁面（列表、移除功能）
  - `SOSContactsScreen.tsx` - 緊急聯絡人管理（CRUD 完整功能）
- [x] 新增路由
  - `app/favorites.tsx`
  - `app/sos-contacts.tsx`
- [x] 更新 `SettingsScreen.tsx` 新增導航入口

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/collections/favorites` | 取得我的最愛列表 |
| `POST /api/collections/:placeId/favorite` | 加入我的最愛 |
| `DELETE /api/collections/:placeId/favorite` | 移除我的最愛 |
| `GET /api/collections/:placeId/favorite/status` | 檢查最愛狀態 |
| `GET /api/config/app` | 取得 App 設定 |
| `GET /api/config/mapbox` | 取得 Mapbox Token |
| `GET /api/coupons/my` | 取得我的優惠券 |
| `POST /api/coupons/redeem` | 核銷優惠券 |

### 異常回報
（無）

---

### 2026-01-19 #008

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #008 API 服務層補齊 |
| 收到時間 | 2026-01-19 |
| 完成時間 | 2026-01-19 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] `economyApi.ts` 新增每日任務 API
  - `getDailyTasks(token)` → `GET /api/user/daily-tasks`
  - `completeDailyTask(token, taskId)` → `POST /api/user/daily-tasks/:id/complete`
- [x] `referralApi.ts` 新增排行榜 API
  - `getLeaderboard(token, params)` → `GET /api/referral/leaderboard`
  - `getMyRank(token)` → `GET /api/referral/leaderboard/my-rank`
- [x] `commonApi.ts` 新增緊急聯絡人 CRUD
  - `getSOSContacts(token)` → `GET /api/sos/contacts`
  - `addSOSContact(token, params)` → `POST /api/sos/contacts`
  - `updateSOSContact(token, contactId, params)` → `PUT /api/sos/contacts/:id`
  - `deleteSOSContact(token, contactId)` → `DELETE /api/sos/contacts/:id`
- [x] 新增對應 TypeScript 型別定義
  - `src/types/economy.ts`: `DailyTask`, `DailyTasksResponse`, `CompleteDailyTaskResponse`
  - `src/types/referral.ts`: `LeaderboardEntry`, `LeaderboardResponse`, `MyRankResponse`
  - `src/types/sos.ts`: `SOSContact`, `CreateSOSContactParams`, `UpdateSOSContactParams`
- [x] 更新 `ReferralScreen.tsx` 使用真實排行榜 API
  - 移除 MOCK_LEADERBOARD 模擬資料
  - 整合 `getLeaderboard()` 和 `getMyRank()` API
  - 新增空狀態顯示

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/user/daily-tasks` | 取得每日任務列表 |
| `POST /api/user/daily-tasks/:id/complete` | 完成每日任務 |
| `GET /api/referral/leaderboard` | 取得推薦排行榜 |
| `GET /api/referral/leaderboard/my-rank` | 取得我的排名 |
| `GET /api/sos/contacts` | 取得緊急聯絡人 |
| `POST /api/sos/contacts` | 新增緊急聯絡人 |
| `PUT /api/sos/contacts/:id` | 更新緊急聯絡人 |
| `DELETE /api/sos/contacts/:id` | 刪除緊急聯絡人 |

### 異常回報
（無）

---

### 2026-01-18 #007

| 項目 | 內容 |
|------|------|
| 來源 | 用戶指定截圖 UI 風格 |
| 收到時間 | 2026-01-18 |
| 完成時間 | 2026-01-18 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] 更新 `EconomyScreen.tsx` UI 風格
  - 新增用戶頭像 + 等級徽章
  - 新增統計列（已解鎖、等級、連續登入）
  - 新增 4-tab 切換（每日/一次性/累積/等級）
  - 任務列表改為圖標 + 標題 + XP 獎勵格式
- [x] 更新 `CrowdfundingScreen.tsx` → 「全球探索地圖」
  - Header 加入 globe 圖標
  - 統計列（已解鎖國家、募資進行中、即將開放）
  - 國家列表 + 狀態徽章（已解鎖/募資中/即將開放/敬請期待）
  - 募資中國家顯示進度條
  - 底部 CTA：「支持我們的理念」
- [x] 更新 `ReferralScreen.tsx` → 「邀請好友」
  - Hero 區塊（禮物圖標 + 標語）
  - 統計列（已邀請、活躍好友、累計 XP）
  - 推薦碼卡片（複製 + 分享按鈕）
  - 邀請獎勵里程碑（1/3/5/10 人）
  - 邀請紀錄列表

### 異常回報
（無）

---

### 2026-01-17 #006

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md (Phase 2-4) |
| 收到時間 | 2026-01-17 |
| 完成時間 | 2026-01-17 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] Phase 2: 建立 `CrowdfundingScreen.tsx` - 眾籌活動列表
  - 活動列表 (active/upcoming/completed)
  - 進度條、贊助者數量、截止日期
  - 我的贊助記錄
- [x] Phase 2: 建立 `CrowdfundingDetailScreen.tsx` - 眾籌詳情
  - 活動詳情、獎勵階層選擇
  - 更新動態、贊助按鈕
- [x] Phase 3: 建立 `ReferralScreen.tsx` - 推薦系統
  - 推薦碼生成/複製/分享
  - 輸入推薦碼套用
  - 推薦好友列表
  - 餘額查看、交易記錄
- [x] Phase 4: 建立 `ContributionScreen.tsx` - 用戶貢獻
  - 回報歇業/搬遷
  - 建議新景點
  - 社群投票 (排除/保留景點, 審核建議景點)
- [x] 建立路由: `crowdfunding.tsx`, `crowdfunding/[id].tsx`, `referral.tsx`, `contribution.tsx`
- [x] 更新 `SettingsScreen.tsx` 加入社群功能區塊

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/crowdfund/campaigns` | 取得募資活動列表 |
| `GET /api/crowdfund/campaigns/:id` | 取得活動詳情 |
| `POST /api/crowdfund/contribute` | 參與募資 |
| `GET /api/crowdfund/my-contributions` | 個人募資記錄 |
| `GET /api/referral/my-code` | 取得推薦碼 |
| `POST /api/referral/generate-code` | 生成推薦碼 |
| `GET /api/referral/validate/:code` | 驗證推薦碼 |
| `POST /api/referral/apply` | 套用推薦碼 |
| `GET /api/referral/my-referrals` | 推薦人列表 |
| `GET /api/referral/balance` | 餘額查詢 |
| `GET /api/referral/transactions` | 交易記錄 |
| `GET /api/contribution/my-reports` | 我的回報 |
| `GET /api/contribution/my-suggestions` | 我的建議 |
| `GET /api/contribution/pending-votes` | 待投票景點 |
| `GET /api/contribution/pending-suggestions` | 待審核建議 |
| `POST /api/contribution/vote/:placeId` | 投票排除/保留 |
| `POST /api/contribution/vote-suggestion/:id` | 建議投票 |

### 異常回報
（無）

---

### 2026-01-17 #005

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md (Phase 1 + Phase 5) |
| 收到時間 | 2026-01-17 |
| 完成時間 | 2026-01-17 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] 建立 `src/modules/traveler/screens/EconomyScreen.tsx` - 經濟系統畫面
  - 用戶等級和 XP 進度條 (via `GET /api/user/level`)
  - 成就徽章 grid (via `GET /api/user/achievements`)
  - 領取獎勵功能 (via `POST /api/user/achievements/:id/claim`)
  - 近期經驗歷史顯示
  - 類別篩選 (collector, investor, promoter, business, specialist)
  - 等級徽章樣式 (bronze, silver, gold, platinum)
- [x] 建立 `src/modules/shared/screens/AccountScreen.tsx` - 帳號綁定畫面
  - 顯示已連結帳號 (Apple/Google)
  - OAuth 綁定按鈕 (Apple Sign In 已實作)
  - 解除綁定功能
  - 主要帳號標示
- [x] 建立路由 `app/economy.tsx` 和 `app/account.tsx`
- [x] 更新 `src/modules/traveler/index.ts` 匯出 EconomyScreen
- [x] 更新 `src/modules/shared/index.ts` 匯出 AccountScreen
- [x] 更新 `SettingsScreen.tsx` 加入新畫面入口

### 使用的 API
| Endpoint | 功能 |
|----------|------|
| `GET /api/user/level` | 取得等級資訊 |
| `GET /api/user/achievements` | 取得成就列表 |
| `POST /api/user/achievements/:id/claim` | 領取成就獎勵 |
| `GET /api/auth/identities` | 取得綁定身份列表 |
| `POST /api/auth/bind` | 綁定新身份 |
| `DELETE /api/auth/identities/:id` | 解除綁定 |

### 異常回報
（無）

---

### 2026-01-17 #004

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #004 |
| 收到時間 | 2026-01-17 |
| 完成時間 | 2026-01-17 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] 檢查 CLAUDE.md 是否引用後端資料
- [x] 更新 `src/services/` 描述：加入 Phase 5-6 新增的 4 個 API 服務
- [x] 更新 `src/types/` 檔案數量：15 → 19
- [x] 更新 Backend Contract Reference：
  - 加入契約版本號 v1.2.0
  - 加入後端資料規模參考（82 表、22 記憶庫）

### 異常回報
（無）

---

### 2026-01-17 #003

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #003 |
| 收到時間 | 2026-01-17 |
| 完成時間 | 2026-01-17 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] 建立 `src/types/economy.ts` - 等級、經驗、成就類型
- [x] 建立 `src/types/crowdfunding.ts` - 募資系統類型
- [x] 建立 `src/types/referral.ts` - 推薦系統類型
- [x] 建立 `src/types/contribution.ts` - 用戶貢獻類型
- [x] 建立 `src/services/economyApi.ts` - 5 APIs (等級、經驗、成就、策劃師申請)
- [x] 建立 `src/services/crowdfundingApi.ts` - 4 APIs (募資活動、贊助)
- [x] 建立 `src/services/referralApi.ts` - 9 APIs (推薦碼、餘額、提現)
- [x] 建立 `src/services/contributionApi.ts` - 11 APIs (回報、建議、黑名單、投票)
- [x] 更新 `src/services/authApi.ts` - 新增帳號綁定 3 APIs
- [x] 更新 `src/types/index.ts` - 匯出新類型
- [x] 更新 `src/services/api.ts` - 整合新 API 服務

### 實作統計
| 模組 | API 數量 |
|------|----------|
| Economy | 5 |
| Crowdfunding | 4 |
| Referral | 9 |
| Contribution | 11 |
| Auth (帳號綁定) | 3 |
| **總計** | **32** |

### 異常回報
（無）

---

### 2026-01-16 #002

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #002 |
| 收到時間 | 2026-01-16 |
| 完成時間 | 2026-01-16 |
| 狀態 | ✅ 完成 |

### 完成項目
- [x] 檢查 docs/ 目錄
- [x] 檢查記憶庫大小（都 < 30KB）
- [x] 建立 docs/archive/ 目錄
- [x] 歸檔 `API_FRONTEND_ENDPOINTS.md`（2025-12-22 舊文件，後端已有 contracts/APP.md）

### 保留的文件
- `APP_STORE_REVIEW_CHECKLIST.md` - 持續使用的文件
- `architecture-audit-report.md` - 今天的審計報告，有參考價值

### 異常回報
（無）

---

## 歷史回報

### 2026-01-16 #001

| 項目 | 內容 |
|------|------|
| 來源 | 後端 sync-app.md #001 |
| 完成時間 | 2026-01-16 |
| 狀態 | ✅ 完成 |

完成項目：
- [x] 建立 docs/sync-backend.md
- [x] 更新 CLAUDE.md 加入「三端協作」段落
- [x] 在記憶庫加入「跨端對應」標註
