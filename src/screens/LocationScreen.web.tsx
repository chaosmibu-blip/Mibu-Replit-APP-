import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Switch,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../constants/translations';
import { useApp } from '../context/AppContext';

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
  
  const lastReportedLocation = useRef<{ latitude: number; longitude: number } | null>(null);
  const lastReportTime = useRef<number>(0);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const updateUserLocation = useCallback(async (latitude: number, longitude: number, sharing: boolean) => {
    try {
      console.log('🔗 Debug URL:', API_BASE_URL + '/api/location/update');
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
      
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        <View style={styles.locationCard}>
          <View style={styles.locationIcon}>
            <Ionicons name="navigate" size={24} color="#22c55e" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>{t.yourLocation}</Text>
            <Text style={styles.locationCoords}>
              {location?.coords.latitude.toFixed(6)}, {location?.coords.longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        {plannerLocations.length > 0 && (
          <View style={styles.plannerSection}>
            <Text style={styles.sectionTitle}>{t.planner}</Text>
            {plannerLocations.map((planner) => (
              <View key={planner.id} style={styles.plannerCard}>
                <View style={styles.plannerIcon}>
                  <Ionicons name="person" size={20} color="#8b5cf6" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationTitle}>{planner.name}</Text>
                  <Text style={styles.locationCoords}>
                    {planner.latitude.toFixed(6)}, {planner.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.webNotice}>
          <Ionicons name="information-circle-outline" size={20} color="#64748b" />
          <Text style={styles.webNoticeText}>
            Map view is only available on mobile devices
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
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
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  locationIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#dcfce7',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  plannerSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  plannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  plannerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f3e8ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  webNoticeText: {
    fontSize: 14,
    color: '#64748b',
  },
});
