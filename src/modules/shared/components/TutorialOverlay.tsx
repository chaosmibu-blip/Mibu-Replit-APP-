/**
 * TutorialOverlay - 新手教學引導元件
 *
 * 用於首次使用者的功能介紹，支援多步驟教學流程。
 * 會自動記錄用戶是否已看過教學，避免重複顯示。
 *
 * 功能特點：
 * - 多步驟教學，支援上一步/下一步導航
 * - 自動儲存教學完成狀態到 AsyncStorage
 * - 支援中英文雙語
 * - 可跳過教學
 *
 * @example
 * <TutorialOverlay
 *   storageKey="gacha-tutorial"
 *   steps={GACHA_TUTORIAL_STEPS}
 *   language="zh-TW"
 *   onComplete={() => console.log('教學完成')}
 * />
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
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { useApp } from '../../../context/AppContext';
import { Language } from '../../../types';

// ============ 常數定義 ============

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ Props 介面定義 ============

/**
 * 教學步驟資料結構
 */
export interface TutorialStep {
  /** 步驟唯一識別碼 */
  id: string;
  /** 中文標題 */
  title: string;
  /** 英文標題 */
  titleEn: string;
  /** 中文說明 */
  description: string;
  /** 英文說明 */
  descriptionEn: string;
  /** Ionicons 圖示名稱 */
  icon: string;
  /** 圖示顏色（可選，預設使用 copper） */
  iconColor?: string;
}

/**
 * TutorialOverlay 元件的 Props 介面
 */
interface TutorialOverlayProps {
  /** AsyncStorage 儲存鍵值（用於記錄是否已看過） */
  storageKey: string;
  /** 教學步驟列表 */
  steps: TutorialStep[];
  /** 語言設定（預設從 AppContext 取得） */
  language?: Language;
  /** 教學完成時的回調函數 */
  onComplete?: () => void;
  /** 是否在元件掛載時自動顯示（預設 true） */
  showOnMount?: boolean;
}

// ============ 常數配置 ============

/** AsyncStorage 鍵值前綴 */
const STORAGE_PREFIX = '@mibu_tutorial_';

// ============ 主元件 ============

/**
 * 新手教學引導元件
 *
 * 顯示邏輯：
 * 1. 元件掛載時檢查 AsyncStorage 是否已看過教學
 * 2. 未看過則顯示教學 Modal
 * 3. 用戶完成或跳過後，記錄到 AsyncStorage
 */
