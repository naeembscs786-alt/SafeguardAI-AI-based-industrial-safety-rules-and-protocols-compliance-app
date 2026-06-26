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
  FlatList,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import AdminFloatingNavBar from "../../components/AdminFloatingNavBar";

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
          <Text style={styles.cardTag}>Control Panel</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Admin");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(false);

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
        setUserName(data.user.name || "Admin");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setUserLoading(false);
    }
  };

  const changeUserRole = async (userId: number, newRole: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/change-role/${userId}?new_role=${newRole}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        Alert.alert("Success", `User role updated to ${newRole}`);
        fetchUsers(); // Refresh list
      } else {
        const data = await res.json();
        Alert.alert("Error", data.detail || "Failed to update role");
      }
    } catch (err) {
      Alert.alert("Error", "Network error");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  const openUserManagement = () => {
    setIsMenuOpen(false);
    setIsUserModalOpen(true);
    fetchUsers();
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
                <Ionicons name="shield-checkmark" size={24} color="#00A86B" />
              </View>
              <View style={{marginLeft: 15}}>
                <Text style={styles.welcomeSubtitle}>Administrator</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.menuBtn} onPress={() => setIsMenuOpen(true)}>
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{users.length || "8"}</Text>
              <Text style={styles.statLbl}>Active Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>4</Text>
              <Text style={styles.statLbl}>Zones</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>12</Text>
              <Text style={styles.statLbl}>Alerts</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.gridSection}>
          <View style={styles.grid}>
            {/* PPE DETECTION */}
            <FeatureCard
              title="PPE Detection AI"
              icon="camera"
              color={["#00A86B", "#006442"]}
              onPress={() => router.push("/(admin)/ppe_detection")}
              fullWidth
              delay={200}
            />
            
            <FeatureCard
              title="Create Module"
              icon="add-circle"
              color={["#1E88E5", "#1565C0"]}
              onPress={() => router.push("/(admin)/create_module")}
              delay={300}
            />

            <FeatureCard
              title="Manage Zones"
              icon="map"
              color={["#4682B4", "#2E506C"]}
              onPress={() => router.push("/(admin)/manage_zones")}
              delay={400}
            />
            <FeatureCard
              title="Module List"
              icon="list"
              color={["#FF8C00", "#FF4500"]}
              onPress={() => router.push("/(admin)/module_list")}
              delay={500}
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
            <Text style={styles.menuHeader}>Admin Tools</Text>
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={openUserManagement}
            >
              <View style={[styles.menuIcon, {backgroundColor: '#E8F5E9'}]}>
                <Ionicons name="people" size={18} color="#2E7D32" />
              </View>
              <Text style={styles.menuText}>User Management</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setIsMenuOpen(false);
                router.push("/(admin)/list_zones");
              }}
            >
              <View style={[styles.menuIcon, {backgroundColor: '#E3F2FD'}]}>
                <Ionicons name="location-outline" size={18} color="#1976D2" />
              </View>
              <Text style={styles.menuText}>Risk Zones List</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setIsMenuOpen(false);
                router.push("/(admin)/manage_simulations");
              }}
            >
              <View style={[styles.menuIcon, {backgroundColor: '#F3E5F5'}]}>
                <Ionicons name="game-controller" size={18} color="#6A5ACD" />
              </View>
              <Text style={styles.menuText}>Manage Simulations</Text>
            </TouchableOpacity>

            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleLogout}
            >
              <View style={[styles.menuIcon, {backgroundColor: '#FFEBEE'}]}>
                <Ionicons name="log-out-outline" size={18} color="#D32F2F" />
              </View>
              <Text style={[styles.menuText, { color: "#D32F2F" }]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* USER MANAGEMENT MODAL */}
      <Modal
        visible={isUserModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsUserModalOpen(false)}
      >
        <View style={styles.userModalContainer}>
          <View style={styles.userModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>User Management</Text>
              <TouchableOpacity onPress={() => setIsUserModalOpen(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {userLoading ? (
              <ActivityIndicator size="large" color="#00A86B" style={{marginTop: 50}} />
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item.user_id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.avatarText}>{item.name[0]}</Text>
                      </View>
                      <View style={{flex: 1}}>
                        <Text style={styles.userNameText}>{item.name}</Text>
                        <View style={styles.roleBadge}>
                          <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.roleActions}>
                      <TouchableOpacity 
                        style={[styles.roleBtn, item.role === 'admin' && styles.activeRoleBtn]} 
                        onPress={() => changeUserRole(item.user_id, 'admin')}
                      >
                        <Text style={[styles.roleBtnText, item.role === 'admin' && styles.activeRoleBtnText]}>Admin</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.roleBtn, item.role === 'officer' && styles.activeRoleBtn]} 
                        onPress={() => changeUserRole(item.user_id, 'officer')}
                      >
                        <Text style={[styles.roleBtnText, item.role === 'officer' && styles.activeRoleBtnText]}>Officer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
              />
            )}
          </View>
        </View>
      </Modal>

      <AdminFloatingNavBar />
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
  menuBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-start", alignItems: "flex-end", paddingTop: 100, paddingRight: 20 },
  menuContainer: { backgroundColor: "#FFFFFF", width: 220, borderRadius: 24, padding: 15, elevation: 20 },
  menuHeader: { fontSize: 12, fontWeight: "800", color: "#888", paddingLeft: 10, paddingBottom: 5, textTransform: 'uppercase' },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 15, marginVertical: 2 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  menuText: { color: "#1A1A1A", fontSize: 14, marginLeft: 12, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#F1F3F5", marginVertical: 8 },
  
  // User Modal Styles
  userModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  userModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 35, borderTopRightRadius: 35, height: '85%', padding: 25 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' },
  userCard: { backgroundColor: '#F8F9FA', borderRadius: 25, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  userAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#2E7D32', fontWeight: '800', fontSize: 20 },
  userNameText: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  roleBadge: { backgroundColor: '#E3F2FD', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  roleText: { fontSize: 10, color: '#1976D2', fontWeight: '800' },
  roleActions: { flexDirection: 'row', gap: 10 },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff' },
  activeRoleBtn: { backgroundColor: '#00A86B', borderColor: '#00A86B' },
  roleBtnText: { fontSize: 13, fontWeight: '700', color: '#666' },
  activeRoleBtnText: { color: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 100, color: '#999', fontSize: 16 },
});