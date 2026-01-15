/**
 * 認證與用戶相關類型
 */
import { Language, UserRole } from './common';

export interface UserPrivileges {
  hasUnlimitedGeneration: boolean;
}

export interface User {
  id: string;
  name?: string;
  email: string | null;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  profileImageUrl?: string | null;
  role?: UserRole;
  activeRole?: UserRole;
  isApproved?: boolean;
  isSuperAdmin?: boolean;
  accessibleRoles?: string[];
  provider?: string | null;
  providerId?: string | null;
  isMerchant?: boolean;
  token?: string;
  privileges?: UserPrivileges;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: UserRole;
  gender: Gender | null;
  birthDate: string | null;
  phone: string | null;
  dietaryRestrictions: string[];
  medicalHistory: string[];
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  preferredLanguage: Language;
}

export interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  birthDate?: string;
  phone?: string;
  dietaryRestrictions?: string[];
  medicalHistory?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  preferredLanguage?: Language;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  profile: UserProfile;
}

export interface DeleteAccountResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: 'UNAUTHORIZED' | 'MERCHANT_ACCOUNT_EXISTS' | 'DELETE_FAILED' | 'SERVER_ERROR';
}
