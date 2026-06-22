import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAdaloWorkouts, AdaloWorkout, adaloImageUrl } from "@/hooks/useAdaloApi";
import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { COLORS } from "@/constants/colors";

const BLUE = "#47B3DD";

function WorkoutRow({
  workout,
  imgWidth,
  onPress,
}: {
  workout: AdaloWorkout;
  imgWidth: number;
  onPress: () => void;
}) {
  const imgUrl = adaloImageUrl(workout.Image);
  const imgHeight = imgWidth * (9 / 16); // landscape 16:9

  return (
    <Pressable
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.88 : 1 }]}
      onPress={onPress}
    >
      {/* Workout name */}
      <Text style={styles.rowTitle}>{workout.Name}</Text>

      {/* Full-width image */}
      <View style={[styles.rowImage, { width: imgWidth, height: imgHeight }]}>
        {imgUrl ? (
          <Image
            source={{ uri: imgUrl }}
            style={[StyleSheet.absoluteFillObject, styles.img]}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.rowImagePlaceholder}>
            <Feather name="zap" size={36} color={BLUE} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function WorkoutListScreen() {
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const IMG_WIDTH = SCREEN_WIDTH - 24;

  const [menuVisible, setMenuVisible] = useState(false);
  const { typeId, title } = useLocalSearchParams<{ typeId: string; title?: string }>();

  const numTypeId = parseInt(typeId ?? "0", 10);
  const { data: workouts, isLoading, refetch } = useAdaloWorkouts(numTypeId);

  const pageTitle = title ?? "Select Workout";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader showBack onMenuPress={() => setMenuVisible(true)} />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading workouts...</Text>
        </View>
      )}

      {!isLoading && (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor={BLUE}
            />
          }
        >
          {/* Blue title banner */}
          <View style={styles.titleBanner}>
            <Text style={styles.titleBannerText}>{pageTitle}</Text>
          </View>

          {/* Workout rows */}
          {(workouts ?? []).map(w => (
            <WorkoutRow
              key={w.id}
              workout={w}
              imgWidth={IMG_WIDTH}
              onPress={() =>
                router.push({
                  pathname: "/workout/detail/[id]",
                  params: { id: String(w.id) },
                } as never)
              }
            />
          ))}

          {(workouts ?? []).length === 0 && (
            <View style={styles.emptyWrap}>
              <Feather name="inbox" size={48} color={COLORS.primary} />
              <Text style={styles.emptyText}>No workouts found.</Text>
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

  /* Each workout: name then image */
  row: {
    paddingTop: 20,
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  rowTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 10,
  },
  rowImage: {
    overflow: "hidden",
    backgroundColor: "#e0e8ee",
  },
  img: {},
  rowImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyWrap: { padding: 32, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center", fontFamily: "Inter_400Regular" },
});
