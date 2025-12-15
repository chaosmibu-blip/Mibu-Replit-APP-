import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Language, User, GachaItem, GachaResponse } from '../types';
import { TRANSLATIONS, DEFAULT_LEVEL } from '../constants/translations';

interface AppContextType {
  state: AppState;
  t: Record<string, string>;
  updateState: (updates: Partial<AppState>) => void;
  setLanguage: (lang: Language) => void;
  setUser: (user: User | null) => void;
  addToCollection: (items: GachaItem[]) => void;
  setResult: (result: GachaResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultState: AppState = {
  language: 'zh-TW',
  user: null,
  country: '',
  city: '',
  countryId: null,
  regionId: null,
  level: DEFAULT_LEVEL,
  loading: false,
  error: null,
  result: null,
  collection: [],
  view: 'home',
  isAuthenticated: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANGUAGE: '@mibu_language',
  COLLECTION: '@mibu_collection',
  USER: '@mibu_user',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedLanguage, storedCollection, storedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.COLLECTION),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      const updates: Partial<AppState> = {};

      if (storedLanguage) {
        updates.language = storedLanguage as Language;
      }

      if (storedCollection) {
        updates.collection = JSON.parse(storedCollection);
      }

      if (storedUser) {
        const user = JSON.parse(storedUser);
        updates.user = user;
        updates.isAuthenticated = true;
      }

      if (Object.keys(updates).length > 0) {
        setState(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  const setUser = useCallback(async (user: User | null) => {
    setState(prev => ({ 
      ...prev, 
      user, 
      isAuthenticated: !!user 
    }));
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, []);

  const addToCollection = useCallback(async (items: GachaItem[]) => {
    setState(prev => {
      const existingIds = new Set(prev.collection.map(i => i.id));
      const newItems = items.filter(i => !existingIds.has(i.id));
      if (newItems.length === 0) return prev;
      const updatedCollection = [...prev.collection, ...newItems];
      
      AsyncStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(updatedCollection));
      
      return { ...prev, collection: updatedCollection };
    });
  }, []);

  const setResult = useCallback((result: GachaResponse | null) => {
    setState(prev => ({ ...prev, result }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const t = TRANSLATIONS[state.language];

  return (
    <AppContext.Provider
      value={{
        state,
        t,
        updateState,
        setLanguage,
        setUser,
        addToCollection,
        setResult,
        setLoading,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
