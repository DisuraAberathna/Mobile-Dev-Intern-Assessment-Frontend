import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useColorScheme as _useColorScheme,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CourseCard } from "@/components/course-card";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as courseService from "@/api/course";
import * as authService from "@/api/auth";
import * as geminiService from "@/api/gemini";
import { Course } from "@/api/course";
import { useRouter, useFocusEffect } from "expo-router";
import { CustomAlert, AlertType } from "@/components/ui/custom-alert";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [aiCourses, setAiCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<any>(null);
  const [interests, setInterests] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as AlertType,
    confirmText: "OK",
    cancelText: undefined as string | undefined,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [coursesData, userData, savedInterests] = await Promise.all([
        courseService.getAllCourses(),
        authService.getProfile(),
        AsyncStorage.getItem("userInterests"),
      ]);
      setCourses(coursesData);
      setUser(userData);

      if (userData?.role === "instructor") {
        const myCourses = await courseService.getInstructorCourses();
        setInstructorCourses(myCourses);
      }

      if (savedInterests !== interests) {
        setInterests(savedInterests);
      }

      if (savedInterests && userData?.role !== "instructor") {
        handleAiRecommendations(savedInterests);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [interests]);

  const handleAiRecommendations = async (prompt: string) => {
    try {
      const [cachedInterests, cachedResults, lastFetchTime] = await Promise.all(
        [
          AsyncStorage.getItem("cachedAiInterests"),
          AsyncStorage.getItem("cachedAiCourses"),
          AsyncStorage.getItem("lastAiFetchTime"),
        ],
      );

      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const isExpired = lastFetchTime
        ? now - parseInt(lastFetchTime) > oneDay
        : true;
      const interestsChanged = prompt !== cachedInterests;

      if (interestsChanged || isExpired || refreshing) {
        await fetchAiRecommendations(prompt);
      } else if (cachedResults) {
        setAiCourses(JSON.parse(cachedResults));
      }
    } catch (error) {
      console.error("Handle AI recommendations error:", error);
    }
  };

  const fetchAiRecommendations = async (prompt: string) => {
    setAiLoading(true);
    const data = await geminiService.getAiRecommendations(prompt);

    if (!data || !data.recommendations) {
      const errorMessage =
        data?.message || "Failed to fetch AI recommendations.";
      setAlertConfig({
        title: "Recommendation Error",
        message: errorMessage,
        type: "error",
        confirmText: "OK",
        cancelText: undefined,
      });
      setShowAlert(true);
      setAiLoading(false);
      return;
    }

    const recommendations = data.recommendations || [];
    setAiCourses(recommendations);

    await Promise.all([
      AsyncStorage.setItem("cachedAiInterests", prompt),
      AsyncStorage.setItem("cachedAiCourses", JSON.stringify(recommendations)),
      AsyncStorage.setItem("lastAiFetchTime", Date.now().toString()),
    ]);
    setAiLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDeleteCourse = (courseId: string) => {
    setPendingDeleteId(courseId);
    setAlertConfig({
      title: "Delete Course",
      message:
        "Are you sure you want to delete this course? This action cannot be undone.",
      type: "warning",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    setShowAlert(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      const data = await courseService.deleteCourse(pendingDeleteId);
      if (data) {
        setInstructorCourses((prev) =>
          prev.filter((c) => c._id !== pendingDeleteId),
        );
        setCourses((prev) => prev.filter((c) => c._id !== pendingDeleteId));
      }
    } catch (error) {
      console.error("Delete course error:", error);
    } finally {
      setShowAlert(false);
      setPendingDeleteId(null);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderRecommendations = () => {
    const hasAiCourses = aiCourses.length > 0;
    const displayData = hasAiCourses ? aiCourses : courses.slice(0, 5);

    if (displayData.length === 0 && !aiLoading) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="subtitle">Recommended for You</ThemedText>
            {hasAiCourses && (
              <ThemedText style={styles.sectionSubtitle}>
                Based on your career goals
              </ThemedText>
            )}
          </View>
          {hasAiCourses && (
            <TouchableOpacity onPress={() => router.push("/interests")}>
              <ThemedText style={[styles.seeAll, { color: tintColor }]}>
                Edit
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
        {aiLoading ? (
          <ActivityIndicator color={tintColor} style={{ marginVertical: 40 }} />
        ) : (
          <FlashList
            data={displayData}
            renderItem={({ item }) => (
              <CourseCard
                course={item}
                horizontal
                onPress={() =>
                  router.push({
                    pathname: "/course/[id]",
                    params: { id: item._id },
                  })
                }
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        )}
      </View>
    );
  };

  const renderInterestsCTA = () => {
    if (interests && aiCourses.length > 0) return null;
    if (interests && aiLoading) return null;

    return (
      <TouchableOpacity
        style={[
          styles.ctaCard,
          { backgroundColor: tintColor + "10", borderColor: tintColor + "30" },
        ]}
        onPress={() => router.push("/interests")}
      >
        <View style={styles.ctaContent}>
          <View style={[styles.ctaIcon, { backgroundColor: tintColor }]}>
            <MaterialIcons
              name="psychology"
              size={24}
              color={colorScheme === "dark" ? "#000000" : "#ffffff"}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={styles.ctaTitle}>
              Get AI Recommendations
            </ThemedText>
            <ThemedText style={styles.ctaSubtitle}>
              Tell us your career goals to see personalized course suggestions.
            </ThemedText>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={Colors[colorScheme].text}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.content}>
      {searchQuery === "" && user?.role !== "instructor" && (
        <>
          {renderInterestsCTA()}
          {renderRecommendations()}
        </>
      )}

      {user?.role === "instructor" && (
        <TouchableOpacity
          style={[styles.addCourseCTA, { backgroundColor: tintColor }]}
          onPress={() => router.push("/add-course")}
        >
          <MaterialIcons
            name="add"
            size={24}
            color={colorScheme === "dark" ? "#000" : "#fff"}
          />
          <ThemedText
            style={styles.addCourseCTAText}
            lightColor="#fff"
            darkColor="#000"
          >
            Create New Course
          </ThemedText>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">
            {user?.role === "instructor"
              ? "My Created Courses"
              : searchQuery === ""
                ? "All Courses"
                : `Search results for "${searchQuery}"`}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="search-off" size={60} color="#8e8e93" />
      <ThemedText style={styles.emptyText}>No courses found</ThemedText>
    </View>
  );

  const displayCourses =
    user?.role === "instructor"
      ? instructorCourses.filter((c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : filteredCourses;

  return (
    <ThemedView style={styles.container}>
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={pendingDeleteId ? confirmDelete : () => setShowAlert(false)}
        onCancel={() => {
          setShowAlert(false);
          setPendingDeleteId(null);
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.welcomeText}>
              Hello, {user?.name || "Learner!"}
            </ThemedText>
            <ThemedText type="title" style={styles.headerTitle}>
              {user?.role === "instructor"
                ? "Instructor Dashboard"
                : "Find Your Class"}
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/profile",
                params: { initialUser: JSON.stringify(user) },
              })
            }
            style={[
              styles.profileButton,
              {
                backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
              },
            ]}
          >
            <MaterialIcons
              name="person"
              size={24}
              color={Colors[colorScheme].text}
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7" },
          ]}
        >
          <MaterialIcons name="search" size={20} color="#8e8e93" />
          <TextInput
            placeholder={
              user?.role === "instructor"
                ? "Search my courses..."
                : "Search for courses..."
            }
            placeholderTextColor="#8e8e93"
            style={[styles.searchInput, { color: Colors[colorScheme].text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={20} color="#8e8e93" />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      ) : (
        <View style={{ flex: 1, paddingBottom: 25 }}>
          <FlashList
            data={displayCourses}
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: 20 }}>
                <CourseCard
                  course={item}
                  onEdit={
                    user?.role === "instructor"
                      ? () =>
                          router.push({
                            pathname: "/add-course",
                            params: { id: item._id },
                          })
                      : undefined
                  }
                  onDelete={
                    user?.role === "instructor"
                      ? () => handleDeleteCourse(item._id)
                      : undefined
                  }
                  onPress={() =>
                    router.push({
                      pathname: "/course/[id]",
                      params: { id: item._id },
                    })
                  }
                />
              </View>
            )}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  loadingContainer: {
    paddingTop: 100,
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 13,
    opacity: 0.5,
  },
  ctaCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ctaIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  addCourseCTA: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addCourseCTAText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
