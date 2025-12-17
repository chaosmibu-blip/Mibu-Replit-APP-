# Mibu - Travel Gacha Mobile App

## Overview

Mibu is a React Native/Expo mobile application that gamifies travel planning through a "gacha" (capsule toy) mechanic. Users can randomly generate travel itineraries for various destinations, collect discovered locations, and plan trips. The app supports multiple languages (Traditional Chinese, English, Japanese, Korean) and features a tab-based navigation system.

The app connects to an external backend API for location data and itinerary generation, with local storage for user preferences and collections.

## Recent Changes (December 2024)

### Inventory & Tab Badge System (December 17, 2024)
- **ItemBoxScreen**: Complete inventory page showing user's collected coupons and items
  - Unread items display red border and dot indicator
  - Coupon redemption flow with merchant code verification
  - 3-minute countdown timer after successful redemption
  - Auto-close modal when countdown expires
- **Tab Badge Notification**: Gacha tab shows red badge with unread item count
  - `setUnreadCount` function in AppContext for efficient state updates
  - No redundant API calls - unread count calculated from existing data
- **Collection Screen Updates**: Partner and coupon badges on collection items
  - Purple "合作/Partner" badge for merchant-affiliated places
  - Orange "優惠/Coupon" badge for places with active coupons
  - Merchant name display for affiliated items

### Unified Pool Preview with Coupons (December 17, 2024)
- **Unified Pool Modal**: Single 「查看獎池」button shows both rare places and coupons in one modal
- **Coupon Section**: SP/SSR coupons displayed at top of pool preview with gold (SSR) or purple (SP) borders
- **Places Section**: Rare places (SP/SSR/SR) displayed below coupons in 2-column grid
- **RegionPoolCoupon Type**: Type for coupon pool items with id, title, description, discount, rarity, merchantName
- **API Integration**: `getRegionCouponPool(token, regionId)` fetches coupons from `/api/coupons/region/:regionId/pool`
- **Parallel Loading**: Both pool data and coupon data loaded simultaneously for better performance
- **Bilingual Support**: All pool preview UI elements support zh-TW and English

### Complete Merchant & Specialist Backend (December 16, 2024)
- **New Merchant Screens**:
  - `MerchantTransactionsScreen`: View transaction history with purchase/usage/refund tracking
  - `MerchantVerifyScreen`: Verify other merchants' codes with merchantId + code input
  - `MerchantPlacesScreen`: Claim and manage places with search functionality
  - `MerchantProductsScreen`: Create, edit, delete products with modal form
  - `MerchantProfileScreen`: View merchant profile info (balance, plan, status)
- **New Specialist Screens**:
  - `SpecialistTravelersScreen`: View active travelers being served
  - `SpecialistTrackingScreen`: Live location tracking with Socket.IO integration
  - `SpecialistHistoryScreen`: View service history with filter (all/active/completed)
  - `SpecialistProfileScreen`: View/edit specialist profile, toggle availability
- **Updated Dashboard Screens**:
  - Added menu navigation links to all sub-pages
  - Consistent styling with menu icons and chevrons
- **Route Structure**:
  - `/merchant/transactions` - Transaction history
  - `/merchant/verify` - Verify merchant codes
  - `/merchant/places` - Place management
  - `/merchant/products` - Product management
  - `/merchant/profile` - Merchant profile
  - `/specialist/travelers` - Active travelers list
  - `/specialist/tracking` - Live location map
  - `/specialist/history` - Service history
  - `/specialist/profile` - Specialist profile
- **API Updates**:
  - `verifyMerchantCode()` now requires merchantId and code
  - `updateSpecialistAvailability()` - PATCH availability status
  - `getSpecialistTravelers()` - Get active traveler list

### Role Switching Mechanism (December 16, 2024)
- **activeRole Field**: User type includes `activeRole` to track current interface
- **switchRole API**: POST `/api/auth/switch-role` to change active interface
- **RoleSwitcher Component**: Displayed for super admins in dashboard headers
- **Robust State Management**: Role switching validates server response before navigation

### Admin Dashboard & Multi-Role System (December 16, 2024)
- **Admin Dashboard Screen**: Complete admin management interface with 4 tabs
  - 待審核用戶 (Pending Users): Review and approve merchant/specialist registrations
  - 所有用戶 (All Users): Browse all registered users with role badges
  - 地點草稿 (Place Drafts): Review and publish user-submitted places
  - 全域排除 (Global Exclusions): Manage places excluded from all gacha results
