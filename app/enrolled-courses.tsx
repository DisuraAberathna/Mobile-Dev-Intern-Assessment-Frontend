import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CourseCard } from "@/components/course-card";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as courseService from "@/api/course";
import { Course } from "@/api/course";
import { FlashList } from "@shopify/flash-list";

function EnrolledCoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;

  const fetchEnrolledCourses = async () => {
    try {
      const data = await courseService.getEnrolledCourses();
      setCourses(data);
    } catch (error) {
      console.error("Fetch enrolled courses error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEnrolledCourses();
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="library-books" size={80} color="#8E8E93" />
      <ThemedText style={styles.emptyTitle}>No Enrolled Courses</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        You haven't enrolled in any courses yet. Start your learning journey
        today!
      </ThemedText>
      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: tintColor }]}
        onPress={() => router.push("/(tabs)/home")}
      >
        <ThemedText
          style={styles.exploreButtonText}
          lightColor="#fff"
          darkColor="#000"
        >
          Explore Courses
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
          <ThemedText type="subtitle">My Learning</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
          </View>
        ) : (
          <FlashList
            data={courses}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <CourseCard
                  course={item}
                  onPress={() =>
                    router.push({
                      pathname: "/course/[id]",
                      params: { id: item._id },
                    })
                  }
                />
              </View>
            )}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  exploreButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default EnrolledCoursesScreen;
