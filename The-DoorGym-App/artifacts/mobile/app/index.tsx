import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, Animated } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useWorkoutType } from "@/context/WorkoutTypeContext";

export default function CustomSplashScreen() {
  const router = useRouter();
  const { workoutType, hasSeenIntro, hasSeenMedical, isLoading: isContextLoading } = useWorkoutType();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current; // Initial opacity for the React image

  useEffect(() => {
    if (isImageLoaded && !isContextLoading) {
      // Hide the native splash screen only after our React image is ready
      // We wait a tiny bit to ensure the React component has actually painted
      const hideTimer = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {
          /* ignore error if already hidden */
        });
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
      }, 2100);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(navigationTimer);
      };
    }
  }, [isImageLoaded, isContextLoading, workoutType, hasSeenIntro, hasSeenMedical, router]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Image
          source={require("../assets/images/splash1.png")}
          style={styles.logo}
          resizeMode="contain"
          onLoad={() => setIsImageLoaded(true)}
        />
      </Animated.View>
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