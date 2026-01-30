/**
 * 觸覺回饋 Tab 按鈕元件
 *
 * 用於底部 Tab Bar 的按鈕，點擊時提供觸覺回饋（iOS）
 * 選中狀態會顯示高亮背景
 *
 * 使用方式：
 * 通常在 Tab Navigator 的 tabBarButton 選項中使用
 *
 * @example
 * <Tabs.Screen
 *   options={{
 *     tabBarButton: (props) => <HapticTab {...props} />,
 *   }}
 * />
 */

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Platform, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MibuBrand } from '../constants/Colors';

/**
 * 觸覺回饋 Tab 按鈕元件
 *
 * @param props - 繼承自 BottomTabBarButtonProps 的所有屬性
 *
 * 功能說明：
 * - iOS 平台：點擊時觸發輕微觸覺回饋
 * - 選中狀態：顯示 Mibu 品牌高亮色背景
 * - 擴大點擊區域：上下左右各擴大 10px
 */
export function HapticTab(props: BottomTabBarButtonProps) {
  // 判斷是否為選中狀態
  const isSelected = props.accessibilityState?.selected;

  return (
    <PlatformPressable
      {...props}
      // 擴大點擊區域，提升使用體驗
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      pressRetentionOffset={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPressIn={(ev) => {
        // iOS 平台觸發輕微觸覺回饋
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        // 呼叫原本的 onPressIn（如果有的話）
        props.onPressIn?.(ev);
      }}
      style={[props.style, styles.tabButton]}
    >
      {/* Tab 內容容器 - 選中時顯示高亮背景 */}
      <View style={[styles.tabContent, isSelected && styles.tabContentSelected]}>
        {props.children}
      </View>
    </PlatformPressable>
  );
}

/**
 * 元件樣式定義
 */
const styles = StyleSheet.create({
  /** Tab 按鈕容器樣式 */
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Tab 內容區域樣式 */
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  /** Tab 選中狀態樣式 - 使用 Mibu 品牌高亮色 */
  tabContentSelected: {
    backgroundColor: MibuBrand.highlight,
  },
});
