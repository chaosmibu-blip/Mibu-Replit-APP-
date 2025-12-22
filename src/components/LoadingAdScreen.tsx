import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AD_WIDTH = 300;
const AD_HEIGHT = 250;

interface LoadingAdScreenProps {
  visible: boolean;
  onComplete: () => void;
  isApiComplete: boolean;
  translations: {
    generatingItinerary: string;
    sponsorAd: string;
    pleaseWait: string;
    almostReady: string;
  };
}

const FORCED_WAIT_SECONDS = 5;

export function LoadingAdScreen({ visible, onComplete, isApiComplete, translations }: LoadingAdScreenProps) {
  const [countdown, setCountdown] = useState(FORCED_WAIT_SECONDS);
  const [isTimerComplete, setIsTimerComplete] = useState(false);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (visible) {
      setCountdown(FORCED_WAIT_SECONDS);
      setIsTimerComplete(false);

      rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );

      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.6, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      rotation.value = 0;
      scale.value = 1;
      pulseOpacity.value = 0.6;
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
    if (isTimerComplete && isApiComplete) {
      onComplete();
    }
  }, [isTimerComplete, isApiComplete, onComplete]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: pulseOpacity.value,
  }));

  const statusText = isApiComplete ? translations.almostReady : translations.pleaseWait;

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: MibuBrand.dark,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ position: 'relative', width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 4,
                  borderColor: MibuBrand.copper,
                  borderTopColor: 'transparent',
                },
                spinStyle,
              ]}
            />
            <Animated.View
              style={[
                {
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: MibuBrand.brown,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                pulseStyle,
              ]}
            >
              <Image
                source={require('../../assets/images/icon.png')}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: MibuBrand.cream,
              marginTop: 32,
              textAlign: 'center',
            }}
          >
            {translations.generatingItinerary}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: MibuBrand.tan,
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            {statusText}
          </Text>

          {countdown > 0 && (
            <View
              style={{
                marginTop: 16,
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: MibuBrand.brownDark,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: '900', color: MibuBrand.copper }}>
                {countdown}
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            width: AD_WIDTH,
            height: AD_HEIGHT,
            backgroundColor: MibuBrand.brownDark,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: MibuBrand.brown,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
          }}
        >
          <Ionicons name="megaphone-outline" size={48} color={MibuBrand.tan} />
          <Text
            style={{
              fontSize: 14,
              color: MibuBrand.tan,
              marginTop: 12,
              textAlign: 'center',
            }}
          >
            {translations.sponsorAd}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: MibuBrand.copper,
              marginTop: 4,
            }}
          >
            {AD_WIDTH} x {AD_HEIGHT}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