- **Admin API Methods**: Added to api.ts
  - `getAdminUsers()` - List all users
  - `getAdminPendingUsers()` - Get pending approvals
  - `approveUser()` - Approve user registrations
  - `getPlaceDrafts()` - Get place drafts
  - `publishDraft()` - Publish draft to live
  - `addGlobalExclusion()` - Add exclusion
  - `deleteGlobalExclusion()` - Remove exclusion
- **Terminology Update**: Changed 「專家」to「專員」(specialist) across all screens
- **Role Navigation Fix**: Admin role now properly redirects to `/admin-dashboard`
- **Portal Switcher**: Super admins see portal buttons for all 4 dashboards

### API Service Updates (December 16, 2024)
- **Complete Merchant API Integration**: Added all merchant endpoints to api.ts
  - `getMerchantMe()` - Get merchant profile
  - `registerMerchant()` - Register as merchant
  - `verifyMerchantCode()` - Verify customer code
  - `getMerchantTransactions()` - Transaction history
  - `searchMerchantPlaces()` - Search for places to claim
  - `claimMerchantPlace()` - Claim a place
  - `getMerchantPlaces()` - List claimed places
  - `updateMerchantPlace()` - Update place info
  - `getMerchantProducts()` - List products
  - `createMerchantProduct()` - Add product
  - `updateMerchantProduct()` - Update product
  - `deleteMerchantProduct()` - Delete product
- **Specialist API Integration**: Added specialist registration endpoint
  - `registerSpecialist()` - Register as specialist
- **New Types Added**: `MerchantMe`, `MerchantTransaction`, `MerchantPlace`, `MerchantProduct`, `PlaceSearchResult`
- **Super Admin Support**: User type now includes `isSuperAdmin` and `accessibleRoles` fields
- **Portal Switcher**: Settings page shows portal switcher for super admins to access all dashboards
- **Logout Flow Update**: Now properly clears token and redirects to login page

### Gacha Flow Simplification (December 15, 2024)
- **Removed district selector**: Users now only need to select Country and City/Region to start gacha
- **Fixed navigation to results**: Changed from AppContext state-based navigation to expo-router `router.push()` for proper navigation after gacha completion
- **Pool preview now uses city-level**: Pool preview aggregates to the city/region level instead of requiring district selection
- **Pull count slider**: Changed from dropdown to horizontal slider with range 5-12 cards
- **Unlimited generations for VIP**: Users logged in with `s8869420@gmail.com` bypass daily generation limits
- **Simplified GachaScreen.tsx**: Removed district-related states and simplified selection flow

### Infrastructure Upgrade (December 15, 2024)
- **NativeWind v4 + Tailwind CSS**: Installed and configured for utility-first styling
  - `babel.config.js` with nativewind/babel preset
  - `tailwind.config.js` with nativewind/preset
  - `metro.config.js` with withNativeWind wrapper
  - `global.css` imported in root layout
  - `nativewind-env.d.ts` for TypeScript support
- **API Configuration**: `API_BASE_URL` now supports `EXPO_PUBLIC_API_URL` environment variable with fallback
- **TypeScript Types**: Added `SosEvent`, `ServiceOrder` interfaces; Updated `User.role` to union type with 'specialist'

### Multi-Role Authentication System (December 15, 2024)
- **Role-based navigation**: Users are routed to different dashboards based on their role
  - `traveler` / `admin` → Main tabs app
  - `merchant` (approved) → Merchant Dashboard
  - `specialist` (approved) → Specialist Dashboard
  - Unapproved merchant/specialist → Pending Approval page
- **AuthScreen with registration**: Modal-based auth with role selection during signup
  - Traveler, Merchant, Specialist options
  - Email/password login and registration
  - Guest login for quick access
- **AppContext token storage**: JWT tokens stored in AsyncStorage via `getToken()` method
- **New screens created**:
  - `MerchantDashboardScreen`: Daily verification code, credit balance, Stripe/Recur top-up
  - `SpecialistDashboardScreen`: Online toggle, active service list
  - `PendingApprovalScreen`: Waiting status for unapproved accounts
