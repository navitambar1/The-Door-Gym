import { Feather } from "@expo/vector-icons";
import { useGetExercises } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { useColors } from "@/hooks/useColors";

const MUSCLE_GROUPS = [
  { label: "Chest", icon: "chevrons-up", color: "#ffd6d6" },
  { label: "Back", icon: "layers", color: "#d6eaff" },
  { label: "Legs", icon: "trending-down", color: "#d6ffd6" },
  { label: "Shoulders", icon: "triangle", color: "#ffecd6" },
  { label: "Arms", icon: "zap", color: "#ffffd6" },
  { label: "Core", icon: "crosshair", color: "#f0d6ff" },
];

const PLACEHOLDER_COLORS = ["#ffd6d6", "#d6eaff", "#d6ffd6", "#ffecd6", "#ffffd6", "#f0d6ff"];

export default function ExercisesScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const query = useGetExercises({ limit: 50 });
  const exercises = query.data?.records ?? [];

  const filtered = exercises.filter(e => {
    const matchGroup = !selectedGroup || e.muscleGroup === selectedGroup;
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

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
        <Text style={[styles.bannerText, { color: colors.primaryForeground }]}>EXERCISE LIBRARY</Text>
      </View>

      {/* Muscle Group Grid */}
      {!selectedGroup ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <View style={styles.grid}>
            {MUSCLE_GROUPS.map((group, idx) => (
              <Pressable
                key={group.label}
                style={({ pressed }) => [
                  styles.tile,
                  { borderColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => setSelectedGroup(group.label)}
              >
                <View style={[styles.tileImage, { backgroundColor: PLACEHOLDER_COLORS[idx] }]}>
                  <Feather name={group.icon as never} size={44} color={colors.primary} />
                </View>
                <Text style={[styles.tileLabel, { color: colors.foreground }]}>{group.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* Exercise List for selected muscle group */
        <View style={{ flex: 1 }}>
          {/* Sub-banner with back to categories */}
          <View style={[styles.subBanner, { backgroundColor: colors.secondary, borderBottomColor: colors.primary }]}>
            <Pressable
              style={({ pressed }) => [styles.backToCats, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => setSelectedGroup(null)}
            >
              <Feather name="chevron-left" size={18} color={colors.primary} />
              <Text style={[styles.backToCatsText, { color: colors.primary }]}>All Categories</Text>
            </Pressable>
            <Text style={[styles.subBannerTitle, { color: colors.foreground }]}>{selectedGroup}</Text>
          </View>

          {/* Search */}
          <View style={[styles.searchContainer, { borderBottomColor: colors.borderLight }]}>
            <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
              <Feather name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder={`Search ${selectedGroup} exercises…`}
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                </Pressable>
              )}
            </View>
          </View>

          {query.isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              contentContainerStyle={{ padding: 12, paddingBottom: bottomPad }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
              }
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Feather name="inbox" size={40} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    No {selectedGroup} exercises found
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.exerciseRow,
                    { borderColor: colors.borderLight, opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={() => router.push(`/exercise/${item.id}` as never)}
                >
                  <View style={[styles.exerciseIconBox, { backgroundColor: colors.secondary }]}>
                    <Feather name="activity" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseName, { color: colors.foreground }]}>{item.name}</Text>
                    {item.sets && item.reps && (
                      <Text style={[styles.exerciseSub, { color: colors.mutedForeground }]}>
                        {item.sets} sets × {item.reps} reps
                        {item.equipment ? ` · ${item.equipment}` : ""}
                      </Text>
                    )}
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.primary} />
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  bannerText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  scroll: { flexGrow: 1 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  tile: {
    width: "50%",
    padding: 6,
  },
  tileImage: {
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    paddingVertical: 8,
  },
  subBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    gap: 12,
  },
  backToCats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  backToCatsText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  subBannerTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    textAlign: "center",
    marginRight: 60,
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  exerciseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  exerciseSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    paddingTop: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
