import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://gacha-travel--s8869420.replit.app';

const TOKEN_KEY = 'auth_token';

async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Failed to save token:', error);
  }
}

export async function clearToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to clear token:', error);
  }
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void): void {
  onUnauthorized = callback;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = await getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      await clearToken();
      if (onUnauthorized) {
        onUnauthorized();
      }
      throw new ApiError('未授權，請重新登入', 401);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        errorText || `API 錯誤: ${response.status}`,
        response.status
      );
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('網路連線錯誤，請檢查網路', 0);
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : '未知錯誤',
      0
    );
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

import type { ItineraryV3Payload, ItineraryV3Response, ItineraryPace } from '../types';

export async function generateItineraryV3(
  city: string,
  district: string,
  pace: ItineraryPace = 'moderate'
): Promise<ItineraryV3Response> {
  const payload: ItineraryV3Payload = { city, district, pace };
  return api.post<ItineraryV3Response>('/api/gacha/itinerary/v3', payload);
}

export { ApiError };
