import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import FloatingNavBar from "../../components/FloatingNavBar";

const { width } = Dimensions.get("window");

export default function ReportIncident() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("low");
  const [media, setMedia] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets.map((a) => a.uri));
    }
  };

  const submitIncident = async () => {
  if (!description) {
    Alert.alert("Input Required", "Please provide a detailed description of the incident.");
    return;
  }

  setLoading(true);

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      setLoading(false);
      return;
    }

    const locData = await Location.getCurrentPositionAsync({});
    const location = `Lat: ${locData.coords.latitude}, Lng: ${locData.coords.longitude}`;

    const token = await AsyncStorage.getItem("token");

    const formData = new FormData();

    // ---------------- TEXT FIELDS ----------------
    formData.append("description", description);
    formData.append("severity", severity);
    formData.append("location", location);

    // ---------------- MEDIA FILE (SAFE FIXED) ----------------
    if (media.length > 0) {
      const uri = media[0];

      const uriParts = uri.split("/");
      const fileName = uriParts[uriParts.length - 1] || `file_${Date.now()}.jpg`;

      const fileType = fileName.includes(".")
        ? fileName.split(".").pop()
        : "jpg";

      formData.append("file", {
        uri,
        name: fileName,
        type: fileType === "mp4" ? "video/mp4" : "image/jpeg",
      } as any);
    }

    // ---------------- API CALL ----------------
    const res = await fetch(`${API_BASE_URL}/incidents/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ DO NOT set Content-Type for FormData
      },
      body: formData,
    });

    const responseBody = await res.json();

    if (res.ok) {
      Alert.alert("Success", "Incident reported successfully!");
      router.push("/(worker)/worker_dashboard");
    } else {
      Alert.alert("Error", responseBody?.detail || "Failed to submit");
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Network Error", "Server not reachable");
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <LinearGradient colors={["#00A86B", "#008F5A"]} style={styles.headerGradient}>
          <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Incident Reporting</Text>
            <View style={{ width: 44 }} />
          </Animated.View>
        </LinearGradient>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.formCard}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>Detailed Description</Text>
            <TextInput
              placeholder="What happened? Where? Who was involved?"
              placeholderTextColor="#999"
              style={styles.textArea}
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Severity Level</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={severity}
                onValueChange={(v) => setSeverity(v)}
                style={styles.picker}
              >
                <Picker.Item label="Low - Minor Concern" value="low" />
                <Picker.Item label="Medium - Potential Hazard" value="medium" />
                <Picker.Item label="High - Immediate Danger" value="high" />
                <Picker.Item label="Critical - Immediate Action" value="critical" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Evidence (Photos/Videos)</Text>
            <TouchableOpacity style={styles.mediaBtn} onPress={pickMedia}>
              <Ionicons name="camera-outline" size={24} color="#00A86B" />
              <Text style={styles.mediaBtnText}>
                {media.length > 0 ? `${media.length} Files Selected` : "Select Media from Gallery"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]} 
            onPress={submitIncident}
            disabled={loading}
          >
            <LinearGradient 
              colors={["#00A86B", "#008F5A"]} 
              style={styles.btnGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitText}>SUBMIT REPORT</Text>
                  <Ionicons name="send" size={18} color="#fff" style={{marginLeft: 10}} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.tipCard}>
          <Ionicons name="information-circle" size={24} color="#00A86B" />
          <Text style={styles.tipText}>
            Accurate reporting saves lives. Ensure all critical details are captured.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { paddingBottom: 20 },
  headerGradient: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, elevation: 15 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },

  formCard: { backgroundColor: "#fff", margin: 20, marginTop: -20, borderRadius: 30, padding: 25, elevation: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20 },
  inputSection: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: "800", color: "#495057", marginBottom: 12, marginLeft: 5 },
  textArea: { backgroundColor: "#F8F9FA", borderRadius: 20, padding: 18, fontSize: 15, color: "#1A1A1A", textAlignVertical: "top", borderWidth: 1, borderColor: "#E9ECEF" },
  pickerContainer: { backgroundColor: "#F8F9FA", borderRadius: 20, borderWidth: 1, borderColor: "#E9ECEF", overflow: "hidden" },
  picker: { color: "#1A1A1A" },
  
  mediaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 18, borderRadius: 20, backgroundColor: "#F1FDF9", borderWidth: 2, borderColor: "#00A86B", borderStyle: "dashed" },
  mediaBtnText: { marginLeft: 12, color: "#00A86B", fontWeight: "700", fontSize: 14 },
  
  submitBtn: { borderRadius: 20, overflow: "hidden", elevation: 8, shadowColor: "#00A86B", shadowOpacity: 0.4, shadowRadius: 15 },
  btnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "900", letterSpacing: 1 },
  disabledBtn: { opacity: 0.7 },

  tipCard: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, padding: 18, backgroundColor: "#E9ECEF", borderRadius: 20, gap: 15 },
  tipText: { flex: 1, fontSize: 13, color: "#495057", fontWeight: "600", lineHeight: 18 },
});