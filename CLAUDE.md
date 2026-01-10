# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- `src/screens/` - Screen components (33 screens)
- `src/components/` - Reusable UI components
- `src/context/AppContext.tsx` - Global state management
- `src/services/api.ts` - API service class (all endpoints)
- `src/types/` - TypeScript interfaces
- `docs/` - Memory bank documentation (6 files)

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

## API Quick Reference

### Core Endpoints
- `POST /api/gacha/itinerary/v3` - Pull gacha (requires auth)
- `GET /api/gacha/quota` - Check remaining daily quota
- `GET /api/inventory` - Get user's item box
- `POST /api/auth/apple` - Apple Sign-In

### Deprecated (Do Not Use)
- `/api/generate-itinerary` → use `/api/gacha/itinerary/v3`
- `/api/gacha/pull/v2` → use `/api/gacha/itinerary/v3`

## Memory Banks

Documentation in `docs/`:
- `memory-screens.md` - Page structure, routes
- `memory-components.md` - UI components, styles
- `memory-api-client.md` - API endpoints, TypeScript interfaces
- `memory-auth-flow.md` - Apple Sign-In, token management
- `memory-state.md` - Context, caching
- `memory-assets.md` - Images, fonts, i18n

## Workflow Notes

1. **Before modifying**: Explain the plan, wait for confirmation
2. **Backend-first**: Business logic handled by backend, frontend only displays
3. **Error handling**: Silently handle `Network request failed`, `AbortError`, `cancelled` (user left app)
4. **After completion**: Update relevant memory bank in `docs/`
5. **Minor adjustments**: Style tweaks and typo fixes don't require memory bank updates
