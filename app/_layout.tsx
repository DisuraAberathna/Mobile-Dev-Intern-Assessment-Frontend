import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { ErrorBoundaryProps } from "expo-router";
import { Colors } from "@/constants/theme";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.errorContainer,
        { backgroundColor: isDark ? "#000" : "#fff" },
      ]}
    >
      <Text style={[styles.errorTitle, { color: isDark ? "#fff" : "#000" }]}>
        Oops! Something went wrong.
      </Text>
      <Text style={[styles.errorMessage, { color: isDark ? "#ccc" : "#666" }]}>
        {error.message}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const AppLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background,
      primary: Colors.light.tint,
      card: Colors.light.background,
      text: Colors.light.text,
      border: "rgba(0,0,0,0.1)",
      notification: Colors.light.tint,
    },
  };

  const AppDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: "#000000",
      primary: Colors.dark.tint,
      card: "#000000",
      text: Colors.dark.text,
      border: "rgba(255,255,255,0.1)",
      notification: Colors.dark.tint,
    },
  };

  return (
    <ThemeProvider value={isDark ? AppDarkTheme : AppLightTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: isDark ? "#000000" : "#ffffff",
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="interests" options={{ presentation: "modal" }} />
        <Stack.Screen name="course/[id]" />
        <Stack.Screen name="enrolled-courses" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}
