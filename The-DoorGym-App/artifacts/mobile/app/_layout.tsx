import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkoutTypeProvider } from "@/context/WorkoutTypeContext";

const domain = process.env.EXPO_PUBLIC_DOMAIN;
const protocol = domain?.includes("ngrok") || domain?.includes(".app") ? "https" : "http";
setBaseUrl(`${protocol}://${domain}`);

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#ffffff" } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="package" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="app-instructions" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="education/index" />
      <Stack.Screen name="education/[id]" />
      <Stack.Screen name="exercises/index" />
      <Stack.Screen name="exercises/[categoryId]" />
      <Stack.Screen name="workout/index" />
      <Stack.Screen name="workout/ff" />
      <Stack.Screen name="workout/list/[typeId]" />
      <Stack.Screen name="workout/detail/[id]" />
      <Stack.Screen name="workout/player/[id]" options={{ animation: "fade" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Splash screen is handled in app/index.tsx to prevent flickering
  // by waiting for the React component to mount and the image to load.

  // if (!fontsLoaded && !fontError) return null;
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: "#ffffff" }} />

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <WorkoutTypeProvider>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#ffffff" }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </WorkoutTypeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
