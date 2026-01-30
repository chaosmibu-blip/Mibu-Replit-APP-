/**
 * Google 原生登入 Hook
 *
 * 使用 expo-auth-session 進行 Google 原生登入
 * 目前僅支援 iOS 平台，Android 支援將於上架時加入
 *
 * 使用方式：
 * import { useGoogleAuth } from '@/hooks/useGoogleAuth';
 *
 * @example
 * const { signInWithGoogle, isReady } = useGoogleAuth();
 *
 * // 檢查是否準備好
 * if (isReady) {
 *   const idToken = await signInWithGoogle();
 *   // 將 idToken 傳送至後端驗證
 * }
 */

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// 確保 Web 瀏覽器 session 正確關閉
WebBrowser.maybeCompleteAuthSession();

/** Google OAuth iOS Client ID */
const GOOGLE_IOS_CLIENT_ID = '543517647590-3fpo4kl895apdp3tt2ditgj5leo034dv.apps.googleusercontent.com';

/**
 * Google 登入 Hook
 *
 * @returns Hook 回傳值
 * @returns signInWithGoogle - 觸發 Google 登入流程的函數
 * @returns isReady - 是否準備好可以開始登入
 *
 * @example
 * const { signInWithGoogle, isReady } = useGoogleAuth();
 *
 * const handleLogin = async () => {
 *   try {
 *     const idToken = await signInWithGoogle();
 *     await sendToBackend(idToken);
 *   } catch (error) {
 *     console.error('登入失敗:', error.message);
 *   }
 * };
 */
export function useGoogleAuth() {
  // 設定 Google OAuth 請求
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    // androidClientId: 之後 Android 上架時再加
  });

  /**
   * 執行 Google 登入流程
   *
   * @returns Promise<string> - 成功時回傳 Google ID Token
   * @throws Error - 使用者取消或登入失敗時拋出錯誤
   */
  const signInWithGoogle = async (): Promise<string> => {
    const result = await promptAsync();

    // 登入成功，回傳 ID Token
    if (result.type === 'success') {
      const { id_token } = result.params;
      return id_token;
    }

    // 使用者取消登入
    if (result.type === 'cancel') {
      throw new Error('使用者取消登入');
    }

    // 其他錯誤情況
    throw new Error('Google 登入失敗');
  };

  return {
    /** 觸發 Google 登入流程 */
    signInWithGoogle,
    /** 是否準備好可以開始登入（OAuth request 已初始化） */
    isReady: !!request,
  };
}
