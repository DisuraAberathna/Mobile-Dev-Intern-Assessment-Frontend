import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as courseService from "@/api/course";
import { Course } from "@/api/course";
import * as authService from "@/api/auth";
import { CustomAlert } from "@/components/ui/custom-alert";

const { width } = Dimensions.get("window");

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCourseDetails(), fetchUserProfile()]);
      setLoading(false);
    };
    init();
  }, [id]);

  const fetchCourseDetails = async () => {
    if (!id) return;
    const data = await courseService.getCourseById(id);
    setCourse(data);
  };

  const fetchUserProfile = async () => {
    const profile = await authService.getProfile();
    setUser(profile);
  };

  const isEnrolled = course?.enrolledStudents.some(
    (s: any) => s.student === user?._id || s.student?._id === user?._id,
  );

  const isInstructor = course?.instructor._id === user?._id;

  const handleEnroll = async () => {
    if (!id) return;
    if (isEnrolled) {
      setAlertConfig({
        title: "Already Enrolled",
        message: "You are already enrolled in this course.",
        type: "info",
      });
      setShowAlert(true);
      return;
    }

    setEnrolling(true);
    const updatedCourse = await courseService.enrollInCourse(id);
    setEnrolling(false);

    if (updatedCourse) {
      setCourse(updatedCourse);
      setAlertConfig({
        title: "Success!",
        message: "You have successfully enrolled in this course.",
        type: "success",
      });
    } else {
      setAlertConfig({
        title: "Enrollment Failed",
        message: "Something went wrong. Please try again later.",
        type: "error",
      });
    }
    setShowAlert(true);
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  if (!course) {
    return (
      <ThemedView style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color="#ff3b30" />
        <ThemedText style={styles.errorText}>Course not found</ThemedText>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={{ color: tintColor }}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setShowAlert(false)}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={Colors[colorScheme].text}
            />
          </TouchableOpacity>
          <ThemedText type="subtitle">Course Details</ThemedText>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons
              name="share"
              size={24}
              color={Colors[colorScheme].text}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: tintColor + "15" },
            ]}
          >
            <MaterialIcons name="auto-stories" size={80} color={tintColor} />
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.badgeRow}>
              <View
                style={[styles.badge, { backgroundColor: tintColor + "20" }]}
              >
                <ThemedText style={[styles.badgeText, { color: tintColor }]}>
                  Best Seller
                </ThemedText>
              </View>
              <View style={styles.ratingBadge}>
                <MaterialIcons name="star" size={16} color="#FF9500" />
                <ThemedText style={styles.ratingText}>
                  4.8 (2.4k reviews)
                </ThemedText>
              </View>
            </View>

            <ThemedText type="title" style={styles.title}>
              {course.title}
            </ThemedText>

            <View style={styles.instructorInfo}>
              <View
                style={[styles.avatar, { backgroundColor: tintColor + "30" }]}
              >
                <MaterialIcons name="person" size={20} color={tintColor} />
              </View>
              <View>
                <ThemedText style={styles.instructorLabel}>
                  Instructor
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.instructorName}
                >
                  {course.instructor.name}
                </ThemedText>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialIcons name="people" size={20} color="#8E8E93" />
                <ThemedText style={styles.statValue}>
                  {course.enrolledStudents.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Students</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialIcons name="timer" size={20} color="#8E8E93" />
                <ThemedText style={styles.statValue}>12h 30m</ThemedText>
                <ThemedText style={styles.statLabel}>Duration</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialIcons name="play-circle" size={20} color="#8E8E93" />
                <ThemedText style={styles.statValue}>24</ThemedText>
                <ThemedText style={styles.statLabel}>Lessons</ThemedText>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Description
              </ThemedText>
              <ThemedText style={styles.description}>
                {course.description}
              </ThemedText>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                What you'll learn
              </ThemedText>
              <ThemedText style={styles.description}>
                {course.content}
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.enrollButton,
              {
                backgroundColor:
                  isEnrolled || isInstructor ? "#8E8E93" : tintColor,
              },
            ]}
            onPress={handleEnroll}
            disabled={enrolling || isEnrolled || isInstructor}
          >
            {enrolling ? (
              <ActivityIndicator color={isDark ? "#000" : "#fff"} />
            ) : (
              <ThemedText
                style={styles.enrollButtonText}
                lightColor="#fff"
                darkColor="#000"
              >
                {isInstructor
                  ? "Your Course"
                  : isEnrolled
                    ? "Already Enrolled"
                    : "Enroll Now • Free"}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 10,
    opacity: 0.6,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imagePlaceholder: {
    width: "100%",
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    padding: 24,
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "inherit",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.7,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 20,
  },
  instructorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  instructorLabel: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 2,
  },
  instructorName: {
    fontSize: 15,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(142, 142, 147, 0.08)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#8E8E93",
    opacity: 0.2,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.7,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: "inherit",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(142, 142, 147, 0.2)",
  },
  enrollButton: {
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
  enrollButtonText: {
    fontSize: 17,
    fontWeight: "700",
  },
});
