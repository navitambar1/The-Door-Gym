import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExerciseCategories, AdaloExerciseCategory, adaloImageUrl } from "@/hooks/useAdaloApi";
import { useWorkoutType } from "@/context/WorkoutTypeContext";
import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { COLORS } from "@/constants/colors";

const BLUE = "#47B3DD";

function CategoryCard({
  cat,
  cardW,
  onPress,
}: {
  cat: AdaloExerciseCategory;
  cardW: number;
  onPress: () => void;
}) {
  const imgUrl = adaloImageUrl(cat.Image);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { width: cardW, opacity: pressed ? 0.88 : 1 }]}
      onPress={onPress}
    >
      {/* Photo */}
      <View style={styles.cardPhoto}>
        {imgUrl ? (
          <Image
            source={{ uri: imgUrl }}
            style={styles.cardPhotoImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cardPhotoPlaceholder}>
            <Feather name="activity" size={32} color={BLUE} />
          </View>
        )}
      </View>

      {/* Name below image */}
      <Text style={styles.cardName} numberOfLines={2}>{cat.Name}</Text>
    </Pressable>
  );
}

export default function ExercisesScreen() {
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const GAP = 12;
  const H_PAD = 12;
  const CARD_W = (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2;
  const [menuVisible, setMenuVisible] = useState(false);
  const { workoutType, currentPackage } = useWorkoutType();
  const { data: categories, isLoading } = useExerciseCategories(workoutType ?? undefined);

  const mainCategories = categories?.filter(c => c.Grouping !== "G1") ?? [];
  const g1Categories = categories?.filter(c => c.Grouping === "G1") ?? [];

  const libraryTitle = workoutType
    ? `${currentPackage?.label ?? workoutType} Exercise Library`
    : "Exercise Library";

  function navToCategory(cat: AdaloExerciseCategory) {
    router.push({
      pathname: `/exercises/[categoryId]` as const,
      params: { categoryId: String(cat.id), name: cat.Name },
    } as never);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader showBack onMenuPress={() => setMenuVisible(true)} />

      {!workoutType && (
        <View style={styles.center}>
          <Feather name="package" size={48} color={BLUE} />
          <Text style={styles.noPackageText}>Please select a package first.</Text>
          <Pressable style={styles.pkgBtn} onPress={() => router.push("/package" as never)}>
            <Text style={styles.pkgBtnText}>Select Package</Text>
          </Pressable>
        </View>
      )}

      {workoutType && isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading categories…</Text>
        </View>
      )}

      {workoutType && !isLoading && (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Page title banner */}
          <View style={styles.titleBanner}>
            <Text style={styles.titleBannerText}>{libraryTitle}</Text>
          </View>

          {/* Section header */}
          <Text style={styles.sectionLabel}>Select a Category</Text>

          {/* Main categories grid */}
          <View style={styles.grid}>
            {mainCategories.map(cat => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                cardW={CARD_W}
                onPress={() => navToCategory(cat)}
              />
            ))}
          </View>

          {/* G1 / Featured */}
          {g1Categories.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Featured</Text>
              <View style={styles.grid}>
                {g1Categories.map(cat => (
                  <CategoryCard
                    key={cat.id}
                    cat={cat}
                    cardW={CARD_W}
                    onPress={() => navToCategory(cat)}
                  />
                ))}
              </View>
            </>
          )}

          {mainCategories.length === 0 && g1Categories.length === 0 && (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No categories found for your package.</Text>
            </View>
          )}
        </ScrollView>
      )}

      <DrawerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },

  noPackageText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#555",
    textAlign: "center",
  },
  pkgBtn: {
    backgroundColor: BLUE,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  pkgBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  loadingText: { color: COLORS.muted, fontFamily: "Inter_400Regular" },

  scroll: { paddingBottom: 60 },

  titleBanner: {
    backgroundColor: BLUE,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  titleBannerText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
  },

  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#666",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 10,
    marginHorizontal: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 12,
  },

  /* Card */
  card: {
    borderRadius: 0,
    overflow: "visible",
    backgroundColor: "transparent",
  },
  cardPhoto: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "transparent",
    overflow: "visible",
  },
  cardPhotoImage: {
    width: "100%",
    height: "100%",
  },
  cardPhotoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e8ee",
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#111111",
    textAlign: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: "transparent",  // label sits below card, not inside it
  },

  emptyWrap: { padding: 32, alignItems: "center" },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center", fontFamily: "Inter_400Regular" },
});
