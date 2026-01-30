/**
 * 揮手動畫元件
 *
 * 顯示一個帶有揮手動畫的表情符號
 * 用於歡迎頁面或問候場景
 *
 * 動畫效果：左右搖擺 4 次
 *
 * 使用方式：
 * import { HelloWave } from '@/components/HelloWave';
 *
 * @example
 * <View style={{ flexDirection: 'row' }}>
 *   <Text>你好！</Text>
 *   <HelloWave />
 * </View>
 */

import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';

/**
 * 揮手動畫元件
 *
 * 自動播放揮手動畫的表情符號
 * 動畫會重複 4 次後停止
 */
export function HelloWave() {
  // 建立旋轉角度的共享值
  const rotationAnimation = useSharedValue(0);

  // 元件掛載時啟動動畫
  useEffect(() => {
    // 設定動畫序列：向右傾斜 25 度 -> 回正
    // 重複執行 4 次
    rotationAnimation.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 150 }),  // 向右傾斜
        withTiming(0, { duration: 150 })    // 回正
      ),
      4 // 重複 4 次
    );
  }, [rotationAnimation]);

  // 建立動畫樣式
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

/**
 * 元件樣式定義
 */
const styles = StyleSheet.create({
  /** 表情符號文字樣式 */
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
