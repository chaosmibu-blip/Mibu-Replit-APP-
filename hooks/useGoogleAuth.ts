/**
 * ============================================================
 * Google 原生登入 Hook (useGoogleAuth.ts)
 * ============================================================
 * 使用 @react-native-google-signin/google-signin 進行原生 Google 登入
 * 取代 expo-auth-session 的網頁式 OAuth（解決 production build 登入失敗問題）
 *
 * 主要功能:
 * - 原生 Google Sign-In SDK（不開瀏覽器）
 * - 支援 iOS 和 Android 平台
 * - 回傳 idToken 給後端驗證
 *
 * ⚠️ 需要 EAS Build（native 層修改，OTA 無法生效）
 *
 * 更新日期：2026-03-05（從 expo-auth-session 遷移到原生 SDK）
 */

import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

/** Google OAuth Client IDs */
const GOOGLE_WEB_CLIENT_ID = '543517647590-cst5g9vp5pq22tvl3oet9nu0jr14n1d0.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '543517647590-3fpo4kl895apdp3tt2ditgj5leo034dv.apps.googleusercontent.com';

// 初始化 Google Sign-In 設定（模組載入時執行一次）
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  offlineAccess: false,
});

/**
 * Google 登入 Hook
 *
 * @returns signInWithGoogle - 觸發 Google 登入流程的函數
 * @returns isReady - 永遠為 true（原生 SDK 不需等待初始化）
 */
export function useGoogleAuth() {
  /**
   * 執行 Google 登入流程
   *
   * @returns Promise<string> - 成功時回傳 Google ID Token
   * @throws Error - 使用者取消或登入失敗時拋出錯誤
   */
  const signInWithGoogle = async (): Promise<string> => {
    // 確認 Google Play Services 可用（Android）
    await GoogleSignin.hasPlayServices();

    const response = await GoogleSignin.signIn();

    if ('data' in response && response.data?.idToken) {
      return response.data.idToken;
    }

    // v14+ 也可能直接回傳在 response 上
    if ('idToken' in response && response.idToken) {
      return response.idToken as string;
    }

    console.error('[Google Auth] 登入成功但 idToken 為空，response keys:', Object.keys(response));
    throw new Error('Google 驗證回傳缺少 idToken');
  };

  return {
    /** 觸發 Google 登入流程 */
    signInWithGoogle: async (): Promise<string> => {
      try {
        return await signInWithGoogle();
      } catch (error: any) {
        if (isErrorWithCode(error)) {
          switch (error.code) {
            case statusCodes.SIGN_IN_CANCELLED:
              throw new Error('使用者取消登入');
            case statusCodes.IN_PROGRESS:
              throw new Error('登入進行中，請稍候');
            case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
              throw new Error('Google Play Services 不可用');
            default:
              console.error('[Google Auth] 錯誤碼:', error.code, '訊息:', error.message);
              throw new Error('Google 登入失敗');
          }
        }
        throw error;
      }
    },
    /** 原生 SDK 不需等待初始化，永遠就緒 */
    isReady: true,
  };
}
