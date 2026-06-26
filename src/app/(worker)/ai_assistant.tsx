import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { AI_CHAT_URL } from '@/constants/api';
import { router } from 'expo-router';
import FloatingNavBar from '../../components/FloatingNavBar';

type Message = {
  sender: "user" | "bot";
  text: string;
};

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! I am your AI Safety Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, chat_history: messages }),
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();
      const botMsg: Message = {
        sender: "bot",
        text: data.answer || "No answer received.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Connection failed! Please check your internet or server." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderItem = ({ item, index }: { item: Message, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(100).duration(400)}
      style={[
        styles.bubble,
        item.sender === "user" ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={item.sender === "user" ? styles.userText : styles.botText}>
        {item.text}
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Always Online</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* CHAT MESSAGES */}
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.chatArea}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => isTyping ? (
            <Text style={styles.typingText}>Assistant is typing...</Text>
          ) : null}
        />

        {/* INPUT BAR */}
        <View style={styles.inputArea}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your safety query..."
            placeholderTextColor="#999"
            style={styles.input}
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </KeyboardAvoidingView>
      <FloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A86B',
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
  },
  chatArea: {
    padding: 20,
    paddingBottom: 40,
  },
  bubble: {
    maxWidth: "85%",
    padding: 15,
    borderRadius: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#00A86B",
    borderBottomRightRadius: 4,
  },
  userText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F3F5",
    borderBottomLeftRadius: 4,
  },
  botText: {
    color: "#1A1A1A",
    fontSize: 15,
    lineHeight: 22,
  },
  typingText: {
    fontSize: 12,
    color: '#aaa',
    marginLeft: 10,
    marginTop: 5,
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  input: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    color: "#1A1A1A",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  sendBtn: {
    marginLeft: 12,
    backgroundColor: "#00A86B",
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    shadowColor: "#00A86B",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});