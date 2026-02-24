import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  const handleRegister = async () => {
    if (!name || !username || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Registering with:", { name, username, password, role });

      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        router.replace("/login");
      }, 1500);
    } catch (err) {
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <MaterialIcons
                  name="arrow-back"
                  size={24}
                  color={Colors[colorScheme].text}
                />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <ThemedText type="title" style={styles.title}>
                  Create Account
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Join us and start your journey
                </ThemedText>
              </View>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: colorScheme === "dark" ? "#333" : "#eee",
                      backgroundColor:
                        colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
                    },
                  ]}
                >
                  <MaterialIcons
                    name="person-outline"
                    size={20}
                    color="#8e8e93"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text }]}
                    placeholder="John Doe"
                    placeholderTextColor="#8e8e93"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Email / Username</ThemedText>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: colorScheme === "dark" ? "#333" : "#eee",
                      backgroundColor:
                        colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
                    },
                  ]}
                >
                  <MaterialIcons
                    name="mail-outline"
                    size={20}
                    color="#8e8e93"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text }]}
                    placeholder="email@example.com"
                    placeholderTextColor="#8e8e93"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: colorScheme === "dark" ? "#333" : "#eee",
                      backgroundColor:
                        colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
                    },
                  ]}
                >
                  <MaterialIcons
                    name="lock-outline"
                    size={20}
                    color="#8e8e93"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text }]}
                    placeholder="••••••••"
                    placeholderTextColor="#8e8e93"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: colorScheme === "dark" ? "#333" : "#eee",
                      backgroundColor:
                        colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
                    },
                  ]}
                >
                  <MaterialIcons
                    name="lock-clock"
                    size={20}
                    color="#8e8e93"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text }]}
                    placeholder="••••••••"
                    placeholderTextColor="#8e8e93"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <MaterialIcons
                    name="error-outline"
                    size={16}
                    color="#ff3b30"
                  />
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  { backgroundColor: Colors[colorScheme].tint },
                ]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.registerButtonText}>
                    Create Account
                  </ThemedText>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <ThemedText style={styles.footerText}>
                  Already have an account?{" "}
                </ThemedText>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <ThemedText
                    style={[
                      styles.footerLink,
                      { color: Colors[colorScheme].tint },
                    ]}
                  >
                    Log In
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginLeft: -8,
  },
  headerTextContainer: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.5,
  },
  formContainer: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 6,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    fontWeight: "500",
  },
  registerButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
    opacity: 0.6,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: "700",
  },
});
