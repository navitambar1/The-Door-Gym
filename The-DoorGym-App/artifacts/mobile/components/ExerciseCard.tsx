import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface ExerciseCardProps {
  id: string;
  name: string;
  description: string;
  muscleGroup?: string | null;
  sets?: number | null;
  reps?: string | null;
  duration?: number | null;
  equipment?: string | null;
}

const MUSCLE_COLORS: Record<string, string> = {
  Chest: "#ff6b6b",
  Back: "#4ecdc4",
  Legs: "#45b7d1",
  Shoulders: "#96ceb4",
  Arms: "#ffeaa7",
  Core: "#fd79a8",
  Cardio: "#fdcb6e",
  Flexibility: "#6c5ce7",
};

export function ExerciseCard({
  id,
  name,
  description,
  muscleGroup,
  sets,
  reps,
  duration,
  equipment,
}: ExerciseCardProps) {
  const colors = useColors();
  const router = useRouter();
  const muscleColor = muscleGroup ? (MUSCLE_COLORS[muscleGroup] ?? colors.primary) : colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => router.push(`/exercise/${id}`)}
    >
      <View style={[styles.accentBar, { backgroundColor: muscleColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {name}
          </Text>
          {muscleGroup && (
            <View style={[styles.muscleBadge, { backgroundColor: muscleColor + "22" }]}>
              <Text style={[styles.muscleText, { color: muscleColor }]}>{muscleGroup}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {description}
        </Text>

        <View style={styles.statsRow}>
          {sets != null && sets > 0 && (
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{sets}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>sets</Text>
            </View>
          )}
          {reps && (
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{reps}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>reps</Text>
            </View>
          )}
          {duration != null && duration > 0 && (
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{duration}s</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>hold</Text>
            </View>
          )}
          {equipment && (
            <View style={[styles.equipBadge, { backgroundColor: colors.secondary }]}>
              <Feather name="tool" size={11} color={colors.mutedForeground} />
              <Text style={[styles.equipText, { color: colors.mutedForeground }]}>{equipment}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  muscleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  muscleText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  desc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  equipBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginLeft: "auto",
  },
  equipText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
