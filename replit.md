# Mibu - Travel Gacha Mobile App

## Overview

Mibu is a React Native/Expo mobile application that gamifies travel planning through a "gacha" (capsule toy) mechanic. Users can randomly generate travel itineraries for various destinations, collect discovered locations, and plan trips. The app supports multiple languages (Traditional Chinese, English, Japanese, Korean) and features a tab-based navigation system.

The app connects to an external backend API for location data and itinerary generation, with local storage for user preferences and collections.

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