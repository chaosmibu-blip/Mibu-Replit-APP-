/**
 * App 狀態相關類型
 */
import { Language } from './common';
import { User } from './auth';
import { GachaItem, GachaResponse } from './gacha';

export type AppView = 'home' | 'gacha_module' | 'planner_module' | 'settings' | 'result' | 'login';
export type GachaSubView = 'gacha' | 'collection' | 'itembox';
export type PlannerSubView = 'location' | 'itinerary' | 'chat' | 'service';

export interface AppState {
  language: Language;
  user: User | null;
  country: string;
  city: string;
  countryId: number | null;
  regionId: number | null;
  level: number;
  loading: boolean;
  error: string | null;
  result: GachaResponse | null;
  collection: GachaItem[];
  view: AppView;
  isAuthenticated: boolean;
  unreadItemCount: number;
}
