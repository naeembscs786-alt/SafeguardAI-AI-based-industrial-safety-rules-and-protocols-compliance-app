import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import OfficerFloatingNavBar from "../../components/OfficerFloatingNavBar";

export default function AnalyticsScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/officer/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: any) => {
    const percent = Math.round((item.score / item.total_questions) * 100);
    const isPassing = percent >= 70;

    return (
      <Animated.View entering={FadeInDown.delay(index * 100)} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.workerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View>
              <Text style={styles.workerName}>{item.name}</Text>
              <Text style={styles.moduleTitle}>{item.title}</Text>
            </View>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: isPassing ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.scoreText, { color: isPassing ? '#2E7D32' : '#D32F2F' }]}>{percent}%</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>CORRECT</Text>
            <Text style={styles.statValue}>{item.score}/{item.total_questions}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TIME</Text>
            <Text style={styles.statValue}>{item.reaction_time}s</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>MISTAKES</Text>
            <Text style={[styles.statValue, { color: item.mistakes > 0 ? '#D32F2F' : '#333' }]}>{item.mistakes}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.statusRow}>
            <Ionicons 
              name={percent < 50 ? "alert-circle" : percent < 75 ? "book" : "checkmark-circle"} 
              size={18} 
              color={percent < 50 ? "#D32F2F" : percent < 75 ? "#1976D2" : "#2E7D32"} 
            />
            <Text style={[styles.statusText, { color: percent < 50 ? "#D32F2F" : percent < 75 ? "#1976D2" : "#2E7D32" }]}>
              {percent < 50 ? "Retraining Required" : percent < 75 ? "Needs Review" : "Safety Compliant"}
            </Text>
          </View>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>DETAILS</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compliance Analytics</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00A86B" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="analytics" size={80} color="#F1F3F5" />
              <Text style={styles.emptyTitle}>No Data Found</Text>
              <Text style={styles.emptySub}>Training results will appear here once workers complete simulations.</Text>
            </View>
          }
        />
      )}
      <OfficerFloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', elevation: 2 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1A1A1A' },

  listContent: { padding: 20, paddingBottom: 120 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  workerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1FDF9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#00A86B' },
  workerName: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  moduleTitle: { fontSize: 12, color: '#666', marginTop: 2 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  scoreText: { fontSize: 14, fontWeight: '900' },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 9, fontWeight: '800', color: '#ADB5BD', letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginTop: 4 },

  divider: { height: 1, backgroundColor: '#F1F3F5', marginBottom: 15 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 13, fontWeight: '700' },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, backgroundColor: '#F8F9FA' },
  actionBtnText: { fontSize: 11, fontWeight: '800', color: '#666' },

  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#333', marginTop: 20 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 10, paddingHorizontal: 50 },
});