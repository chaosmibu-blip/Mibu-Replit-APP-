# 用戶故事地圖 — Mibu App

> **版本**：v1.4.0 | **最後更新**：2026-02-28
> **目的**：以用戶旅程為軸，映射 App 所有功能與對應畫面
> **資料來源**：以實際程式碼為準，非規劃文件

---

## 角色定義

| 角色 | 說明 | 主要入口 |
|------|------|---------|
| **旅人** (Traveler) | 核心用戶，探索、收集、規劃旅程、養成 MINI 夥伴 | Tab 1-4 + 隱藏 Tab |
| **商家** (Merchant) | 合作店家，管理店面、優惠券、產品 | 商家 Dashboard |
| **專家** (Specialist) | 在地嚮導，提供即時服務 | 專家 Dashboard |
| **管理員** (Admin) | 系統管理，審核、公告、排除設定 | 管理員 Dashboard |

---

## 旅人 (Traveler) 故事地圖

```
用戶活動    註冊/登入     探索發現      收集成就      規劃旅程       社群互動       個人管理       MINI 夥伴
            │            │             │             │              │              │              │
用戶任務    ├─ 註冊       ├─ 首頁       ├─ 圖鑑       ├─ 行程規劃     ├─ 募資活動     ├─ 個人檔案     ├─ MINI 檔案
            ├─ 登入       ├─ AI 扭蛋    ├─ 物品箱     ├─ 即時定位     ├─ 貢獻回報     ├─ 設定         ├─ 探索出發
            ├─ 審核等待    ├─ 每日任務   ├─ 信箱       ├─ AI 對話      ├─ 最愛景點     ├─ 通知偏好     ├─ 塗鴉牆
            │            ├─ 活動公告    ├─ 經濟系統   │              ├─ SOS 緊急     ├─ 推薦好友     ├─ 私人筆記
            │            │             │             │              ├─ 活動詳情     │              ├─ 夥伴/成長
```

### 註冊/登入

| 用戶故事 | 畫面 | 狀態 |
|---------|------|------|
| 作為旅人，我想註冊帳號開始使用 | LoginScreen → RegisterScreen → RegisterSuccessScreen | ✅ 已實作 |
| 作為旅人，我想用 email/密碼登入 | LoginScreen | ✅ 已實作 |
| 作為旅人，我想用 Apple 登入 | LoginScreen → AuthCallbackScreen | ✅ 已實作 |
| 作為新用戶，我想知道帳號審核狀態 | PendingApprovalScreen | ✅ 已實作 |

### 探索發現

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為旅人，我想看到今天的活動和任務 | HomeScreen | useHomeQueries | ✅ RQ |
| 作為旅人，我想透過 AI 扭蛋發現新景點 | GachaScreen / GachaModuleScreen | — (一次性操作) | ✅ 已實作 |
| 作為旅人，我想瀏覽扭蛋結果 | ItemsScreen | — (讀 context) | ✅ 已實作 |

### 收集成就

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為旅人，我想查看收集圖鑑和稀有度 | CollectionScreen | useCollectionQueries | ✅ RQ |
| 作為旅人，我想管理物品箱和使用道具 | ItemBoxScreen | useInventoryQueries | ✅ RQ |
| 作為旅人，我想查看信箱獎勵並領取 | MailboxScreen / MailboxDetailScreen | useMailboxQueries | ✅ RQ |
| 作為旅人，我想了解金幣經濟和特權 | EconomyScreen | useEconomyQueries | ✅ RQ |

### 規劃旅程

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為旅人，我想建立和管理行程 | Planner → ItineraryScreenV2 | — | ✅ 已實作 |
| 作為旅人，我想在行程中新增景點 | AddPlacesModal | — | ✅ 已實作 |
| 作為旅人，我想查看即時位置 | Planner → LocationScreen | — (串流) | ✅ 已實作 |
| 作為旅人，我想跟 AI 討論行程 | Planner → ChatScreen | — | ⚠️ Mock 階段 |

