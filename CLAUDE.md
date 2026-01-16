# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 溝通風格

- 用口語化的繁體中文，像朋友聊天一樣
- 專有名詞要順便說明白話意思
- 修改前先說「我想做什麼」和「為什麼」
- 不要太硬邦邦、太正式

## Project Overview

Mibu is a travel safety platform built with React Native + Expo, featuring two core modules:
1. **Gacha Module** - Gamified travel itinerary discovery with coupon rewards
2. **Trip Planner Module** - Connect travelers with local specialists for guidance

## Role Definition

You are a **frontend engineer** responsible for the Expo App implementation:
- Focus on UI/UX implementation, not business logic (backend handles that)
- Follow sync instructions from backend when provided (marked with "📱 給前端的同步指令")
- Report API inconsistencies to backend for confirmation

## Development Commands

```bash
# Start development server
npm start                    # Basic start
npx expo start --web --port 5000 --tunnel --go  # Replit workflow (use --go to force Expo Go mode)

# Platform-specific
npm run ios                  # iOS simulator
npm run android              # Android emulator
npm run web                  # Web browser

# Testing & Linting
npm test                     # Run Jest tests (watch mode)
npm run lint                 # ESLint

# Production build (EAS)
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Architecture

### File Structure
- `app/` - Expo Router file-based routing (pages)
- `src/modules/` - **模組化架構（主要開發位置）**
  - `traveler/` - 一般用戶：扭蛋、旅程策畫 (7 screens, 2 components)
  - `merchant/` - 商家端：金流、優惠券管理 (13 screens)
  - `specialist/` - 專員端：地圖、聊天 (5 screens)
  - `admin/` - 管理端：後台管理 (4 screens)
  - `shared/` - 共用元件 (9 screens, 6 components)
- `src/screens/` - 向後相容的重新匯出（指向 modules/）
- `src/components/` - 向後相容的重新匯出（指向 modules/shared/）
- `src/context/AppContext.tsx` - Global state management
- `src/services/` - API 服務（已模組化）
  - `api.ts` - 主入口（委派給各模組服務）
  - `authApi.ts`, `gachaApi.ts`, `merchantApi.ts`, `specialistApi.ts`, `adminApi.ts`, etc.
- `src/types/` - TypeScript interfaces（已拆分成 15 個檔案）
  - `errors.ts` - 錯誤碼定義（E1xxx-E9xxx）
- `docs/` - Memory bank documentation (7 files)

### Navigation Structure
```
app/
├── (tabs)/           # Tab Navigator (Home, Gacha, Planner, Collection, Settings)
├── merchant/         # Merchant role pages
├── specialist/       # Specialist role pages
└── [auth pages]      # Login, Register, Profile, etc.
```

### Four User Roles
| Role | Code | Access |
|------|------|--------|
| Traveler | `user` | Gacha, Collection, Planner |
| Merchant | `merchant` | Dashboard, Coupons, Places |
| Specialist | `specialist` | Traveler tracking, Services |
| Admin | `admin` | Full access, Announcements |

### Module Imports (推薦)
```typescript
// 從模組匯入（推薦）
import { GachaScreen, CouponWinAnimation, gachaApi } from '@/modules/traveler';
import { MerchantDashboardScreen, CouponFormScreen } from '@/modules/merchant';
import { RoleSwitcher, TierBadge } from '@/modules/shared';

// 舊式匯入（仍然有效，向後相容）
import { GachaScreen } from '@/screens/GachaScreen';
```

### State Management
- `AppContext` provides: user state, language, token management, role switching
- Token storage: `expo-secure-store` (iOS/Android), `AsyncStorage` (Web)
- Use `useApp()` hook to access context

### API Configuration
- **Development**: `https://591965a7-25f6-479c-b527-3890b1193c21-00-1m08cwv9a4rev.picard.replit.dev`
- **Production**: `https://gacha-travel--s8869420.replit.app`
- Auth: Bearer Token (`Authorization: Bearer ${token}`)
- Environment set in `eas.json` for production builds

## Syntax Firewall (React Native Rules)

