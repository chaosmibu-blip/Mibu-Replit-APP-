import { io, Socket } from 'socket.io-client';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../constants/translations';

let socket: Socket | null = null;
let locationSubscription: Location.LocationSubscription | null = null;

interface TravelerLocation {
  travelerId: string;
  serviceId: number;
  lat: number;
  lng: number;
  timestamp: number;
}

interface LocationUpdatePayload {
  lat: number;
  lng: number;
  timestamp: number;
}

export function initSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  stopLocationTracking();
}

export function getSocket(): Socket | null {
  return socket;
}

export async function startLocationTracking(
  onAck?: (data: { lat: number; lng: number; timestamp: number }) => void
): Promise<void> {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.error('Location permission denied');
    return;
  }

  if (onAck) {
    socket.on('location_ack', onAck);
  }

  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (location) => {
      const payload: LocationUpdatePayload = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        timestamp: Date.now(),
      };
      socket?.emit('location_update', payload);
    }
  );
}

export function stopLocationTracking(): void {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
}

export function subscribeToTravelerLocations(
  onLocation: (data: TravelerLocation) => void
): void {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  socket.emit('specialist_subscribe', {});
  socket.on('traveler_location', onLocation);
}

export function unsubscribeFromTravelerLocations(): void {
  socket?.off('traveler_location');
}
