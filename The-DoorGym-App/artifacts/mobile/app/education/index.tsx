import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

export default function EducationIndexScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/education/library" as never);
  }, [router]);
  return <View />;
}
