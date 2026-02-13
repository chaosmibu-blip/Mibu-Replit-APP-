# 用戶故事地圖 — Mibu App

> **版本**：v1.4.0 | **最後更新**：2026-02-13
> **目的**：以用戶旅程為軸，映射 App 所有功能與對應畫面

---

## 角色定義

| 角色 | 說明 | 主要入口 |
|------|------|---------|
| **旅人** (Traveler) | 核心用戶，探索、收集、規劃旅程 | Tab 1-4 |
| **商家** (Merchant) | 合作店家，管理店面、優惠券、產品 | 商家 Dashboard |
| **專家** (Specialist) | 在地嚮導，提供即時服務 | 專家 Dashboard |
| **管理員** (Admin) | 系統管理，審核、公告、排除設定 | 管理員 Dashboard |

---

## 旅人 (Traveler) 故事地圖

```
用戶活動    註冊/登入     探索發現      收集成就      規劃旅程       社群互動       個人管理
            │            │             │             │              │              │
用戶任務    ├─ 註冊       ├─ 首頁       ├─ 圖鑑       ├─ 行程規劃     ├─ 募資活動     ├─ 個人檔案
            ├─ 登入       ├─ AI 扭蛋    ├─ 物品箱     ├─ 即時定位     ├─ 貢獻回報     ├─ 設定
            ├─ 審核等待    ├─ 每日任務   ├─ 信箱       ├─ AI 對話      ├─ 最愛景點     ├─ 通知偏好
            │            ├─ 活動公告    ├─ 經濟系統   │              ├─ SOS 緊急     ├─ 推薦好友
            │            │             │             │              │              │
```

### 註冊/登入

| 用戶故事 | 畫面 | 狀態 |
|---------|------|------|
| 作為旅人，我想註冊帳號開始使用 | LoginScreen → 註冊流程 | ✅ 已實作 |
| 作為旅人，我想用 email/密碼登入 | LoginScreen | ✅ 已實作 |
| 作為新用戶，我想知道帳號審核狀態 | PendingApprovalScreen | ✅ 已實作 |

### 探索發現

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為旅人，我想看到今天的活動和任務 | HomeScreen | useHomeQueries | ✅ React Query |
| 作為旅人，我想透過 AI 扭蛋發現新景點 | GachaScreen / GachaModuleScreen | — (一次性操作) | ✅ 已實作 |
| 作為旅人，我想瀏覽已收集的物品 | ItemsScreen | — (讀 context) | ✅ 已實作 |

### 收集成就

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為旅人，我想查看收集圖鑑和稀有度 | CollectionScreen | useCollectionQueries | ✅ React Query |
| 作為旅人，我想管理物品箱和使用道具 | ItemBoxScreen | useInventoryQueries | ✅ React Query |
| 作為旅人，我想查看信箱獎勵並領取 | MailboxScreen / MailboxDetailScreen | useMailboxQueries | ✅ React Query |
| 作為旅人，我想了解金幣經濟和特權 | EconomyScreen | useEconomyQueries | ✅ React Query |

### 規劃旅程

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為旅人，我想建立和管理行程 | ItineraryScreenV2 | — (複雜) | ✅ 已實作（未遷移 RQ） |
| 作為旅人，我想在行程中新增景點 | AddPlacesModal | — | ✅ 已實作 |
| 作為旅人，我想查看即時位置 | LocationScreen | — (串流) | ✅ 已實作 |
| 作為旅人，我想跟 AI 討論行程 | ChatScreen | — (Mock) | ⚠️ Mock 階段 |

### 社群互動

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為旅人，我想參加募資活動 | CrowdfundingScreen / CrowdfundingDetailScreen | useCrowdfundingQueries | ✅ React Query |
| 作為旅人，我想回報或建議景點 | ContributionScreen | useContributionQueries | ✅ React Query |
| 作為旅人，我想管理最愛景點 | FavoritesScreen | useCollectionQueries | ✅ React Query |
| 作為旅人，遇到緊急狀況我想求助 | SOSScreen / SOSContactsScreen | useSOSQueries | ✅ React Query |

### 個人管理

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為旅人，我想編輯個人檔案和頭像 | ProfileScreen / AvatarSelectorModal | — | ✅ 已實作 |
| 作為旅人，我想調整 App 設定 | SettingsScreen | — (低價值) | ✅ 已實作 |
| 作為旅人，我想管理通知偏好 | NotificationPreferencesScreen | useNotificationQueries | ✅ React Query |
| 作為旅人，我想查看通知列表 | NotificationListScreen | useNotificationQueries | ✅ React Query |
| 作為旅人，我想推薦朋友加入 | ReferralScreen | useReferralQueries | ✅ React Query |

---

## 商家 (Merchant) 故事地圖

