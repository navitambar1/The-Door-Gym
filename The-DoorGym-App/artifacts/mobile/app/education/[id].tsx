import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEducationItem, useEducationCategories, adaloImageUrl, adaloVideoUrl } from "@/hooks/useAdaloApi";
import { useWorkoutType } from "@/context/WorkoutTypeContext";
import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
import { COLORS } from "@/constants/colors";

const BLUE = "#47B3DD";

export default function EducationDetailScreen() {
  const { id, autoplay } = useLocalSearchParams<{ id: string; autoplay?: string }>();
  const router = useRouter();
  const { width: SCREEN_W } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const { workoutType } = useWorkoutType();

  const itemId = parseInt(id ?? "0", 10);
  const { data: item, isLoading } = useEducationItem(itemId);
  const { data: allCategories } = useEducationCategories();

  const myCategories = allCategories?.filter(
    cat => item?.["Education Categories"]?.includes(cat.id) && cat["Library Type"] === workoutType
  ) ?? [];

  const thumbUrl = adaloImageUrl(item?.Thumbnail);
  const videoUrl = adaloVideoUrl(item?.["Video File"]) ?? item?.["YouTube Link"] ?? null;

  // For autoplay (Overview fallback): wait until the video URL is resolved, then open modal
  useEffect(() => {
    if (autoplay === "1" && videoUrl) {
      setVideoVisible(true);
    }
  }, [autoplay, videoUrl]);

  const thumbHeight = Math.round((SCREEN_W - 24) * 0.5625);

  function handleViewExercises() {
    if (myCategories.length > 0) {
      router.push(
        `/education/videos/${myCategories[0].id}?name=${encodeURIComponent(item?.Name ?? "")}` as never
      );
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader showBack onMenuPress={() => setMenuVisible(true)} />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {!isLoading && item && (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Blue title banner */}
          <View style={styles.titleBanner}>
            <Text style={styles.titleBannerText}>Education - {item.Name}</Text>
          </View>

          {/* Video thumbnail — outer has border, inner clips image */}
          <Pressable
            style={styles.thumbOuter}
            onPress={() => videoUrl ? setVideoVisible(true) : undefined}
          >
            <View style={[styles.thumbInner, { height: thumbHeight }]}>
              {thumbUrl ? (
                <Image
                  source={{ uri: thumbUrl }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.thumbBg} />
              )}
              {videoUrl && (
                <View style={styles.playCircle}>
                  <Feather name="play" size={36} color="#ffffff" />
                </View>
              )}
            </View>
          </Pressable>

          {/* Description */}
          <View style={styles.descSection}>
            {!!item.Description && (
              <Text style={styles.descText}>{item.Description}</Text>
            )}
            {!!item.Instructions && !item.Description && (
              <Text style={styles.descText}>{item.Instructions}</Text>
            )}
          </View>

          {/* VIEW EXERCISES button */}
          {myCategories.length > 0 && (
            <Pressable
              style={({ pressed }) => [styles.viewExercisesBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={handleViewExercises}
            >
              <Text style={styles.viewExercisesBtnText}>VIEW EXERCISES</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      {!isLoading && !item && (
        <View style={styles.center}>
          <Text style={styles.errorText}>Content not found.</Text>
        </View>
      )}

      <VideoPlayerModal
        visible={videoVisible}
        videoUrl={videoUrl}
        onClose={() => {
          if (autoplay === "1") {
            router.back();
          } else {
            setVideoVisible(false);
          }
        }}
      />

      <DrawerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: 60 },

  titleBanner: {
    backgroundColor: BLUE,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  titleBannerText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    textAlign: "center",
  },

  thumbOuter: {
    marginHorizontal: 12,
    marginTop: 16,
    backgroundColor: COLORS.primaryDark,
  },
  thumbInner: {
    overflow: "hidden",
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primaryDark,
  },
  playCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(71,179,221,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },

  descSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  descText: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    color: "#222",
    lineHeight: 27,
  },

  viewExercisesBtn: {
    backgroundColor: BLUE,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: "center",
  },
  viewExercisesBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    letterSpacing: 1.5,
  },

  errorText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: COLORS.muted,
    textAlign: "center",
  },
});
