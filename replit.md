# Mibu - Travel Gacha Mobile App

## Overview

Mibu is a React Native/Expo mobile application that gamifies travel planning using a "gacha" (capsule toy) mechanic. Users can randomly generate travel itineraries, collect discovered locations, and plan trips. The app supports multiple languages and connects to an external backend API for itinerary generation and location data, using local storage for user preferences and collections. The business vision is to make travel planning engaging and discovery-driven, tapping into the growing market for unique travel experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

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

## External Dependencies

### Backend API
- **Base URL**: `https://gacha-travel--s8869420.replit.app`
- **Key Endpoints**:
    - Location data: `/api/locations/countries`, `/api/locations/regions/:countryId`, `/api/locations/districts/:regionId`
    - Gacha: `/api/gacha/itinerary`
    - Authentication & User Management: `/api/auth/user`, `/api/auth/login`, `/api/auth/switch-role`, `/api/auth/register` (for merchant/specialist), `/api/admin/users`, `/api/admin/pending-users`, `/api/admin/approve-user`
    - SOS: `/api/user/sos-link`, `/api/sos/trigger`
    - Location Update: `/api/location/update`
    - Merchant Specific: `/api/merchant/me`, `/api/merchant/transactions`, `/api/merchant/verify`, `/api/merchant/places`, `/api/merchant/products`
    - Specialist Specific: `/api/specialist/register`, `/api/specialist/travelers`, `/api/specialist/tracking` (Socket.IO for live tracking)
    - Coupons: `/api/coupons/region/:regionId/pool`

### Key NPM Packages
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

### Third-Party Integrations
- **Twilio**: For SMS sending capabilities (credentials managed via Replit Connectors).
- **Stripe & Recur**: Payment gateways for merchant top-ups.
- **Socket.IO**: For live location tracking in specialist features.