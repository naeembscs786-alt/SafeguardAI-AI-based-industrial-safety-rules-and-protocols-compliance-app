import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "../constants/api";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Input Required", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    
    // Create a timeout controller to prevent infinite hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    try {
      console.log(`[Login] Attempting connection to: ${API_BASE_URL}/login`);
      
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Login Failed", data.detail || "Invalid credentials.");
        setLoading(false);
        return;
      }

      const token = data.access_token;
      await AsyncStorage.setItem("token", token);
      
      const decoded: any = jwtDecode(token);
      const role = decoded.role;
      console.log(`[Login] Success! Role detected: ${role}`);

      if (role === "admin") {
        router.replace("/(admin)/admin_dashboard");
      } else if (role === "officer") {
        router.replace("/(officer)/officer_dashboard");
      } else {
        router.replace("/(worker)/worker_dashboard");
      }
    } catch (error: any) {
      console.error("[Login] Error:", error);
      const targetUrl = `${API_BASE_URL}/login`;
      
      if (error.name === 'AbortError') {
        Alert.alert(
          "Connection Timeout", 
          `Target: ${targetUrl}\n\nTroubleshoot:\n1. Is Backend Running?\n2. Same Wi-Fi on Phone & PC?\n3. PC Wi-Fi Profile: Set to 'Private' (not Public).\n4. Try opening URL in Phone Browser.`
        );
      } else {
        Alert.alert(
          "Network Error", 
          `Failed to connect to: ${targetUrl}\n\nError: ${error.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <View style={styles.inner}>
          
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield-checkmark" size={32} color="#00A86B" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue monitoring safety.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.form}>
            <View style={styles.inputGroup}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#999"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.forgotPass}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginBtn, loading && { opacity: 0.7 }]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginBtnText}>{loading ? "Signing in..." : "Login"}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.linkText}>Register Now</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  inner: { flex: 1, padding: 30, justifyContent: "center" },
  backBtn: { position: 'absolute', top: 20, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F1FDF9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900', color: '#1A1A1A' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 8, textAlign: 'center' },
  form: { width: '100%' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 15, borderWidth: 1, borderColor: '#E9ECEF', marginBottom: 18, paddingHorizontal: 15 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 15, color: '#1A1A1A', fontSize: 15 },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotText: { color: '#00A86B', fontWeight: '700', fontSize: 14 },
  loginBtn: { backgroundColor: '#00A86B', paddingVertical: 18, borderRadius: 15, alignItems: 'center', shadowColor: '#00A86B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#666', fontSize: 14 },
  linkText: { color: '#00A86B', fontWeight: '800', fontSize: 14 },
});