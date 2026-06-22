import * as ScreenOrientation from "expo-screen-orientation";
import { type VideoPlayer } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { VideoRenderer } from "@/components/VideoRenderer";
import { COLORS } from "@/constants/colors";

const CIRCLE = 64;
const TOP_OFFSET = Platform.OS === "ios" ? 56 : 36;

interface VideoPlayerModalProps {
  visible: boolean;
  videoUrl: string | null | undefined;
  /** Pre-loaded native VideoPlayer — skips buffering delay on play */
  player?: VideoPlayer | null;
  onClose: () => void;
  onBack?: () => void;
  onNext?: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
}

export function VideoPlayerModal({
  visible,
  videoUrl,
  player,
  onClose,
  onBack,
  onNext,
  backDisabled,
  nextDisabled,
}: VideoPlayerModalProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 12000);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    if (visible) {
      ScreenOrientation.unlockAsync().catch(() => {});
    } else {
      setLoading(false);
      ScreenOrientation.unlockAsync().catch(() => {});
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      supportedOrientations={["portrait", "landscape-left", "landscape-right"]}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {videoUrl ? (
          <VideoRenderer
            uri={videoUrl}
            player={player}
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        ) : (
          <View style={styles.noVideo}>
            <Text style={styles.noVideoText}>No video available</Text>
          </View>
        )}

        {loading && !!videoUrl && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        {/* EXIT — top-right */}
        <Pressable style={[styles.circle, styles.exitBtn]} onPress={onClose}>
          <Text style={styles.circleText}>EXIT</Text>
        </Pressable>

        {/* BACK — bottom-left */}
        {onBack && (
          <Pressable
            style={[styles.circle, styles.backBtn, backDisabled && styles.disabled]}
            onPress={onBack}
          >
            <Text style={styles.circleText}>BACK</Text>
          </Pressable>
        )}

        {/* NEXT — bottom-right */}
        {onNext && (
          <Pressable
            style={[styles.circle, styles.nextBtn, nextDisabled && styles.disabled]}
            onPress={onNext}
          >
            <Text style={styles.circleText}>NEXT</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const BOTTOM_OFFSET = Platform.OS === "ios" ? 44 : 28;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  noVideo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noVideoText: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  circle: {
    position: "absolute",
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: {
    color: "#ffffff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  exitBtn: { top: TOP_OFFSET, right: 20 },
  backBtn: { bottom: BOTTOM_OFFSET, left: 20 },
  nextBtn: { bottom: BOTTOM_OFFSET, right: 20 },
  disabled: { opacity: 0.35 },
});
