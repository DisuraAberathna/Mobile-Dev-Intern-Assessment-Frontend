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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [aiCourses, setAiCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<any>(null);
  const [interests, setInterests] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

      if (savedInterests !== interests) {
        setInterests(savedInterests);
      }

      if (savedInterests) {
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
    try {
      const data = await geminiService.getAiRecommendations(prompt);
      setAiCourses(data);

      await Promise.all([
        AsyncStorage.setItem("cachedAiInterests", prompt),
        AsyncStorage.setItem("cachedAiCourses", JSON.stringify(data)),
        AsyncStorage.setItem("lastAiFetchTime", Date.now().toString()),
      ]);
    } catch (error) {
      console.error("AI Fetch error:", error);
    } finally {
      setAiLoading(false);
    }
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

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const recommendedCourses = courses.slice(0, 5);

  const renderRecommended = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">Recommended for You</ThemedText>
        <TouchableOpacity>
          <ThemedText style={[styles.seeAll, { color: tintColor }]}>
            See All
          </ThemedText>
        </TouchableOpacity>
      </View>
      <FlashList
        data={recommendedCourses}
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
    </View>
  );

  const renderAiRecommendations = () => {
    if (aiLoading) {
      return (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            AI Recommendations
          </ThemedText>
          <ActivityIndicator color={tintColor} style={{ marginTop: 20 }} />
        </View>
      );
    }

    if (aiCourses.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="subtitle">AI For You</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Based on your career goals
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => router.push("/interests")}>
            <ThemedText style={[styles.seeAll, { color: tintColor }]}>
              Edit
            </ThemedText>
          </TouchableOpacity>
        </View>
        <FlashList
          data={aiCourses}
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
      {searchQuery === "" && (
        <>
          {renderInterestsCTA()}
          {renderAiRecommendations()}
          {renderRecommended()}
        </>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">
            {searchQuery === ""
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.welcomeText}>
              Hello, {user?.name || "Learner!"}
            </ThemedText>
            <ThemedText type="title" style={styles.headerTitle}>
              Find Your Class
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
            placeholder="Search for courses..."
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
            data={filteredCourses}
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: 20 }}>
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
});