- **Payment gateway integration**: Dual support for Stripe and Recur payments

### Login Flow
- Standalone login page (`app/login.tsx`) shows on app launch
- AuthScreen modal for registration with role selection
- Supports Email/Password login and Guest login
- Role-based redirects after authentication

### Location Feature (LocationScreen)
- Uses `expo-location` for user positioning
- Native platforms: Map view with `react-native-maps`
- Web platform: List view (maps not supported on web)
- **Share location toggle**: Switch to share location with trip planner
- API sends `isSharingEnabled` flag, receives planner locations for map markers
- Planner markers displayed in purple on map when sharing is enabled
- Full i18n support for all 4 languages

### SOS Safety Center (SOSScreen)
- Accessible from Settings > Safety section
- Webhook URL display for iOS Shortcuts integration
- Copy to clipboard functionality with `expo-clipboard`
- Step-by-step iOS Shortcuts setup instructions
- Red SOS emergency button with confirmation dialog
- Full i18n support for all 4 languages
- Route: `/sos` via `app/sos.tsx`

### Chat Feature (ChatScreen)
- AI trip assistant with pre-defined responses
- Quick reply buttons
- Full i18n support with localized responses
- Typing indicator animation

### Twilio Integration
- `src/lib/twilio.ts` with proper error handling
- SMS sending capability
- Credentials managed via Replit Connectors

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **Expo SDK 54** with React Native 0.81 - Chosen for cross-platform development (iOS, Android, Web) with a single codebase
- **Expo Router** with file-based routing - Provides intuitive navigation structure through the `app/` directory
- **TypeScript** with strict mode enabled - Ensures type safety across the application

### Navigation Structure
- Tab-based navigation using `@react-navigation/bottom-tabs`
- Five main tabs: Home, Gacha, Planner, Collection, Settings
- Screen components live in `src/screens/` and are re-exported through `app/(tabs)/` files

### State Management
- **React Context API** (`src/context/AppContext.tsx`) - Centralized state management for:
  - User authentication state
  - Language preferences
  - Collection of discovered items
  - Current gacha results
  - Loading and error states
- **AsyncStorage** for persistence of language, collection, and user data

### Component Architecture
- **UI Components** (`src/components/ui/`) - Reusable primitives (Button, Card, Select)
- **Themed Components** (`components/`) - Theme-aware wrappers (ThemedText, ThemedView)
- **Screen Components** (`src/screens/`) - Full page implementations

### Theming System
- Light/dark mode support via `useColorScheme` hook
- Centralized color definitions in `constants/Colors.ts`
- Platform-specific styling (iOS blur effects, Android edge-to-edge)

### Internationalization
- Four supported languages: zh-TW, en, ja, ko
- Translation strings stored in `src/constants/translations.ts`
- Language selection persisted to AsyncStorage

### Animation
- **react-native-reanimated** for performant animations (parallax scrolling, gestures)
- Haptic feedback on iOS for tab interactions

## External Dependencies

### Backend API
- **API Base URL**: `https://gacha-travel--s8869420.replit.app`
- Endpoints used:
  - `GET /api/locations/countries` - Fetch available countries
  - `GET /api/locations/regions/:countryId` - Fetch regions within a country
  - `GET /api/locations/districts/:regionId` - Fetch districts within a region
  - `POST /api/gacha/itinerary` - Generate random itinerary
  - `GET /api/auth/user` - Fetch authenticated user data
  - `GET /api/auth/login` - OAuth login flow
  - `POST /api/location/update` - Update user location with sharing flag
  - `GET /api/user/sos-link` - Get user's SOS webhook URL
  - `POST /api/sos/trigger` - Trigger SOS emergency signal

### Key NPM Packages
- `@react-native-async-storage/async-storage` - Local data persistence
- `@react-native-community/slider` - Level selection slider in gacha screen
- `react-native-webview` - OAuth authentication flow
- `expo-haptics` - Tactile feedback on iOS
- `expo-blur` - iOS tab bar blur effect
- `@expo/vector-icons` / `expo-symbols` - Icon system with platform-specific implementations

### Development Tools
- ESLint with Expo configuration
- Jest with jest-expo preset for testing
- TypeScript ~5.9 with path aliases (`@/*` maps to project root)