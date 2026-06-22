import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { useColors } from "@/hooks/useColors";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
}

function SettingRow({ icon, label, value }: SettingRowProps) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.borderLight, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon as never} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      {value && (
        <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
      )}
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom + 16;

  const stats = [
    { label: "Workouts", value: "47" },
    { label: "Hours", value: "38" },
    { label: "Streak", value: "5d" },
    { label: "Calories", value: "12k" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader showBack={false} onMenuPress={() => setDrawerOpen(true)} />
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Blue Banner */}
      <View style={[styles.banner, { backgroundColor: colors.primary }]}>
        <Text style={[styles.bannerText, { color: colors.primaryForeground }]}>MY PROFILE</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* Avatar section */}
        <View style={[styles.avatarSection, { borderBottomColor: colors.borderLight }]}>
          <View style={[styles.avatar, { backgroundColor: colors.secondary, borderColor: colors.primary }]}>
            <Feather name="user" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>Athlete</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>Member since 2024</Text>
        </View>

        {/* Stats grid */}
        <View style={[styles.statsCard, { borderColor: colors.primary }]}>
          {stats.map((s, i) => (
            <View
              key={s.label}
              style={[
                styles.statCell,
                i < stats.length - 1 && { borderRightWidth: 1, borderRightColor: colors.borderLight },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.primary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings sections */}
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>ACCOUNT</Text>
        <View style={[styles.card, { borderColor: colors.borderLight }]}>
          <SettingRow icon="edit-2" label="Edit Profile" />
          <SettingRow icon="bell" label="Notifications" value="On" />
          <SettingRow icon="lock" label="Privacy" />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.primary }]}>PREFERENCES</Text>
        <View style={[styles.card, { borderColor: colors.borderLight }]}>
          <SettingRow icon="target" label="Weekly Goal" value="4 workouts" />
          <SettingRow icon="globe" label="Units" value="Metric" />
          <SettingRow icon="info" label="App Version" value="1.0.0" />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            { borderColor: "#ff3b30", opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="log-out" size={16} color="#ff3b30" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    paddingVertical: 14,
    alignItems: "center",
  },
  bannerText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  sub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statsCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    backgroundColor: "#fff",
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#ff3b30",
  },
});
