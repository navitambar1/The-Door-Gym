import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEducationCategoriesForItem } from "@/hooks/useAdaloApi";
import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { COLORS } from "@/constants/colors";

const BLUE = "#47B3DD";

const TYPE_LABEL: Record<string, string> = {
  ES: "Essential Strength",
  "ES+": "Essential Strength+",
  FF: "Functional Fitness",
  "FF+": "Functional Fitness+",
};

export default function EducationCategoryScreen() {
  const { educationItemId, name } = useLocalSearchParams<{
    educationItemId: string;
    name?: string;
  }>();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const itemId = parseInt(educationItemId ?? "0", 10);
  const { data: categories, isLoading } = useEducationCategoriesForItem(itemId);

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
            <Text style={styles.titleBannerText}>{name ?? "Education"}</Text>
          </View>

          <Text style={styles.subtitle}>Choose your programme</Text>

          {(categories ?? []).map(cat => (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() =>
                router.push(
                  `/education/videos/${cat.id}?name=${encodeURIComponent(cat.Name)}` as never
                )
              }
            >
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>{cat["Library Type"]}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>
                  {TYPE_LABEL[cat["Library Type"]] ?? cat["Library Type"]}
                </Text>
                <Text style={styles.cardSubtitle}>{cat.Name}</Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </Pressable>
          ))}

          {(categories ?? []).length === 0 && (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No subcategories found.</Text>
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
  emptyText: { color: COLORS.muted, textAlign: "center", fontFamily: "Inter_400Regular" },

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

  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: "#f4f8fb",
    borderWidth: 1,
    borderColor: "#dce8f0",
    overflow: "hidden",
  },
  cardBadge: {
    width: 56,
    alignSelf: "stretch",
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#222",
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.muted,
    marginTop: 2,
  },
  cardArrow: {
    fontSize: 24,
    color: "#aaa",
    paddingRight: 14,
  },
});
