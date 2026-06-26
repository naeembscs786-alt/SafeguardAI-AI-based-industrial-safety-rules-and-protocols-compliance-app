import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import OfficerFloatingNavBar from "../../components/OfficerFloatingNavBar";

const { width } = Dimensions.get("window");

interface FeatureCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: readonly [string, string, ...string[]];
  onPress: () => void;
  fullWidth?: boolean;
  delay?: number;
}

const FeatureCard = ({ title, icon, color, onPress, fullWidth, delay = 0 }: FeatureCardProps) => (
  <Animated.View 
    entering={FadeInDown.delay(delay).duration(600)}
    style={[styles.cardWrapper, fullWidth && styles.fullWidthCard]}
  >
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient 
        colors={color} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }} 
        style={[styles.card, fullWidth && styles.cardFullHeight]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={32} color="#fff" />
        </View>
        <View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardTag}>Safety Monitor</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

export default function OfficerDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Officer");
  const [loading, setLoading] = useState(true);
  const [incidentsCount, setIncidentsCount] = useState(0);
  const [sosCount, setSosCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      
      // Fetch Profile
      const profileRes = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUserName(profileData.user?.name || "Officer");
      }

      // Fetch Incidents Count
      const incidentsRes = await fetch(`${API_BASE_URL}/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json();
        if (Array.isArray(incidentsData)) {
          setIncidentsCount(incidentsData.length);
        }
      }

      // Fetch SOS Count
      const sosRes = await fetch(`${API_BASE_URL}/sos-alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sosRes.ok) {
        const sosData = await sosRes.json();
        if (Array.isArray(sosData)) {
          setSosCount(sosData.length);
        }
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00A86B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <LinearGradient colors={["#00A86B", "#008F5A"]} style={styles.headerGradient}>
          <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Ionicons name="shield" size={24} color="#00A86B" />
              </View>
              <View style={{marginLeft: 15}}>
                <Text style={styles.welcomeSubtitle}>Safety Officer</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{incidentsCount}</Text>
              <Text style={styles.statLbl}>Incidents</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{sosCount}</Text>
              <Text style={styles.statLbl}>SOS Alerts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>Live</Text>
              <Text style={styles.statLbl}>Status</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.gridSection}>
          <View style={styles.grid}>
            {/* SOS ALERTS */}
            <FeatureCard
              title="SOS Alerts"
              icon="notifications"
              color={["#FF1744", "#D32F2F"]}
              onPress={() => router.push("/(officer)/sos_logs")}
              fullWidth
              delay={200}
            />

            {/* INCIDENT REPORTS */}
            <FeatureCard
              title="Incident Reports"
              icon="document-text"
              color={["#00A86B", "#008F5A"]}
              onPress={() => router.push("/(officer)/incident_list")}
              fullWidth
              delay={300}
            />
            
            {/* ANALYTICS */}
            <FeatureCard
              title="Simulation Analytics"
              icon="stats-chart"
              color={["#1E88E5", "#1565C0"]}
              onPress={() => router.push("/(officer)/analytics")}
              fullWidth
              delay={400}
            />
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <OfficerFloatingNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 20 },
  headerGradient: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, elevation: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  userName: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  welcomeSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "600" },
  logoutBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", paddingVertical: 15, borderRadius: 20 },
  statItem: { alignItems: "center" },
  statVal: { color: "#fff", fontSize: 16, fontWeight: "800" },
  statLbl: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "600", textTransform: "uppercase" },
  statDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
  gridSection: { paddingHorizontal: 20, marginTop: 25 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cardWrapper: { width: "48%", marginBottom: 16 },
  fullWidthCard: { width: "100%", marginBottom: 16 },
  card: { height: 140, borderRadius: 30, padding: 24, justifyContent: "space-between", elevation: 8 },
  cardFullHeight: { height: 110, flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 20 },
  iconContainer: { width: 54, height: 54, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cardTag: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600" },
});