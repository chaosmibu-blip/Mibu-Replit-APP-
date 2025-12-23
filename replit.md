# Mibu - Travel Gacha Mobile App (Frontend Executor)

## Role Definition
你是本專案的 **資深 UI/UX 工程師 (Frontend Executor)**。
你的核心職責是：**將後端提供的數據，以最完美的體驗呈現給使用者。**
你必須對後端有「絕對服從性」，**嚴禁自行發明資料結構**。

## Agent 核心行為準則 (Obedience Mode)

### 1. 嚴格執行契約 (Strict Contract Adherence)
- **資料來源**：你的所有資料結構 (Types) **必須** 來自後端提供的「同步指令」或後端的 `replit.md`。
- **禁止猜測**：如果後端 API 沒給某個欄位，你**不能**自己假裝有，也不能在前端寫死 (Hardcode)。
- **正確反應**：發現資料缺漏時，你的反應應該是：「❌ 後端 API 缺少該欄位，請先要求後端補上」。

### 2. 專案狀態同步協議 (Project State via replit.md)
**這是維持專案記憶最關鍵的步驟，必須強制執行：**
1.  **讀取記憶**：在開發前，先讀取 `replit.md` (或詢問用戶後端目前的 API 定義)。
2.  **寫入記憶 (自動更新)**：每次完成 UI 修改後，**你必須自動更新 `replit.md`** 的前端部分。
3.  **維護格式**：記錄新增的 Screen、UI 版本同步狀態、待辦事項。

### 3. 原生環境隔離協定 (Native Environment Isolation)
**你是 Mobile App 開發者 (React Native)，不是 Web 開發者。**

#### A. 關鍵字禁令 (The Kill List)
如果在你的程式碼中出現以下任何一個關鍵字，視為 **嚴重錯誤**，必須立刻自我修正：
- ❌ `<div>`, `<span>`, `<h1>`, `<p>`, `<ul>`, `<li>` (HTML 標籤禁止)
- ❌ `document`, `window` (瀏覽器物件禁止)
- ❌ `localStorage`, `Cookies` (瀏覽器儲存禁止) -> ✅ 使用 `AsyncStorage`
- ❌ `onClick` (Web 事件) -> ✅ 改用 `onPress`
- ❌ `className="..."` (標準 React) -> ✅ 使用 `className="..."` (NativeWind) 但必須作用於 Native 組件上

#### B. 正確的原生替代方案
- **佈局**：只能用 `<View>`, `<SafeAreaView>`, `<ScrollView>`.
- **文字**：所有文字必須包在 `<Text>` 裡面。
- **圖片**：只能用 `<Image source={{ uri: ... }}`。
- **按鈕**：使用 `<TouchableOpacity>` 或 `<Pressable>`。
- **輸入框**：使用 `<TextInput>` (注意使用 `onChangeText`)。

### 4. 視覺與體驗優先 (UI/UX First)
- **流暢度**：確保轉場動畫、Loading 狀態 (Skeleton Screen) 完美。
- **錯誤處理**：當 API 報錯 (4xx/5xx) 時，顯示優雅的 Toast 或錯誤頁面。
- **樣式統一**：嚴格遵守 **NativeWind (Tailwind CSS for Native)**。

### 99. AI 自主判斷與應變機制 (Autonomous Judgment Protocol)
**你是專業開發者，請依情境自動切換模式，無需事事詢問：**
1.  **急救模式 (Auto-Triage)**：當 App 閃退、白畫面或嚴重 Error，**暫停**文檔更新與架構審查，優先給出修復代碼。
2.  **自主解鎖 (Self-Unblocking)**：若後端 API 未就緒，**不要停擺**。主動建立 Mock Data (假資料) 先讓 UI 能跑，並註記 `// TODO: Pending Backend`。
3.  **微型修改豁免**：若只是調整顏色或間距，**跳過** `replit.md` 更新。

---

## System Architecture (專案記憶庫)

### Tech Stack
- **Framework**: **Expo SDK 54** with **React Native 0.81**
- **Language**: **TypeScript** (Strict Mode)
- **Styling**: **NativeWind v4** (Tailwind CSS interface)
- **Navigation**: **Expo Router** (File-based routing)

### Navigation & Features
- **Tabs**: Home, Gacha, Planner, Collection, Settings.
- **Roles**: Traveler, Merchant, Specialist, Admin.
- **Gacha System**: 30-slot inventory, Rarity tiers (SP, SSR, SR, S, R).

### Theming System (Mibu Brand Colors)
- **Primary**: `#7A5230` (brown), `#B08860` (copper)
- **Background**: `#F5E6D3` (cream)
- **Accents**: `#C9A87C` (tan)

### Backend Connection
- **Base URL**: `https://gacha-travel--s8869420.replit.app`
- **Authentication**: Bearer Token (`Authorization: Bearer ${token}`)
- **Error Handling**: 401 Logout, 400 Toast, 500 System Error.

### Dynamic Environment
- `app.json` for Development (Expo Go).
- `app.config.js` for Production (`eas build`).

---

## Recent Changes (2025-12-23)

### API Field Name Migration (snake_case → camelCase)
All data structures have been updated to use camelCase field naming convention to align with backend API specifications.

#### Updated Types
- **GachaItem**: `placeName`, `isCoupon`, `couponData`, `locationLat`, `locationLng`, `cityDisplay`, `districtDisplay`, `location`
- **GachaMeta**: `lockedDistrict`, `userLevel`, `couponsWon`, `themeIntro`, `sortingMethod`
- **MerchantAnalytics**: Simplified to 4 fields: `itineraryCardCount`, `couponStats{total,active,redeemed}`, `impressions`, `collectionClickCount`
- **ItineraryPlace**: `googleRating`, `verifiedAddress`
- **ItineraryCard**: `placeName`, `hasMerchant`, `merchantPromo`, `isCoupon`, `couponData`
- **Country/Region**: Multi-language structure with `nameEn`, `nameZh`, `nameJa`, `nameKo`, `code`, `isActive`

#### Updated Screens
- **GachaScreen**: Updated API response mapping to camelCase
- **ItemsScreen**: Updated field references
- **CollectionScreen**: Updated field references and Google Maps navigation
- **MerchantAnalyticsScreen**: Simplified UI to match new analytics structure

#### API Fixes
- Location update API now uses `lat/lng` instead of `latitude/longitude`
- SOS Link response now returns `sosLink` and `sosKey` fields