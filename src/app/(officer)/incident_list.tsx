import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import OfficerFloatingNavBar from "../../components/OfficerFloatingNavBar";

export default function IncidentList() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setIncidents(data);
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
    }
  };

  const updateStatus = async (incidentId: number, newStatus: string) => {
    setUpdatingId(incidentId);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}?status=${newStatus}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        Alert.alert("Success", `Incident status updated to ${newStatus}`);
        fetchIncidents(); // Reload list
      } else {
        Alert.alert("Error", "Failed to update status");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not reach server");
    } finally {
      setUpdatingId(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIncidents();
    setRefreshing(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved": return { bg: "#E8F5E9", text: "#2E7D32", icon: "checkmark-circle" };
      case "in progress": return { bg: "#E3F2FD", text: "#1976D2", icon: "sync" };
      case "pending": return { bg: "#FFF3E0", text: "#EF6C00", icon: "time" };
      case "critical": return { bg: "#FFEBEE", text: "#C62828", icon: "alert-circle" };
      default: return { bg: "#F5F5F5", text: "#616161", icon: "help-circle" };
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const statusStyle = getStatusStyle(item.status || "pending");
    const isUpdating = updatingId === item.incident_id;
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 100)} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status?.toUpperCase() || "PENDING"}
            </Text>
          </View>
          <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.imageContainer}>
            {item.media ? (
              <Image source={{ uri: `${API_BASE_URL}/uploads/${item.media}` }} style={styles.incidentImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={30} color="#CED4DA" />
              </View>
            )}
            <View style={[styles.severityTag, { backgroundColor: item.severity === 'High' ? '#FF1744' : '#FFA000' }]}>
              <Text style={styles.severityTagText}>{item.severity || 'Medium'}</Text>
            </View>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.workerLabel}>Reported by Worker ID: {item.worker_id}</Text>
            <Text style={styles.descriptionText} numberOfLines={3}>
              {item.description || "No description provided."}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={16} color="#00A86B" />
              <Text style={styles.locationText}>{item.location || "On-site"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {item.status !== "resolved" ? (
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.progressBtn]} 
                onPress={() => updateStatus(item.incident_id, "In Progress")}
                disabled={isUpdating}
              >
                {isUpdating ? <ActivityIndicator size="small" color="#1976D2" /> : (
                  <>
                    <Ionicons name="eye" size={18} color="#1976D2" />
                    <Text style={[styles.btnText, { color: "#1976D2" }]}>In Progress</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.resolveBtn]} 
                onPress={() => updateStatus(item.incident_id, "resolved")}
                disabled={isUpdating}
              >
                {isUpdating ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark-done" size={18} color="#fff" />
                    <Text style={[styles.btnText, { color: "#fff" }]}>Resolve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.resolvedLabel}>
              <Ionicons name="ribbon" size={20} color="#00A86B" />
              <Text style={styles.resolvedLabelText}>This incident has been fully resolved</Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={["#00A86B", "#008756"]} style={styles.headerGradient}>
        <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleGroup}>
            <Text style={styles.headerTitle}>Field Incidents</Text>
            <Text style={styles.headerSubtitle}>{incidents.length} active reports</Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <FlatList
        data={incidents}
        renderItem={renderItem}
        keyExtractor={(item) => item.incident_id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A86B" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark" size={80} color="#E9ECEF" />
            <Text style={styles.emptyTitle}>Secure Environment</Text>
            <Text style={styles.emptySub}>No incidents have been reported in this sector.</Text>
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
  titleGroup: { alignItems: 'center' },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "900" },
  headerSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600", marginTop: 2 },

  listContent: { padding: 20, paddingBottom: 150 },
  card: { backgroundColor: "#fff", borderRadius: 30, padding: 20, marginBottom: 25, elevation: 6, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15, borderWidth: 1, borderColor: "#F1F3F5" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: "900" },
  dateText: { fontSize: 12, color: "#ADB5BD", fontWeight: "700" },

  mainInfo: { flexDirection: "row", gap: 18 },
  imageContainer: { position: 'relative' },
  incidentImage: { width: 100, height: 100, borderRadius: 22 },
  imagePlaceholder: { width: 100, height: 100, borderRadius: 22, backgroundColor: "#F8F9FA", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E9ECEF" },
  severityTag: { position: 'absolute', bottom: -5, alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, elevation: 2 },
  severityTagText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  
  textContainer: { flex: 1, justifyContent: "space-between" },
  workerLabel: { fontSize: 11, color: "#ADB5BD", fontWeight: "800", letterSpacing: 0.5 },
  descriptionText: { fontSize: 14, color: "#333", lineHeight: 20, fontWeight: "500", marginVertical: 6 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { fontSize: 13, color: "#00A86B", fontWeight: "800" },

  cardFooter: { marginTop: 20, borderTopWidth: 1, borderTopColor: "#F8F9FA", paddingTop: 18 },
  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 16, elevation: 2 },
  progressBtn: { backgroundColor: "#E3F2FD", borderWidth: 1, borderColor: "#BBDEFB" },
  resolveBtn: { backgroundColor: "#00A86B", shadowColor: "#00A86B", shadowOpacity: 0.3, shadowRadius: 10 },
  btnText: { fontSize: 13, fontWeight: "900" },

  resolvedLabel: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#F1FDF9", paddingVertical: 12, borderRadius: 15 },
  resolvedLabelText: { color: "#00A86B", fontSize: 13, fontWeight: "800" },

  emptyState: { alignItems: "center", marginTop: 120 },
  emptyTitle: { fontSize: 24, fontWeight: "900", color: "#333", marginTop: 20 },
  emptySub: { fontSize: 15, color: "#888", textAlign: "center", marginTop: 10, paddingHorizontal: 60, lineHeight: 22 },
});