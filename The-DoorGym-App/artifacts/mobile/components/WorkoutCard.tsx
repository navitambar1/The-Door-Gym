import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface WorkoutCardProps {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty?: string | null;
  category?: string | null;
  exerciseCount: number;
  calories?: number | null;
  compact?: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "#34c759",
  Intermediate: "#ff9f0a",
  Advanced: "#ff453a",
};

export function WorkoutCard({
  id,
  name,
  description,
  duration,
  difficulty,
  category,
  exerciseCount,
  calories,
  compact = false,
}: WorkoutCardProps) {
  const colors = useColors();
  const router = useRouter();
  const diffColor = difficulty ? (DIFFICULTY_COLORS[difficulty] ?? colors.mutedForeground) : colors.mutedForeground;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => router.push(`/workout/${id}`)}
    >
      <View style={styles.topRow}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>{category ?? "Workout"}</Text>
        </View>
        {difficulty && (
          <View style={[styles.diffBadge, { backgroundColor: diffColor + "22" }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>{difficulty}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
        {name}
      </Text>

      {!compact && (
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {description}
        </Text>
      )}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>{duration} min</Text>
        </View>
        <View style={styles.stat}>
          <Feather name="zap" size={13} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>{exerciseCount} exercises</Text>
        </View>
        {calories != null && calories > 0 && (
          <View style={styles.stat}>
            <Feather name="activity" size={13} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>{calories} kcal</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  diffText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
