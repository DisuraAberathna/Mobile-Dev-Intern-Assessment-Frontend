import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as authService from "@/api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

function ProfileScreen() {
  const params = useLocalSearchParams();
  const initialUser = params.initialUser
    ? JSON.parse(params.initialUser as string)
    : null;

  const [user, setUser] = useState<any>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      setUser(data);
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["userToken", "userRole"]);
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
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
          <ThemedText type="subtitle">My Profile</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: tintColor + "20" },
              ]}
            >
              <MaterialIcons name="person" size={60} color={tintColor} />
            </View>
            <ThemedText type="title" style={styles.userName}>
              {user?.name || "Guest User"}
            </ThemedText>
            <ThemedText style={styles.userEmail}>{user?.username}</ThemedText>
            <View
              style={[styles.roleBadge, { backgroundColor: tintColor + "15" }]}
            >
              <ThemedText style={[styles.roleText, { color: tintColor }]}>
                {user?.role?.toUpperCase()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.menuSection}>
            <ProfileMenuItem
              icon="edit"
              title="Edit Profile"
              onPress={() => {}}
            />
            {user?.role === "student" && (
              <ProfileMenuItem
                icon="library-books"
                title="Enrolled Courses"
                onPress={() => router.push("/enrolled-courses")}
              />
            )}
            <ProfileMenuItem
              icon="settings"
              title="Settings"
              onPress={() => {}}
            />
            <ProfileMenuItem icon="help-outline" title="Help & Support" />
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <View style={[styles.iconBox, { backgroundColor: "#ff3b3015" }]}>
                <MaterialIcons name="logout" size={22} color="#ff3b30" />
              </View>
              <ThemedText style={[styles.menuTitle, { color: "#ff3b30" }]}>
                Log Out
              </ThemedText>
              <MaterialIcons name="chevron-right" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ProfileMenuItem({
  icon,
  title,
  onPress,
}: {
  icon: any;
  title: string;
  onPress?: () => void;
}) {
  const colorScheme = useColorScheme() ?? "light";
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7" },
        ]}
      >
        <MaterialIcons name={icon} size={22} color={Colors[colorScheme].text} />
      </View>
      <ThemedText style={styles.menuTitle}>{title}</ThemedText>
      <MaterialIcons name="chevron-right" size={24} color="#8e8e93" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    opacity: 0.6,
    marginBottom: 16,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#8e8e9330",
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 20,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;
