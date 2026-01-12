/**
 * 專員相關 API - 追蹤、旅客管理、服務關係
 */
import { ApiBase } from './base';
import { SpecialistInfo, ServiceRelation } from '../types';

class SpecialistApiService extends ApiBase {
  async getSpecialistMe(token: string): Promise<SpecialistInfo> {
    return this.request<SpecialistInfo>('/api/specialist/me', {
      headers: this.authHeaders(token),
    });
  }

  async registerSpecialist(token: string, params: {
    serviceRegion?: string;
  }): Promise<{ specialist: SpecialistInfo }> {
    return this.request('/api/specialist/register', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  async toggleSpecialistOnline(token: string): Promise<{ specialist: SpecialistInfo }> {
    return this.request<{ specialist: SpecialistInfo }>('/api/specialist/toggle-online', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  async updateSpecialistAvailability(token: string, isAvailable: boolean): Promise<{ specialist: SpecialistInfo }> {
    return this.request<{ specialist: SpecialistInfo }>('/api/specialist/availability', {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify({ isAvailable }),
    });
  }

  async getSpecialistTravelers(token: string): Promise<{
    travelers: Array<{
      serviceRelation: ServiceRelation;
      traveler: { id: string; firstName: string; lastName: string }
    }>
  }> {
    return this.request('/api/specialist/travelers', {
      headers: this.authHeaders(token),
    });
  }

  async getSpecialistServices(token: string): Promise<{ relations: ServiceRelation[] }> {
    return this.request<{ relations: ServiceRelation[] }>('/api/specialist/services', {
      headers: this.authHeaders(token),
    });
  }
}

export const specialistApi = new SpecialistApiService();
