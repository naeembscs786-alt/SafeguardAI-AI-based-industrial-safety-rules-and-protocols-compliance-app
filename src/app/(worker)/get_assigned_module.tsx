import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import FloatingNavBar from "../../components/FloatingNavBar";

type Module = {
  module_id: number;
  title: string;
  industry: string;
  description: string;
  sop_steps: string;
  media_url: string;
};

export default function MyModulesScreen() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyModules = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/my-modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setModules(data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load assigned modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyModules();
  }, []);

  const renderItem = ({ item, index }: { item: Module, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Ionicons name="book" size={24} color="#00A86B" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.moduleTitle}>{item.title}</Text>
            <Text style={styles.industryTag}>{item.industry}</Text>
          </View>
        </View>
        
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.divider} />

        <View style={styles.sopRow}>
          <Ionicons name="document-text-outline" size={16} color="#666" />
          <Text style={styles.sopText} numberOfLines={1}>
            {item.sop_steps || "No SOP steps provided"}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Assigned Modules</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#00A86B" />
            <Text style={styles.loadingText}>Syncing your training...</Text>
          </View>
        ) : (
          <FlatList
            data={modules}
            keyExtractor={(item) => item.module_id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <View style={styles.listHeader}>
                <Text style={styles.listSubtitle}>Complete your assigned safety modules to stay compliant.</Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-done-circle-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No modules assigned yet.</Text>
              </View>
            )}
            ListFooterComponent={() => <View style={{ height: 100 }} />}
          />
        )}
      </View>
      <FloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  listHeader: {
    marginBottom: 20,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1FDF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 15,
    flex: 1,
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  industryTag: {
    fontSize: 12,
    color: '#00A86B',
    fontWeight: '700',
    marginTop: 2,
  },
  desc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 15,
  },
  sopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sopText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    marginTop: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },
});