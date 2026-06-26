import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import AdminFloatingNavBar from "../../components/AdminFloatingNavBar";

export default function CreateModule() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [sop, setSop] = useState("");
  const [media, setMedia] = useState("");

  const handleSubmit = async () => {
    if (!title || !industry || !description) {
      Alert.alert("Error", "Please fill essential fields (Title, Industry, Description)");
      return;
    }

    const token = await AsyncStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          industry,
          description,
          sop_steps: sop,
          media_url: media,
        }),
      });

      if (res.ok) {
        Alert.alert("Success", "Training module has been created.");
        router.push("/(admin)/module_list");
      } else {
        Alert.alert("Error", "Failed to create module.");
      }
    } catch {
      Alert.alert("Network error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.titleText}>Create Module</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <View style={styles.formCard}>
          <Text style={styles.formHeader}>Training Details</Text>
          
          <View style={styles.inputGroup}>
            <Ionicons name="bookmark-outline" size={20} color="#00A86B" style={styles.icon} />
            <TextInput placeholder="Module Title" value={title} onChangeText={setTitle} style={styles.input} />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="business-outline" size={20} color="#00A86B" style={styles.icon} />
            <TextInput placeholder="Target Industry" value={industry} onChangeText={setIndustry} style={styles.input} />
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              placeholder="Full Description..." 
              value={description} 
              onChangeText={setDescription} 
              style={[styles.input, {height: 100, textAlignVertical: 'top'}]} 
              multiline 
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="list-outline" size={20} color="#00A86B" style={styles.icon} />
            <TextInput 
              placeholder="SOP Steps (Comma separated)" 
              value={sop} 
              onChangeText={setSop} 
              style={styles.input} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="videocam-outline" size={20} color="#00A86B" style={styles.icon} />
            <TextInput placeholder="Training Media URL (Optional)" value={media} onChangeText={setMedia} style={styles.input} />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.btnText}>PUBLISH MODULE</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
      <AdminFloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  titleText: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  formCard: { backgroundColor: '#fff', borderRadius: 25, padding: 25, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  formHeader: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 20, textAlign: 'center' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 18, borderWidth: 1, borderColor: '#E9ECEF', marginBottom: 15, paddingHorizontal: 15 },
  icon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 14, color: '#1A1A1A', fontSize: 15 },
  submitBtn: { backgroundColor: '#00A86B', padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 15, shadowColor: '#00A86B', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
});