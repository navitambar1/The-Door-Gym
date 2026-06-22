import { Feather } from "@expo/vector-icons";
import { useGetExercise, useGetExercises } from "@workspace/api-client-react";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MUSCLE_ACCENT: Record<string, string> = {
  Chest: "#ff6b6b",
  Back: "#4ecdc4",
  Legs: "#45b7d1",
  Shoulders: "#96ceb4",
  Arms: "#ffd93d",
  Core: "#fd79a8",
};

export default function ExercisePlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  // Load the current exercise
  const exerciseQuery = useGetExercise(id ?? "", { query: { enabled: !!id, queryKey: ["exercise", id] } });
  const exercise = exerciseQuery.data;

  // Load all exercises for BACK/NEXT navigation
  const allQuery = useGetExercises({ limit: 50 });
  const allExercises = allQuery.data?.records ?? [];

  // Find current index and adjacent exercises
  const currentIndex = allExercises.findIndex(e => e.id === id);
  const prevExercise = currentIndex > 0 ? allExercises[currentIndex - 1] : null;
  const nextExercise = currentIndex >= 0 && currentIndex < allExercises.length - 1
    ? allExercises[currentIndex + 1]
    : null;

  const muscleColor = exercise?.muscleGroup
    ? (MUSCLE_ACCENT[exercise.muscleGroup] ?? "#47B3DD")
    : "#47B3DD";

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom + 16;

  if (exerciseQuery.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#47B3DD" size="large" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Exercise not found</Text>
        <Pressable style={styles.exitBtn} onPress={() => router.back()}>
          <Text style={styles.exitBtnText}>EXIT</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      {/* EXIT button — top right */}
      <View style={styles.topControls}>
        <Pressable
          style={({ pressed }) => [styles.circleBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.circleBtnText}>EXIT</Text>
        </Pressable>
      </View>

      {/* Exercise image/placeholder */}
      <View style={styles.imageArea}>
        <View style={[styles.imagePlaceholder, { backgroundColor: muscleColor + "22", borderColor: muscleColor }]}>
          <Feather name="activity" size={64} color={muscleColor} />
          <View style={styles.overlayText}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.muscleGroup && (
              <Text style={[styles.exerciseMuscle, { color: muscleColor }]}>{exercise.muscleGroup}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Description area */}
      <View style={styles.infoArea}>
        {exercise.sets && exercise.reps && (
          <View style={styles.targetRow}>
            <View style={styles.targetChip}>
              <Text style={styles.targetLabel}>SETS</Text>
              <Text style={styles.targetValue}>{exercise.sets}</Text>
            </View>
            <View style={styles.targetChip}>
              <Text style={styles.targetLabel}>REPS</Text>
              <Text style={styles.targetValue}>{exercise.reps}</Text>
            </View>
            {exercise.equipment && (
              <View style={[styles.targetChip, styles.equipChip]}>
                <Feather name="tool" size={12} color="#aaa" />
                <Text style={styles.equipText}>{exercise.equipment}</Text>
              </View>
            )}
          </View>
        )}
        <ScrollView style={styles.descScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.descText}>{exercise.description}</Text>
        </ScrollView>
      </View>

      {/* BACK / NEXT buttons */}
      <View style={styles.bottomControls}>
        <Pressable
          style={({ pressed }) => [
            styles.circleBtn,
            !prevExercise && styles.circleBtnDisabled,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          disabled={!prevExercise}
          onPress={() => prevExercise && router.replace(`/exercise/${prevExercise.id}` as never)}
        >
          <Text style={[styles.circleBtnText, !prevExercise && styles.circleBtnTextDisabled]}>BACK</Text>
        </Pressable>

        <View style={styles.progressDots}>
          {currentIndex >= 0 && allExercises.length > 0 && (
            <Text style={styles.progressText}>
              {currentIndex + 1} / {allExercises.length}
            </Text>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.circleBtn,
            !nextExercise && styles.circleBtnDisabled,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          disabled={!nextExercise}
          onPress={() => nextExercise && router.replace(`/exercise/${nextExercise.id}` as never)}
        >
          <Text style={[styles.circleBtnText, !nextExercise && styles.circleBtnTextDisabled]}>NEXT</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "space-between",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  imageArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    position: "relative",
  },
  overlayText: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    gap: 2,
  },
  exerciseName: {
    color: "#ffffff",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  exerciseMuscle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  infoArea: {
    paddingHorizontal: 20,
    maxHeight: 180,
    gap: 12,
  },
  targetRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  targetChip: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    gap: 2,
    minWidth: 64,
  },
  equipChip: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingVertical: 10,
  },
  targetLabel: {
    color: "#888",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  targetValue: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  equipText: {
    color: "#aaa",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  descScroll: {
    flex: 1,
  },
  descText: {
    color: "#cccccc",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "center",
    paddingBottom: 8,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  circleBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#47B3DD",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  circleBtnDisabled: {
    borderColor: "#333333",
  },
  circleBtnText: {
    color: "#47B3DD",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  circleBtnTextDisabled: {
    color: "#333333",
  },
  progressDots: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    color: "#888888",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  exitBtn: {
    marginTop: 20,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#47B3DD",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  exitBtnText: {
    color: "#47B3DD",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
});
