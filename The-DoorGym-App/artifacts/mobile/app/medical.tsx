import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorkoutType } from "@/context/WorkoutTypeContext";

const BLUE = "#47B3DD";

const PARAGRAPHS = [
  "The DoorGym app provides general fitness information and guided exercise videos for educational and physical training purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.",
  "Always consult your physician or a qualified healthcare provider before beginning any new exercise program, especially if you have existing injuries, medical conditions, or concerns about your health.",
  "Stop exercising immediately if you experience dizziness, pain, shortness of breath, or any other unusual symptoms.",
  "Always follow all DoorGym setup instructions, safety guidelines, and exercise demonstrations exactly as shown in the app, as improper installation, incorrect form, or misuse of the equipment can increase the risk of injury.",
  "By using this app, you acknowledge that you understand and accept these terms.",
];

export default function MedicalDisclaimerScreen() {
  const router = useRouter();
  const { workoutType, setHasSeenMedical } = useWorkoutType();
  const [agreed, setAgreed] = useState(false);

  async function handleAgree() {
    await setHasSeenMedical(true);
    if (workoutType) {
      router.replace("/dashboard");
    } else {
      router.replace("/package");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require("../assets/images/logo_icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Disclaimer paragraphs */}
        {PARAGRAPHS.map((text, i) => (
          <Text key={i} style={styles.paragraph}>{text}</Text>
        ))}

        {/* Checkbox row */}
        <Pressable style={styles.checkRow} onPress={() => setAgreed(v => !v)}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>I have read and agree to{"\n"}the terms above</Text>
        </Pressable>
      </ScrollView>

      {/* I AGREE button — fixed at bottom */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.agreeBtn,
            !agreed && styles.agreeBtnDisabled,
            pressed && agreed && { opacity: 0.85 },
          ]}
          onPress={handleAgree}
          disabled={!agreed}
        >
          <Text style={styles.agreeBtnText}>I AGREE</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },

  logoWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 220,
    height: 80,
  },

  paragraph: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#222",
    lineHeight: 26,
    marginBottom: 20,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: BLUE,
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    lineHeight: 20,
  },
  checkLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#222",
    lineHeight: 24,
    flex: 1,
  },

  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  agreeBtn: {
    backgroundColor: BLUE,
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: "center",
  },
  agreeBtnDisabled: {
    backgroundColor: "#b0d8eb",
  },
  agreeBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 1.5,
  },
});
