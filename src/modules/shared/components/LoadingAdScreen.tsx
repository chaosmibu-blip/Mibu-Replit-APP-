/**
 * LoadingAdScreen - AI 行程生成等待畫面
 *
 * 當 AI 正在生成行程時顯示的全螢幕等待畫面。
 * 包含動態腳印動畫、多語系提示文字、計時器，以及預留的廣告版位。
 *
 * 設計理念：
 * - AI 行程生成約需 1-2 分鐘，這段等待時間需要良好的 UX
 * - 透過動態提示文字讓用戶知道系統正在處理
 * - 強制等待 5 秒確保用戶看到廣告（未來功能）
 * - 當 API 完成且計時器結束時自動關閉
 *
 * @example
 * <LoadingAdScreen
 *   visible={isGenerating}
 *   onComplete={handleComplete}
 *   onCancel={handleCancel}
 *   isApiComplete={apiDone}
 *   translations={loadingTexts}
 *   language="zh-TW"
 * />
 */
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import { MibuBrand } from '../../../../constants/Colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

// ============ 常數定義 ============

const { width: SCREEN_WIDTH } = Dimensions.get('window');
/** 廣告區塊寬度（螢幕寬 - 48px 邊距） */
const AD_WIDTH = SCREEN_WIDTH - 48;
/** 廣告區塊高度 */
const AD_HEIGHT = 120;

// ============ Props 介面定義 ============

/**
 * LoadingAdScreen 元件的 Props 介面
 */
interface LoadingAdScreenProps {
  /** 是否顯示等待畫面 */
  visible: boolean;
  /** 完成時的回調函數（計時器結束且 API 完成時觸發） */
  onComplete: () => void;
  /** 取消時的回調函數（可選） */
  onCancel?: () => void;
  /** API 是否已完成 */
  isApiComplete: boolean;
  /** 多語系文字翻譯 */
  translations: {
    /** 「正在生成行程」標題 */
    generatingItinerary: string;
    /** 「贊助商廣告」文字 */
    sponsorAd: string;
    /** 「請稍候」文字 */
    pleaseWait: string;
    /** 「即將完成」文字 */
    almostReady: string;
  };
  /** 語言代碼（預設 zh-TW） */
  language?: string;
}

// ============ 常數配置 ============

/** 強制等待秒數（確保用戶看到廣告） */
const FORCED_WAIT_SECONDS = 5;

/** 各語系的載入提示文字 */
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

/** 各語系的預估時間提示文字 */
const ESTIMATED_TIME_TEXT: Record<string, string> = {
  'zh-TW': '預計需要 1-2 分鐘，請耐心等候',
  'en': 'This may take 1-2 minutes, please wait',
  'ja': '約1〜2分かかります、お待ちください',
  'ko': '약 1-2분 소요됩니다, 잠시만 기다려주세요',
};

// ============ 子元件 ============

/**
 * PawPrint - 動態腳印元件
 *
 * 顯示一個會呼吸（縮放 + 透明度變化）的可愛腳印圖案。
 * 透過 delay 參數讓多個腳印形成波浪動畫效果。
 */
const PawPrint = ({ delay, x, y }: { delay: number; x: number; y: number }) => {
  // 透明度動畫值
  const opacity = useSharedValue(0.3);
  // 縮放動畫值
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // 透明度呼吸動畫：0.3 -> 1 -> 0.3 循環
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // -1 表示無限循環
        true
      )
    );
    // 縮放呼吸動畫：0.8 -> 1.1 -> 0.8 循環
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

  // 組合動畫樣式
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
      {/* 腳印圖案：上方兩個小圓 + 下方三個圓（中間大） */}
      <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 3, marginBottom: 2 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: MibuBrand.info }} />
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: MibuBrand.info }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: MibuBrand.info }} />
          <View style={{ width: 10, height: 12, borderRadius: 5, backgroundColor: MibuBrand.info }} />
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: MibuBrand.info }} />
        </View>
      </View>
    </Animated.View>
  );
};

// ============ 主元件 ============

/**
 * AI 行程生成等待畫面
 *
 * 顯示邏輯：
 * 1. visible 為 true 時顯示 Modal
 * 2. 同時啟動 5 秒倒數計時器
 * 3. 當計時器結束且 isApiComplete 為 true 時，觸發 onComplete
 */
export function LoadingAdScreen({ visible, onComplete, onCancel, isApiComplete, translations, language = 'zh-TW' }: LoadingAdScreenProps) {
  // 倒數計時器（從 5 開始）
  const [countdown, setCountdown] = useState(FORCED_WAIT_SECONDS);
  // 計時器是否已結束
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  // 目前顯示的提示文字索引
  const [tipIndex, setTipIndex] = useState(0);
  // 已經過的秒數
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 根據語言取得對應的提示文字
  const tips = LOADING_TIPS[language] || LOADING_TIPS['zh-TW'];
  const estimatedTimeText = ESTIMATED_TIME_TEXT[language] || ESTIMATED_TIME_TEXT['zh-TW'];

  // 當 visible 變化時重置所有狀態
  useEffect(() => {
    if (visible) {
      setCountdown(FORCED_WAIT_SECONDS);
      setIsTimerComplete(false);
      setTipIndex(0);
      setElapsedSeconds(0);
    }
  }, [visible]);

  // 倒數計時器邏輯
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

  // 提示文字輪播 + 經過時間計時
  useEffect(() => {
    if (!visible) return;

    // 每 3 秒切換一次提示文字
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);

    // 每秒更新經過時間
    const elapsedTimer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(tipTimer);
      clearInterval(elapsedTimer);
    };
  }, [visible, tips.length]);

  // 當計時器和 API 都完成時，觸發 onComplete
  useEffect(() => {
    if (isTimerComplete && isApiComplete) {
      onComplete();
    }
  }, [isTimerComplete, isApiComplete, onComplete]);

  // 根據 API 狀態決定顯示的文字
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
          {/* 腳印動畫區域 */}
          <View
            style={{
              width: 120,
              height: 80,
              position: 'relative',
              marginBottom: 40,
            }}
          >
            {/* 5 個腳印，透過不同 delay 形成波浪效果 */}
            <PawPrint delay={0} x={0} y={30} />
            <PawPrint delay={200} x={40} y={0} />
            <PawPrint delay={400} x={80} y={30} />
            <PawPrint delay={600} x={20} y={55} />
            <PawPrint delay={800} x={60} y={55} />
          </View>

          {/* 主標題 */}
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

          {/* 動態提示文字 */}
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

          {/* 預估時間提示 */}
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

          {/* 已經過時間顯示 */}
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

          {/* 取消按鈕（可選） */}
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
                {language === 'zh-TW' ? '取消' : language === 'ja' ? 'キャンセル' : language === 'ko' ? '취소' : 'Cancel'}
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
