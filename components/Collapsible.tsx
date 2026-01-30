/**
 * 可折疊區塊元件
 *
 * 提供可展開/收合的內容區塊，常用於 FAQ、設定頁面等
 * 點擊標題列可切換展開狀態，附帶旋轉箭頭動畫
 *
 * 使用方式：
 * import { Collapsible } from '@/components/Collapsible';
 *
 * @example
 * <Collapsible title="點擊展開">
 *   <Text>這是隱藏的內容</Text>
 * </Collapsible>
 */

import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * 可折疊區塊元件
 *
 * @param props.title - 區塊標題文字
 * @param props.children - 可折疊的內容
 *
 * @example
 * <Collapsible title="常見問題">
 *   <Text>問題的答案...</Text>
 * </Collapsible>
 */
export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  // 控制展開/收合狀態
  const [isOpen, setIsOpen] = useState(false);
  // 取得當前主題以設定圖標顏色
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      {/* 標題列 - 可點擊切換展開狀態 */}
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        {/* 箭頭圖標 - 展開時旋轉 90 度 */}
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        {/* 標題文字 */}
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>

      {/* 內容區塊 - 僅在展開時顯示 */}
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

/**
 * 元件樣式定義
 */
const styles = StyleSheet.create({
  /** 標題列樣式 */
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  /** 內容區塊樣式 - 左側縮排 */
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
