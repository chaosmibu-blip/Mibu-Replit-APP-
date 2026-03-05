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
 * - Expo Go 相容（延遲載入原生模組，避免啟動時炸）
 *
 * ⚠️ 需要 EAS Build（native 層修改，OTA 無法生效）
 * ⚠️ Expo Go 中會拋出「需要 EAS Build」錯誤，不會 crash
 *
 * 更新日期：2026-03-05（延遲載入修復 Expo Go 相容性）
 */

/** Google OAuth Client IDs */
const GOOGLE_WEB_CLIENT_ID = '543517647590-cst5g9vp5pq22tvl3oet9nu0jr14n1d0.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '543517647590-3fpo4kl895apdp3tt2ditgj5leo034dv.apps.googleusercontent.com';

let isConfigured = false;

/**
 * 延遲載入並初始化 Google Sign-In SDK
 * Expo Go 中原生模組不存在，會拋出明確錯誤而非 crash
 */
function getGoogleSigninModule() {
  try {
    const module = require('@react-native-google-signin/google-signin');

    if (!isConfigured) {
      module.GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        offlineAccess: false,
      });
      isConfigured = true;
    }

    return module;
  } catch {
    throw new Error(
      'Google 原生登入需要 EAS Build 的開發版本，Expo Go 不支援。請使用 eas build --profile development 建立開發版本。'
    );
  }
}

/**
 * Google 登入 Hook
 *
 * @returns signInWithGoogle - 觸發 Google 登入流程的函數
 * @returns isReady - 永遠為 true（原生 SDK 不需等待初始化）
 */
export function useGoogleAuth() {
  return {
    /** 觸發 Google 登入流程 */
    signInWithGoogle: async (): Promise<string> => {
      const { GoogleSignin, isErrorWithCode, statusCodes } = getGoogleSigninModule();

      try {
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