export function TutorialOverlay({
  storageKey,
  steps,
  language: languageProp,
  onComplete,
  showOnMount = true,
}: TutorialOverlayProps) {
  const { state, t } = useApp();
  // 語言：優先使用 prop，否則從 context 取得
  const language = languageProp ?? state.language;
  // 是否顯示教學 Modal
  const [visible, setVisible] = useState(false);
  // 目前步驟索引（從 0 開始）
  const [currentStep, setCurrentStep] = useState(0);
  // 滑動動畫值（目前未使用，保留供未來擴充）
  const [slideAnim] = useState(new Animated.Value(0));
  // 取得步驟的本地化文字（zh-TW 用中文，其餘 fallback 到英文）
  const isZhLang = language === 'zh-TW';

  // 元件掛載時檢查是否需要顯示教學
  useEffect(() => {
    if (showOnMount) {
      checkIfShouldShow();
    }
  }, [showOnMount]);

  /**
   * 檢查是否應該顯示教學
   * 從 AsyncStorage 讀取完成記錄
   */
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

  /**
   * 標記教學為已完成
   * 儲存到 AsyncStorage
   */
  const markAsComplete = async () => {
    try {
      await AsyncStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, 'true');
    } catch {
      // 靜默處理錯誤
    }
  };

  /**
   * 處理「下一步」按鈕點擊
   * 如果是最後一步則完成教學
   */
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // 播放滑動動畫
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

  /**
   * 處理「上一步」按鈕點擊
   */
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

  /**
   * 處理「跳過」按鈕點擊
   */
  const handleSkip = () => {
    handleComplete();
  };

  /**
   * 完成教學流程
   * 儲存完成記錄並關閉 Modal
   */
  const handleComplete = async () => {
    await markAsComplete();
    setVisible(false);
    onComplete?.();
  };

  // 如果不顯示或沒有步驟，返回 null
  if (!visible || steps.length === 0) return null;

  // 取得目前步驟資料
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* 跳過按鈕（右上角） */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>
              {t.common_skip}
            </Text>
          </TouchableOpacity>

          {/* 步驟指示器（小圓點） */}
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

          {/* 圖示 */}
          <View style={[styles.iconContainer, { backgroundColor: (step.iconColor || MibuBrand.copper) + '20' }]}>
            <Ionicons
              name={step.icon as any}
              size={48}
              color={step.iconColor || MibuBrand.copper}
            />
          </View>

          {/* 標題與說明 */}
          <Text style={styles.title}>
            {isZhLang ? step.title : step.titleEn}
          </Text>
          <Text style={styles.description}>
            {isZhLang ? step.description : step.descriptionEn}
          </Text>

          {/* 導航按鈕 */}
          <View style={styles.buttonRow}>
            {/* 上一步按鈕（第一步時隱藏） */}
            {!isFirstStep && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="chevron-back" size={20} color={MibuBrand.brownLight} />
                <Text style={styles.backButtonText}>
                  {t.common_back}
                </Text>
              </TouchableOpacity>
            )}
            {/* 下一步/開始使用 按鈕 */}
            <TouchableOpacity
              style={[styles.nextButton, isFirstStep && styles.nextButtonFull]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? t.common_getStarted : t.common_next}
              </Text>
              {!isLastStep && (
                <Ionicons name="chevron-forward" size={20} color={UIColors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============ 預設教學步驟 ============

/**
 * 扭蛋功能教學步驟
 * 可直接使用或作為範本參考
 */
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
    iconColor: MibuBrand.brown,
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

// ============ 輔助函數 ============

/**
 * 清除特定教學的完成記錄
 * 主要用於測試或重置教學
 *
 * @param storageKey - 教學的儲存鍵值
 */
export const resetTutorial = async (storageKey: string) => {
  try {
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}${storageKey}`);
  } catch {
    // 靜默處理
  }
};

/**
 * useTutorial - 教學狀態管理 Hook
 *
 * 用於手動控制教學顯示邏輯
 *
 * @param storageKey - 教學的儲存鍵值
 * @returns shouldShow - 是否應該顯示教學
 * @returns reset - 重置教學狀態的函數
 * @returns checkStatus - 重新檢查狀態的函數
 */
export function useTutorial(storageKey: string) {
  const [shouldShow, setShouldShow] = useState(false);

  /**
   * 檢查教學完成狀態
   */
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

  /**
   * 重置教學狀態（清除完成記錄）
   */
  const reset = async () => {
    await resetTutorial(storageKey);
    setShouldShow(true);
  };

  return { shouldShow, reset, checkStatus };
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 背景遮罩：半透明黑色 */
  overlay: {
    flex: 1,
    backgroundColor: UIColors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  /** 教學卡片：白色背景、大圓角 */
  card: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 24,
    padding: 32,
    width: Math.min(SCREEN_WIDTH - 40, 360),
    alignItems: 'center',
  },
  /** 跳過按鈕：右上角定位 */
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  /** 跳過按鈕文字 */
  skipText: {
    fontSize: 14,
    color: MibuBrand.brownLight,
  },
  /** 步驟指示器容器 */
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  /** 步驟指示點（未選中） */
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MibuBrand.tanLight,
  },
  /** 步驟指示點（選中）：加寬 */
  dotActive: {
    backgroundColor: MibuBrand.copper,
    width: 24,
  },
  /** 圖示容器：圓形背景 */
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  /** 標題文字 */
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: MibuBrand.dark,
    textAlign: 'center',
    marginBottom: 12,
  },
  /** 說明文字 */
  description: {
    fontSize: 15,
    color: MibuBrand.brownLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  /** 按鈕列容器 */
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  /** 上一步按鈕 */
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
  /** 上一步按鈕文字 */
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownLight,
  },
  /** 下一步按鈕 */
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
  /** 下一步按鈕（滿版模式，當沒有上一步時） */
  nextButtonFull: {
    flex: 1,
  },
  /** 下一步按鈕文字 */
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: UIColors.white,
  },
});
