/**
 * SOS 緊急求救相關類型
 */

export interface SosEvent {
  id: string;
  userId: string;
  status: 'pending' | 'active' | 'resolved' | 'cancelled';
  locationLat?: number;
  locationLng?: number;
  createdAt: string;
  updatedAt: string;
}

export type SosAlertStatus = 'pending' | 'acknowledged' | 'resolved' | 'cancelled';

export interface SosAlert {
  id: number;
  userId: string;
  serviceOrderId: number | null;
  plannerId: number | null;
  location: string | null;
  locationAddress: string | null;
  message: string | null;
  status: SosAlertStatus;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface SosEligibility {
  eligible: boolean;
  reason: string | null;
}

export interface SosSendParams {
  serviceOrderId?: number;
  plannerId?: number;
  location?: string;
  locationAddress?: string;
  message?: string;
}

export interface SosSendResponse {
  success: boolean;
  alertId: number;
  message: string;
}

export interface SosAlertsResponse {
  alerts: SosAlert[];
}
