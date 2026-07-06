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

import { useEducationLibrary, useEducationCategories, AdaloEducationItem, adaloImageUrl } from "@/hooks/useAdaloApi";
import { useWorkoutType } from "@/context/WorkoutTypeContext";
import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { COLORS } from "@/constants/colors";

const BLUE = "#47B3DD";

function EducationRow({
  item,
  imgWidth,
  onPress,
}: {
  item: AdaloEducationItem;
  imgWidth: number;
  onPress: () => void;
}) {
  const thumbUrl = adaloImageUrl(item.Thumbnail);
  const imgHeight = imgWidth * (9 / 16);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.88 : 1 }]}
      onPress={onPress}
    >
      <Text style={styles.rowTitle}>{item.Name}</Text>
      <View style={[styles.thumbWrap, { width: imgWidth, height: imgHeight }]}>
        {thumbUrl ? (
          <Image
            source={{ uri: thumbUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbPlaceholder} />
        )}
      </View>
    </Pressable>
  );
}

export default function EducationLibraryScreen() {
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const IMG_WIDTH = SCREEN_WIDTH - 24;

  const [menuVisible, setMenuVisible] = useState(false);
  const { data: items, isLoading } = useEducationLibrary();
  const { data: allCategories } = useEducationCategories();
  const { workoutType } = useWorkoutType();

  function handleItemPress(item: AdaloEducationItem) {
    const isOverview = item.Name?.toLowerCase().startsWith("overview");
    if (isOverview) {
      // Skip intermediate screen — go directly to video player
      router.push(`/education/${item.id}?autoplay=1` as never);
      return;
    }
    router.push(`/education/${item.id}` as never);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader showBack onMenuPress={() => setMenuVisible(true)} />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {!isLoading && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.titleBanner}>
            <Text style={styles.titleBannerText}>Education Library</Text>
          </View>

          {(items ?? []).map(item => (
            <EducationRow
              key={item.id}
              item={item}
              imgWidth={IMG_WIDTH}
              onPress={() => handleItemPress(item)}
            />
          ))}

          {(items ?? []).length === 0 && (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No education content found.</Text>
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
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
  },

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
  thumbWrap: {
    overflow: "hidden",
    backgroundColor: "#d0dde8",
  },
  thumbPlaceholder: {
    flex: 1,
    backgroundColor: "#d0dde8",
  },

  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center", fontFamily: "Inter_400Regular" },
});
