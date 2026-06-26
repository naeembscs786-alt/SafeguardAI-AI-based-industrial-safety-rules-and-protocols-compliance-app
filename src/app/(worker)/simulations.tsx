import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { API_BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import FloatingNavBar from "../../components/FloatingNavBar";

const { width } = Dimensions.get("window");

type Simulation = {
  simulation_id: number;
  title: string;
  industry: string;
  scenario: string;
  difficulty: string;
};

type Question = {
  step_id: number;
  simulation_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  correct_answer: string;
};

export default function SimulationScreen() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);

  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/simulations`);
      const data = await res.json();
      setSimulations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const startSimulation = async (sim: Simulation) => {
    const res = await fetch(`${API_BASE_URL}/simulation/${sim.simulation_id}`);
    const data = await res.json();

    setSelectedSimulation(sim);
    setQuestions(data);
    setIndex(0);
    setCorrect(0);
    setMistakes(0);
    setFinished(false);
    setStartTime(Date.now());
  };

  const answer = (selected: string) => {
    const q = questions[index];
    if (selected === q.correct_answer) {
      setCorrect((prev) => prev + 1);
    } else {
      setMistakes((prev) => prev + 1);
    }

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      finishSimulation();
    }
  };

  const finishSimulation = async () => {
    const seconds = (Date.now() - startTime) / 1000;
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/submit-result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        simulation_id: selectedSimulation?.simulation_id,
        total_questions: questions.length,
        correct_answers: correct,
        mistakes,
        reaction_time: seconds,
      }),
    });

    const data = await res.json();
    setScore(data.score);
    setFinished(true);
  };

  const backToList = () => {
    setSelectedSimulation(null);
    setQuestions([]);
    setFinished(false);
    loadSimulations();
  };

  /* ===============================
     RESULT SCREEN
  =============================== */
  if (finished) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Animated.View entering={FadeInDown} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={80} color="#00A86B" />
              <Text style={styles.resultTitle}>Simulation Complete!</Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Accuracy</Text>
                <Text style={styles.statValue}>{score}%</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Correct</Text>
                <Text style={styles.statValue}>{correct}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Mistakes</Text>
                <Text style={styles.statValue}>{mistakes}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={backToList}>
              <Text style={styles.primaryBtnText}>FINISH & CONTINUE</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <FloatingNavBar />
      </SafeAreaView>
    );
  }

  /* ===============================
     QUESTION SCREEN
  =============================== */
  if (selectedSimulation && questions.length > 0) {
    const q = questions[index];
    const progress = ((index + 1) / questions.length) * 100;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.quizHeader}>
            <TouchableOpacity onPress={backToList} style={styles.backBtn}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.quizTitle}>{selectedSimulation.title}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          <Animated.View key={index} entering={FadeInRight} style={styles.questionCard}>
            <Text style={styles.questionNum}>Step {index + 1} of {questions.length}</Text>
            <Text style={styles.questionText}>{q.question}</Text>
          </Animated.View>

          <View style={styles.optionsContainer}>
            {[
              { label: q.option_a, value: "A" },
              { label: q.option_b, value: "B" },
              { label: q.option_c, value: "C" },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.optionBtn}
                onPress={() => answer(opt.value)}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>{opt.value}</Text>
                </View>
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <FloatingNavBar />
      </SafeAreaView>
    );
  }

  /* ===============================
     LIST SCREEN
  =============================== */
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Simulations</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={simulations}
          keyExtractor={(item) => item.simulation_id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.listSubtitle}>Test your safety knowledge in real-world scenarios.</Text>
            </View>
          )}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity
                style={styles.simulationCard}
                onPress={() => startSimulation(item)}
              >
                <View style={styles.simIcon}>
                  <Ionicons name="game-controller" size={28} color="#00A86B" />
                </View>
                <View style={styles.simInfo}>
                  <Text style={styles.simTitle}>{item.title}</Text>
                  <View style={styles.tagRow}>
                    <View style={styles.tag}><Text style={styles.tagText}>{item.industry}</Text></View>
                    <View style={[styles.tag, {backgroundColor: '#FFF8E1'}]}><Text style={[styles.tagText, {color: '#FF8F00'}]}>{item.difficulty}</Text></View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </Animated.View>
          )}
          ListFooterComponent={() => <View style={{ height: 100 }} />}
        />
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listHeader: {
    marginBottom: 20,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  simulationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  simIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#F1FDF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simInfo: {
    flex: 1,
    marginLeft: 15,
  },
  simTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 8,
  },
  tag: {
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },

  // QUIZ SCREEN
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F1F3F5',
    borderRadius: 3,
    width: '100%',
    marginBottom: 30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00A86B',
    borderRadius: 3,
  },
  questionCard: {
    marginBottom: 30,
  },
  questionNum: {
    fontSize: 13,
    color: '#00A86B',
    fontWeight: '800',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  optionLetterText: {
    fontWeight: '800',
    color: '#333',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },

  // RESULT SCREEN
  resultCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 50,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    marginTop: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 5,
  },
  primaryBtn: {
    backgroundColor: '#00A86B',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});