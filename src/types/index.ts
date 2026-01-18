/**
 * Types 統一匯出
 *
 * 向後兼容：import { User, GachaItem } from '@/types' 仍然有效
 * 新用法：import { User } from '@/types/auth'
 */

// Common
export * from './common';

// Auth
export * from './auth';

// Gacha
export * from './gacha';

// Inventory
export * from './inventory';

// Collection
export * from './collection';

// Merchant
export * from './merchant';

// Specialist
export * from './specialist';

// Admin
export * from './admin';

// Location
export * from './location';

// SOS
export * from './sos';

// App State
export * from './app';

// Ads
export * from './ads';

// Notifications
export * from './notifications';

// Errors
export * from './errors';

// Economy (Phase 5)
export * from './economy';

// Crowdfunding (Phase 5)
export * from './crowdfunding';

// Referral (Phase 5)
export * from './referral';

// Contribution (Phase 6)
export * from './contribution';

// Event (Phase 7 - sync-app #006)
export * from './event';
