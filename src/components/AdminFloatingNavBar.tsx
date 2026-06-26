import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');

interface NavItemProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
}

const NAV_ITEMS: NavItemProps[] = [
  { name: 'Home', icon: 'home-outline', path: '/admin_dashboard' },
  { name: 'Create', icon: 'add-circle-outline', path: '/create_module' },
  { name: 'PPE', icon: 'shield-outline', path: '/ppe_detection' },
  { name: 'Zones', icon: 'map-outline', path: '/manage_zones' },
  { name: 'Modules', icon: 'list-outline', path: '/module_list' },
];

export default function AdminFloatingNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.endsWith(item.path);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => router.push(`/(admin)${item.path}` as any)}
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
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconCircle: {
    backgroundColor: '#00A86B',
    shadowColor: '#00A86B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
