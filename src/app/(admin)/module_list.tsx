import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../constants/api";
import AdminFloatingNavBar from "../../components/AdminFloatingNavBar";

type Module = {
  module_id: number;
  title: string;
  industry: string;
  description: string;
  sop_steps: string;
  media_url: string;
  created_by: number;
};

export default function AdminModulesScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  const fetchModules = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setModules(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load modules");
    }
  };

  const fetchWorkers = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWorkers(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load workers");
    }
  };

  const assignModule = async (module_id: number, user_id: number) => {
    const token = await AsyncStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/assign-module/${module_id}/${user_id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        Alert.alert("Success", "Module assigned to worker successfully.");
        setModalVisible(false);
      } else {
        const data = await res.json();
        Alert.alert("Error", data.detail || "Failed to assign");
      }
    } catch {
      Alert.alert("Error", "Network error");
    }
  };

  const openAssignModal = (module_id: number) => {
    setSelectedModuleId(module_id);
    fetchWorkers();
    setModalVisible(true);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const deleteModule = (module_id: number) => {
    Alert.alert("Development Notice", "Delete functionality will be connected in the next update.");
  };

  const renderItem = ({ item, index }: { item: Module, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)} style={styles.card}>
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

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openAssignModal(item.module_id)}>
          <Ionicons name="person-add-outline" size={18} color="#00A86B" />
          <Text style={[styles.actionText, {color: '#00A86B'}]}>Assign</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Edit", "Redirecting to editor...")}>
          <Ionicons name="create-outline" size={18} color="#1E88E5" />
          <Text style={[styles.actionText, {color: '#1E88E5'}]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => deleteModule(item.module_id)}>
          <Ionicons name="trash-outline" size={18} color="#D32F2F" />
          <Text style={[styles.actionText, {color: '#D32F2F'}]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Module Inventory</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={modules}
          keyExtractor={(item) => item.module_id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.listSubtitle}>Manage and assign safety training modules to your workforce.</Text>
            </View>
          )}
          ListFooterComponent={() => <View style={{ height: 100 }} />}
        />
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign to Worker</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={workers}
              keyExtractor={(item) => item.user_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.workerItem}
                  onPress={() => selectedModuleId && assignModule(selectedModuleId, item.user_id)}
                >
                  <View style={styles.workerAvatar}>
                    <Text style={styles.avatarText}>{item.name[0]}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.workerName}>{item.name}</Text>
                    <Text style={styles.workerEmail}>{item.email}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <AdminFloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  listHeader: { marginBottom: 20 },
  listSubtitle: { fontSize: 14, color: '#666', lineHeight: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#F1F3F5', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F1FDF9', justifyContent: 'center', alignItems: 'center' },
  headerInfo: { marginLeft: 15, flex: 1 },
  moduleTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  industryTag: { fontSize: 12, color: '#00A86B', fontWeight: '700', marginTop: 2 },
  desc: { fontSize: 14, color: '#666', lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#F1F3F5', marginVertical: 15 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5 },
  actionText: { fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '70%', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  workerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
  workerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E6F4EA', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#00A86B', fontWeight: '800', fontSize: 16 },
  workerName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  workerEmail: { fontSize: 12, color: '#888', marginTop: 2 },
});