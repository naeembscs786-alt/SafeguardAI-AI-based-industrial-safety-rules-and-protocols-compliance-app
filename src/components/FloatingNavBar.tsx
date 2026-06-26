import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface NavItemProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
}

const NAV_ITEMS: NavItemProps[] = [
  { name: 'Home', icon: 'home-outline', path: '/worker_dashboard' },
  { name: 'Assistant', icon: 'chatbubble-ellipses-outline', path: '/ai_assistant' },
  { name: 'Report', icon: 'alert-circle-outline', path: '/report_incident' },
  { name: 'SOS', icon: 'warning-outline', path: '/sos_alerts' },
  { name: 'Risk', icon: 'shield-checkmark-outline', path: '/risk_zone' }, 
];

export default function FloatingNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item) => {
          // Check if pathname ends with the item path to handle group segments
          const isActive = pathname.endsWith(item.path);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => router.push(item.path as any)}
              style={styles.navItem}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, isActive && styles.activeIconCircle]}>
                <Ionicons
                  name={isActive ? (item.icon.replace('-outline', '') as any) : item.icon}
                  size={24}
                  color={isActive ? '#FFFFFF' : '#666'}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 35 : 20,
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    width: width * 0.95,
    height: 70,
    borderRadius: 35,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeIconCircle: {
    backgroundColor: '#00A86B', // Theme Green
    shadowColor: '#00A86B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
