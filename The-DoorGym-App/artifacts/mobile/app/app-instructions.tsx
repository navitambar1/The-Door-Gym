import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { COLORS } from "@/constants/colors";

const SECTIONS = [
  {
    title: "Getting Started",
    body: "Welcome to The Door Gym app. Select your package to get started with personalised workouts, exercise videos, and educational content tailored to your equipment.",
  },
  {
    title: "Selecting Your Package",
    body: "Tap 'Select Package' in the menu or return to the dashboard to choose between Essential Strength (ES), Essential Strength Plus (ES+), Functional Fitness (FF), or Functional Fitness Plus (FF+). Your choice filters all content to your equipment.",
  },
  {
    title: "Exercise Library",
    body: "Browse exercise categories filtered to your package. Tap any category to see a list of exercises with video demonstrations and instructions.",
  },
  {
    title: "Start Workout",
    body: "Access structured workout sessions designed for your package. ES and ES+ members see workout lists directly. FF and FF+ members first select a difficulty level before viewing workouts.",
  },
  {
    title: "Education",
    body: "Learn about movement fundamentals, injury prevention, and technique through educational videos and articles categorised for your workout type.",
  },
  {
    title: "DoorGym Setup",
    body: "Watch video guides for setting up your DoorGym equipment. Find setup instructions specific to each package and accessory.",
  },
  {
    title: "Shop",
    body: "Visit thedoorgym.com to browse and purchase equipment, accessories, and upgrades to enhance your training.",
  },
];

export default function AppInstructionsScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader showBack onMenuPress={() => setMenuVisible(true)} />
      <ScrollView contentContainerStyle={styles.content}>
        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
      <DrawerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  menuBtn: { width: 44, alignItems: "flex-end", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { width: 44, alignItems: "flex-start" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    letterSpacing: 1,
  },
  content: { padding: 20, paddingBottom: 60 },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: COLORS.foreground,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#444",
    lineHeight: 22,
  },
});
