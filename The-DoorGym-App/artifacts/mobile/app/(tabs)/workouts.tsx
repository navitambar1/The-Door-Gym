import { Feather } from "@expo/vector-icons";
import { useGetWorkouts } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { useColors } from "@/hooks/useColors";

const DIFFICULTY_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

const PLACEHOLDER_COLORS = [
  "#e8f6fc", "#d4edda", "#fff3cd", "#f8d7da",
  "#d1ecf1", "#e2e3e5", "#fde8d8", "#eae8ff",
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "#34c759",
  Intermediate: "#ff9f0a",
  Advanced: "#ff3b30",
};

export default function WorkoutsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const query = useGetWorkouts({ limit: 50 });
  const workouts = query.data?.records ?? [];

  const filtered = workouts.filter(w =>
    selectedDifficulty === "All" || w.difficulty === selectedDifficulty
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom + 16;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader showBack={false} onMenuPress={() => setDrawerOpen(true)} />
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Blue Banner */}
      <View style={[styles.banner, { backgroundColor: colors.primary }]}>
        <Text style={[styles.bannerText, { color: colors.primaryForeground }]}>SELECT YOUR WORKOUT</Text>
      </View>

      {/* Difficulty filter */}
      <View style={[styles.filterRow, { borderBottomColor: colors.borderLight }]}>
        {DIFFICULTY_OPTIONS.map(opt => {
          const isActive = selectedDifficulty === opt;
          const diffColor = DIFFICULTY_COLORS[opt];
          return (
            <Pressable
              key={opt}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive
                    ? (diffColor ?? colors.primary)
                    : colors.muted,
                  borderColor: isActive
                    ? (diffColor ?? colors.primary)
                    : colors.borderLight,
                },
              ]}
              onPress={() => setSelectedDifficulty(opt)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? "#fff" : colors.foreground },
                ]}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {query.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.grid, { paddingBottom: bottomPad }]}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="inbox" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No workouts found
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const diffColor = item.difficulty ? DIFFICULTY_COLORS[item.difficulty] : null;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.tile,
                  { borderColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => router.push(`/workout/${item.id}` as never)}
              >
                <View
                  style={[
                    styles.tileImage,
                    { backgroundColor: PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length] },
                  ]}
                >
                  <Feather name="zap" size={40} color={colors.primary} />
                  {item.difficulty && (
                    <View
                      style={[
                        styles.diffBadge,
                        { backgroundColor: diffColor ?? colors.primary },
                      ]}
                    >
                      <Text style={styles.diffBadgeText}>{item.difficulty}</Text>
                    </View>
                  )}
                  <View style={styles.durationBadge}>
                    <Feather name="clock" size={11} color="#fff" />
                    <Text style={styles.durationText}>{item.duration}m</Text>
                  </View>
                </View>
                <Text style={[styles.tileLabel, { color: colors.foreground }]} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.category && (
                  <Text style={[styles.tileSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.category}
                  </Text>
                )}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    paddingVertical: 14,
    alignItems: "center",
  },
  bannerText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
  },
  filterText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  grid: {
    padding: 8,
  },
  row: {
    gap: 0,
  },
  tile: {
    flex: 1,
    margin: 6,
    borderRadius: 0,
    overflow: "visible",
    backgroundColor: "transparent",
  },
  tileImage: {
    aspectRatio: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  diffBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  diffBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  tileLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 8,
    paddingTop: 8,
    lineHeight: 18,
  },
  tileSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    paddingTop: 80,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