### 社群互動

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為旅人，我想參加募資活動 | CrowdfundingScreen / CrowdfundingDetailScreen | useCrowdfundingQueries | ✅ RQ |
| 作為旅人，我想回報或建議景點 | ContributionScreen | useContributionQueries | ✅ RQ |
| 作為旅人，我想管理最愛景點 | FavoritesScreen | useCollectionQueries | ✅ RQ |
| 作為旅人，遇到緊急狀況我想求助 | SOSScreen / SOSContactsScreen | useSOSQueries | ✅ RQ |
| 作為旅人，我想查看活動詳情 | EventDetailScreen | — | ✅ 已實作 |

### 個人管理

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為旅人，我想編輯個人檔案和頭像 | ProfileScreen / AvatarSelectorModal | — | ✅ 已實作 |
| 作為旅人，我想調整 App 設定 | SettingsScreen | — | ✅ 已實作 |
| 作為旅人，我想管理通知偏好 | NotificationPreferencesScreen | useNotificationQueries | ✅ RQ |
| 作為旅人，我想查看通知列表 | NotificationListScreen | useNotificationQueries | ✅ RQ |
| 作為旅人，我想推薦朋友加入 | ReferralScreen | useReferralQueries | ✅ RQ |

### MINI 夥伴

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為旅人，我想查看和編輯 MINI 檔案 | MiniProfileScreen | useMiniQueries | ✅ RQ |
| 作為旅人，我想讓 MINI 去探索景點 | MiniProfileScreen | useMiniQueries | ✅ RQ |
| 作為旅人，我想在景點塗鴉牆留言 | MiniProfileScreen | useMiniQueries | ✅ RQ |
| 作為旅人，我想記錄私人地點筆記 | MiniProfileScreen | useMiniQueries | ✅ RQ |
| 作為旅人，我想收集和培養多隻 MINI | MiniProfileScreen | useMiniQueries | ✅ RQ |

### 訪客升級

| 用戶故事 | 元件 | hooks | 狀態 |
|---------|------|-------|------|
| 作為訪客，我想在適當時機被提示升級帳號 | UpgradePromptToast | useGuestUpgradePrompt | ✅ 已實作 |

**觸發點**：收集第 10 個景點 / 首次 AI 對話 / 連續登入 3 天

---

## 商家 (Merchant) 故事地圖

```
用戶活動    入駐申請       總覽管理       店面經營         優惠促銷        數據分析       交易核銷
            │             │             │               │              │             │
用戶任務    ├─ 申請入駐    ├─ 儀表板      ├─ 認領店面      ├─ 優惠券列表   ├─ 數據分析    ├─ 核銷驗證
            ├─ 註冊表單    ├─ 個人資料    ├─ 編輯店面      ├─ 新增優惠券   │             ├─ 交易記錄
            │             │             ├─ 店面列表      ├─ 產品管理     │             │
            │             │             ├─ 新增店面      │              │             │
```

### 入駐申請

| 用戶故事 | 畫面 | 狀態 |
|---------|------|------|
| 作為商家，我想申請加入平台 | MerchantApplyScreen | ✅ 已實作 |
| 作為商家，我想填寫註冊資料 | MerchantApplyScreen（12 題問卷） | ✅ 已實作 |

### 營運管理

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為商家，我想查看營運總覽 | MerchantDashboardScreen | useMerchantQueries | ✅ RQ |
| 作為商家，我想管理個人資料 | MerchantProfileScreen | useMerchantQueries | ✅ RQ |
| 作為商家，我想認領我的店面 | ClaimPlaceScreen | useMerchantQueries | ✅ RQ |
| 作為商家，我想編輯店面資訊 | PlaceEditScreen | useMerchantQueries | ✅ RQ |
| 作為商家，我想查看所有店面 | MerchantPlacesScreen / PlaceListScreen | useMerchantQueries | ✅ RQ |
| 作為商家，我想新增合作店面 | NewPlaceScreen | useMerchantQueries | ✅ RQ |
| 作為商家，我想建立優惠券 | CouponFormScreen | useMerchantQueries | ✅ RQ |
| 作為商家，我想管理優惠券 | MerchantCouponsScreen / CouponListScreen | useMerchantQueries | ✅ RQ |
| 作為商家，我想管理產品 | MerchantProductsScreen | useMerchantQueries | ✅ RQ |
| 作為商家，我想查看數據分析 | MerchantAnalyticsScreen | useMerchantQueries | ✅ RQ |
| 作為商家，我想核銷用戶優惠 | MerchantVerifyScreen | useMerchantQueries | ✅ RQ |
| 作為商家，我想查看交易記錄 | MerchantTransactionsScreen | useMerchantQueries | ✅ RQ |

