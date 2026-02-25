import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InterestsScreen() {
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;

  useEffect(() => {
    loadSavedInterest();
  }, []);

  const loadSavedInterest = async () => {
    try {
      const saved = await AsyncStorage.getItem("userInterests");
      if (saved) setInterest(saved);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!interest.trim()) return;

    setLoading(true);
    try {
      await AsyncStorage.setItem("userInterests", interest.trim());
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Full-stack Web Development",
    "Data Science and Analytics",
    "Mobile App Development with React Native",
    "UI/UX Design Principles",
    "Cloud Computing and AWS",
    "Cybersecurity Fundamentals",
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons
              name="close"
              size={24}
              color={Colors[colorScheme].text}
            />
          </TouchableOpacity>
          <ThemedText type="subtitle">Career Goals</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: tintColor + "15" },
                ]}
              >
                <MaterialIcons name="psychology" size={50} color={tintColor} />
              </View>
            </View>

            <ThemedText type="title" style={styles.title}>
              What are your interests?
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Tell us about your career goals or what you'd like to learn. We'll
              use this to recommend the best courses for you.
            </ThemedText>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
                },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  { color: Colors[colorScheme].text, paddingRight: 30 },
                ]}
                placeholder="e.g. I want to become a Senior Frontend Developer..."
                placeholderTextColor="#8e8e93"
                multiline
                numberOfLines={4}
                value={interest}
                onChangeText={setInterest}
                textAlignVertical="top"
              />
              {interest.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setInterest("")}
                  activeOpacity={0.6}
                >
                  <MaterialIcons name="cancel" size={20} color="#8e8e93" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.suggestionsContainer}>
              <ThemedText style={styles.suggestionTitle}>
                Need inspiration?
              </ThemedText>
              <View style={styles.chipsContainer}>
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.chip, { borderColor: tintColor + "40" }]}
                    onPress={() => setInterest(item)}
                  >
                    <ThemedText style={[styles.chipText, { color: tintColor }]}>
                      {item}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: tintColor,
                  opacity: interest.trim() ? 1 : 0.6,
                },
              ]}
              onPress={handleSave}
              disabled={loading || !interest.trim()}
            >
              {loading ? (
                <ActivityIndicator
                  color={colorScheme === "dark" ? "#000" : "#fff"}
                />
              ) : (
                <ThemedText
                  style={styles.saveButtonText}
                  lightColor="#FFFFFF"
                  darkColor="#000000"
                >
                  Save & Find Courses
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 22,
    marginBottom: 30,
  },
  inputContainer: {
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  clearButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  suggestionsContainer: {
    marginTop: 30,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.6,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  footer: {
    padding: 24,
    paddingTop: 12,
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
