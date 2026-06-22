import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { createVideoPlayer, type VideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAdaloWorkout, AdaloVideo, adaloVideoUrl } from "@/hooks/useAdaloApi";
import { useWorkoutType } from "@/context/WorkoutTypeContext";
import { VideoRenderer } from "@/components/VideoRenderer";
import { COLORS } from "@/constants/colors";

const PRELOAD_AHEAD = 3;

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtu.be") || url.includes("youtube.com");
}

function getNativeVideoUrl(v: AdaloVideo | undefined): string | null {
  if (!v) return null;
  const url = adaloVideoUrl(v["Video File"]);
  return url && !isYouTubeUrl(url) ? url : null;
}

function stripEmoji(name: string): string {
  return name.replace(/⬇️/g, "").replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim();
}

function Timer({ resetKey }: { resetKey: number }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    setSeconds(0);
    const iv = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, [resetKey]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return <Text style={styles.timer}>{mm}:{ss}</Text>;
}

export default function WorkoutPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentPackage } = useWorkoutType();
  const workoutId = parseInt(id ?? "0", 10);

  const { data: workout, isLoading: workoutLoading } = useAdaloWorkout(workoutId);

  useEffect(() => {
    ScreenOrientation.unlockAsync().catch(() => {});
    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  const [phase, setPhase] = useState<"regular" | "circuit">("regular");
  const [idx, setIdx] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [videoList, setVideoList] = useState<AdaloVideo[]>([]);
  const [circuitList, setCircuitList] = useState<AdaloVideo[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [webviewKey, setWebviewKey] = useState(0);

  useEffect(() => {
    if (!workout) return;
    const videoIds = [...(workout.Videos ?? []), ...(workout["Circuit Videos"] ?? [])];
    if (videoIds.length === 0) { setIsReady(true); return; }

    const base = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/adalo`;
    const idList = videoIds.join(",");
    fetch(`${base}/videos?ids=${idList}`)
      .then(r => r.json())
      .then((data: { records?: AdaloVideo[] }) => {
        const records = data.records ?? [];
        const byId: Record<number, AdaloVideo> = {};
        records.forEach(v => { byId[v.id] = v; });

        const regular = (workout.Videos ?? []).map(vid => byId[vid]).filter(Boolean) as AdaloVideo[];
        const circuit = (workout["Circuit Videos"] ?? []).map(vid => byId[vid]).filter(Boolean) as AdaloVideo[];

        setVideoList(regular);
        setCircuitList(circuit);
        setIsReady(true);
      })
      .catch(() => setIsReady(true));
  }, [workout]);

  const currentVideo = phase === "regular" ? videoList[idx] : circuitList[idx % (circuitList.length || 1)];
  const totalRegular = videoList.length;
  const totalCircuit = circuitList.length;

  // ── Video preloading ──────────────────────────────────────
  const playersRef = useRef<Map<string, VideoPlayer>>(new Map());

  useEffect(() => {
    const list = phase === "regular" ? videoList : circuitList;
    if (!list.length) return;

    const toKeep = new Set<string>();
    for (let i = idx; i < Math.min(list.length, idx + PRELOAD_AHEAD); i++) {
      const url = getNativeVideoUrl(list[i]);
      if (url) toKeep.add(url);
    }

    toKeep.forEach(url => {
      if (!playersRef.current.has(url)) {
        const p = createVideoPlayer({ uri: url });
        p.loop = true;
        playersRef.current.set(url, p);
      }
    });

    playersRef.current.forEach((p, url) => {
      if (!toKeep.has(url)) {
        try { p.release(); } catch { /* ignore */ }
        playersRef.current.delete(url);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase, videoList.length, circuitList.length]);

  useEffect(() => {
    const ref = playersRef.current;
    return () => {
      ref.forEach(p => { try { p.release(); } catch { /* ignore */ } });
      ref.clear();
    };
  }, []);

  const currentNativeUrl = getNativeVideoUrl(currentVideo);
  const currentPlayer = currentNativeUrl ? (playersRef.current.get(currentNativeUrl) ?? null) : null;

  const goNext = useCallback(() => {
    setTimerKey(k => k + 1);
    setWebviewKey(k => k + 1);
    if (phase === "regular") {
      if (idx < totalRegular - 1) {
        setIdx(i => i + 1);
      } else if (totalCircuit > 0) {
        setPhase("circuit");
        setIdx(0);
      } else {
        setIdx(i => (i + 1) % Math.max(totalRegular, 1));
      }
    } else {
      setIdx(i => (i + 1) % Math.max(totalCircuit, 1));
    }
  }, [phase, idx, totalRegular, totalCircuit]);

  const goBack = useCallback(() => {
    setTimerKey(k => k + 1);
    setWebviewKey(k => k + 1);
    if (phase === "regular") {
      if (idx > 0) setIdx(i => i - 1);
      else if (totalCircuit > 0) { setPhase("circuit"); setIdx(totalCircuit - 1); }
    } else {
      if (idx > 0) setIdx(i => i - 1);
      else { setPhase("regular"); setIdx(Math.max(totalRegular - 1, 0)); }
    }
  }, [phase, idx, totalRegular, totalCircuit]);

  const isLoading = workoutLoading || !isReady;
  const videoUrl = adaloVideoUrl(currentVideo?.["Video File"]) ?? null;

  return (
    <View style={styles.fullscreen}>
      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      )}
      
      {!isLoading && (
        <>
          {/* Video area */}
          <View style={styles.videoArea}>
            {videoUrl ? (
              <VideoRenderer
                uri={videoUrl}
                player={currentPlayer}
                rendererKey={webviewKey}
              />
            ) : (
              <View style={styles.noVideoPlaceholder}>
                <Feather name="play-circle" size={64} color="rgba(255,255,255,0.3)" />
                <Text style={styles.noVideoText}>No video for this exercise</Text>
              </View>
            )}
          </View>

          {/* Timer */}
          <View style={styles.timerRow}>
            <Timer resetKey={timerKey} />
          </View>

          {/* EXIT top-right */}
          <Pressable style={styles.exitBtn} onPress={() => router.back()}>
            <Text style={styles.exitBtnText}>EXIT</Text>
          </Pressable>

          {/* Bottom nav */}
          <View style={styles.controls}>
            <Pressable
              style={[styles.navBtn, idx === 0 && phase === "regular" && styles.navBtnDisabled]}
              onPress={goBack}
            >
              <Feather name="chevron-left" size={22} color="#ffffff" />
              <Text style={styles.navBtnText}>BACK</Text>
            </Pressable>

            <Pressable style={styles.exitLargeBtn} onPress={() => router.back()}>
              <Text style={styles.exitLargeText}>EXIT</Text>
            </Pressable>

            <Pressable style={styles.navBtn} onPress={goNext}>
              <Text style={styles.navBtnText}>NEXT</Text>
              <Feather name="chevron-right" size={22} color="#ffffff" />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: { flex: 1, backgroundColor: "#000000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },

  videoArea: { flex: 1, backgroundColor: "#111", position: "relative" },
  noVideoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  noVideoText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  timerRow: {
    backgroundColor: "#000",
    alignItems: "center",
    paddingVertical: 8,
  },
  timer: {
    color: "#ffffff",
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3,
  },

  exitBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 52 : 32,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  exitBtnText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: Platform.OS === "ios" ? 20 : 16,
    backgroundColor: "#000000",
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 4,
  },
  navBtnDisabled: { opacity: 0.35 },
  navBtnText: { color: "#ffffff", fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  exitLargeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  exitLargeText: { color: "#ffffff", fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
});
