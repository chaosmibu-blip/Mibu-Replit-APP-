/**
 * TutorialOverlay - 新手教學引導元件
 *
 * 用於首次使用者的功能介紹
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MibuBrand } from '../../../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface TutorialStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  iconColor?: string;
}

interface TutorialOverlayProps {
  storageKey: string;
  steps: TutorialStep[];
  language?: 'zh-TW' | 'en';
  onComplete?: () => void;
  showOnMount?: boolean;
}

const STORAGE_PREFIX = '@mibu_tutorial_';

export function TutorialOverlay({
  storageKey,
  steps,
  language = 'zh-TW',
  onComplete,
  showOnMount = true,
}: TutorialOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));
  const isZh = language === 'zh-TW';

  useEffect(() => {
    if (showOnMount) {
      checkIfShouldShow();
    }
  }, [showOnMount]);

  const checkIfShouldShow = async () => {
    try {
      const hasSeenTutorial = await AsyncStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
      if (!hasSeenTutorial) {
        setVisible(true);
      }
    } catch {
      // 如果讀取失敗，不顯示教學
    }
  };

  const markAsComplete = async () => {
    try {
      await AsyncStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, 'true');
    } catch {
      // 靜默處理錯誤
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      Animated.timing(slideAnim, {
        toValue: currentStep + 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      Animated.timing(slideAnim, {
        toValue: currentStep - 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await markAsComplete();
    setVisible(false);
    onComplete?.();
  };

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Skip button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>
              {isZh ? '跳過' : 'Skip'}
            </Text>
          </TouchableOpacity>

          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: (step.iconColor || MibuBrand.copper) + '20' }]}>
            <Ionicons
              name={step.icon as any}
              size={48}
              color={step.iconColor || MibuBrand.copper}
            />
          </View>

          {/* Content */}
          <Text style={styles.title}>
            {isZh ? step.title : step.titleEn}
          </Text>
          <Text style={styles.description}>
            {isZh ? step.description : step.descriptionEn}
          </Text>

          {/* Navigation buttons */}
          <View style={styles.buttonRow}>
            {!isFirstStep && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="chevron-back" size={20} color={MibuBrand.brownLight} />
                <Text style={styles.backButtonText}>
                  {isZh ? '上一步' : 'Back'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextButton, isFirstStep && styles.nextButtonFull]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? (isZh ? '開始使用' : 'Get Started') : (isZh ? '下一步' : 'Next')}
              </Text>
              {!isLastStep && (
                <Ionicons name="chevron-forward" size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// 預設的扭蛋教學步驟
export const GACHA_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '歡迎來到 Mibu！',
    titleEn: 'Welcome to Mibu!',
    description: '探索旅遊新體驗，透過扭蛋發現在地景點和獨家優惠。',
    descriptionEn: 'Discover local spots and exclusive offers through our gacha system.',
    icon: 'gift',
    iconColor: MibuBrand.copper,
  },
  {
    id: 'select-region',
    title: '選擇目的地',
    titleEn: 'Choose Your Destination',
    description: '選擇你想探索的國家和地區，系統會為你推薦當地熱門景點。',
    descriptionEn: 'Select a country and region to explore local attractions.',
    icon: 'location',
    iconColor: '#6366f1',
  },
  {
    id: 'pull-gacha',
    title: '開始扭蛋',
    titleEn: 'Start Gacha',
    description: '點擊「扭蛋」按鈕開始！每次可獲得多個景點推薦，還有機會抽到優惠券。',
    descriptionEn: 'Tap the gacha button to get spot recommendations and win coupons!',
    icon: 'dice',
    iconColor: '#10b981',
  },
  {
    id: 'collect-coupons',
    title: '收集優惠券',
    titleEn: 'Collect Coupons',
    description: '稀有優惠券會直接存入道具箱，記得查看有效期限並前往商家使用！',
    descriptionEn: 'Rare coupons are saved to your item box. Check expiry dates and use them!',
    icon: 'ticket',
    iconColor: '#f59e0b',
  },
];

// 清除特定教學的完成記錄（用於測試）
export const resetTutorial = async (storageKey: string) => {
  try {
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}${storageKey}`);
  } catch {
    // 靜默處理
  }
};

// 手動顯示教學的 hook
export function useTutorial(storageKey: string) {
  const [shouldShow, setShouldShow] = useState(false);

  const checkStatus = async () => {
    try {
      const hasSeenTutorial = await AsyncStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
      setShouldShow(!hasSeenTutorial);
    } catch {
      setShouldShow(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [storageKey]);

  const reset = async () => {
    await resetTutorial(storageKey);
    setShouldShow(true);
  };

  return { shouldShow, reset, checkStatus };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 24,
    padding: 32,
    width: Math.min(SCREEN_WIDTH - 40, 360),
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    color: MibuBrand.brownLight,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MibuBrand.tanLight,
  },
  dotActive: {
    backgroundColor: MibuBrand.copper,
    width: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: MibuBrand.dark,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: MibuBrand.brownLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: MibuBrand.creamLight,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownLight,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: MibuBrand.brown,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
