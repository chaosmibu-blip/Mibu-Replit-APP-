/**
 * InfoToast - 資訊提示吐司元件
 *
 * 用於顯示非阻塞式的提示訊息，自動消失。
 * 適合用於操作成功、提醒、警告等場景。
 *
 * 特點：
 * - 從底部滑入的動畫效果
 * - 可自訂顯示時長
 * - 自動消失後觸發 onHide 回調
 * - 使用警告色系（金黃色調）
 *
 * @example
 * const [showToast, setShowToast] = useState(false);
 *
 * <InfoToast
 *   visible={showToast}
 *   message="行程已儲存成功！"
 *   duration={3000}
 *   onHide={() => setShowToast(false)}
 * />
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '@/constants/Colors';
import { Spacing, Radius, FontSize, Shadow, SemanticColors } from '@/src/theme/designTokens';

// ============ Props 介面定義 ============

/**
 * InfoToast 元件的 Props 介面
 */
interface InfoToastProps {
  /** 是否顯示吐司 */
  visible: boolean;
  /** 顯示的訊息文字 */
  message: string;
  /** 顯示時長（毫秒）（預設 3000） */
  duration?: number;
  /** 吐司消失後的回調函數 */
  onHide?: () => void;
}

// ============ 主元件 ============

/**
 * 資訊提示吐司元件
 *
 * 當 visible 為 true 時，會從底部滑入並淡入顯示。
 * 經過 duration 時間後，會自動淡出並滑出，然後觸發 onHide。
 */
export function InfoToast({ visible, message, duration = 3000, onHide }: InfoToastProps) {
  // 淡入淡出動畫值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // 垂直位移動畫值
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      // 進場動畫：同時執行淡入和上移
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 設定計時器，duration 後執行退場動畫
      const timer = setTimeout(() => {
        // 退場動畫：同時執行淡出和下移
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // 動畫完成後觸發 onHide 回調
          onHide?.();
        });
      }, duration);

      // 清理計時器
      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, translateY, onHide]);

  // 不顯示時返回 null
  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.toast}>
        {/* 資訊圖示 */}
        <Ionicons name="information-circle" size={20} color={SemanticColors.warning.dark} style={styles.icon} />
        {/* 訊息文字 */}
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 容器：絕對定位於底部 */
  container: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: 'center',
    zIndex: 1000,
  },
  /** 吐司本體：橫向排列、警告色調 */
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.warning.light,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: MibuBrand.warning,
    ...Shadow.md,
  },
  /** 圖示右側間距 */
  icon: {
    marginRight: Spacing.sm + 2,
  },
  /** 訊息文字：深色、允許換行 */
  message: {
    flex: 1,
    fontSize: FontSize.md,
    color: SemanticColors.warning.dark,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default InfoToast;
