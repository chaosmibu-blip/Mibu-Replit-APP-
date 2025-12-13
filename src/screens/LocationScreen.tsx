import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  Dimensions,
  ScrollView,
  Linking,
} from 'react-native';
let MapView: any = null;
let Marker: any = null;
let PROVIDER_DEFAULT: any = null;
type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
}
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface NearbyPlace {
  id: string;
  name: string;
  nameEn: string;
  nameJa: string;
  nameKo: string;
  category: string;
  latitude: number;
  longitude: number;
  distance: number;
  address: string;
}

const samplePlaces: NearbyPlace[] = [
  { id: '1', name: '台北101', nameEn: 'Taipei 101', nameJa: '台北101', nameKo: '타이베이 101', category: 'landmark', latitude: 25.0339, longitude: 121.5645, distance: 0, address: '台北市信義區信義路五段7號' },
  { id: '2', name: '象山步道', nameEn: 'Elephant Mountain', nameJa: '象山', nameKo: '샹산', category: 'nature', latitude: 25.0273, longitude: 121.5736, distance: 0, address: '台北市信義區信義路五段150巷' },
  { id: '3', name: '饒河夜市', nameEn: 'Raohe Night Market', nameJa: '饒河夜市', nameKo: '라오허 야시장', category: 'food', latitude: 25.0502, longitude: 121.5772, distance: 0, address: '台北市松山區饒河街' },
  { id: '4', name: '中正紀念堂', nameEn: 'CKS Memorial Hall', nameJa: '中正紀念堂', nameKo: '중정기념당', category: 'landmark', latitude: 25.0345, longitude: 121.5198, distance: 0, address: '台北市中正區中山南路21號' },
  { id: '5', name: '西門町', nameEn: 'Ximending', nameJa: '西門町', nameKo: '시먼딩', category: 'shopping', latitude: 25.0422, longitude: 121.5081, distance: 0, address: '台北市萬華區峨眉街' },
  { id: '6', name: '陽明山國家公園', nameEn: 'Yangmingshan National Park', nameJa: '陽明山国立公園', nameKo: '양명산 국립공원', category: 'nature', latitude: 25.1935, longitude: 121.5601, distance: 0, address: '台北市北投區陽明山' },
  { id: '7', name: '故宮博物院', nameEn: 'National Palace Museum', nameJa: '故宮博物院', nameKo: '고궁박물관', category: 'landmark', latitude: 25.1024, longitude: 121.5485, distance: 0, address: '台北市士林區至善路二段221號' },
  { id: '8', name: '士林夜市', nameEn: 'Shilin Night Market', nameJa: '士林夜市', nameKo: '스린 야시장', category: 'food', latitude: 25.0883, longitude: 121.5241, distance: 0, address: '台北市士林區基河路101號' },
];

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  switch (category) {
    case 'landmark': return 'business';
    case 'nature': return 'leaf';
    case 'food': return 'restaurant';
    case 'shopping': return 'bag';
    default: return 'location';
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'landmark': return '#6366f1';
    case 'nature': return '#22c55e';
    case 'food': return '#f97316';
    case 'shopping': return '#ec4899';
    default: return '#64748b';
  }
};

