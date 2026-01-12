/**
 * 管理員相關類型
 */
import { UserRole } from './common';

export interface GlobalExclusion {
  id: number;
  userId: null;
  placeName: string;
  district: string;
  city: string;
  penaltyScore: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string | null;
  name?: string;
  role: UserRole;
  isApproved: boolean;
  createdAt: string;
}

export interface PlaceDraft {
  id: number;
  placeName: string;
  district?: string;
  city?: string;
  category?: string;
  submittedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type AnnouncementType = 'announcement' | 'flash_event' | 'holiday_event';

export interface Announcement {
  id: number;
  type: AnnouncementType;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementsResponse {
  announcements: Announcement[];
}

export interface CreateAnnouncementParams {
  type: AnnouncementType;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  priority?: number;
}

export interface UpdateAnnouncementParams {
  type?: AnnouncementType;
  title?: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  priority?: number;
}
