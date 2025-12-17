# Mibu - Travel Gacha Mobile App

## Overview

Mibu is a React Native/Expo mobile application that gamifies travel planning using a "gacha" (capsule toy) mechanic. Users can randomly generate travel itineraries, collect discovered locations, and plan trips. The app supports multiple languages and connects to an external backend API for itinerary generation and location data, using local storage for user preferences and collections. The business vision is to make travel planning engaging and discovery-driven, tapping into the growing market for unique travel experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

## Agent 開發守則

### 1. Backend Agnostic
- 只負責 UI 和 API 串接
- 後端邏輯是黑盒子，不要試圖猜測後端資料庫結構
- 只依賴 API 契約定義的端點和 Type

### 2. Type Consistency
- 嚴格遵守 `types/` 資料夾中的 TypeScript 定義
- 如果 API 回傳的資料跟 Type 不符，**請先報錯，不要擅自修改 Type**
- Type 不符代表後端改壞了，需要通知後端修正

### 3. Routing
- 使用 **Expo Router**
- 請使用 `router.push()` 而非 `navigation.navigate()`

### 4. Styling
- 嚴格使用 **NativeWind (Tailwind)**
- 禁止使用 `StyleSheet.create`，除非 Tailwind 無法實現

### 5. 禁止事項
- ❌ 使用 HTML 標籤（`<div>`, `<span>` 等）
- ❌ 依賴 Browser Cookie（必須用 Bearer Token）
- ❌ 猜測後端資料庫結構

### 6. 依賴鎖定
- 除非用戶明確允許，禁止修改 `package.json` 或安裝新套件

### 7. 與後端協作
如遇到 API 問題或需要新端點，請告知用戶，讓後端 Agent 處理：
1. 新增/修改端點
2. 更新 `docs/API_CONTRACT.md`
3. 提供前端同步指令

## System Architecture

### Frontend Framework
- **Expo SDK 54** with React Native 0.81 for cross-platform development (iOS, Android, Web).
- **Expo Router** for file-based routing.
- **TypeScript** with strict mode for type safety.
- **NativeWind v4 + Tailwind CSS** for utility-first styling.

### Navigation Structure
- Tab-based navigation using `@react-navigation/bottom-tabs` with five main tabs: Home, Gacha, Planner, Collection, Settings.
- Role-based navigation redirects users to specific dashboards (Traveler, Admin, Merchant, Specialist) based on their assigned role.

### State Management
- **React Context API** (`src/context/AppContext.tsx`) for centralized state management (authentication, language, collections, gacha results, loading/error states).
- **AsyncStorage** for persisting language, collection, and user data.

### Component Architecture
- Reusable UI components (`src/components/ui/`) and theme-aware components (`components/`).
- Screen components (`src/screens/`) implement full page functionalities.

### Theming System
- Light/dark mode support via `useColorScheme` hook.
- Centralized color definitions in `constants/Colors.ts`.
- **Mibu Brand Colors**: Warm earth-tone palette derived from logo:
  - Primary: `#7A5230` (brown), `#B08860` (copper), `#4A2B13` (dark)
  - Background: `#F5E6D3` (cream), `#FDFBF8` (cream light), `#FFFEFA` (warm white)
  - Accents: `#C9A87C` (tan), `#E8D5C4` (tan light), `#5A3420` (brown dark)
  - Tier colors: SP gold, SSR bronze, SR copper, S caramel, R tan (all earth-tone variants)
- Tailwind extended with `mibu` color tokens in `tailwind.config.js`.

### Internationalization
- Support for Traditional Chinese, English, Japanese, and Korean, with translation strings in `src/constants/translations.ts`.

