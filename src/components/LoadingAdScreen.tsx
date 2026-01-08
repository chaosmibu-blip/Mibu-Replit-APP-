import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AD_WIDTH = SCREEN_WIDTH - 48;
const AD_HEIGHT = 120;

interface LoadingAdScreenProps {
  visible: boolean;
  onComplete: () => void;
  onTimeout?: () => void;
  onCancel?: () => void;
  isApiComplete: boolean;
  translations: {
    generatingItinerary: string;
    sponsorAd: string;
    pleaseWait: string;
    almostReady: string;
  };
  language?: string;
}

const FORCED_WAIT_SECONDS = 5;
const MAX_WAIT_SECONDS = 180;
const SHOW_CANCEL_AFTER_SECONDS = 15;

const PawPrint = ({ delay, x, y }: { delay: number; x: number; y: number }) => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
        },
        animatedStyle,
      ]}
    >
      <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 3, marginBottom: 2 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#6B8DD6' }} />
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#6B8DD6' }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#6B8DD6' }} />
          <View style={{ width: 10, height: 12, borderRadius: 5, backgroundColor: '#6B8DD6' }} />
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#6B8DD6' }} />
        </View>
      </View>
    </Animated.View>
  );
};

export function LoadingAdScreen({ visible, onComplete, onTimeout, onCancel, isApiComplete, translations, language = 'zh-TW' }: LoadingAdScreenProps) {
  const [countdown, setCountdown] = useState(FORCED_WAIT_SECONDS);
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const isZh = language === 'zh-TW';

  const getStageMessage = () => {
    if (isApiComplete) {
      return isZh ? '即將完成！' : 'Almost ready!';
    }
    if (totalElapsed < 15) {
      return isZh ? '正在準備您的請求...' : 'Preparing your request...';
    }
    if (totalElapsed < 60) {
      return isZh ? 'AI 正在驗證行程中...' : 'AI is validating itinerary...';
    }
    if (totalElapsed < 120) {
      return isZh ? '正在優化您的行程安排...' : 'Optimizing your itinerary...';
    }
    return isZh ? '最後確認中，請稍候...' : 'Final confirmation, please wait...';
  };

  const getExpectedTimeMessage = () => {
    if (isApiComplete) return '';
    return isZh 
      ? 'AI 驗證行程需時 1-3 分鐘，感謝您的耐心等待'
      : 'AI validation takes 1-3 minutes. Thank you for your patience.';
  };

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  useEffect(() => {
    if (visible) {
      setCountdown(FORCED_WAIT_SECONDS);
      setIsTimerComplete(false);
      setTotalElapsed(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsTimerComplete(true);
          return 0;
        }
        return prev - 1;
      });
      
      setTotalElapsed((prev) => {
        const newTotal = prev + 1;
        if (newTotal >= MAX_WAIT_SECONDS && !isApiComplete) {
          clearInterval(timer);
          onTimeout?.();
        }
        return newTotal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, isApiComplete, onTimeout]);

  useEffect(() => {
    if (isTimerComplete && isApiComplete) {
      onComplete();
    }
  }, [isTimerComplete, isApiComplete, onComplete]);

  const showCancelButton = totalElapsed >= SHOW_CANCEL_AFTER_SECONDS && !isApiComplete;

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: 120,
              height: 80,
              position: 'relative',
              marginBottom: 40,
            }}
          >
            <PawPrint delay={0} x={0} y={30} />
            <PawPrint delay={200} x={40} y={0} />
            <PawPrint delay={400} x={80} y={30} />
            <PawPrint delay={600} x={20} y={55} />
            <PawPrint delay={800} x={60} y={55} />
          </View>

          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: '#333333',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {translations.generatingItinerary}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: '#555555',
              textAlign: 'center',
              marginBottom: 8,
              fontWeight: '600',
            }}
          >
            {getStageMessage()}
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: '#999999',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {getExpectedTimeMessage()}
          </Text>

          {!isApiComplete && (
            <View
              style={{
                backgroundColor: '#E8E8E8',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#666666',
                  fontWeight: '500',
                }}
              >
                {isZh ? '已等待' : 'Elapsed'}: {formatElapsed(totalElapsed)}
              </Text>
            </View>
          )}

          {showCancelButton && (
            <TouchableOpacity
              onPress={onCancel}
              style={{
                marginTop: 10,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#CCCCCC',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#666666',
                }}
              >
                {isZh ? '取消' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* TODO: 廣告功能開放後恢復此區塊
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              width: '100%',
              height: AD_HEIGHT,
              backgroundColor: '#FAFAFA',
              borderRadius: 12,
              borderWidth: 2,
              borderColor: '#D0D0D0',
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#B0B0B0',
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              ADVERTISEMENT
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#C0C0C0',
              }}
            >
              Ad Space
            </Text>
          </View>
        </View>
        */}
      </SafeAreaView>
    </Modal>
  );
}
