import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

interface AppHeaderProps {
  showBack?: boolean;
  onMenuPress?: () => void;
}

export function AppHeader({ showBack = false, onMenuPress }: AppHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.side}>
          {showBack && (
            <Pressable
              style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => router.back()}
              hitSlop={8}
            >
              <Feather name="arrow-left" size={24} color="#222222" />
            </Pressable>
          )}
        </View>

        <Image
          source={require("../assets/images/logo_icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={[styles.side, styles.sideRight]}>
          {onMenuPress && (
            <Pressable
              style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
              onPress={onMenuPress}
              hitSlop={8}
            >
              <Feather name="menu" size={26} color="#222222" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 12,
  },
  side: {
    width: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  iconBtn: {
    padding: 4,
  },
  logo: {
    flex: 1,
    height: 40,
  },
});
