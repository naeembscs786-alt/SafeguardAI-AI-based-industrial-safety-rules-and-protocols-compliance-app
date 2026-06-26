import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInDown } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import AdminFloatingNavBar from "../../components/AdminFloatingNavBar";

const { width } = Dimensions.get("window");

export default function PPEDetection() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [safe, setSafe] = useState(true);

  const [helmet, setHelmet] = useState(false);
  const [vest, setVest] = useState(false);
  const [glove, setGlove] = useState(false);
  const [mask, setMask] = useState(false);
  const [boots, setBoots] = useState(false);

  const soundRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const playAlarm = async () => {
    try {
      const { Audio } = await import("expo-av");
      const { sound } = await Audio.Sound.createAsync(require("../../../assets/aviation-alarm.mp3"));
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {}
  };

  const stopAlarm = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
    } catch {}
  };

  const startSystem = () => {
    setRunning(true);
    timerRef.current = setInterval(() => { captureAndDetect(); }, 2500);
  };

  const stopSystem = async () => {
    setRunning(false);
    clearInterval(timerRef.current);
    await stopAlarm();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0].uri) {
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick image");
    }
  };

  const captureAndDetect = async () => {
    if (!cameraRef.current) return;
    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
      processImage(photo.uri);
    } catch (e) {
      setLoading(false);
    }
  };

  const processImage = async (uri: string) => {
    try {
      setLoading(true);
      const fileResponse = await fetch(uri);
      const fileBlob = await fileResponse.blob();
      const formData = new FormData();
      formData.append("file", fileBlob, "frame.jpg");

      const res = await fetch(`${API_BASE_URL}/detect-ppe`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      const data = await res.json();
      const result = data.detections || [];
      setDetections(result);

      const labels = result.map((x: any) => x.label.toLowerCase());
      const hasHelmet = labels.includes("helmet");
      const hasVest = labels.includes("vest");
      const hasGlove = labels.includes("glove");
      const hasMask = labels.includes("mask");
      const hasBoots = labels.includes("boots");

      setHelmet(hasHelmet);
      setVest(hasVest);
      setGlove(hasGlove);
      setMask(hasMask);
      setBoots(hasBoots);

      const workerSafe = hasHelmet && hasVest && hasGlove;
      setSafe(workerSafe);

      if (!workerSafe) { playAlarm(); } else { stopAlarm(); }
    } catch (e) {
      Alert.alert("Error", "Backend failed to process");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => { clearInterval(timerRef.current); stopAlarm(); };
  }, []);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera" size={60} color="#ccc" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>PPE AI Monitoring</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* CAMERA BOX */}
        <View style={styles.cameraContainer}>
          <View style={styles.cameraWrapper}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            {loading && (
              <View style={styles.overlay}>
                <ActivityIndicator size="large" color="#00A86B" />
                <Text style={styles.scanText}>Analyzing PPE...</Text>
              </View>
            )}
          </View>
          
          <View style={[styles.statusBanner, { backgroundColor: safe ? "#E6F4EA" : "#FFEBEE" }]}>
            <Ionicons name={safe ? "checkmark-circle" : "alert-circle"} size={24} color={safe ? "#00A86B" : "#D32F2F"} />
            <Text style={[styles.statusText, { color: safe ? "#00A86B" : "#D32F2F" }]}>
              {safe ? "Worker Protected" : "Security Breach: PPE Missing"}
            </Text>
          </View>
        </View>

        {/* CHECKLIST */}
        <View style={styles.checklist}>
          <Item name="Helmet" ok={helmet} />
          <Item name="Safety Vest" ok={vest} />
          <Item name="Gloves" ok={glove} />
          <Item name="Face Mask" ok={mask} />
          <Item name="Boots" ok={boots} />
        </View>

        {/* CONTROLS */}
        <View style={styles.controls}>
          {!running ? (
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={startSystem}>
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.btnText}>Start Live Scan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
                <Ionicons name="images" size={20} color="#00A86B" />
                <Text style={styles.secondaryBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={stopSystem}>
              <Ionicons name="stop" size={20} color="#fff" />
              <Text style={styles.btnText}>Stop Monitoring</Text>
            </TouchableOpacity>
          )}
        </View>

        {detections.length > 0 && (
          <View style={styles.resultBox}>
            <Text style={styles.resultHeader}>Raw Detections</Text>
            {detections.map((item: any, i) => (
              <Text key={i} style={styles.resultItem}>• {item.label} ({(item.confidence * 100).toFixed(0)}%)</Text>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
      <AdminFloatingNavBar />
    </SafeAreaView>
  );
}

function Item({ name, ok }: { name: string; ok: boolean }) {
  return (
    <View style={[styles.item, { borderColor: ok ? "#00A86B" : "#eee" }]}>
      <Ionicons name={ok ? "shield-checkmark" : "close-circle-outline"} size={20} color={ok ? "#00A86B" : "#ccc"} />
      <Text style={[styles.itemText, { color: ok ? "#00A86B" : "#888" }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  permissionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginVertical: 20 },
  permissionBtn: { backgroundColor: '#00A86B', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
  cameraContainer: { backgroundColor: '#fff', borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: '#eee', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  cameraWrapper: { height: 400, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  scanText: { color: '#fff', marginTop: 10, fontWeight: '700' },
  statusBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, gap: 10 },
  statusText: { fontSize: 15, fontWeight: '800' },
  checklist: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  item: { width: '31%', padding: 12, borderRadius: 15, borderWidth: 1, alignItems: 'center', backgroundColor: '#F8F9FA' },
  itemText: { fontSize: 11, fontWeight: '700', marginTop: 5 },
  controls: { marginBottom: 20 },
  btnRow: { flexDirection: 'row', gap: 10 },
  primaryBtn: { flex: 2, backgroundColor: '#00A86B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, gap: 10, shadowColor: '#00A86B', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  secondaryBtn: { flex: 1, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, gap: 10, borderWidth: 1, borderColor: '#00A86B' },
  stopBtn: { backgroundColor: '#D32F2F', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, gap: 10 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryBtnText: { color: '#00A86B', fontWeight: '800', fontSize: 15 },
  resultBox: { backgroundColor: '#F8F9FA', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
  resultHeader: { fontSize: 14, fontWeight: '800', color: '#1A1A1A', marginBottom: 10 },
  resultItem: { fontSize: 13, color: '#666', marginBottom: 5, fontWeight: '500' },
});