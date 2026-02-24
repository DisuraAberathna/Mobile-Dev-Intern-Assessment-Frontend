import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type AlertType = "info" | "success" | "error" | "warning";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function CustomAlert({
  visible,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText,
  onConfirm,
  onCancel,
}: CustomAlertProps) {
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;

  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
    }
  }, [visible]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return { icon: "check-circle", color: "#34c759" };
      case "error":
        return { icon: "error", color: "#ff3b30" };
      case "warning":
        return { icon: "warning", color: "#ffcc00" };
      default:
        return { icon: "info", color: tintColor };
    }
  };

  const { icon, color } = getTypeStyles();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.alertBox,
            { backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#ffffff" },
          ]}
        >
          <View
            style={[styles.iconContainer, { backgroundColor: color + "15" }]}
          >
            <MaterialIcons name={icon as any} size={40} color={color} />
          </View>

          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>

          <View style={styles.buttonContainer}>
            {cancelText && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <ThemedText style={styles.cancelButtonText}>
                  {cancelText}
                </ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: color }]}
              onPress={onConfirm}
            >
              <ThemedText style={styles.confirmButtonText}>
                {confirmText}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertBox: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "rgba(142, 142, 147, 0.12)",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.8,
  },
});
