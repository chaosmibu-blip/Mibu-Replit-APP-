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
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface NearbyPlace {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  latitude: number;
  longitude: number;
  distance: number;
}

const samplePlaces: NearbyPlace[] = [
  { id: '1', name: '台北101', nameEn: 'Taipei 101', category: 'landmark', latitude: 25.0339, longitude: 121.5645, distance: 0 },
  { id: '2', name: '象山步道', nameEn: 'Elephant Mountain', category: 'nature', latitude: 25.0273, longitude: 121.5736, distance: 0 },
  { id: '3', name: '饒河夜市', nameEn: 'Raohe Night Market', category: 'food', latitude: 25.0502, longitude: 121.5772, distance: 0 },
  { id: '4', name: '中正紀念堂', nameEn: 'CKS Memorial Hall', category: 'landmark', latitude: 25.0345, longitude: 121.5198, distance: 0 },
  { id: '5', name: '西門町', nameEn: 'Ximending', category: 'shopping', latitude: 25.0422, longitude: 121.5081, distance: 0 },
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

export function LocationScreen() {
  const { state } = useApp();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 25.0330,
    longitude: 121.5654,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const t = {
    'zh-TW': {
      title: '定位',
      loading: '正在取得您的位置...',
      permissionDenied: '需要位置權限才能使用此功能',
      retry: '重新取得位置',
      nearbyTitle: '附近景點',
      distance: '距離',
      km: '公里',
      m: '公尺',
      viewOnMap: '在地圖上查看',
      myLocation: '我的位置',
    },
    'en': {
      title: 'Location',
      loading: 'Getting your location...',
      permissionDenied: 'Location permission is required',
      retry: 'Retry',
      nearbyTitle: 'Nearby Places',
      distance: 'Distance',
      km: 'km',
      m: 'm',
      viewOnMap: 'View on Map',
      myLocation: 'My Location',
    },
    'ja': {
      title: '位置情報',
      loading: '位置情報を取得中...',
      permissionDenied: '位置情報の許可が必要です',
      retry: '再試行',
      nearbyTitle: '近くのスポット',
      distance: '距離',
      km: 'km',
      m: 'm',
      viewOnMap: '地図で見る',
      myLocation: '現在地',
    },
    'ko': {
      title: '위치',
      loading: '위치를 가져오는 중...',
      permissionDenied: '위치 권한이 필요합니다',
      retry: '다시 시도',
      nearbyTitle: '주변 명소',
      distance: '거리',
      km: 'km',
      m: 'm',
      viewOnMap: '지도에서 보기',
      myLocation: '내 위치',
    },
  };

  const texts = t[state.language] || t['zh-TW'];

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
      setErrorMsg('無法取得位置');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>{texts.loading}</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Ionicons name="location-outline" size={48} color="#ef4444" />
        </View>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={getLocation}>
          <Ionicons name="refresh" size={20} color="#ffffff" />
          <Text style={styles.retryButtonText}>{texts.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {nearbyPlaces.map(place => (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              title={state.language === 'zh-TW' ? place.name : place.nameEn}
              pinColor={getCategoryColor(place.category)}
              onPress={() => setSelectedPlace(place)}
            />
          ))}
        </MapView>

        <TouchableOpacity style={styles.myLocationButton} onPress={centerOnLocation}>
          <Ionicons name="locate" size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <Text style={styles.nearbyTitle}>{texts.nearbyTitle}</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.placesScroll}
        >
          {nearbyPlaces.map(place => (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.placeCard,
                selectedPlace?.id === place.id && styles.placeCardSelected
              ]}
              onPress={() => focusOnPlace(place)}
            >
              <View style={[styles.placeIcon, { backgroundColor: getCategoryColor(place.category) + '20' }]}>
                <Ionicons 
                  name={getCategoryIcon(place.category)} 
                  size={24} 
                  color={getCategoryColor(place.category)} 
                />
              </View>
              <Text style={styles.placeName} numberOfLines={1}>
                {state.language === 'zh-TW' ? place.name : place.nameEn}
              </Text>
              <Text style={styles.placeDistance}>
                {formatDistance(place.distance)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 32,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
    top: 60,
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
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  placesScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  placeCard: {
    width: 140,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  placeCardSelected: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  placeDistance: {
    fontSize: 12,
    color: '#64748b',
  },
});