---

## 專家 (Specialist) 故事地圖

```
用戶活動    入駐申請       接案管理       個人品牌         即時服務
            │             │             │               │
用戶任務    ├─ 註冊        ├─ 儀表板      ├─ 個人資料      ├─ 即時追蹤
            ├─ 申請入駐    ├─ 歷史記錄    ├─ 可用性設定    ├─ 旅人列表
```

### 入駐申請

| 用戶故事 | 畫面 | 狀態 |
|---------|------|------|
| 作為專家，我想註冊成為專家 | RegisterSpecialistScreen | ✅ 已實作 |
| 作為專家，我想申請加入平台 | PartnerApplyScreen | ✅ 已實作 |

### 營運服務

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為專家，我想查看接案總覽 | SpecialistDashboardScreen | useSpecialistQueries | ✅ RQ |
| 作為專家，我想管理個人資料 | SpecialistProfileScreen | useSpecialistQueries | ✅ RQ |
| 作為專家，我想查看服務歷史 | SpecialistHistoryScreen | useSpecialistQueries | ✅ RQ |
| 作為專家，我想即時追蹤旅人位置 | SpecialistTrackingScreen | — (WebSocket) | ✅ 已實作 |
| 作為專家，我想查看旅人列表 | SpecialistTravelersScreen | — | ✅ 已實作 |

---

## 管理員 (Admin) 故事地圖

```
用戶活動    系統管理       內容管理         品質控制
            │             │               │
用戶任務    ├─ 儀表板      ├─ 公告管理      ├─ 全域排除
            ├─ 用戶審核    ├─ 公告新增/編輯  │
```

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為管理員，我想查看系統總覽 | AdminDashboardScreen | useAdminQueries | ✅ RQ |
| 作為管理員，我想審核新用戶 | AdminDashboardScreen | useAdminQueries | ✅ RQ |
| 作為管理員，我想管理公告 | AdminAnnouncementsScreen | useAdminQueries | ✅ RQ |
| 作為管理員，我想新增/編輯公告 | AnnouncementManageScreen | useAdminQueries | ✅ RQ |
| 作為管理員，我想設定全域排除景點 | AdminExclusionsScreen | useAdminQueries | ✅ RQ |

---

## 跨角色共用功能

| 功能 | 關鍵檔案 | 說明 |
|------|---------|------|
| 認證系統 | AuthContext + tokenUtils | JWT Token 管理、SecureStore/AsyncStorage |
| 多語系 | I18nContext | 4 語系（繁中、英、日、韓） |
| 推播通知 | pushNotificationService | Expo Push Notifications |
| 預載服務 | preloadService | 登入後預載頭像/素材 |
| 頭像系統 | avatarService | 三層快取（記憶體 → AsyncStorage → 首字母） |
| 訪客升級 | useGuestUpgradePrompt | 非阻擋式提示、AsyncStorage 追蹤 |

---

## 畫面總覽統計

| 模組 | 畫面數 | 說明 |
|------|--------|------|
| 認證 | 5 | 登入/註冊/審核 |
| Shared | 13 | 首頁、設定、通知、SOS、個人檔案、申請頁 |
| Traveler | 21 | 扭蛋、圖鑑、行程、經濟、信箱、物品箱、社群、MINI |
| Merchant | 16 | 入駐 + 店面 + 優惠券 + 產品 + 分析 + 核銷 |
| Specialist | 6 | 入駐 + 儀表板 + 追蹤 |
| Admin | 4 | 儀表板 + 公告 + 排除 |
| **合計** | **60** | |

---

## 技術債

| 項目 | 優先級 | 說明 |
|------|--------|------|
| ChatScreen 真實 API | P2 | 目前 Mock，需串接後端 AI Chat API |
| Google Sign In | P2 | OAuth 登入第二管道 |
| 離線模式 | P2 | React Query 已有快取基礎，需加 persistence |
| 測試覆蓋 | P2 | hooks 層適合加 unit test |
| 機率說明功能 | P3 | 等商家端開放 |

---

*最後更新：2026-02-28 | 資料來源：實際程式碼掃描 | API 契約：v1.4.0*
