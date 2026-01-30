/**
 * CouponWinAnimation - 中獎動畫元件
 *
 * 功能：
 * - 以全屏 Modal 顯示扭蛋中獎結果
 * - 根據稀有度顯示不同特效動畫：
 *   - SP: 全屏金色閃光 + 旋轉 + 粒子特效
 *   - SSR: 紫色粒子特效 + 光暈
 *   - SR: 藍色光暈
 *   - S/R: 簡單彈出動畫
 * - SSR+ 等級支援分享功能
 *
 * 動畫效果：
 * - scaleAnim: 卡片彈出縮放
 * - rotateAnim: SP 等級旋轉
 * - opacityAnim: 淡入效果
 * - glowAnim: 光暈脈動
 * - particleAnims: 粒子擴散（SP/SSR）
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  TouchableOpacity,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { CouponTier } from '../../../types';

// ============================================================
// 常數定義
// ============================================================

// 螢幕尺寸（用於粒子動畫計算）
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================
// Props 介面定義
// ============================================================

interface CouponWinAnimationProps {
  visible: boolean;          // 是否顯示
  tier: CouponTier;          // 稀有度等級
  couponName: string;        // 優惠券名稱
  placeName: string;         // 商家名稱
  onClose: () => void;       // 關閉回調
  language?: 'zh-TW' | 'en'; // 語言設定
}

/**
 * 稀有度視覺配置
 * - bgColor: 卡片背景色
 * - textColor: 文字色
 * - glowColor: 光暈色
 * - icon: 圖示名稱
 * - label/labelEn: 稀有度標籤（中/英）
 */
const TIER_CONFIG: Record<CouponTier, {
  bgColor: string;
  textColor: string;
  glowColor: string;
  icon: string;
  label: string;
  labelEn: string;
}> = {
  SP: {
    bgColor: '#fef3c7',
    textColor: '#b45309',
    glowColor: '#fbbf24',
    icon: 'star',
    label: '超稀有',
    labelEn: 'SUPER RARE',
  },
  SSR: {
    bgColor: '#fce7f3',
    textColor: '#be185d',
    glowColor: '#f472b6',
    icon: 'diamond',
    label: '極稀有',
    labelEn: 'ULTRA RARE',
  },
  SR: {
    bgColor: '#dbeafe',
    textColor: '#1d4ed8',
    glowColor: '#60a5fa',
    icon: 'ribbon',
    label: '稀有',
    labelEn: 'RARE',
  },
  S: {
    bgColor: '#dcfce7',
    textColor: '#16a34a',
    glowColor: '#4ade80',
    icon: 'trophy',
    label: '優質',
    labelEn: 'SPECIAL',
  },
  R: {
    bgColor: '#f1f5f9',
    textColor: '#475569',
    glowColor: '#94a3b8',
    icon: 'ticket',
    label: '一般',
    labelEn: 'REGULAR',
  },
};

// ============================================================
// 主元件
// ============================================================

