import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useWorkoutType } from "@/context/WorkoutTypeContext";

export default function SplashScreen() {
  const router = useRouter();
  const { workoutType, hasSeenIntro, hasSeenMedical, isLoading } = useWorkoutType();

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
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
    return () => clearTimeout(timer);
  }, [isLoading, workoutType, hasSeenIntro, hasSeenMedical, router]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/splash1.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: "90%",
  },
});
