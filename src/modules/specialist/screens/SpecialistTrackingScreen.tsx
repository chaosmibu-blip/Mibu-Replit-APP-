import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../constants/translations';

interface TravelerLocation {
  travelerId: string;
  serviceId?: number;
  lat: number;
  lng: number;
  timestamp: string;
  travelerName?: string;
}

export function SpecialistTrackingScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams();
  const socketRef = useRef<Socket | null>(null);
  const [locations, setLocations] = useState<Map<string, TravelerLocation>>(new Map());
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '即時位置追蹤' : 'Live Location Tracking',
    connecting: isZh ? '連線中...' : 'Connecting...',
    connected: isZh ? '已連線' : 'Connected',
    disconnected: isZh ? '已斷線' : 'Disconnected',
    noLocations: isZh ? '尚無旅客位置資料' : 'No traveler locations yet',
    lastUpdate: isZh ? '最後更新' : 'Last update',
    travelers: isZh ? '旅客' : 'travelers',
  };

  useEffect(() => {
    initSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initSocket = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      socketRef.current = io(API_BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        setConnected(true);
        setLoading(false);
        socketRef.current?.emit('specialist_subscribe', {});
      });

      socketRef.current.on('disconnect', () => {
        setConnected(false);
      });

      socketRef.current.on('traveler_location', (data: TravelerLocation) => {
        setLocations(prev => {
          const updated = new Map(prev);
          updated.set(data.travelerId, data);
          return updated;
        });
      });

      socketRef.current.on('active_travelers', (data: { count: number; travelers: TravelerLocation[] }) => {
        const newLocations = new Map<string, TravelerLocation>();
        data.travelers.forEach(t => {
          newLocations.set(t.travelerId, t);
        });
        setLocations(newLocations);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setLoading(false);
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(isZh ? 'zh-TW' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const locationArray = Array.from(locations.values());

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>{translations.connecting}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
        <View style={[styles.connectionStatus, connected ? styles.statusConnected : styles.statusDisconnected]}>
          <View style={[styles.statusDot, connected ? styles.dotConnected : styles.dotDisconnected]} />
          <Text style={styles.statusText}>
            {connected ? translations.connected : translations.disconnected}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {Platform.OS === 'web' ? (
          <View style={styles.webMapPlaceholder}>
            <Ionicons name="map-outline" size={64} color="#94a3b8" />
            <Text style={styles.webMapText}>
              {isZh ? '地圖在網頁版不可用' : 'Map not available on web'}
            </Text>
            <Text style={styles.travelerCount}>
              {locationArray.length} {translations.travelers}
            </Text>
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <Text style={styles.mapPlaceholderText}>
              {isZh ? '地圖區域 - 需要 react-native-maps' : 'Map Area - requires react-native-maps'}
            </Text>
          </View>
        )}

        <View style={styles.travelerListCard}>
          <Text style={styles.listTitle}>
            {isZh ? '旅客位置' : 'Traveler Locations'} ({locationArray.length})
          </Text>
          {locationArray.length === 0 ? (
            <Text style={styles.noDataText}>{translations.noLocations}</Text>
          ) : (
            <View style={styles.travelerList}>
              {locationArray.map(loc => (
                <View key={loc.travelerId} style={styles.travelerItem}>
                  <View style={styles.travelerIcon}>
                    <Ionicons name="person-circle" size={36} color="#6366f1" />
                  </View>
                  <View style={styles.travelerDetails}>
                    <Text style={styles.travelerName}>
                      {loc.travelerName || `Traveler #${loc.travelerId.slice(-6)}`}
                    </Text>
                    <Text style={styles.travelerCoords}>
                      {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                    </Text>
                    <Text style={styles.travelerTime}>
                      {translations.lastUpdate}: {formatTime(loc.timestamp)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.focusButton}>
                    <Ionicons name="locate" size={20} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusConnected: {
    backgroundColor: '#dcfce7',
  },
  statusDisconnected: {
    backgroundColor: '#fef2f2',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotConnected: {
    backgroundColor: '#22c55e',
  },
  dotDisconnected: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  webMapPlaceholder: {
    height: 200,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webMapText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  travelerCount: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    color: '#64748b',
    fontSize: 14,
  },
  travelerListCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    marginTop: -20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 16,
    paddingVertical: 40,
  },
  travelerList: {
    gap: 12,
  },
  travelerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  travelerIcon: {
    marginRight: 12,
  },
  travelerDetails: {
    flex: 1,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  travelerCoords: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  travelerTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  focusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
