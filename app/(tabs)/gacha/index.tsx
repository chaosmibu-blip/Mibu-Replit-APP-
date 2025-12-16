import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../../src/context/AppContext';
import { apiService } from '../../../src/services/api';
import { GachaResult } from '../../../src/types';

export default function GachaScreen() {
  const { state } = useApp();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [drawCount, setDrawCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [gachaResults, setGachaResults] = useState<GachaResult[]>([]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  
  const countries = [{ id: 'tw', name: '台灣' }, { id: 'jp', name: '日本' }];
  const cities: Record<string, { id: string; name: string }[]> = {
    tw: [{ id: 'tpe', name: '台北' }, { id: 'khh', name: '高雄' }],
    jp: [{ id: 'tky', name: '東京' }, { id: 'osa', name: '大阪' }],
  };

  const handleSelectCountry = (countryId: string) => {
    setSelectedCountry(countryId);
    setSelectedCity(null);
    setCountryModalVisible(false);
  };

  const handleSelectCity = (cityId: string) => {
    setSelectedCity(cityId);
    setCityModalVisible(false);
  };

  const handleDrawGacha = async () => {
    if (!selectedCity) {
      Alert.alert('提醒', '請先選擇要探索的城市！');
      return;
    }
    
    setIsLoading(true);
    setGachaResults([]);

    try {
      const results = await apiService.drawGacha({
        cityId: selectedCity,
        count: drawCount,
      });
      
      setGachaResults(results);

      const drawnCoupons = results.filter(r => r.drawnCoupon).map(r => r.drawnCoupon!.title);
      if (drawnCoupons.length > 0) {
        Alert.alert('恭喜中獎！', `你獲得了：${drawnCoupons.join(', ')}`);
      }

    } catch (error) {
      console.error('Gacha draw failed:', error);
      Alert.alert('錯誤', '抽取失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedCountryName = () => {
    const country = countries.find(c => c.id === selectedCountry);
    return country?.name || '請選擇國家';
  };

  const getSelectedCityName = () => {
    if (!selectedCountry) return '請先選擇國家';
    const city = cities[selectedCountry]?.find(c => c.id === selectedCity);
    return city?.name || '請選擇城市';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>今天去哪玩？老天說了算</Text>
        
        <View style={styles.settingsBox}>
          <Text style={styles.label}>選擇探索國家</Text>
          <TouchableOpacity 
            style={styles.selectButton} 
            onPress={() => setCountryModalVisible(true)}
          >
            <Text style={[styles.selectButtonText, !selectedCountry && styles.placeholderText]}>
              {getSelectedCountryName()}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>選擇城市/地區</Text>
          <TouchableOpacity 
            style={[styles.selectButton, !selectedCountry && styles.selectButtonDisabled]} 
            onPress={() => selectedCountry && setCityModalVisible(true)}
            disabled={!selectedCountry}
          >
            <Text style={[styles.selectButtonText, !selectedCity && styles.placeholderText]}>
              {getSelectedCityName()}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          
          <View style={styles.drawCountContainer}>
            <Text style={styles.label}>行程數量</Text>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => setDrawCount(c => Math.max(1, c - 1))}>
                <Text style={styles.stepperButton}>-</Text>
              </TouchableOpacity>
              <Text style={styles.drawCountText}>{drawCount}</Text>
              <TouchableOpacity onPress={() => setDrawCount(c => Math.min(10, c + 1))}>
                <Text style={styles.stepperButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity style={styles.prizePoolButton}>
            <Text style={styles.prizePoolButtonText}>查看獎池</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.drawButton} onPress={handleDrawGacha} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.drawButtonText}>開始扭蛋</Text>
          )}
        </TouchableOpacity>
        
        {gachaResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>扭蛋結果</Text>
            {gachaResults.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <Text style={styles.placeName}>{result.place.name}</Text>
                {result.drawnCoupon && (
                  <Text style={styles.couponText}>🎉 獲得優惠券: {result.drawnCoupon.title}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={countryModalVisible}
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCountryModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>選擇國家</Text>
            <FlatList
              data={countries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, selectedCountry === item.id && styles.modalItemActive]}
                  onPress={() => handleSelectCountry(item.id)}
                >
                  <Text style={[styles.modalItemText, selectedCountry === item.id && styles.modalItemTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={cityModalVisible}
        onRequestClose={() => setCityModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCityModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>選擇城市</Text>
            <FlatList
              data={selectedCountry ? cities[selectedCountry] : []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, selectedCity === item.id && styles.modalItemActive]}
                  onPress={() => handleSelectCity(item.id)}
                >
                  <Text style={[styles.modalItemText, selectedCity === item.id && styles.modalItemTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  settingsBox: { backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 20 },
  label: { fontSize: 16, color: '#666', marginBottom: 8, marginTop: 12 },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectButtonDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  drawCountContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepperButton: { fontSize: 24, paddingHorizontal: 16, color: '#4A90E2', fontWeight: 'bold' },
  drawCountText: { fontSize: 18, fontWeight: '600', marginHorizontal: 10, minWidth: 30, textAlign: 'center' },
  prizePoolButton: { alignSelf: 'center', marginTop: 16 },
  prizePoolButtonText: { color: '#4A90E2', fontSize: 14, textDecorationLine: 'underline' },
  drawButton: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, alignItems: 'center' },
  drawButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  resultsContainer: { marginTop: 30 },
  resultsTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  resultCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  placeName: { fontSize: 16, fontWeight: '500', color: '#333' },
  couponText: { color: '#28a745', marginTop: 8, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemActive: {
    backgroundColor: '#EBF5FF',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalItemTextActive: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});
