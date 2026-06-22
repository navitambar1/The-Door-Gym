import { Feather } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

type FeatherIconName = "home" | "info" | "book" | "package" | "play" | "settings" | "shopping-bag" | "x" | "chevron-right";

const MENU_ITEMS: Array<{
  icon: FeatherIconName;
  label: string;
  route?: string;
  action?: () => void;
}> = [
  { icon: "home", label: "Home", route: "/dashboard" },
  { icon: "info", label: "App Instructions", route: "/app-instructions" },
  { icon: "book", label: "Education", route: "/education" },
  { icon: "package", label: "Select Package", route: "/package" },
  { icon: "play", label: "Start Workout", route: "/workout" },
  { icon: "settings", label: "DoorGym Setup", route: "/setup" },
  { icon: "shopping-bag", label: "Shop Website", action: () => WebBrowser.openBrowserAsync("https://thedoorgym.com/") },
];

const SCREEN_WIDTH = Dimensions.get("window").width;

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const colors = useColors();
  const router = useRouter();
  const pathname = usePathname();
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: false }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 280, useNativeDriver: false }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SCREEN_WIDTH, duration: 220, useNativeDriver: false }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: false }),
      ]).start();
    }
  }, [visible]);

  const handleNavigate = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as never), 50);
  };

  const handleItem = (item: typeof MENU_ITEMS[0]) => {
    onClose();
    if (item.action) {
      setTimeout(() => item.action!(), 50);
    } else if (item.route) {
      setTimeout(() => router.push(item.route as never), 50);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.drawer,
          { backgroundColor: colors.background, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={[styles.drawerHeader, { backgroundColor: "#47B3DD" }]}>
          <Text style={styles.drawerLogoText}>THE DOOR GYM</Text>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={onClose}
          >
            <Feather name="x" size={24} color="#ffffff" />
          </Pressable>
        </View>

        <View style={styles.menuItems}>
          {MENU_ITEMS.filter(item => !item.route || item.route !== pathname).map(item => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuItem,
                { borderBottomColor: colors.muted, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => handleItem(item)}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#e8f6fc" }]}>
                <Feather name={item.icon} size={18} color="#47B3DD" />
              </View>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "78%",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  drawerLogoText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    letterSpacing: 2,
  },
  closeBtn: {
    padding: 4,
  },
  menuItems: {
    paddingTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});
