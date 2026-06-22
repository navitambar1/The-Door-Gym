import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { PACKAGES, WorkoutType, useWorkoutType } from "@/context/WorkoutTypeContext";

const PACKAGE_IMAGES: Record<WorkoutType, ImageSourcePropType> = {
  ES: require("../assets/images/essential1.png") as ImageSourcePropType,
  "ES+": require("../assets/images/essential_plus.png") as ImageSourcePropType,
  FF: require("../assets/images/functional1.png") as ImageSourcePropType,
  "FF+": require("../assets/images/functional_plus.png") as ImageSourcePropType,
};

const PACKAGE_DESCRIPTIONS: { code: WorkoutType; label: string; desc: string }[] = [
  { code: "ES", label: "Essential Strength", desc: "Base package, does not include any of the above mentioned items" },
  { code: "ES+", label: "Essential Strength Plus", desc: "comes with Better Band" },
  { code: "FF", label: "Functional Fitness", desc: "comes with Suspension Straps and Core Sliders" },
  { code: "FF+", label: "Functional Fitness Plus", desc: "comes with Suspension Straps, Core Sliders and Better Band" },
];

const COL_GAP = 10;
const ROW_GAP = 10;
const H_PAD = 12;

export default function PackageScreen() {
  const router = useRouter();
  const { setWorkoutType } = useWorkoutType();
  const [menuVisible, setMenuVisible] = useState(false);
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Exact pixel size: screen minus left pad, right pad, and one column gap — divided by 2
  const cardSize = Math.floor((SCREEN_WIDTH - H_PAD * 2 - COL_GAP) / 2);

  async function handleSelect(code: WorkoutType) {
    await setWorkoutType(code);
    router.replace("/dashboard");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader onMenuPress={() => setMenuVisible(true)} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBanner}>
          <Text style={styles.titleBannerText}>Select Your Package</Text>
        </View>

        {/* 2-column grid using FlatList — most reliable layout on all iOS versions */}
        <FlatList
          data={PACKAGES}
          keyExtractor={(pkg) => pkg.code}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: H_PAD, paddingTop: 14 }}
          columnWrapperStyle={{ gap: COL_GAP, marginBottom: ROW_GAP }}
          renderItem={({ item: pkg }) => (
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              onPress={() => handleSelect(pkg.code)}
            >
              <Image
                source={PACKAGE_IMAGES[pkg.code]}
                style={{ width: cardSize, height: cardSize }}
                resizeMode="contain"
              />
              <Text style={[styles.tileLabel, { width: cardSize }]}>{pkg.label}</Text>
            </Pressable>
          )}
        />

        <Text style={styles.hintText}>
          If you don&apos;t know which package you have see below {"  "}
          <Text style={styles.downArrow}>⬇️</Text>
        </Text>

        <Image
          source={require("../assets/images/essential_strength.jpg")}
          style={{
            width: SCREEN_WIDTH - 24,
            height: (SCREEN_WIDTH - 24) * 1.1,
            alignSelf: "center",
            marginTop: 12,
            marginBottom: 8,
          }}
          resizeMode="contain"
        />

        <View style={styles.descSection}>
          {PACKAGE_DESCRIPTIONS.map((item) => (
            <Text key={item.code} style={styles.descRow}>
              <Text style={styles.descBold}>{item.label}</Text>
              {" — "}
              {item.desc}
            </Text>
          ))}
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>NOTES —</Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>●</Text>
            <Text style={styles.bulletText}>
              The above mentioned items are available for sale individually on the website if you want to upgrade your package.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>●</Text>
            <Text style={styles.bulletText}>
              The Better Band is a unique Hip Stability Band that is easy to put on. If you don&apos;t have one, you can use a regular Hip Stability Band and still choose the Plus option of your package.
            </Text>
          </View>
        </View>
      </ScrollView>

      <DrawerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  scroll: { paddingBottom: 50 },

  titleBanner: { backgroundColor: "#47B3DD", paddingVertical: 16, alignItems: "center" },
  titleBannerText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: 0.5 },

  tileLabel: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#111111",
    textAlign: "center",
  },

  hintText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#222",
    textAlign: "center",
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 4,
    lineHeight: 24,
  },
  downArrow: { fontSize: 18 },

  descSection: { paddingHorizontal: 20, marginTop: 8, gap: 14 },
  descRow: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#222", lineHeight: 22 },
  descBold: { fontFamily: "Inter_700Bold" },

  notesSection: { paddingHorizontal: 20, marginTop: 22, gap: 12 },
  notesTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#222", marginBottom: 4 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bullet: { fontSize: 18, color: "#222", lineHeight: 24 },
  bulletText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: "#222", lineHeight: 22 },
});
