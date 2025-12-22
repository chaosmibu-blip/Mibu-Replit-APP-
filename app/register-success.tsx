import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { MibuBrand } from '../constants/Colors';

export default function RegisterSuccessScreen() {
  const router = useRouter();
  const { state } = useApp();
  const isZh = state.language === 'zh-TW';

  const texts = {
    title: isZh ? '申請已送出！' : 'Application Submitted!',
    message: isZh ? '已收到您的申請，立馬為您處理' : 'We have received your application and will process it shortly',
    note: isZh ? '審核通過後，您將收到通知，届時即可使用帳號登入' : 'Once approved, you will receive a notification and can log in with your account',
    backToLogin: isZh ? '返回登入頁面' : 'Back to Login',
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color={MibuBrand.success} />
        </View>

        <Image
          source={require('../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>{texts.title}</Text>
        <Text style={styles.message}>{texts.message}</Text>
        <Text style={styles.note}>{texts.note}</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>{texts.backToLogin}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 340,
  },
  iconContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: MibuBrand.brown,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
  note: {
    fontSize: 14,
    color: MibuBrand.copper,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
