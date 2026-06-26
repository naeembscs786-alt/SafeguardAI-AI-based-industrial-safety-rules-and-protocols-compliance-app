import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import FloatingNavBar from "../../components/FloatingNavBar";

const { width } = Dimensions.get("window");

interface FeatureCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string[];
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
          <Text style={styles.cardTag}>Open Feature</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

export default function WorkerDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUserName(data.user.name || "User");
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
        
        {/* ENHANCED COMPACT GREEN HEADER */}
        <LinearGradient colors={["#00A86B", "#008F5A"]} style={styles.headerGradient}>
          <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color="#00A86B" />
              </View>
              <View style={{marginLeft: 15}}>
                <Text style={styles.welcomeSubtitle}>Active Session</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.menuBtn} onPress={() => setIsMenuOpen(true)}>
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Stats Row for Enhancement */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>Active</Text>
              <Text style={styles.statLbl}>Status</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>24/7</Text>
              <Text style={styles.statLbl}>Support</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>100%</Text>
              <Text style={styles.statLbl}>Safety</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.gridSection}>
          <View style={styles.grid}>
            {/* AI Assistant - FULL WIDTH */}
            <FeatureCard
              title="AI Assistant"
              icon="chatbubble-ellipses"
              color={["#00A86B", "#006442"]}
              onPress={() => router.push("/(worker)/ai_assistant")}
              fullWidth
              delay={200}
            />
            
            <FeatureCard
              title="Report Incident"
              icon="alert-circle"
              color={["#FF8C00", "#FF4500"]}
              onPress={() => router.push("/(worker)/report_incident")}
              delay={400}
            />
            <FeatureCard
              title="Risk Zones"
              icon="map"
              color={["#4682B4", "#2E506C"]}
              onPress={() => router.push("/(worker)/risk_zone")}
              delay={500}
            />
            
            {/* SOS - FULL WIDTH FOR EMPHASIS */}
            <FeatureCard
              title="Emergency SOS"
              icon="warning"
              color={["#D32F2F", "#B71C1C"]}
              onPress={() => router.push("/(worker)/sos_alerts")}
              delay={600}
              fullWidth
            />
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* DROPDOWN MENU MODAL */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
        >
          <Animated.View entering={FadeInDown} style={styles.menuContainer}>
            <Text style={styles.menuHeader}>Quick Actions</Text>
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setIsMenuOpen(false);
                router.push("/(worker)/get_assigned_module");
              }}
            >
              <View style={[styles.menuIcon, {backgroundColor: '#E6F4EA'}]}>
                <Ionicons name="book" size={18} color="#00A86B" />
              </View>
              <Text style={styles.menuText}>Training Modules</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setIsMenuOpen(false);
                router.push("/(worker)/simulations");
              }}
            >
              <View style={[styles.menuIcon, {backgroundColor: '#F3E5F5'}]}>
                <Ionicons name="game-controller" size={18} color="#6A5ACD" />
              </View>
              <Text style={styles.menuText}>Safety Simulations</Text>
            </TouchableOpacity>

            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleLogout}
            >
              <View style={[styles.menuIcon, {backgroundColor: '#FFEBEE'}]}>
                <Ionicons name="log-out-outline" size={18} color="#D32F2F" />
              </View>
              <Text style={[styles.menuText, { color: "#D32F2F" }]}>Logout Session</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <FloatingNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  userName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  welcomeSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 5,
  },
  statItem: {
    alignItems: "center",
  },
  statVal: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  statLbl: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  gridSection: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  fullWidthCard: {
    width: "100%",
    marginBottom: 16,
  },
  card: {
    height: 140,
    borderRadius: 30,
    padding: 24,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
  },
  cardFullHeight: {
    height: 110,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardTag: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    width: 220,
    borderRadius: 24,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  menuHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#888",
    paddingLeft: 10,
    paddingBottom: 5,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 15,
    marginVertical: 2,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    color: "#1A1A1A",
    fontSize: 14,
    marginLeft: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F3F5",
    marginVertical: 8,
  },
});
