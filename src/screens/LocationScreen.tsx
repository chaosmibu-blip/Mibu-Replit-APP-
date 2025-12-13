import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

export function LocationScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<any>(null);

  const getLocation = async () => {
    setLoading(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation({
          coords: {
            latitude: 25.0330,
            longitude: 121.5654,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(currentLocation);
    } catch (error) {
      console.error('Location error:', error);
      setLocation({
        coords: {
          latitude: 25.0330,
          longitude: 121.5654,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  const lat = location?.coords.latitude || 25.0330;
  const lng = location?.coords.longitude || 121.5654;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Map"
        />
        <TouchableOpacity style={styles.locateButton} onPress={getLocation}>
          <Ionicons name="navigate" size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {MapView && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
        >
          {Marker && location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="您的位置"
            />
          )}
        </MapView>
      )}
      <TouchableOpacity style={styles.locateButton} onPress={centerOnUser}>
        <Ionicons name="navigate" size={24} color="#22c55e" />
      </TouchableOpacity>
    </View>
  );
}

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
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  locateButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#dcfce7',
  },
});
