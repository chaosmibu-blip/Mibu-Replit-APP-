/**
 * Google 原生登入 Hook
 * 使用 expo-auth-session 進行 Google 原生登入
 */
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_IOS_CLIENT_ID = '543517647590-3fpo4kl895apdp3tt2ditgj5leo034dv.apps.googleusercontent.com';

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    // androidClientId: 之後 Android 上架時再加
  });

  const signInWithGoogle = async (): Promise<string> => {
    const result = await promptAsync();

    if (result.type === 'success') {
      const { id_token } = result.params;
      return id_token;
    }

    if (result.type === 'cancel') {
      throw new Error('使用者取消登入');
    }

    throw new Error('Google 登入失敗');
  };

  return {
    signInWithGoogle,
    isReady: !!request,
  };
}
