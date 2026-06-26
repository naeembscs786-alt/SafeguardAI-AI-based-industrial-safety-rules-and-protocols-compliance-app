import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import OfficerFloatingNavBar from "../../components/OfficerFloatingNavBar";

export default function SOSDashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const alertsCountRef = useRef(0);
  const router = useRouter();

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/sos-alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        if (alertsCountRef.current > 0 && data.length > alertsCountRef.current) {
          Alert.alert("🚨 NEW SOS ALERT!", "A worker has triggered a new emergency signal.");
        }
        alertsCountRef.current = data.length;
        setAlerts(data);
      }
    } catch {
      console.log("Polling failed");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleResolve = async (id: number) => {
    try {
      // Logic for resolving (assuming endpoint exists or keeping frontend-only for now)
      Alert.alert("Resolved", "Emergency alert has been marked as resolved.");
      // Actual implementation would need backend PUT /sos/{id}/resolve
    } catch {
      Alert.alert("Error resolving alert");
    }
  };

  const openMap = (location: string) => {
    const url = `https://www.google.com/maps?q=${location}`;
    Linking.openURL(url);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)} style={styles.alertCard}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Ionicons name="warning" size={14} color="#FF1744" />
          <Text style={styles.typeText}>{item.emergency_type?.toUpperCase() || "EMERGENCY"}</Text>
        </View>
        <Text style={styles.timeText}>{item.time || "Just now"}</Text>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.worker_name?.[0] || "W"}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{item.worker_name || "Unknown Worker"}</Text>
          <Text style={styles.userRole}>Active Emergency • ID: {item.sos_id}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <TouchableOpacity style={styles.detailRow} onPress={() => openMap(item.location)}>
          <Ionicons name="location-sharp" size={18} color="#00A86B" />
          <Text style={styles.locationLink}>{item.location}</Text>
          <Ionicons name="open-outline" size={14} color="#00A86B" style={{marginLeft: 5}} />
        </TouchableOpacity>
        
        <View style={[styles.detailRow, { marginTop: 10 }]}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#666" />
          <Text style={styles.messageText}>{item.message || "No additional details provided."}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.dispatchBtn}
          onPress={() => Alert.alert("Dispatching", "Rescue team is being coordinated.")}
        >
          <Text style={styles.dispatchText}>DISPATCH TEAM</Text>
          <Ionicons name="rocket" size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.resolveBtn}
          onPress={() => handleResolve(item.sos_id)}
        >
          <Ionicons name="checkmark-circle" size={24} color="#00A86B" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={["#FF1744", "#D32F2F"]} style={styles.headerGradient}>
        <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Emergency Alerts</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveText}>LIVE MONITORING</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <FlatList
        data={alerts}
        renderItem={renderItem}
        keyExtractor={(item) => item.sos_id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF1744" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark-outline" size={80} color="#E9ECEF" />
            <Text style={styles.emptyTitle}>All Clear</Text>
            <Text style={styles.emptySub}>No active SOS alerts at the moment.</Text>
          </View>
        }
      />

      <OfficerFloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  headerGradient: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, elevation: 15 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  refreshBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitleContainer: { alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },
  liveIndicator: { flexDirection: "row", alignItems: "center", marginTop: 4, backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00FF00", marginRight: 5 },
  liveText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },

  listContent: { padding: 20, paddingBottom: 120 },
  alertCard: { backgroundColor: "#fff", borderRadius: 25, padding: 20, marginBottom: 20, elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, borderWidth: 1, borderColor: "#F1F3F5" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  typeBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFEBEE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 5 },
  typeText: { fontSize: 10, fontWeight: "900", color: "#FF1744" },
  timeText: { fontSize: 12, color: "#ADB5BD", fontWeight: "700" },

  userInfo: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#F1FDF9", justifyContent: "center", alignItems: "center", marginRight: 15 },
  avatarText: { fontSize: 18, fontWeight: "800", color: "#00A86B" },
  userName: { fontSize: 16, fontWeight: "800", color: "#1A1A1A" },
  userRole: { fontSize: 11, color: "#666", marginTop: 2, fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#F1F3F5", marginBottom: 15 },
  details: { marginBottom: 20 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  locationLink: { fontSize: 14, color: "#00A86B", fontWeight: "700", flex: 1, textDecorationLine: "underline" },
  messageText: { fontSize: 13, color: "#666", fontStyle: "italic", flex: 1, lineHeight: 18 },

  cardActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  dispatchBtn: { flex: 1, backgroundColor: "#FF1744", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 15, gap: 10, elevation: 3 },
  dispatchText: { color: "#fff", fontWeight: "900", fontSize: 12, letterSpacing: 1 },
  resolveBtn: { width: 50, height: 50, borderRadius: 15, backgroundColor: "#F1FDF9", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#D1F2E8" },

  emptyState: { alignItems: "center", marginTop: 100 },
  emptyTitle: { fontSize: 22, fontWeight: "900", color: "#333", marginTop: 20 },
  emptySub: { fontSize: 14, color: "#888", textAlign: "center", marginTop: 10, paddingHorizontal: 50 },
});