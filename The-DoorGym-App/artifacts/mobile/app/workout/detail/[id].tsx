import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAdaloWorkout, adaloImageUrl } from "@/hooks/useAdaloApi";
import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { COLORS } from "@/constants/colors";

function stripEmoji(name: string): string {
  return name.replace(/⬇️/g, "").replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim();
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const workoutId = parseInt(id ?? "0", 10);
  const { data: workout, isLoading } = useAdaloWorkout(workoutId);

  const name = workout ? stripEmoji(workout.Name) : "";
  const heroImageUrl = adaloImageUrl(workout?.Image);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader showBack onMenuPress={() => setMenuVisible(true)} />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {!isLoading && workout && (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Hero */}
          <View style={styles.hero}>
            {heroImageUrl ? (
              <Image
                source={{ uri: heroImageUrl }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.heroIconFallback}>
                <Feather name="zap" size={44} color="#ffffff" />
              </View>
            )}
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.workoutName}>{name}</Text>
            {workout.Description ? (
              <Text style={styles.description}>{workout.Description}</Text>
            ) : null}
          </View>

          {/* Start button */}
          <Pressable
            style={styles.startBtn}
            onPress={() =>
              router.push({
                pathname: "/workout/player/[id]",
                params: { id: String(workout.id) },
              } as never)
            }
          >
            <Feather name="play" size={22} color="#ffffff" />
            <Text style={styles.startBtnText}>START WORKOUT</Text>
          </Pressable>
        </ScrollView>
      )}

      {!isLoading && !workout && (
        <View style={styles.center}>
          <Text style={styles.errorText}>Workout not found.</Text>
        </View>
      )}
      <DrawerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  menuBtn: { width: 44, alignItems: "flex-end", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { width: 44, alignItems: "flex-start" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  content: { paddingBottom: 60 },
  hero: {
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroIconFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  workoutName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#222",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#555",
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#222",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    margin: 16,
    borderRadius: 10,
    paddingVertical: 18,
    gap: 10,
  },
  startBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    letterSpacing: 1.5,
  },
  errorText: { color: "#ff3b30", fontFamily: "Inter_400Regular" },
});
