import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useWorkoutType } from "@/context/WorkoutTypeContext";
import { COLORS } from "@/constants/colors";

export default function WorkoutRouterScreen() {
  const router = useRouter();
  const { workoutType, currentPackage, isLoading } = useWorkoutType();

  useEffect(() => {
    if (isLoading) return;
    if (!workoutType) {
      router.replace("/package");
      return;
    }
    if (workoutType === "FF" || workoutType === "FF+") {
      router.replace({ pathname: "/workout/ff", params: { type: workoutType } } as never);
    } else if (workoutType === "ES" || workoutType === "ES+") {
      const typeId = currentPackage?.numericId ?? 5;
      router.replace({
        pathname: "/workout/list/[typeId]",
        params: { typeId: String(typeId), title: currentPackage?.label ?? workoutType },
      } as never);
    }
  }, [isLoading, workoutType]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>Loading workout...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#fff" },
  text: { color: COLORS.muted, fontFamily: "Inter_400Regular" },
});
