/**
 * 外部連結元件
 *
 * 用於開啟外部網址的連結元件
 * - Web 平台：在新分頁開啟
 * - 原生平台：使用 App 內瀏覽器開啟
 *
 * 使用方式：
 * import { ExternalLink } from '@/components/ExternalLink';
 *
 * @example
 * <ExternalLink href="https://google.com">
 *   <Text>前往 Google</Text>
 * </ExternalLink>
 */

import { Href, Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

/** 元件 Props 型別 - 繼承 Link 的 props，但 href 必須是字串 */
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

/**
 * 外部連結元件
 *
 * @param props.href - 外部網址（必須是完整的 URL）
 * @param props.children - 連結內容
 *
 * @example
 * <ExternalLink href="https://expo.dev">
 *   前往 Expo 官網
 * </ExternalLink>
 */
export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        // 原生平台使用 App 內瀏覽器
        if (Platform.OS !== 'web') {
          // 阻止預設行為（避免跳轉到系統瀏覽器）
          event.preventDefault();
          // 使用 App 內瀏覽器開啟連結
          await openBrowserAsync(href);
        }
        // Web 平台使用預設行為（在新分頁開啟）
      }}
    />
  );
}
