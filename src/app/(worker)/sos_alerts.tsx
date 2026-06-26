import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration, Platform, SafeAreaView, ScrollView, Modal } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { API_BASE_URL } from '../../constants/api';
import FloatingNavBar from '../../components/FloatingNavBar';

// Frontend Fallback Knowledge Base (Matches Chatbot Training Keywords)
const EMERGENCY_SOPS: any = {
  "Fire": [
    "🔥 Pull the fire alarm immediately.",
    "🧯 Use a fire extinguisher if safe to do so.",
    "🏃 Evacuate to the nearest assembly point."
  ],
  "Electric Hazard": [
    "⚡ Shut off the main power supply.",
    "🚫 Do NOT touch the victim with bare hands.",
    "📞 Call for electrical maintenance team."
  ],
  "Gas Leak": [
    "💨 Stop work and eliminate all ignition sources.",
    "🚪 Open windows/doors if indoors; move upwind if outdoors.",
    "🚨 Trigger the site-wide gas alarm."
  ],
  "Injury": [
    "🚑 Check the scene for safety before approaching.",
    "🩹 Apply pressure to bleeding wounds.",
    "📞 Keep the victim still and wait for paramedics."
  ],
  "Fall": [
    "🧗 Do NOT move the person (potential spine injury).",
    "👷 Secure the area to prevent further falls.",
    "🏥 Monitor breathing until medical help arrives."
  ],
  "Explosion": [
    "💣 Take cover under a sturdy table or desk.",
    "🚶 Exit the building quickly but calmly.",
    "💨 Watch out for falling debris and secondary blasts."
  ]
};

export default function SOSScreen() {
  const [isSending, setIsSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState("");
  const [sop, setSop] = useState("");
  const [module, setModule] = useState("");

  const emergencyTypes = [
    { name: "Fire", icon: "flame" },
    { name: "Electric Hazard", icon: "flash" },
    { name: "Gas Leak", icon: "cloud-outline" },
    { name: "Injury", icon: "medkit" },
    { name: "Fall", icon: "warning" },
    { name: "Explosion", icon: "nuclear" },
  ];

  const triggerSOS = async () => {
    setShowOptions(true);
  };

  const sendSOSWithType = async (type: string) => {
    setSelectedEmergency(type);
    setShowOptions(false);
    setIsSending(true);

    // Subtle vibration for tactile feedback to the worker
    if (Platform.OS !== 'web') {
      Vibration.vibrate(500); 
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Location access is needed to alert the safety team.');
      setIsSending(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude.toFixed(6);
      const lng = location.coords.longitude.toFixed(6);

      const response = await fetch(`${API_BASE_URL}/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: `lat:${lat},lng:${lng}`,
          message: `URGENT: ${type} emergency at location. Safety team required.`,
          emergency_type: type,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Fallback Logic if backend doesn't return specific module
        if (!data.recommended_module || data.recommended_module === "No module found") {
          const fallbackSteps = EMERGENCY_SOPS[type] || [
            "🚨 Immediate evacuation required.",
            "📞 Safety officer has been notified.",
            "🛡️ Stay in a safe area until team arrives."
          ];
          setModule(`AI Safety Protocol`);
          setSop(fallbackSteps.join("\n\n"));
        } else {
          setModule(data.recommended_module);
          setSop(data.sop);
        }
        
        Alert.alert('🚨 ALERT SENT', 'Safety Officers have been notified of your location. Stay calm and follow the protocols.');
      } else {
        Alert.alert('Error', 'Could not reach emergency servers');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Check your connection');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Emergency SOS</Text>
            <Text style={styles.subtitle}>Instant notification to Safety Team</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.sosButton, isSending && styles.disabledBtn]} 
              onPress={triggerSOS}
              activeOpacity={0.8}
            >
              <View style={styles.innerCircle}>
                <Ionicons name="radio-outline" size={60} color="#fff" />
                <Text style={styles.sosText}>{isSending ? 'ALERTING...' : 'NOTIFY TEAM'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Recommended Action Card */}
          {module !== "" && (
            <Animated.View entering={FadeInUp.delay(200)} style={styles.sopCard}>
              <View style={styles.sopHeader}>
                <Ionicons name="shield-checkmark" size={24} color="#00A86B" />
                <Text style={styles.sopTitle}>Next Steps for You</Text>
              </View>
              <Text style={styles.sopModule}>PROTOCOL: {module}</Text>
              <View style={styles.sopDivider} />
              <Text style={styles.sopText}>{sop}</Text>
              <TouchableOpacity 
                style={styles.closeSop} 
                onPress={() => setModule("")}
              >
                <Text style={styles.closeSopText}>Acknowledge</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#00A86B" />
            <Text style={styles.infoText}>
              Your precise GPS location will be sent to the Safety Dashboard. Do not leave this page until help arrives.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.overlay}>
          <Animated.View entering={ZoomIn} style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Specify Emergency</Text>
              <TouchableOpacity onPress={() => setShowOptions(false)}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsGrid}>
              {emergencyTypes.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionBtn}
                  onPress={() => sendSOSWithType(item.name)}
                >
                  <View style={styles.optionIcon}>
                    <Ionicons name={item.icon as any} size={24} color="#FF1744" />
                  </View>
                  <Text style={styles.optionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>

      <FloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingBottom: 100 },
  content: { padding: 30, alignItems: 'center' },
  header: { marginTop: 20, marginBottom: 40 },
  title: { color: "#1A1A1A", fontSize: 32, fontWeight: "900", textAlign: "center" },
  subtitle: { color: "#666", fontSize: 16, marginTop: 8, textAlign: "center", fontWeight: '500' },
  buttonContainer: { marginVertical: 30 },
  sosButton: { width: 260, height: 260, borderRadius: 130, backgroundColor: "#FFEBEE", justifyContent: "center", alignItems: "center", elevation: 15 },
  innerCircle: { width: 220, height: 220, borderRadius: 110, backgroundColor: "#FF1744", justifyContent: "center", alignItems: "center", borderWidth: 6, borderColor: 'rgba(255,255,255,0.2)' },
  sosText: { color: "#fff", fontSize: 20, fontWeight: "900", marginTop: 10 },
  disabledBtn: { opacity: 0.6 },

  sopCard: { backgroundColor: '#F1FDF9', padding: 25, borderRadius: 25, width: '100%', marginBottom: 30, borderWidth: 1, borderColor: '#D1F2E8', elevation: 5 },
  sopHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sopTitle: { fontSize: 18, fontWeight: '800', color: '#004D33', marginLeft: 10 },
  sopModule: { fontSize: 10, fontWeight: '900', color: '#00A86B', letterSpacing: 1 },
  sopDivider: { height: 1, backgroundColor: '#D1F2E8', marginVertical: 15 },
  sopText: { fontSize: 15, color: '#333', lineHeight: 24, fontWeight: '600' },
  closeSop: { marginTop: 20, backgroundColor: '#00A86B', padding: 15, borderRadius: 12, alignItems: 'center' },
  closeSopText: { color: '#fff', fontWeight: '800' },

  infoCard: { flexDirection: 'row', backgroundColor: '#F8F9FA', padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  infoText: { flex: 1, marginLeft: 15, color: "#666", fontSize: 13, fontWeight: '500', lineHeight: 18 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", padding: 25, borderRadius: 30, width: "100%", elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "900", color: "#1A1A1A" },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  optionBtn: { width: '48%', backgroundColor: '#F8F9FA', padding: 15, borderRadius: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  optionIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  optionText: { fontSize: 14, fontWeight: "700", color: "#333" },
});