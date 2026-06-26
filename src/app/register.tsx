import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { API_BASE_URL } from "../constants/api";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Input Error", "All fields are required to create an account.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: "worker",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert("Registration Failed", data.detail || "Could not create account.");
        setLoading(false);
        return;
      }

      Alert.alert("Success", "Account created successfully! Please login.");
      router.replace("/login");
    } catch (error) {
      Alert.alert("Network Error", "Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
              <View style={styles.logoCircle}>
                <Ionicons name="person-add" size={32} color="#00A86B" />
              </View>
              <Text style={styles.title}>Join SafeGuard</Text>
              <Text style={styles.subtitle}>Create your safety profile to start monitoring.</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.form}>
              <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>

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
                  placeholder="Create Password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity 
                style={[styles.registerBtn, loading && { opacity: 0.7 }]} 
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerBtnText}>{loading ? "Initializing..." : "Create Account"}</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.linkText}>Login</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { flexGrow: 1 },
  inner: { padding: 30, flex: 1, justifyContent: "center", paddingTop: 60 },
  backBtn: { position: 'absolute', top: 20, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 35 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F1FDF9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900', color: '#1A1A1A' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 8, textAlign: 'center' },
  form: { width: '100%' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 15, borderWidth: 1, borderColor: '#E9ECEF', marginBottom: 18, paddingHorizontal: 15 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 15, color: '#1A1A1A', fontSize: 15 },
  registerBtn: { backgroundColor: '#00A86B', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, shadowColor: '#00A86B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, paddingBottom: 20 },
  footerText: { color: '#666', fontSize: 14 },
  linkText: { color: '#00A86B', fontWeight: '800', fontSize: 14 },
});