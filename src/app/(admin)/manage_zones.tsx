import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import AdminFloatingNavBar from "../../components/AdminFloatingNavBar";

export default function ManageZonesScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [zoneName, setZoneName] = useState("");
  const [radius, setRadius] = useState("100");
  const [riskLevel, setRiskLevel] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // OpenStreetMap (Leaflet) HTML
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([31.5204, 74.3587], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        var marker;
        var circle;

        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;
          
          if (marker) map.removeLayer(marker);
          if (circle) map.removeLayer(circle);

          marker = L.marker([lat, lng]).addTo(map);
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            latitude: lat,
            longitude: lng
          }));
        });

        window.updateRadius = function(r) {
          if (marker && r) {
            if (circle) map.removeLayer(circle);
            circle = L.circle(marker.getLatLng(), {
              color: '#00A86B',
              fillColor: '#00A86B',
              fillOpacity: 0.2,
              radius: parseInt(r)
            }).addTo(map);
          }
        }
      </script>
    </body>
    </html>
  `;

  const onMessage = (event: any) => {
    const coords = JSON.parse(event.nativeEvent.data);
    setSelectedLocation(coords);
    webViewRef.current?.injectJavaScript(`window.updateRadius(${radius});`);
  };

  useEffect(() => {
    if (selectedLocation) {
      webViewRef.current?.injectJavaScript(`window.updateRadius(${radius});`);
    }
  }, [radius]);

  const createZone = async () => {
    if (!zoneName || !radius || !riskLevel || !moduleId || !selectedLocation) {
      Alert.alert("Error", "Fill all fields and click on map to set location.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/zones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          zone_name: zoneName,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          radius: parseInt(radius),
          risk_level: riskLevel,
          module_id: parseInt(moduleId),
        }),
      });

      if (res.ok) {
        Alert.alert("Success", "Zone Created 🚀", [
          { text: "View List", onPress: () => router.push("/(admin)/list_zones") },
          { text: "Add Another", style: "cancel" }
        ]);
        setZoneName(""); setRiskLevel(""); setModuleId(""); setSelectedLocation(null);
      } else {
        const err = await res.text();
        Alert.alert("Error", err);
      }
    } catch {
      Alert.alert("Error", "Network Error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Initialize Risk Zone</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* MAP */}
        <View style={styles.mapCard}>
          <Text style={styles.mapHint}>Tap on map to select location</Text>
          <View style={styles.mapWrapper}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              onMessage={onMessage}
              style={styles.map}
              scrollEnabled={false}
            />
          </View>
          {selectedLocation && (
            <View style={styles.coordBadge}>
              <Text style={styles.coordText}>
                Selected: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        {/* FORM */}
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Zone Configuration</Text>
          <TextInput
            placeholder="Zone Name (e.g. Chemical Storage)"
            value={zoneName}
            onChangeText={setZoneName}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <View style={styles.row}>
            <TextInput
              placeholder="Radius (m)"
              value={radius}
              onChangeText={setRadius}
              keyboardType="numeric"
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Risk Level (High/Med)"
              value={riskLevel}
              onChangeText={setRiskLevel}
              style={[styles.input, { flex: 1 }]}
              placeholderTextColor="#999"
            />
          </View>
          <TextInput
            placeholder="Training Module ID"
            value={moduleId}
            onChangeText={setModuleId}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.createBtn} onPress={createZone}>
            <Text style={styles.createBtnText}>INITIALIZE ZONE</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <AdminFloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },

  mapCard: { backgroundColor: '#fff', borderRadius: 25, padding: 10, elevation: 4, marginBottom: 20 },
  mapHint: { fontSize: 12, color: '#00A86B', fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  mapWrapper: { height: 280, borderRadius: 20, overflow: 'hidden' },
  map: { flex: 1 },
  coordBadge: { marginTop: 10, alignSelf: 'center', backgroundColor: '#F1FDF9', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10 },
  coordText: { fontSize: 12, color: '#00A86B', fontWeight: '600' },

  formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 25, elevation: 3, marginBottom: 25 },
  formLabel: { fontSize: 13, fontWeight: '800', color: '#00A86B', marginBottom: 15, letterSpacing: 1 },
  input: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#E9ECEF', color: '#1A1A1A' },
  row: { flexDirection: 'row' },
  createBtn: { backgroundColor: '#00A86B', padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 5 },
  createBtnText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
});