export default function CouponWinAnimation({
  visible,
  tier,
  couponName,
  placeName,
  onClose,
  language = 'zh-TW',
}: CouponWinAnimationProps) {

  // ============================================================
  // 動畫值初始化
  // ============================================================

  // 卡片縮放動畫
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // 旋轉動畫（SP 專用）
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // 淡入動畫
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // 光暈脈動動畫
  const glowAnim = useRef(new Animated.Value(0)).current;

  // 粒子動畫陣列（12 個粒子）
  const particleAnims = useRef(
    Array.from({ length: 12 }, () => ({
      x: new Animated.Value(0),        // X 軸位移
      y: new Animated.Value(0),        // Y 軸位移
      opacity: new Animated.Value(1),  // 透明度
      scale: new Animated.Value(1),    // 縮放
    }))
  ).current;

  // ============================================================
  // 衍生變數
  // ============================================================

  // 當前稀有度配置
  const config = TIER_CONFIG[tier];

  // 語言判斷
  const isZh = language === 'zh-TW';

  // 是否為高稀有度（有光暈效果）
  const isHighTier = tier === 'SP' || tier === 'SSR' || tier === 'SR';

  // 是否可分享（SSR 以上）
  const isShareableTier = tier === 'SP' || tier === 'SSR';

  // 分享狀態
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  // ============================================================
  // 事件處理
  // ============================================================

  /**
   * 分享中獎結果
   * - Web: 使用 Web Share API，失敗則複製到剪貼簿
   * - Native: 使用 React Native Share
   */
  const handleShare = async () => {
    const shareText = isZh
      ? `🎰 我在 Mibu 扭蛋抽到了【${tier}】優惠券！\n🎁 ${couponName}\n📍 ${placeName}\n\n快來一起玩 ➜ https://mibu.app`
      : `🎰 I got a【${tier}】coupon from Mibu Gacha!\n🎁 ${couponName}\n📍 ${placeName}\n\nCome play ➜ https://mibu.app`;

    try {
      if (Platform.OS === 'web') {
        // Web: Try Web Share API first, fallback to clipboard
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: isZh ? 'Mibu 扭蛋中獎！' : 'Mibu Gacha Win!',
            text: shareText,
          });
        } else {
          await Clipboard.setStringAsync(shareText);
          setShareStatus('copied');
          setTimeout(() => setShareStatus('idle'), 2000);
        }
      } else {
        // Native: Use React Native Share
        await Share.share({
          message: shareText,
          title: isZh ? 'Mibu 扭蛋中獎！' : 'Mibu Gacha Win!',
        });
      }
    } catch (error: unknown) {
      // User cancelled or share failed, fallback to clipboard
      if (error instanceof Error && error.name !== 'AbortError') {
        await Clipboard.setStringAsync(shareText);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    }
  };

  // ============================================================
  // 動畫效果
  // ============================================================

  /**
   * 當 Modal 顯示時啟動動畫
   */
  useEffect(() => {
    if (visible) {
      // 重置所有動畫值
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      opacityAnim.setValue(0);
      glowAnim.setValue(0);

      // ===== 主卡片動畫：淡入 + 彈跳 =====
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // ===== 高稀有度：光暈脈動動畫 =====
      if (isHighTier) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();

        // ===== SP/SSR：粒子擴散動畫 =====
        if (tier === 'SP' || tier === 'SSR') {
          particleAnims.forEach((particle, index) => {
            const angle = (index / 12) * Math.PI * 2;
            const distance = 150 + Math.random() * 100;

            Animated.parallel([
              Animated.timing(particle.x, {
                toValue: Math.cos(angle) * distance,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(particle.y, {
                toValue: Math.sin(angle) * distance,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.delay(500),
                Animated.timing(particle.opacity, {
                  toValue: 0,
                  duration: 1000,
                  useNativeDriver: true,
                }),
              ]),
            ]).start();
          });
        }
      }

      // ===== SP 專屬：卡片旋轉動畫 =====
      if (tier === 'SP') {
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ).start();
      }
    }
  }, [visible]);

  // ============================================================
  // 動畫插值
  // ============================================================

  // 旋轉角度插值（0-360 度）
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 光暈透明度插值（0.3-0.8）
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  // ============================================================
  // 渲染
  // ============================================================

  // 未顯示時不渲染
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        {/* ========== 背景光暈（高稀有度專用） ========== */}
        {isHighTier && (
          <Animated.View
            style={[
              styles.backgroundGlow,
              {
                backgroundColor: config.glowColor,
                opacity: glowOpacity,
              },
            ]}
          />
        )}

        {/* ========== 粒子特效（SP/SSR 專用） ========== */}
        {(tier === 'SP' || tier === 'SSR') &&
          particleAnims.map((particle, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  backgroundColor: config.glowColor,
                  opacity: particle.opacity,
                  transform: [
                    { translateX: particle.x },
                    { translateY: particle.y },
                    { scale: particle.scale },
                  ],
                },
              ]}
            />
          ))}

        {/* ========== 主卡片 ========== */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: config.bgColor,
              opacity: opacityAnim,
              transform: [
                { scale: scaleAnim },
                tier === 'SP' ? { rotate } : { rotate: '0deg' },
              ],
            },
          ]}
        >
          {/* 稀有度 badge */}
          <View style={[styles.tierBadge, { backgroundColor: config.glowColor }]}>
            <Text style={[styles.tierText, { color: '#ffffff' }]}>{tier}</Text>
          </View>

          {/* 稀有度圖示 */}
          <View style={[styles.iconContainer, { backgroundColor: `${config.glowColor}33` }]}>
            <Ionicons name={config.icon as any} size={48} color={config.textColor} />
          </View>

          {/* 稀有度標籤 */}
          <Text style={[styles.tierLabel, { color: config.textColor }]}>
            {isZh ? config.label : config.labelEn}
          </Text>

          {/* 優惠券資訊 */}
          <Text style={styles.couponName}>{couponName}</Text>
          <Text style={styles.placeName}>
            <Ionicons name="location" size={14} color="#64748b" /> {placeName}
          </Text>

          {/* 恭喜文字 */}
          <Text style={[styles.congratsText, { color: config.textColor }]}>
            {isZh ? '🎉 恭喜獲得優惠券！' : '🎉 Congratulations!'}
          </Text>

          {/* ========== 按鈕列 ========== */}
          <View style={styles.buttonRow}>
            {/* 分享按鈕（SSR 以上顯示） */}
            {isShareableTier && (
              <TouchableOpacity
                style={[styles.shareButton, { borderColor: config.glowColor }]}
                onPress={handleShare}
              >
                <Ionicons
                  name={shareStatus === 'copied' ? 'checkmark' : 'share-social'}
                  size={18}
                  color={config.textColor}
                />
                <Text style={[styles.shareButtonText, { color: config.textColor }]}>
                  {shareStatus === 'copied'
                    ? (isZh ? '已複製' : 'Copied')
                    : (isZh ? '分享' : 'Share')}
                </Text>
              </TouchableOpacity>
            )}

            {/* 領取按鈕 */}
            <TouchableOpacity
              style={[
                styles.closeButton,
                isShareableTier && styles.closeButtonNarrow,
              ]}
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, { color: config.textColor }]}>
                {isZh ? '領取' : 'Collect'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================================
// 樣式定義
// ============================================================

const styles = StyleSheet.create({
  // 遮罩層
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 2,
    borderRadius: SCREEN_WIDTH,
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  card: {
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 320,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tierBadge: {
    position: 'absolute',
    top: -16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tierText: {
    fontSize: 18,
    fontWeight: '900',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  couponName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  congratsText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 2,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonNarrow: {
    paddingHorizontal: 28,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
