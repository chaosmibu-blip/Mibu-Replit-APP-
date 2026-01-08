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

const LOADING_TIPS: Record<string, string[]> = {
  'zh-TW': [
    'AI 正在為您規劃專屬行程...',
    '正在搜尋最佳景點組合...',
    '分析您的偏好中...',
    '尋找在地人推薦的秘境...',
    '即將為您呈現精彩行程！',
  ],
  'en': [
    'AI is planning your personalized trip...',
    'Searching for the best attractions...',
    'Analyzing your preferences...',
    'Finding hidden gems locals love...',
    'Your amazing itinerary is almost ready!',
  ],
  'ja': [
    'AIがあなた専用の旅程を計画中...',
    '最高のスポットを検索中...',
    'ご希望を分析中...',
    '地元おすすめの穴場を探索中...',
    '素敵な旅程がまもなく完成！',
  ],
  'ko': [
    'AI가 맞춤 여행을 계획 중...',
    '최고의 명소를 검색 중...',
    '선호도를 분석 중...',
    '현지인 추천 명소 탐색 중...',
    '멋진 일정이 곧 완성됩니다!',
  ],
};

const ESTIMATED_TIME_TEXT: Record<string, string> = {
  'zh-TW': '預計需要 1-2 分鐘，請耐心等候',
  'en': 'This may take 1-2 minutes, please wait',
  'ja': '約1〜2分かかります、お待ちください',
  'ko': '약 1-2분 소요됩니다, 잠시만 기다려주세요',
};

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

export function LoadingAdScreen({ visible, onComplete, onCancel, isApiComplete, translations, language = 'zh-TW' }: LoadingAdScreenProps) {
  const [countdown, setCountdown] = useState(FORCED_WAIT_SECONDS);
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const tips = LOADING_TIPS[language] || LOADING_TIPS['zh-TW'];
  const estimatedTimeText = ESTIMATED_TIME_TEXT[language] || ESTIMATED_TIME_TEXT['zh-TW'];

  useEffect(() => {
    if (visible) {
      setCountdown(FORCED_WAIT_SECONDS);
      setIsTimerComplete(false);
      setTipIndex(0);
      setElapsedSeconds(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);

    const elapsedTimer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(tipTimer);
      clearInterval(elapsedTimer);
    };
  }, [visible, tips.length]);

  useEffect(() => {
    if (isTimerComplete && isApiComplete) {
      onComplete();
    }
  }, [isTimerComplete, isApiComplete, onComplete]);

  const statusText = isApiComplete ? translations.almostReady : tips[tipIndex];

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
              fontSize: 15,
              color: '#888888',
              textAlign: 'center',
              marginBottom: 8,
              minHeight: 40,
            }}
          >
            {statusText}
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: '#aaaaaa',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            {estimatedTimeText}
          </Text>

          {elapsedSeconds > 0 && (
            <Text
              style={{
                fontSize: 12,
                color: '#bbbbbb',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              {elapsedSeconds} 秒
            </Text>
          )}

          {onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                backgroundColor: 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#999999',
                  textAlign: 'center',
                }}
              >
                取消
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
