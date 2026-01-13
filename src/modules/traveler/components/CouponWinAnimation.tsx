/**
 * CouponWinAnimation - 中獎動畫元件
 *
 * SP: 全屏金色閃光動畫
 * SSR: 紫色粒子特效
 * SR: 藍色光暈
 * S/R: 簡單彈出動畫
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CouponWinAnimationProps {
  visible: boolean;
  tier: CouponTier;
  couponName: string;
  placeName: string;
  onClose: () => void;
  language?: 'zh-TW' | 'en';
}

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

export default function CouponWinAnimation({
  visible,
  tier,
  couponName,
  placeName,
  onClose,
  language = 'zh-TW',
}: CouponWinAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 12 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
    }))
  ).current;

  const config = TIER_CONFIG[tier];
  const isZh = language === 'zh-TW';
  const isHighTier = tier === 'SP' || tier === 'SSR' || tier === 'SR';
  const isShareableTier = tier === 'SP' || tier === 'SSR';
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

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

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      opacityAnim.setValue(0);
      glowAnim.setValue(0);

      // Main card animation
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

      // Glow animation for high tiers
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

        // Particle animations for SP/SSR
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

      // Rotate animation for SP
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

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        {/* Background glow for high tiers */}
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

        {/* Particles for SP/SSR */}
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

        {/* Main card */}
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
          {/* Tier badge */}
          <View style={[styles.tierBadge, { backgroundColor: config.glowColor }]}>
            <Text style={[styles.tierText, { color: '#ffffff' }]}>{tier}</Text>
          </View>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${config.glowColor}33` }]}>
            <Ionicons name={config.icon as any} size={48} color={config.textColor} />
          </View>

          {/* Label */}
          <Text style={[styles.tierLabel, { color: config.textColor }]}>
            {isZh ? config.label : config.labelEn}
          </Text>

          {/* Coupon info */}
          <Text style={styles.couponName}>{couponName}</Text>
          <Text style={styles.placeName}>
            <Ionicons name="location" size={14} color="#64748b" /> {placeName}
          </Text>

          {/* Congratulations text */}
          <Text style={[styles.congratsText, { color: config.textColor }]}>
            {isZh ? '🎉 恭喜獲得優惠券！' : '🎉 Congratulations!'}
          </Text>

          {/* Button row */}
          <View style={styles.buttonRow}>
            {/* Share button for SSR+ */}
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

            {/* Close/Collect button */}
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

const styles = StyleSheet.create({
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
