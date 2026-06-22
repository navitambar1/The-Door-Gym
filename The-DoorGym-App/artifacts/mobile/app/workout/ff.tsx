import { useLocalSearchParams, useRouter } from "expo-router";
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
import { Feather } from "@expo/vector-icons";

import { useWorkoutNames, AdaloWorkoutName, adaloImageUrl } from "@/hooks/useAdaloApi";
import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { COLORS } from "@/constants/colors";

const BLUE = "#47B3DD";

const FF_TITLE: Record<string, string> = {
  FF: "Functional Fitness",
  "FF+": "Functional Fitness Plus",
};

function WorkoutNameCard({
  item,
  cardW,
  onPress,
}: {
  item: AdaloWorkoutName;
  cardW: number;
  onPress: () => void;
}) {
  const imgUrl = adaloImageUrl(item.Image);
  const displayName = item["Display Name"] ?? item.Name;

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
            <Feather name="zap" size={32} color={BLUE} />
          </View>
        )}
      </View>

      {/* Name below image */}
      <Text style={styles.cardName} numberOfLines={2}>{displayName}</Text>
    </Pressable>
  );
}

export default function FFLibraryScreen() {
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const GAP = 12;
  const H_PAD = 12;
  const CARD_W = (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2;

  const [menuVisible, setMenuVisible] = useState(false);
  const { type } = useLocalSearchParams<{ type: string }>();
  const packageType = type ?? "FF";

  const { data: workoutNames, isLoading } = useWorkoutNames(packageType);

  const handleSelect = (item: AdaloWorkoutName) => {
    const displayName = item["Display Name"] ?? item.Name;
    router.push({
      pathname: "/workout/list/[typeId]",
      params: {
        typeId: String(item.id),
        title: `${displayName} – ${FF_TITLE[packageType] ?? packageType}`,
      },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader showBack onMenuPress={() => setMenuVisible(true)} />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading workout levels...</Text>
        </View>
      )}

      {!isLoading && (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Page title banner */}
          <View style={styles.titleBanner}>
            <Text style={styles.titleBannerText}>
              {FF_TITLE[packageType] ?? packageType}{"\n"}Select Workout
            </Text>
          </View>

          {/* Section header */}
          <Text style={styles.sectionLabel}>Select a Category</Text>

          {/* Grid */}
          <View style={styles.grid}>
            {(workoutNames ?? []).map(item => (
              <WorkoutNameCard
                key={item.id}
                item={item}
                cardW={CARD_W}
                onPress={() => handleSelect(item)}
              />
            ))}
          </View>

          {(workoutNames ?? []).length === 0 && (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No workout levels found.</Text>
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
    color: "#222",
    textAlign: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "transparent",
  },

  emptyWrap: { padding: 32, alignItems: "center" },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center", fontFamily: "Inter_400Regular" },
});