### Feature Specifications
- **Gacha System**: Random itinerary generation, 30-slot inventory system with rarity tiers (SP, SSR, SR, S, R), coupon redemption flow, and unread item notifications.
- **Collection Management**: Displays collected places with badges for partners and coupons.
- **Pool Preview**: Unified modal displaying both rare places and coupons.
- **Multi-Role System**: Supports Traveler, Merchant, Specialist, and Admin roles with dedicated dashboards and role-switching mechanisms.
- **Authentication**: Modal-based login/registration with role selection, guest login, and JWT token storage.
- **Location Feature**: `expo-location` for user positioning, `react-native-maps` for map view (native platforms), and location sharing with trip planners.
- **SOS Safety Center**: Provides a webhook URL for iOS Shortcuts integration and an emergency trigger button.
- **AI Chat Feature**: AI trip assistant with pre-defined responses and quick reply buttons.

### System Design Choices
- **Gacha Flow Simplification**: Removed district selection, streamlined navigation to results, and improved pool preview.
- **Payment Gateway Integration**: Dual support for Stripe and Recur payments.

## Backend API

- **Base URL**: `https://gacha-travel--s8869420.replit.app`
- **認證方式**: Bearer Token（Header: `Authorization: Bearer ${token}`）

### 主要 API 端點

| 功能 | 方法 | 端點 | 認證 |
|------|------|------|------|
| 取得用戶資訊 | GET | /api/auth/user | 是 |
| 生成扭蛋行程 | POST | /api/gacha/itinerary/v3 | 是 |
| 獎池預覽 | GET | /api/gacha/pool/:city | 否 |
| 取得收藏列表 | GET | /api/collection/with-promo | 是 |
| 取得道具箱 | GET | /api/inventory | 是 |
| 取得商家資訊 | GET | /api/merchant/me | 是 |
| 取得國家列表 | GET | /api/locations/countries | 否 |
| 取得公告 | GET | /api/announcements | 否 |

### 其他端點
- Location data: `/api/locations/regions/:countryId`, `/api/locations/districts/:regionId`
- Authentication: `/api/auth/login`, `/api/auth/switch-role`, `/api/auth/register`
- Admin: `/api/admin/users`, `/api/admin/pending-users`, `/api/admin/approve-user`
- SOS: `/api/user/sos-link`, `/api/sos/trigger`
- Location Update: `/api/location/update`
- Merchant: `/api/merchant/me`, `/api/merchant/transactions`, `/api/merchant/verify`, `/api/merchant/places`, `/api/merchant/products`, `/api/merchant/apply`, `/api/merchant/analytics`, `/api/merchant/coupons`
- Specialist: `/api/specialist/register`, `/api/specialist/travelers`, `/api/specialist/tracking`
- Coupons: `/api/coupons/region/:regionId/pool`

### 統一錯誤處理

| 狀態碼 | 處理方式 |
|--------|----------|
| 401 | 執行登出並導向登入頁 |
| 400 | 顯示 Toast 錯誤訊息 |
| 500 | 顯示「系統錯誤，請稍後再試」|

## Design System

### 主色調（UI 元素）
- Primary: `#6366f1` (Indigo)
- Success: `#10b981` (Emerald)
- Error: `#ef4444` (Red)
- Background: `#f9fafb`

### 稀有度顏色
- SP: 金色 `#f59e0b`
- SSR: 粉紅 `#ec4899`
- SR: 紫色 `#8b5cf6`
- S: 藍色 `#3b82f6`
- R: 灰色 `#9ca3af`

### Mibu 品牌色（已在 ItemBoxScreen 等使用）
- Primary: `#7A5230` (brown), `#B08860` (copper), `#4A2B13` (dark)
- Background: `#F5E6D3` (cream), `#FDFBF8` (cream light), `#FFFEFA` (warm white)
- Accents: `#C9A87C` (tan), `#E8D5C4` (tan light), `#5A3420` (brown dark)

## Key NPM Packages
- `@react-native-async-storage/async-storage`
- `@react-native-community/slider`
- `react-native-webview`
- `expo-haptics`
- `expo-blur`
- `@expo/vector-icons`, `expo-symbols`
- `expo-location`
- `react-native-maps`
- `expo-clipboard`
- `react-native-reanimated`

## Third-Party Integrations
- **Twilio**: For SMS sending capabilities (credentials managed via Replit Connectors).
- **Stripe & Recur**: Payment gateways for merchant top-ups.
- **Socket.IO**: For live location tracking in specialist features.
