// zone_detection.tsx (IMPROVED FINAL VERSION)

import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Alert, SafeAreaView
} from "react-native";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import FloatingNavBar from '../../components/FloatingNavBar';

export default function RiskZoneScreen() {
  const [status, setStatus] = useState("Monitoring...");
  const [zone, setZone] = useState("");
  const [module, setModule] = useState("");
  const [isInside, setIsInside] = useState(false);

  const intervalRef = useRef<any>(null);
  const lastZoneRef = useRef<string | null>(null);

  useEffect(() => {
    startTracking();

    return () => {
      // 🔥 IMPORTANT: cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ===============================
  // START TRACKING
  // ===============================
  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission denied");
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        checkZone(loc.coords.latitude, loc.coords.longitude);
      } catch (err) {
        setStatus("Location Error");
      }
    }, 3000);
  };

  // ===============================
  // CHECK ZONE
  // ===============================
  const checkZone = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/check-risk-zone?lat=${lat}&lng=${lng}`,
        { method: "POST" }
      );

      const data = await res.json();

      // ===============================
      // ENTERED ZONE
      // ===============================
      if (data.inside_zone) {

        // 🔥 Prevent repeated alerts
        if (lastZoneRef.current !== data.zone) {
          lastZoneRef.current = data.zone;

          Speech.speak(
            `Warning! You entered ${data.zone}. Please follow safety instructions.`,
            { rate: 0.9 }
          );
        }

        setIsInside(true);
        setStatus("HIGH RISK DETECTED");
        setZone(data.zone);
        setModule(data.module || "Safety training required");

      } else {
        // ===============================
        // SAFE AREA
        // ===============================
        if (lastZoneRef.current !== null) {
          Speech.speak("You are now in a safe area.");
        }

        lastZoneRef.current = null;
        setIsInside(false);
        setStatus("Safe Area");
        setZone("");
        setModule("");
      }

    } catch {
      setStatus("Server Offline");
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>

        <View style={styles.header}>
          <Text style={styles.title}>Risk Zone Monitor</Text>
          <Text style={styles.subtitle}>Real-time hazard detection</Text>
        </View>

        <View style={styles.monitorContainer}>
          <View style={[styles.pulseCircle, isInside && styles.dangerPulse]}>
            <Ionicons 
              name={isInside ? "warning" : "shield-checkmark"} 
              size={80} 
              color={isInside ? "#FF1744" : "#00A86B"} 
            />
          </View>
          
          <Text style={[styles.statusText, isInside && styles.dangerText]}>
            {status}
          </Text>

          {zone ? (
            <View style={styles.zoneCard}>
              <Text style={styles.zoneLabel}>Zone</Text>
              <Text style={styles.zoneName}>{zone}</Text>

              <Text style={styles.moduleLabel}>Recommended Training</Text>
              <Text style={styles.moduleText}>{module}</Text>
            </View>
          ) : (
            <Text style={styles.safeSubtitle}>
              Scanning for nearby hazards...
            </Text>
          )}
        </View>

        <View style={styles.footerInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#666" />
            <Text style={styles.infoText}>GPS Active</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="notifications" size={20} color="#666" />
            <Text style={styles.infoText}>Voice Alerts ON</Text>
          </View>
        </View>

      </Animated.View>

      <FloatingNavBar />
    </SafeAreaView>
  );
}

// ===============================
// STYLES (same as yours)
// ===============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'space-between', paddingBottom: 120 },
  header: { alignItems: 'center', marginTop: 20 },
  title: { fontSize: 28, fontWeight: '900', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },

  monitorContainer: { alignItems: 'center', width: '100%' },

  pulseCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F1FDF9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1F2E8',
    marginBottom: 30,
  },

  dangerPulse: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },

  statusText: { fontSize: 24, fontWeight: '800', color: '#00A86B' },
  dangerText: { color: '#FF1744' },

  safeSubtitle: { color: '#999', marginTop: 10 },

  zoneCard: {
    backgroundColor: '#F8F9FA',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    marginTop: 30,
    alignItems: 'center',
  },

  zoneLabel: { fontSize: 12, color: '#888' },
  zoneName: { fontSize: 20, fontWeight: '800' },

  moduleLabel: { marginTop: 15, fontSize: 12, color: '#888' },
  moduleText: { fontSize: 14, fontWeight: '700', color: '#00A86B' },

  footerInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 15,
  },

  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { marginLeft: 8, fontSize: 12, color: '#666' },
});