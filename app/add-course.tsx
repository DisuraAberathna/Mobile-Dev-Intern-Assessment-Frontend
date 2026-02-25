import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as courseService from "@/api/course";
import { CustomAlert, AlertType } from "@/components/ui/custom-alert";

export default function AddCourseScreen() {
  const { id } = useLocalSearchParams();
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "error" as AlertType,
  });

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;

  useEffect(() => {
    if (isEditMode) {
      fetchCourseDetails();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const data = await courseService.getCourseById(id as string);
      if (data) {
        setTitle(data.title);
        setDescription(data.description);
        setContent(data.content);
      }
    } catch (error) {
      console.error("Fetch course details failed:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !content) {
      setAlertConfig({
        title: "Missing Fields",
        message: "Please fill in all the details to continue.",
        type: "warning",
      });
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const courseData = { title, description, content };
      const data = isEditMode
        ? await courseService.updateCourse(id as string, courseData)
        : await courseService.createCourse(courseData);

      if (data && (data.course || data._id)) {
        setAlertConfig({
          title: isEditMode ? "Course Updated!" : "Course Created!",
          message: isEditMode
            ? "Your changes have been saved successfully."
            : "Your new course has been successfully published.",
          type: "success",
        });
        setShowAlert(true);
      } else {
        const errorMessage =
          data?.errors && data.errors.length > 0
            ? data.errors[0].message
            : data?.message || "Something went wrong. Please try again.";

        setAlertConfig({
          title: "Operation Failed",
          message: errorMessage,
          type: "error",
        });
        setShowAlert(true);
      }
    } catch (error) {
      setAlertConfig({
        title: "Error",
        message: "An unexpected error occurred. Please check your connection.",
        type: "error",
      });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertConfirm = () => {
    setShowAlert(false);
    if (alertConfig.type === "success") {
      router.back();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={handleAlertConfirm}
      />
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
          <ThemedText type="subtitle">
            {isEditMode ? "Update Course" : "Create New Course"}
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {initialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Course Title</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: Colors[colorScheme].text,
                        backgroundColor:
                          colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
                        borderColor: colorScheme === "dark" ? "#333" : "#eee",
                      },
                    ]}
                    placeholder="e.g. Master React Native"
                    placeholderTextColor="#8e8e93"
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>
                    Short Description
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        color: Colors[colorScheme].text,
                        backgroundColor:
                          colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
                        borderColor: colorScheme === "dark" ? "#333" : "#eee",
                      },
                    ]}
                    placeholder="A brief overview of your course..."
                    placeholderTextColor="#8e8e93"
                    multiline
                    numberOfLines={3}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Detailed Content</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      styles.largeTextArea,
                      {
                        color: Colors[colorScheme].text,
                        backgroundColor:
                          colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
                        borderColor: colorScheme === "dark" ? "#333" : "#eee",
                      },
                    ]}
                    placeholder="Details, chapters, and learning materials..."
                    placeholderTextColor="#8e8e93"
                    multiline
                    numberOfLines={10}
                    value={content}
                    onChangeText={setContent}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: tintColor }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator
                      color={colorScheme === "dark" ? "#000" : "#fff"}
                    />
                  ) : (
                    <ThemedText
                      style={styles.submitButtonText}
                      lightColor="#fff"
                      darkColor="#000"
                    >
                      {isEditMode ? "Save Changes" : "Publish Course"}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  largeTextArea: {
    height: 250,
    textAlignVertical: "top",
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "bold",
  },
});