| Forbidden | Use Instead |
|-----------|-------------|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<img>` | `<Image>` |
| `<button>` | `<TouchableOpacity>` or `<Pressable>` |
| `<input>` | `<TextInput>` |
| `<ul>`, `<li>` | `<FlatList>` or `<ScrollView>` |
| `onClick` | `onPress` |

## Key Values

| Item | Value |
|------|-------|
| Daily gacha limit | 36 pulls |
| Inventory capacity | 30 slots |
| JWT expiry | 7 days |
| Gacha count range | 1-15 (default 7) |

## Error Codes (錯誤碼)

API 錯誤碼定義在 `src/types/errors.ts`：

| 範圍 | 類別 | 範例 |
|------|------|------|
| E1xxx | 認證 | `TOKEN_EXPIRED`, `UNAUTHORIZED` |
| E2xxx | 扭蛋 | `DAILY_LIMIT_EXCEEDED` |
| E3xxx | 地點 | `PLACE_NOT_FOUND` |
| E4xxx | 商家 | `COUPON_EXPIRED`, `INVALID_REDEMPTION_CODE` |
| E5xxx | 驗證 | `INVALID_INPUT`, `MISSING_REQUIRED_FIELD` |
| E6xxx | 資源 | `INVENTORY_NOT_FOUND` |
| E7xxx | 支付 | `PAYMENT_FAILED` |
| E9xxx | 伺服器 | `RATE_LIMIT_EXCEEDED` |

使用方式：
```typescript
import { isApiError, getErrorMessage } from '@/types/errors';

if (isApiError(response)) {
  const msg = getErrorMessage(response.code, 'zh-TW');
  // 顯示給用戶
}
```

## API Quick Reference

### Core Endpoints
- `POST /api/auth/mobile` - 統一 OAuth 登入（Apple/Google）
- `POST /api/gacha/itinerary/v3` - Pull gacha (requires auth)
- `GET /api/gacha/quota` - Check remaining daily quota
- `GET /api/inventory` - Get user's item box
- `GET /api/collections` - Get user's collection
- `POST /api/inventory/:id/redeem` - Redeem coupon (需要商家每日核銷碼)

### Deprecated (Do Not Use)
- `/api/generate-itinerary` → use `/api/gacha/itinerary/v3`
- `/api/gacha/pull/v2` → use `/api/gacha/itinerary/v3`
- `/api/auth/apple` → use `/api/auth/mobile` with `provider: 'apple'`
- `/api/collection/*` → use `/api/collections/*` (注意 s)

## Memory Banks

Documentation in `docs/`:
- `memory-screens.md` - Page structure, routes
- `memory-components.md` - UI components, styles
- `memory-api-client.md` - API endpoints, TypeScript interfaces
- `memory-auth-flow.md` - Apple Sign-In, token management
- `memory-state.md` - Context, caching
- `memory-assets.md` - Images, fonts, i18n
- `architecture-audit-report.md` - 前後端架構審計報告

## Backend Contract Reference

後端 API 合約文件在 [MIBU_REPLIT](https://github.com/chaosmibu-blip/MIBU_REPLIT) repo：
- `docs/contracts/COMMON.md` - 通用定義（錯誤碼、認證、分頁）
- `docs/contracts/APP.md` - App 專用 API 規格

**重要**：修改 API 服務時，先檢查後端合約確認 endpoint 是否存在。

## Workflow Notes

1. **Before modifying**: Explain the plan, wait for confirmation
2. **Backend-first**: Business logic handled by backend, frontend only displays
3. **Error handling**: Silently handle `Network request failed`, `AbortError`, `cancelled` (user left app)
4. **After completion**: Update relevant memory bank in `docs/`
5. **Minor adjustments**: Style tweaks and typo fixes don't require memory bank updates

## Build & Submit

```bash
# Development
npx expo start --web --port 5000

# Build iOS (Production)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## Important Notes

| Item | Description |
|------|-------------|
| **iPhone only** | iPad runs in 2x mode - Apple will test on iPad |
| **AI Gacha timing** | Takes 1-2 minutes - UI must clearly inform user of wait time |
| **Dark mode** | Tab Bar forced to use light background |
| **Token management** | iOS uses SecureStore, Web uses AsyncStorage |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank screen | Check if API responds, verify Token validity |
| Tab Bar text unreadable | Check tint settings in `TabBarBackground.ios.tsx` |
| Login state lost | Check if `loadStoredData` correctly calls API |

For more details, see the `docs/` folder.
