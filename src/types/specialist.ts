/**
 * 專員相關類型
 */

export interface SpecialistInfo {
  id: number;
  userId: string;
  name: string;
  isOnline: boolean;
  isAvailable: boolean;
  serviceRegion?: string;
  currentTravelers?: number;
  maxTravelers?: number;
}

export interface ServiceRelation {
  id: number;
  travelerId: string;
  specialistId: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  traveler?: {
    id: string;
    name: string;
  };
}

export interface ServiceOrder {
  id: string;
  userId: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  verificationCode?: string;
  createdAt: string;
  updatedAt: string;
}
