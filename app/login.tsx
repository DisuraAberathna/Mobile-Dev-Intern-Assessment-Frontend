import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CustomAlert, AlertType } from "@/components/ui/custom-alert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "@/api/auth";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "error" as AlertType,
  });
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!username || !password) {
      setAlertConfig({
        title: "Required Fields",
        message: "Please enter both username and password to continue.",
        type: "warning",
      });
      setShowAlert(true);
      return;
    }

    setLoading(true);

    try {
      const data = await authService.login(username, password);

      if (data && data.token) {
        await AsyncStorage.setItem("userToken", data.token);
        if (data.role) {
          await AsyncStorage.setItem("userRole", data.role);
        }

        setLoading(false);
        router.replace("/(tabs)/home");
      } else {
        const errorMessage =
          data?.errors && data.errors.length > 0
            ? data.errors[0].message
            : data?.message || "Login failed. Please check your credentials.";

        setAlertConfig({
          title: "Login Failed",
          message: errorMessage,
          type: "error",
        });
        setShowAlert(true);
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Login Error:", error);

      let errorMessage = "Invalid credentials. Please try again.";
      let errorTitle = "Login Failed";

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage =
          "Unable to connect to the server. Please check your internet connection.";
        errorTitle = "Network Error";
      }

      setAlertConfig({
        title: errorTitle,
        message: errorMessage,
        type: "error",
      });
      setShowAlert(true);
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setShowAlert(false)}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 50}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <View
                  style={[
                    styles.logoIcon,
                    { backgroundColor: Colors[colorScheme].tint + "20" },
                  ]}
                >
                  <MaterialIcons
                    name="lock"
                    size={40}
                    color={Colors[colorScheme].tint}
                  />
                </View>
                <ThemedText type="title" style={styles.title}>
                  Secure Login
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Enter your details to access your account
                </ThemedText>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <ThemedText style={styles.label}>Username</ThemedText>
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
                      style={[
                        styles.input,
                        { color: Colors[colorScheme].text },
                      ]}
                      placeholder="Username"
                      placeholderTextColor="#8e8e93"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.labelRow}>
                    <ThemedText style={styles.label}>Password</ThemedText>
                    <TouchableOpacity>
                      <ThemedText
                        style={[
                          styles.forgotPassword,
                          { color: Colors[colorScheme].tint },
                        ]}
                      >
                        Forgot Password?
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
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
                      style={[
                        styles.input,
                        { color: Colors[colorScheme].text },
                      ]}
                      placeholder="Password"
                      placeholderTextColor="#8e8e93"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons
                        name={showPassword ? "visibility-off" : "visibility"}
                        size={20}
                        color="#8e8e93"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    { backgroundColor: Colors[colorScheme].tint },
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator
                      color={colorScheme === "dark" ? "#000" : "#fff"}
                    />
                  ) : (
                    <ThemedText
                      style={styles.loginButtonText}
                      lightColor="#fff"
                      darkColor="#000"
                    >
                      Log In
                    </ThemedText>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <ThemedText style={styles.footerText}>
                    Don&apos;t have an account?{" "}
                  </ThemedText>
                  <TouchableOpacity onPress={() => router.push("/register")}>
                    <ThemedText
                      style={[
                        styles.footerLink,
                        { color: Colors[colorScheme].tint },
                      ]}
                    >
                      Create Account
                    </ThemedText>
                  </TouchableOpacity>
                </View>
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
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingBottom: 40,
    paddingTop: 40,
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.5,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: "500",
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
  loginButton: {
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
  loginButtonText: {
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
