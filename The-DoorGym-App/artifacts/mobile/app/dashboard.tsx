import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { useWorkoutType } from "@/context/WorkoutTypeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 10;
const H_PAD = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2;
const IMAGE_HEIGHT = CARD_WIDTH * 1.05;

interface DashboardTile {
  id: string;
  label: string;
  image: ImageSourcePropType;
  route?: string;
  action?: () => void;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { workoutType } = useWorkoutType();

  const TILES: DashboardTile[] = [
    {
      id: "instructions",
      label: "App Instructions",
      image: require("../assets/images/newinstructions.jpg"),
      route: "/app-instructions",
    },
    {
      id: "education",
      label: "Education",
      image: require("../assets/images/neweducation.jpg"),
      route: "/education",
    },
    {
      id: "exercise",
      label: "Exercise Library",
      image: require("../assets/images/newexerciselibrary.jpg"),
      route: "/exercises",
    },
    {
      id: "workout",
      label: "Start Workout",
      image: require("../assets/images/newstartworkout.jpg"),
      route: "/workout",
    },
    {
      id: "setup",
      label: "Setup Videos",
      image: require("../assets/images/doorgymsetup.jpg"),
      route: "/setup",
    },
    {
      id: "shop",
      label: "Shop Website",
      image: require("../assets/images/shopping.jpg"),
      action: () => WebBrowser.openBrowserAsync("https://thedoorgym.com/"),
    },
  ];

  const handleTile = (tile: DashboardTile) => {
    if (tile.action) {
      tile.action();
    } else if (tile.route) {
      router.push(tile.route as never);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader onMenuPress={() => setDrawerOpen(true)} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {TILES.map((tile) => (
            <Pressable
              key={tile.id}
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => handleTile(tile)}
            >
              <View style={styles.imageBox}>
                <Image
                  source={tile.image}
                  style={styles.tileImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  headerLogo: {
    width: 160,
    height: 44,
  },
  menuBtn: {
    padding: 6,
    gap: 5,
    alignItems: "flex-end",
  },
  menuLine: {
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#222222",
  },

  scroll: {
    padding: H_PAD,
    paddingBottom: 40,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    justifyContent: "space-between",
  },

  card: {
    width: CARD_WIDTH,
    marginBottom: 4,
    alignItems: "center",
  },

  imageBox: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    borderRadius: 0,
    overflow: "visible",
    backgroundColor: "transparent",
  },

  tileImage: {
    width: "100%",
    height: "100%",
  },

  tileLabel: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#111111",
    textAlign: "center",
  },
});
