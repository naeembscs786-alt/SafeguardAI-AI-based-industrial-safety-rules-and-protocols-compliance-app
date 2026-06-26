import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import AdminFloatingNavBar from "../../components/AdminFloatingNavBar";

export default function ManageSimulations() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [scenario, setScenario] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const [simulationId, setSimulationId] = useState("");
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [dangerLevel, setDangerLevel] = useState("");

  const createSimulation = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/simulations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, industry, scenario, difficulty }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", `Simulation Base Created!\nID: ${data.simulation_id}`);
      } else {
        Alert.alert("Error", "Failed to create simulation base.");
      }
    } catch {
      Alert.alert("Network Error");
    }
  };

  const addStep = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/simulation-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          simulation_id: Number(simulationId),
          question,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          correct_answer: correctAnswer,
          danger_level: dangerLevel,
        }),
      });
      if (res.ok) {
        Alert.alert("Success", "Question step added to simulation.");
        setQuestion(""); setOptionA(""); setOptionB(""); setOptionC("");
      } else {
        Alert.alert("Error", "Failed to add step.");
      }
    } catch {
      Alert.alert("Network Error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.titleText}>Manage Simulations</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* CREATE BASE SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Create Simulation Base</Text>
          <View style={styles.inputGroup}>
            <Ionicons name="create-outline" size={20} color="#00A86B" style={styles.icon} />
            <TextInput placeholder="Simulation Title" value={title} onChangeText={setTitle} style={styles.input} />
          </View>
          <View style={styles.inputGroup}>
            <Ionicons name="business-outline" size={20} color="#00A86B" style={styles.icon} />
            <TextInput placeholder="Industry Segment" value={industry} onChangeText={setIndustry} style={styles.input} />
          </View>
          <View style={styles.inputGroup}>
            <TextInput placeholder="Scenario Description..." value={scenario} onChangeText={setScenario} style={[styles.input, {height: 80}]} multiline />
          </View>
          <View style={styles.inputGroup}>
            <Ionicons name="stats-chart-outline" size={20} color="#00A86B" style={styles.icon} />
            <TextInput placeholder="Difficulty (Easy/Medium/Hard)" value={difficulty} onChangeText={setDifficulty} style={styles.input} />
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={createSimulation}>
            <Text style={styles.btnText}>INITIALIZE BASE</Text>
          </TouchableOpacity>
        </View>

        {/* ADD STEP SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Add Question Steps</Text>
          <View style={styles.inputGroup}>
            <Ionicons name="finger-print" size={20} color="#6A5ACD" style={styles.icon} />
            <TextInput placeholder="Simulation ID" value={simulationId} onChangeText={setSimulationId} keyboardType="numeric" style={styles.input} />
          </View>
          <View style={styles.inputGroup}>
            <TextInput placeholder="Question Text..." value={question} onChangeText={setQuestion} style={[styles.input, {height: 60}]} multiline />
          </View>
          
          <View style={styles.optionsGrid}>
            <View style={styles.inputGroupSmall}><TextInput placeholder="Opt A" value={optionA} onChangeText={setOptionA} style={styles.input} /></View>
            <View style={styles.inputGroupSmall}><TextInput placeholder="Opt B" value={optionB} onChangeText={setOptionB} style={styles.input} /></View>
            <View style={styles.inputGroupSmall}><TextInput placeholder="Opt C" value={optionC} onChangeText={setOptionC} style={styles.input} /></View>
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#6A5ACD" style={styles.icon} />
            <TextInput placeholder="Correct Answer (A/B/C)" value={correctAnswer} onChangeText={setCorrectAnswer} style={styles.input} />
          </View>
          
          <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: '#6A5ACD'}]} onPress={addStep}>
            <Text style={styles.btnText}>ATTACH STEP</Text>
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
  sectionCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, borderWidth: 1, borderColor: '#eee', marginBottom: 25, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 15 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 15, borderWidth: 1, borderColor: '#E9ECEF', marginBottom: 12, paddingHorizontal: 15 },
  inputGroupSmall: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF', paddingHorizontal: 10 },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, color: '#1A1A1A', fontSize: 14 },
  optionsGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  primaryBtn: { backgroundColor: '#00A86B', padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
});