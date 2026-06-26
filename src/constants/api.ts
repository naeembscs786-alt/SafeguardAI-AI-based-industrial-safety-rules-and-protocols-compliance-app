import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Dynamically determines the backend host.
 * - On Web: localhost
 * - On Android Emulator: 10.0.2.2
 * - On Mobile (Development): Automatically detects machine IP via Expo Constants
 * - Fallback: Hardcoded IP
 */

const getHost = () => {
  if (Platform.OS === 'web') return 'localhost';

  // 🔥 Handle Android Emulator
  if (Platform.OS === 'android' && !Device.isDevice) {
    return '10.0.2.2';
  }

  // Try to get IP from Expo's hostUri (e.g. "192.168.100.16:8081")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    // Simple check to ensure it's an IP and not "localhost"
    if (ip && ip !== 'localhost') return ip;
  }

  // Final fallback (matches your current network)
  return '10.186.183.45';
};

const HOST = getHost();

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? `http://${HOST}:8000`
).replace(/\/$/, '');

export const AI_CHAT_URL = (
  process.env.EXPO_PUBLIC_AI_CHAT_URL ??
  `http://${HOST}:8000/ask`
).replace(/\/$/, '');

console.log(`[API] Detected Host: ${HOST}`);
console.log(`[API] Base URL: ${API_BASE_URL}`);
