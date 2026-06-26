import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import AdminFloatingNavBar from "../../components/AdminFloatingNavBar";

type Zone = {
  zone_id: number;
  zone_name: string;
  latitude: number;
  longitude: number;
  radius: number;
  risk_level: string;
  module_id: number;
};

export default function ListZonesScreen() {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/zones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setZones(data);
    } catch {
      Alert.alert("Error", "Failed to load zones");
    } finally {
      setLoading(false);
    }
  };

  const deleteZone = async (id: number) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to remove this risk zone?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await fetch(`${API_BASE_URL}/zones/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                Alert.alert("Success", "Zone removed successfully.");
                loadZones();
              }
            } catch {
              Alert.alert("Error", "Network Error");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }: { item: Zone; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={styles.zoneCard}
    >
      <View style={styles.zoneHeader}>
        <View style={styles.iconBox}>
          <Ionicons name="navigate-circle" size={24} color="#00A86B" />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.zoneTitle}>{item.zone_name}</Text>
          <Text style={styles.zoneRisk}>{item.risk_level.toUpperCase()} RISK</Text>
        </View>
        <TouchableOpacity onPress={() => deleteZone(item.zone_id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="#D32F2F" />
        </TouchableOpacity>
      </View>
      <View style={styles.zoneDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="locate-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="resize-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{item.radius}m Radius</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="book-outline" size={14} color="#666" />
          <Text style={styles.detailText}>Module {item.module_id}</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Active Risk Zones</Text>
          <TouchableOpacity onPress={loadZones} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={22} color="#00A86B" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <Text style={styles.loadingText}>Loading zones...</Text>
          </View>
        ) : (
          <FlatList
            data={zones}
            renderItem={renderItem}
            keyExtractor={(item) => item.zone_id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Ionicons name="map-outline" size={60} color="#E9ECEF" />
                <Text style={styles.emptyTitle}>No Zones Found</Text>
                <Text style={styles.emptySub}>Add a new risk zone from the Manage Zones screen.</Text>
                <TouchableOpacity 
                  style={styles.addBtn}
                  onPress={() => router.push("/(admin)/manage_zones")}
                >
                  <Text style={styles.addBtnText}>Create Zone</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
      <AdminFloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  main: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  refreshBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  
  listContent: { paddingBottom: 120, paddingTop: 10 },
  zoneCard: { backgroundColor: '#fff', padding: 20, borderRadius: 25, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  zoneHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#F1FDF9', justifyContent: 'center', alignItems: 'center' },
  zoneTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  zoneRisk: { color: '#00A86B', fontSize: 11, fontWeight: '800', marginTop: 2 },
  deleteBtn: { padding: 8 },
  zoneDetails: { borderTopWidth: 1, borderTopColor: '#F8F9FA', paddingTop: 15, gap: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, color: '#666', fontWeight: '600' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#666', marginTop: 10, fontWeight: '600' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginTop: 20 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 10, paddingHorizontal: 40 },
  addBtn: { marginTop: 25, backgroundColor: '#00A86B', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '800' },
});
