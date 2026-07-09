import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useWorkoutType } from "@/context/WorkoutTypeContext";

export default function CustomSplashScreen() {
  const router = useRouter();
  const { workoutType, hasSeenIntro, hasSeenMedical, isLoading: isContextLoading } = useWorkoutType();

  useEffect(() => {
    if (isContextLoading) return;

    const hideTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 100);

    const navigationTimer = setTimeout(() => {
      if (!hasSeenIntro) {
        router.replace("/intro");
      } else if (!hasSeenMedical) {
        router.replace("/medical");
      } else if (!workoutType) {
        router.replace("/package");
      } else {
        router.replace("/dashboard");
      }
    }, 2000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(navigationTimer);
    };

  }, [isContextLoading, workoutType, hasSeenIntro, hasSeenMedical, router]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/splash1.png")}
        style={styles.splash}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  splash: {
    width: "100%",
    height: "100%",
  },
});