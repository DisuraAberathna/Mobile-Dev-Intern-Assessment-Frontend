import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, BackHandler } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import * as Device from "expo-device";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";

export default function InitialCheckScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  const performChecks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Check Network Connectivity
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        setError(
          "No internet connection detected. Please connect to WiFi or mobile data to continue.",
        );
        setLoading(false);
        return;
      }

      // 2. Security Check (Simulator/Emulator Check for production)
      if (!Device.isDevice && !__DEV__) {
        setError(
          "Security Violation: This application cannot be run on an emulator in production.",
        );
        setLoading(false);
        return;
      }

      // 3. Optional: Root/Jailbreak check (requires more advanced libs, skipping for Expo Go compatibility)

      // If all checks pass, navigate to Login
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err) {
      console.error("Initial check failed:", err);
      setError("Failed to perform application checks. Please restart the app.");
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    performChecks();
  }, [performChecks]);

  const handleRetry = () => {
    performChecks();
  };

  const handleExit = () => {
    BackHandler.exitApp();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: Colors[colorScheme].tint + "15" },
            ]}
          >
            <MaterialIcons
              name={error ? "security" : "shield"}
              size={60}
              color={error ? "#ff3b30" : Colors[colorScheme].tint}
            />
          </View>
          <ThemedText type="title" style={styles.title}>
            {error ? "Security Check" : "TradeHub"}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {error ? "Action Required" : "Performing secure startup checks..."}
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
            <ThemedText style={styles.loadingText}>Please wait...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>

            <View style={styles.buttonGroup}>
              <View
                style={[
                  styles.button,
                  { backgroundColor: Colors[colorScheme].tint },
                ]}
                onTouchEnd={handleRetry}
              >
                <ThemedText style={styles.buttonText}>Retry Checks</ThemedText>
              </View>
              <View
                style={[
                  styles.button,
                  {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: "#ff3b30",
                    marginTop: 12,
                  },
                ]}
                onTouchEnd={handleExit}
              >
                <ThemedText style={[styles.buttonText, { color: "#ff3b30" }]}>
                  Exit Application
                </ThemedText>
              </View>
            </View>
          </View>
        ) : null}
      </View>
      <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.5,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  errorContainer: {
    width: "100%",
    alignItems: "center",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonGroup: {
    width: "100%",
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  versionText: {
    position: "absolute",
    bottom: 40,
    fontSize: 12,
    opacity: 0.3,
  },
});