const translations = {
  'zh-TW': {
    title: '定位',
    loading: '正在取得您的位置...',
    permissionDenied: '需要位置權限才能使用此功能',
    retry: '重新取得位置',
    nearbyTitle: '附近景點',
    km: '公里',
    m: '公尺',
    openMap: '在地圖中開啟',
    yourLocation: '您的位置',
    allCategories: '全部',
    noPlaces: '沒有找到符合的景點',
    landmark: '地標',
    nature: '自然',
    food: '美食',
    shopping: '購物',
    listView: '列表',
    mapView: '地圖',
  },
  'en': {
    title: 'Location',
    loading: 'Getting your location...',
    permissionDenied: 'Location permission is required',
    retry: 'Retry',
    nearbyTitle: 'Nearby Places',
    km: 'km',
    m: 'm',
    openMap: 'Open in Maps',
    yourLocation: 'Your Location',
    allCategories: 'All',
    noPlaces: 'No places found',
    landmark: 'Landmark',
    nature: 'Nature',
    food: 'Food',
    shopping: 'Shopping',
    listView: 'List',
    mapView: 'Map',
  },
  'ja': {
    title: '位置情報',
    loading: '位置情報を取得中...',
    permissionDenied: '位置情報の許可が必要です',
    retry: '再試行',
    nearbyTitle: '近くのスポット',
    km: 'km',
    m: 'm',
    openMap: 'マップで開く',
    yourLocation: '現在地',
    allCategories: 'すべて',
    noPlaces: 'スポットが見つかりません',
    landmark: 'ランドマーク',
    nature: '自然',
    food: 'グルメ',
    shopping: 'ショッピング',
    listView: 'リスト',
    mapView: 'マップ',
  },
  'ko': {
    title: '위치',
    loading: '위치를 가져오는 중...',
    permissionDenied: '위치 권한이 필요합니다',
    retry: '다시 시도',
    nearbyTitle: '주변 명소',
    km: 'km',
    m: 'm',
    openMap: '지도에서 열기',
    yourLocation: '내 위치',
    allCategories: '전체',
    noPlaces: '장소를 찾을 수 없습니다',
    landmark: '랜드마크',
    nature: '자연',
    food: '음식',
    shopping: '쇼핑',
    listView: '목록',
    mapView: '지도',
  },
};

