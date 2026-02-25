import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Course } from "@/api/course";

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  horizontal?: boolean;
}

export function CourseCard({
  course,
  onPress,
  horizontal = false,
}: CourseCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        horizontal ? styles.horizontalCard : styles.verticalCard,
        {
          backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
          borderColor: isDark ? "#2C2C2E" : "#F2F2F7",
          borderWidth: 1,
        },
      ]}
    >
      <View
        style={[
          styles.imageContainer,
          horizontal ? styles.horizontalImage : styles.verticalImage,
          { backgroundColor: tintColor + (isDark ? "20" : "10") },
        ]}
      >
        <MaterialIcons
          name="auto-stories"
          size={horizontal ? 32 : 28}
          color={tintColor}
        />
      </View>

      <View style={styles.courseInfo}>
        <ThemedText
          numberOfLines={2}
          style={[styles.courseTitle, { fontSize: horizontal ? 16 : 15 }]}
        >
          {course.title}
        </ThemedText>

        <View style={styles.instructorRow}>
          <MaterialIcons name="person" size={12} color="#8E8E93" />
          <ThemedText style={styles.instructorName} numberOfLines={1}>
            {course.instructor.name}
          </ThemedText>
        </View>

        <View style={styles.courseStats}>
          <View style={styles.ratingBadge}>
            <MaterialIcons name="star" size={12} color="#FF9500" />
            <ThemedText style={styles.ratingText}>4.8</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <ThemedText style={styles.studentCount}>
            {course.enrolledStudents.length} enrolled
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  horizontalCard: {
    width: 240,
    marginRight: 16,
    marginBottom: 8,
  },
  verticalCard: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 16,
    padding: 10,
    alignItems: "center",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  horizontalImage: {
    height: 120,
  },
  verticalImage: {
    width: 85,
    height: 85,
    borderRadius: 14,
  },
  courseInfo: {
    flex: 1,
    padding: 12,
  },
  courseTitle: {
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 6,
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  instructorName: {
    fontSize: 13,
    color: "#8E8E93",
  },
  courseStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#8E8E93",
    marginHorizontal: 8,
    opacity: 0.3,
  },
  studentCount: {
    fontSize: 12,
    color: "#8E8E93",
  },
});
