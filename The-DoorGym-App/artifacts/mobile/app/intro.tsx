import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useWorkoutType } from "@/context/WorkoutTypeContext";

const INTRO_URL =
  "https://customer-f0bg00h3x7zvd1r0.cloudflarestream.com/4310f79c48c751a058e5a6a70f65019a/manifest/video.m3u8";

export default function IntroVideoScreen() {
  const router = useRouter();
  const { hasSeenMedical, workoutType, setHasSeenIntro } = useWorkoutType();

  const proceed = useCallback(async () => {
    await setHasSeenIntro(true);
    if (!hasSeenMedical) {
      router.replace("/medical");
    } else if (!workoutType) {
      router.replace("/package");
    } else {
      router.replace("/dashboard");
    }
  }, [hasSeenMedical, workoutType, setHasSeenIntro, router]);

  const player = useVideoPlayer({ uri: INTRO_URL }, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener("playToEnd", () => {
      proceed();
    });
    return () => sub.remove();
  }, [player, proceed]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        nativeControls={false}
        contentFit="contain"
        allowsFullscreen={false}
      />
      <SafeAreaView style={styles.overlay} edges={["top", "right"]}>
        <Pressable
          style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={proceed}
          hitSlop={16}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 16,
  },
  skipBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#47B3DD",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginRight: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  skipText: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
});
