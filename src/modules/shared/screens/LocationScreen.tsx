import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Text,
  Switch,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../constants/translations';
import { useApp } from '../../../context/AppContext';

const THROTTLE_INTERVAL = 10000;
const MIN_DISTANCE_METERS = 10;

interface PlannerLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

function getDistanceFromLatLonInMeters(
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function LocationScreen() {
  const { t } = useApp();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSharingEnabled, setIsSharingEnabled] = useState(false);
  const [plannerLocations, setPlannerLocations] = useState<PlannerLocation[]>([]);
  
  const mapRef = useRef<MapView | null>(null);
  const lastReportedLocation = useRef<{ latitude: number; longitude: number } | null>(null);
  const lastReportTime = useRef<number>(0);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const updateUserLocation = useCallback(async (latitude: number, longitude: number, sharing: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/location/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat: latitude, lng: longitude }),
      });
      
      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 0) {
          const data = await response.json();
          if (data.plannerLocations && Array.isArray(data.plannerLocations)) {
            setPlannerLocations(data.plannerLocations);
          }
        }
      }
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }, []);

  const shouldReportLocation = useCallback((latitude: number, longitude: number): boolean => {
    const now = Date.now();
    const timeSinceLastReport = now - lastReportTime.current;
    
    if (timeSinceLastReport >= THROTTLE_INTERVAL) {
      return true;
    }
    
    if (lastReportedLocation.current) {
      const distance = getDistanceFromLatLonInMeters(
        lastReportedLocation.current.latitude,
        lastReportedLocation.current.longitude,
        latitude,
        longitude
      );
      
      if (distance >= MIN_DISTANCE_METERS) {
        return true;
      }
    }
    
    return false;
  }, []);

  const handleLocationUpdate = useCallback((newLocation: Location.LocationObject) => {
    setLocation(newLocation);
    
    const { latitude, longitude } = newLocation.coords;
    
    if (shouldReportLocation(latitude, longitude)) {
      updateUserLocation(latitude, longitude, isSharingEnabled);
      lastReportedLocation.current = { latitude, longitude };
      lastReportTime.current = Date.now();
    }
  }, [shouldReportLocation, updateUserLocation, isSharingEnabled]);

  const startLocationTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg(t.locationPermissionRequired);
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      handleLocationUpdate(currentLocation);
      setLoading(false);

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        handleLocationUpdate
      );
    } catch (error) {
      console.error('Location error:', error);
      setErrorMsg(t.unableToGetLocation);
      setLoading(false);
    }
  }, [handleLocationUpdate, t]);

  useEffect(() => {
    startLocationTracking();
    
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [startLocationTracking]);

  const centerOnUser = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  }, [location]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>{t.gettingLocation}</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="location-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={startLocationTracking}>
          <Text style={styles.retryButtonText}>{t.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initialRegion = {
    latitude: location?.coords.latitude || 25.0330,
    longitude: location?.coords.longitude || 121.5654,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <View style={styles.sharingToggle}>
        <View style={styles.sharingInfo}>
          <Ionicons name="people" size={20} color="#64748b" />
          <Text style={styles.sharingText}>{t.shareLocationToPlanner}</Text>
        </View>
        <Switch
          value={isSharingEnabled}
          onValueChange={setIsSharingEnabled}
          trackColor={{ false: '#d1d5db', true: '#86efac' }}
          thumbColor={isSharingEnabled ? '#22c55e' : '#f4f4f5'}
        />
      </View>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        rotateEnabled={true}
        pitchEnabled={true}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={t.yourLocation}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}
        
        {plannerLocations.map((planner) => (
          <Marker
            key={planner.id}
            coordinate={{
              latitude: planner.latitude,
              longitude: planner.longitude,
            }}
            title={planner.name}
            description={t.planner}
          >
            <View style={styles.plannerMarker}>
              <Ionicons name="person" size={16} color="#ffffff" />
            </View>
          </Marker>
        ))}
      </MapView>
      
      <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
        <Ionicons name="locate" size={24} color="#22c55e" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sharingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sharingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sharingText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  userMarker: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    backgroundColor: '#22c55e',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  plannerMarker: {
    width: 32,
    height: 32,
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
