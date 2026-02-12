/**
 * ============================================================
 * Token 安全儲存工具 (tokenUtils.ts)
 * ============================================================
 * 提供 JWT Token 的跨平台安全儲存
 *
 * - iOS/Android：SecureStore（Keychain / EncryptedSharedPreferences）
 * - Web：AsyncStorage（localStorage 包裝）
 *
 * 獨立於 Context，可在任何地方直接引用
 *
 * 更新日期：2026-02-12（從 AppContext.tsx 抽出）
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * 安全儲存 Token
 * @param token - JWT Token 字串
 */
export const saveToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('@mibu_token', token);
  } else {
    await SecureStore.setItemAsync('mibu_token', token);
  }
};

/**
 * 讀取已儲存的 Token
 * @returns Token 字串或 null（未登入/已過期）
 */
export const loadToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem('@mibu_token');
  }
  return await SecureStore.getItemAsync('mibu_token');
};

/**
 * 清除已儲存的 Token（登出時使用）
 */
export const removeToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem('@mibu_token');
  } else {
    await SecureStore.deleteItemAsync('mibu_token');
  }
};
