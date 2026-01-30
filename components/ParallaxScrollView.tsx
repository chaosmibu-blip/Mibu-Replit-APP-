/**
 * 視差滾動元件
 *
 * 提供帶有視差效果的捲動視圖
 * Header 區域會隨著滾動產生視差和縮放效果
 *
 * 使用方式：
 * import ParallaxScrollView from '@/components/ParallaxScrollView';
 *
 * @example
 * <ParallaxScrollView
 *   headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
 *   headerImage={<Image source={require('./header.png')} />}
 * >
 *   <Text>滾動內容...</Text>
 * </ParallaxScrollView>
 */

import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

/** Header 區域高度常數 */
const HEADER_HEIGHT = 250;

/** 元件 Props 型別定義 */
type Props = PropsWithChildren<{
  /** Header 圖片元素 */
  headerImage: ReactElement;
  /** Header 背景色（需提供淺色和深色模式的值） */
  headerBackgroundColor: { dark: string; light: string };
}>;

/**
 * 視差滾動元件
 *
 * @param props.headerImage - Header 區域顯示的圖片元件
 * @param props.headerBackgroundColor - Header 背景色配置
 * @param props.children - 滾動區域的內容
 *
 * @example
 * <ParallaxScrollView
 *   headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
 *   headerImage={
 *     <Image
 *       source={require('@/assets/images/header.png')}
 *       style={styles.headerImage}
 *     />
 *   }
 * >
 *   <ThemedText>內容</ThemedText>
 * </ParallaxScrollView>
 */
export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  // 取得當前色彩主題
  const colorScheme = useColorScheme() ?? 'light';
  // 建立 ScrollView 的 animated ref
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  // 追蹤滾動偏移量
  const scrollOffset = useScrollViewOffset(scrollRef);
  // 取得底部 Tab Bar 的高度（用於內容 padding）
  const bottom = useBottomTabOverflow();

  // 建立 Header 的動畫樣式
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          // 視差位移效果
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          // 下拉時放大效果
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        {/* Header 區域 - 帶有視差動畫 */}
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}>
          {headerImage}
        </Animated.View>
        {/* 內容區域 */}
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

/**
 * 元件樣式定義
 */
const styles = StyleSheet.create({
  /** 容器樣式 */
  container: {
    flex: 1,
  },
  /** Header 區域樣式 */
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  /** 內容區域樣式 */
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
