import { Feather } from "@expo/vector-icons";
import { useGetWorkout, useGetExercises } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { useColors } from "@/hooks/useColors";

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "#34c759",
  Intermediate: "#ff9f0a",
  Advanced: "#ff3b30",
};

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const workoutQuery = useGetWorkout(id ?? "", { query: { enabled: !!id, queryKey: ["workout", id] } });
  const exercisesQuery = useGetExercises({ limit: 20 });

  const workout = workoutQuery.data;
  const exercises = exercisesQuery.data?.records?.slice(0, workout?.exerciseCount ?? 5) ?? [];

  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom + 16;
  const diffColor = workout?.difficulty ? (DIFFICULTY_COLORS[workout.difficulty] ?? colors.primary) : colors.primary;

  if (workoutQuery.isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <AppHeader showBack onMenuPress={() => setDrawerOpen(true)} />
        <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <AppHeader showBack onMenuPress={() => setDrawerOpen(true)} />
        <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Workout not found</Text>
        <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader showBack onMenuPress={() => setDrawerOpen(true)} />
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Blue title banner */}
      <View style={[styles.titleBanner, { backgroundColor: colors.primary }]}>
        <Text style={[styles.titleBannerText, { color: colors.primaryForeground }]}>
          {workout.name}
        </Text>
        {workout.difficulty && (
          <Text style={[styles.titleBannerSub, { color: colors.primaryForeground + "cc" }]}>
            {workout.difficulty} · {workout.duration} min · {workout.exerciseCount} exercises
          </Text>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats row */}
        <View style={[styles.statsRow, { borderColor: colors.primary }]}>
          <View style={styles.stat}>
            <Feather name="clock" size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{workout.duration}</Text>
            <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>min</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.stat}>
            <Feather name="zap" size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{workout.exerciseCount}</Text>
            <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>exercises</Text>
          </View>
          {workout.calories != null && workout.calories > 0 && (
            <>
              <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
              <View style={styles.stat}>
                <Feather name="activity" size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{workout.calories}</Text>
                <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>kcal</Text>
              </View>
            </>
          )}
        </View>

        {/* Description */}
        {workout.description && (
          <View style={styles.descSection}>
            <Text style={[styles.descTitle, { color: colors.foreground }]}>About this workout</Text>
            <Text style={[styles.desc, { color: colors.mutedForeground }]}>{workout.description}</Text>
          </View>
        )}

        {/* Exercise list */}
        {exercises.length > 0 && (
          <View style={styles.exercisesSection}>
            <View style={[styles.exercisesBanner, { backgroundColor: colors.primary }]}>
              <Text style={[styles.exercisesBannerText, { color: colors.primaryForeground }]}>
                Exercises in this workout
              </Text>
            </View>
            {exercises.map((ex, idx) => (
              <Pressable
                key={ex.id}
                style={({ pressed }) => [
                  styles.exerciseRow,
                  { borderBottomColor: colors.borderLight, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => router.push(`/exercise/${ex.id}` as never)}
              >
                <View style={[styles.exerciseNum, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.exerciseNumText, { color: colors.primary }]}>{idx + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseName, { color: colors.foreground }]}>{ex.name}</Text>
                  {ex.sets && ex.reps && (
                    <Text style={[styles.exerciseSub, { color: colors.mutedForeground }]}>
                      {ex.sets} sets × {ex.reps} reps
                    </Text>
                  )}
                </View>
                <Feather name="play-circle" size={22} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Start Workout button */}
      <View style={[styles.footer, { paddingBottom: bottomPad, borderTopColor: colors.borderLight }]}>
        <Pressable
          style={({ pressed }) => [
            styles.startBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (exercises.length > 0) {
              router.push(`/exercise/${exercises[0].id}` as never);
            }
          }}
        >
          <Feather name="play" size={20} color={colors.primaryForeground} />
          <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>START WORKOUT</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  titleBanner: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
  },
  titleBannerText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  titleBannerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  content: {
    gap: 0,
  },
  statsRow: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderRadius: 8,
    margin: 16,
    overflow: "hidden",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statUnit: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1 },
  descSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  descTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  desc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  exercisesSection: {},
  exercisesBanner: {
    paddingVertical: 12,
    alignItems: "center",
  },
  exercisesBannerText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    backgroundColor: "#fff",
  },
  exerciseNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseNumText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  exerciseInfo: { flex: 1, gap: 2 },
  exerciseName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  exerciseSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    backgroundColor: "#fff",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 8,
  },
  startBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 1 },
});
