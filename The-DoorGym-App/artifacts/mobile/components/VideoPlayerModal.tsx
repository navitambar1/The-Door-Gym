import * as ScreenOrientation from "expo-screen-orientation";
import { type VideoPlayer } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VideoRenderer } from "@/components/VideoRenderer";
import { COLORS } from "@/constants/colors";

const CIRCLE = 64;
// small breathing room beyond the safe-area edge — NOT a big inward push
const EDGE_GAP = 12;

interface VideoPlayerModalProps {
  visible: boolean;
  videoUrl: string | null | undefined;
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
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
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

  // Positions derived from the ACTUAL safe area, so they hold up
  // across portrait, landscape-left, landscape-right, notches, etc.
  const topPos = insets.top + (isLandscape ? 20 : 12);

  const bottomPos =
    insets.bottom + (isLandscape ? 10 : 10);

  const leftPos =
    insets.left + (isLandscape ? 10 : 10);

  const rightPos =
    insets.right + (isLandscape ? 43 : 10);

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
        <Pressable
          style={[styles.circle, { top: topPos, right: rightPos }]}
          onPress={onClose}
        >
          <Text style={styles.circleText}>EXIT</Text>
        </Pressable>

        {/* BACK — bottom-left */}
        {onBack && (
          <Pressable
            style={[
              styles.circle,
              { bottom: bottomPos, left: leftPos },
              backDisabled && styles.disabled,
            ]}
            onPress={onBack}
          >
            <Text style={styles.circleText}>BACK</Text>
          </Pressable>
        )}

        {/* NEXT — bottom-right */}
        {onNext && (
          <Pressable
            style={[
              styles.circle,
              { bottom: bottomPos, right: rightPos },
              nextDisabled && styles.disabled,
            ]}
            onPress={onNext}
          >
            <Text style={styles.circleText}>NEXT</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

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
  disabled: { opacity: 0.35 },
});