```
用戶活動    總覽管理       店面經營         優惠促銷        數據分析       交易核銷
            │             │               │              │             │
用戶任務    ├─ 儀表板      ├─ 認領店面      ├─ 優惠券列表   ├─ 數據分析    ├─ 核銷驗證
            ├─ 個人資料    ├─ 編輯店面      ├─ 新增優惠券   │             ├─ 交易記錄
            │             ├─ 店面列表      ├─ 產品管理     │             │
            │             ├─ 新增店面      │              │             │
```

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為商家，我想查看營運總覽 | MerchantDashboardScreen | useMerchantQueries | ✅ React Query |
| 作為商家，我想管理個人資料 | MerchantProfileScreen | useMerchantQueries | ✅ React Query |
| 作為商家，我想認領我的店面 | ClaimPlaceScreen | useMerchantQueries | ✅ React Query |
| 作為商家，我想編輯店面資訊 | PlaceEditScreen | useMerchantQueries | ✅ React Query |
| 作為商家，我想查看所有店面 | MerchantPlacesScreen / PlaceListScreen | useMerchantQueries | ✅ React Query |
| 作為商家，我想新增合作店面 | NewPlaceScreen | useMerchantQueries | ✅ React Query |
| 作為商家，我想建立優惠券 | CouponFormScreen | useMerchantQueries | ✅ React Query |
| 作為商家，我想管理優惠券 | MerchantCouponsScreen / CouponListScreen | useMerchantQueries | ✅ React Query |
| 作為商家，我想管理產品 | MerchantProductsScreen | useMerchantQueries | ✅ React Query |
| 作為商家，我想查看數據分析 | MerchantAnalyticsScreen | useMerchantQueries | ✅ React Query |
| 作為商家，我想核銷用戶優惠 | MerchantVerifyScreen | useMerchantQueries | ✅ React Query |
| 作為商家，我想查看交易記錄 | MerchantTransactionsScreen | useMerchantQueries | ✅ React Query |

---

## 專家 (Specialist) 故事地圖

```
用戶活動    接案管理       個人品牌         即時服務
            │             │               │
用戶任務    ├─ 儀表板      ├─ 個人資料      ├─ 即時追蹤
            ├─ 歷史記錄    ├─ 可用性設定    ├─ 旅人列表
            │             │               │
```

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為專家，我想查看接案總覽 | SpecialistDashboardScreen | useSpecialistQueries | ✅ React Query |
| 作為專家，我想管理個人資料 | SpecialistProfileScreen | useSpecialistQueries | ✅ React Query |
| 作為專家，我想查看服務歷史 | SpecialistHistoryScreen | useSpecialistQueries | ✅ React Query |
| 作為專家，我想即時追蹤旅人位置 | SpecialistTrackingScreen | — (WebSocket) | ✅ 已實作 |
| 作為專家，我想查看旅人列表 | SpecialistTravelersScreen | — | ✅ 已實作 |

---

## 管理員 (Admin) 故事地圖

```
用戶活動    系統管理       內容管理         品質控制
            │             │               │
用戶任務    ├─ 儀表板      ├─ 公告管理      ├─ 全域排除
            ├─ 用戶審核    ├─ 公告新增/編輯  ├─ 景點草稿
            │             │               │
```

| 用戶故事 | 畫面 | hooks | 狀態 |
|---------|------|-------|------|
| 作為管理員，我想查看系統總覽 | AdminDashboardScreen | useAdminQueries | ✅ React Query |
| 作為管理員，我想審核新用戶 | AdminDashboardScreen | useAdminQueries | ✅ React Query |
| 作為管理員，我想管理公告 | AdminAnnouncementsScreen | useAdminQueries | ✅ React Query |
| 作為管理員，我想新增/編輯公告 | AnnouncementManageScreen | useAdminQueries | ✅ React Query |
| 作為管理員，我想設定全域排除景點 | AdminExclusionsScreen | useAdminQueries | ✅ React Query |

---

## 跨角色共用功能

| 功能 | 相關畫面 | 說明 |
|------|---------|------|
| 認證系統 | AuthContext | JWT Token 管理、SecureStore/AsyncStorage |
| 多語系 | I18nContext | 4 語系（繁中、簡中、英、日） |
| 推播通知 | pushNotificationService | Expo Push Notifications |
| 預載服務 | preloadService | 登入後預載頭像/素材 |
| 頭像系統 | avatarService | 三層快取（記憶體→AsyncStorage→首字母） |

---

## 技術債與未來工作

| 項目 | 優先級 | 說明 |
|------|--------|------|
| ItineraryScreenV2 重構 | P1 | 18+ useState，需拆分子元件 + 獨立狀態管理 |
| ChatScreen 真實 API | P2 | 目前 Mock，需串接後端 AI Chat API |
| 離線模式 | P2 | React Query 已有快取基礎，需加 persistence |
| 測試覆蓋 | P2 | hooks 層適合加 unit test |
| LocationScreen 重構 | P3 | 即時串流可考慮 React Query + WebSocket 整合 |

---

## 畫面總覽統計

| 模組 | 畫面數 | 已遷移 RQ | 特殊處理 |
|------|--------|-----------|---------|
| Shared | 11 | 5 | 6 個有特殊原因跳過 |
| Traveler | 18 | 10 | ItineraryV2/Gacha/Items/Chat 跳過 |
| Merchant | 14 | 14 | 全數遷移 |
| Admin | 4 | 4 | 全數遷移 |
| Specialist | 5 | 3 | Tracking(WS) + Travelers 跳過 |
| **合計** | **52** | **36** | **16 有明確理由跳過** |

---

*產出日期：2026-02-13 | 架構審查 Phase 0-3 完成*