export function LocationScreen() {
  const { state } = useApp();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [region, setRegion] = useState<Region>({
    latitude: 25.0330,
    longitude: 121.5654,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  });

  const texts = translations[state.language] || translations['zh-TW'];

  const getPlaceName = (place: NearbyPlace): string => {
    switch (state.language) {
      case 'en': return place.nameEn;
      case 'ja': return place.nameJa;
      case 'ko': return place.nameKo;
      default: return place.name;
    }
  };

  const getCategoryName = (category: string): string => {
    return texts[category as keyof typeof texts] || category;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)} ${texts.m}`;
    }
    return `${km.toFixed(1)} ${texts.km}`;
  };

  const getLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg(texts.permissionDenied);
        const defaultPlaces = samplePlaces.map((place, idx) => ({
          ...place,
          distance: idx * 0.5 + 0.3,
        }));
        setNearbyPlaces(defaultPlaces);
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(currentLocation);

      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);

      const placesWithDistance = samplePlaces.map(place => ({
        ...place,
        distance: calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          place.latitude,
          place.longitude
        ),
      })).sort((a, b) => a.distance - b.distance);

      setNearbyPlaces(placesWithDistance);
    } catch (error) {
      console.error('Location error:', error);
      const defaultPlaces = samplePlaces.map((place, idx) => ({
        ...place,
        distance: idx * 0.5 + 0.3,
      }));
      setNearbyPlaces(defaultPlaces);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const openInMaps = (place: NearbyPlace) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${place.latitude},${place.longitude}`,
      android: `google.navigation:q=${place.latitude},${place.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
    });
    Linking.openURL(url);
  };

  const centerOnLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  };

  const focusOnPlace = (place: NearbyPlace) => {
    setSelectedPlace(place);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const categories = ['landmark', 'nature', 'food', 'shopping'];

  const filteredPlaces = selectedCategory 
    ? nearbyPlaces.filter(p => p.category === selectedCategory)
    : nearbyPlaces;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>{texts.loading}</Text>
      </View>
    );
  }

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{texts.title}</Text>
        {!isWeb && (
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
              onPress={() => setViewMode('map')}
            >
              <Ionicons name="map" size={18} color={viewMode === 'map' ? '#ffffff' : '#64748b'} />
              <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
                {texts.mapView}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={18} color={viewMode === 'list' ? '#ffffff' : '#64748b'} />
              <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
                {texts.listView}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
              {texts.allCategories}
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip, 
                selectedCategory === cat && styles.categoryChipActive,
                selectedCategory === cat && { backgroundColor: getCategoryColor(cat) }
              ]}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              <Ionicons 
                name={getCategoryIcon(cat)} 
                size={16} 
                color={selectedCategory === cat ? '#ffffff' : getCategoryColor(cat)} 
              />
              <Text style={[
                styles.categoryChipText, 
                selectedCategory === cat && styles.categoryChipTextActive,
                selectedCategory !== cat && { color: getCategoryColor(cat) }
              ]}>
                {getCategoryName(cat)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {errorMsg && (
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={20} color="#f59e0b" />
          <Text style={styles.warningText}>{errorMsg}</Text>
        </View>
      )}

      {!isWeb && viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {filteredPlaces.map(place => (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                title={getPlaceName(place)}
                pinColor={getCategoryColor(place.category)}
                onPress={() => setSelectedPlace(place)}
              />
            ))}
          </MapView>

          <TouchableOpacity style={styles.myLocationButton} onPress={centerOnLocation}>
            <Ionicons name="locate" size={24} color="#22c55e" />
          </TouchableOpacity>

          {selectedPlace && (
            <View style={styles.selectedPlaceCard}>
              <View style={[styles.selectedPlaceIcon, { backgroundColor: getCategoryColor(selectedPlace.category) + '20' }]}>
                <Ionicons 
                  name={getCategoryIcon(selectedPlace.category)} 
                  size={24} 
                  color={getCategoryColor(selectedPlace.category)} 
                />
              </View>
              <View style={styles.selectedPlaceInfo}>
                <Text style={styles.selectedPlaceName}>{getPlaceName(selectedPlace)}</Text>
                <Text style={styles.selectedPlaceDistance}>{formatDistance(selectedPlace.distance)}</Text>
              </View>
              <TouchableOpacity style={styles.navigateButton} onPress={() => openInMaps(selectedPlace)}>
                <Ionicons name="navigate" size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPlace(null)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {location && (
            <View style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Ionicons name="navigate" size={24} color="#22c55e" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>{texts.yourLocation}</Text>
                <Text style={styles.locationCoords}>
                  {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                </Text>
              </View>
              <TouchableOpacity style={styles.refreshButton} onPress={getLocation}>
                <Ionicons name="refresh" size={20} color="#22c55e" />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>{texts.nearbyTitle}</Text>

          {filteredPlaces.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{texts.noPlaces}</Text>
            </View>
          ) : (
            filteredPlaces.map(place => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeCard}
                onPress={() => openInMaps(place)}
              >
                <View style={[styles.placeIcon, { backgroundColor: getCategoryColor(place.category) + '20' }]}>
                  <Ionicons 
                    name={getCategoryIcon(place.category)} 
                    size={24} 
                    color={getCategoryColor(place.category)} 
                  />
                </View>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{getPlaceName(place)}</Text>
                  <Text style={styles.placeAddress} numberOfLines={1}>{place.address}</Text>
                  <View style={styles.placeDistanceRow}>
                    <Ionicons name="navigate-circle" size={14} color="#22c55e" />
                    <Text style={styles.placeDistanceText}>{formatDistance(place.distance)}</Text>
                  </View>
                </View>
                <View style={styles.placeAction}>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#22c55e',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  categoryFilter: {
    backgroundColor: '#ffffff',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefce8',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  myLocationButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedPlaceCard: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 12,
  },
  selectedPlaceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPlaceInfo: {
    flex: 1,
  },
  selectedPlaceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  selectedPlaceDistance: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  navigateButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#dcfce7',
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  placeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  placeDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  placeDistanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22c55e',
  },
  placeAction: {
    padding: 4,
  },
});
