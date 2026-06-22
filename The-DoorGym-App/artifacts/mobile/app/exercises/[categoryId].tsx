import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createVideoPlayer, type VideoPlayer } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useVideos, AdaloVideo, adaloImageUrl, adaloVideoUrl } from "@/hooks/useAdaloApi";
import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
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

export default function ExerciseVideoPlayerScreen() {
  const { categoryId, name } = useLocalSearchParams<{ categoryId: string; name?: string }>();
  const router = useRouter();
  const { width: SCREEN_W } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);

  const catId = parseInt(categoryId ?? "0", 10);
  const { data: videos, isLoading } = useVideos(catId);

  const [selectedIdx, setSelectedIdx] = useState(0);

  const sorted = videos
    ? [...videos].sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
    : [];

  const current = sorted[selectedIdx];
  const thumbUrl = adaloImageUrl(current?.Thumbnail);

  const goBack = () => setSelectedIdx(i => Math.max(0, i - 1));
  const goNext = () => setSelectedIdx(i => Math.min(sorted.length - 1, i + 1));

  const THUMB_H = Math.round((SCREEN_W * 0.62) * 0.5625);

  // ── Video preloading ──────────────────────────────────────
  const playersRef = useRef<Map<string, VideoPlayer>>(new Map());
  const sidebarRef = useRef<FlatList<AdaloVideo>>(null);

  useEffect(() => {
    if (!sorted.length) return;
    const toKeep = new Set<string>();
    for (let i = selectedIdx; i < Math.min(sorted.length, selectedIdx + PRELOAD_AHEAD); i++) {
      const url = getNativeVideoUrl(sorted[i]);
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
  }, [selectedIdx, sorted.length]);

  useEffect(() => {
    const ref = playersRef.current;
    return () => {
      ref.forEach(p => { try { p.release(); } catch { /* ignore */ } });
      ref.clear();
    };
  }, []);

  const currentNativeUrl = getNativeVideoUrl(current);
  const currentPlayer = currentNativeUrl ? (playersRef.current.get(currentNativeUrl) ?? null) : null;

  // Scroll sidebar to show the active item after the modal closes
  function scrollSidebarToSelected(idx: number) {
    setTimeout(() => {
      sidebarRef.current?.scrollToIndex({
        index: idx,
        animated: true,
        viewPosition: 0.3,
      });
    }, 120);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader showBack onMenuPress={() => setMenuVisible(true)} />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      )}

      {!isLoading && sorted.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No exercises found for this category.</Text>
        </View>
      )}

      {!isLoading && sorted.length > 0 && (
        <View style={styles.splitView}>
          {/* ── Left sidebar ── */}
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarHeaderText}>{name ?? "Exercises"}</Text>
            </View>
            <FlatList
              ref={sidebarRef}
              data={sorted}
              keyExtractor={v => String(v.id)}
              getItemLayout={(_, index) => ({ length: 64, offset: 64 * index, index })}
              onScrollToIndexFailed={({ index }) => {
                sidebarRef.current?.scrollToOffset({ offset: index * 64, animated: true });
              }}
              renderItem={({ item: v, index: idx }) => (
                <Pressable
                  style={[styles.sidebarItem, idx === selectedIdx && styles.sidebarItemActive]}
                  onPress={() => setSelectedIdx(idx)}
                >
                  <Text
                    style={[styles.sidebarItemText, idx === selectedIdx && styles.sidebarItemTextActive]}
                    numberOfLines={3}
                  >
                    {v.Title}
                  </Text>
                </Pressable>
              )}
            />
          </View>

          {/* ── Right content ── */}
          <View style={styles.mainContent}>
            {current && (
              <>
                <Pressable
                  style={[styles.thumbArea, { height: THUMB_H }]}
                  onPress={() => setVideoVisible(true)}
                >
                  {thumbUrl ? (
                    <Image
                      source={{ uri: thumbUrl }}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.thumbPlaceholder} />
                  )}
                  <View style={styles.playOverlay}>
                    <Feather name="play" size={22} color="#fff" />
                  </View>
                </Pressable>

                <FlatList
                  data={[current]}
                  keyExtractor={v => `desc-${v.id}`}
                  style={styles.infoScroll}
                  contentContainerStyle={styles.infoContent}
                  renderItem={({ item: v }) => (
                    <>
                      <Text style={styles.descHeading}>Exercise description</Text>
                      {!!v.Description && (
                        <Text style={styles.descBody}>{v.Description}</Text>
                      )}
                    </>
                  )}
                />
              </>
            )}
          </View>
        </View>
      )}

      {/* Bottom bar */}
      {!isLoading && sorted.length > 0 && (
        <View style={styles.bottomBar}>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>CLOSE</Text>
          </Pressable>
          <Pressable style={styles.fullscreenBtn} onPress={() => setVideoVisible(true)}>
            <Text style={styles.fullscreenBtnText}>FULLSCREEN</Text>
          </Pressable>
        </View>
      )}

      <VideoPlayerModal
        visible={videoVisible}
        videoUrl={adaloVideoUrl(current?.["Video File"]) ?? null}
        player={currentPlayer}
        onClose={() => {
          setVideoVisible(false);
          scrollSidebarToSelected(selectedIdx);
        }}
        onBack={() => goBack()}
        onNext={() => goNext()}
        backDisabled={selectedIdx === 0}
        nextDisabled={selectedIdx === sorted.length - 1}
      />

      <DrawerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: COLORS.muted, fontFamily: "Inter_400Regular", fontSize: 17 },
  emptyText: { color: COLORS.muted, textAlign: "center", fontFamily: "Inter_400Regular", fontSize: 17 },
  splitView: { flex: 1, flexDirection: "row" },

  sidebar: {
    width: "42%",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  sidebarHeader: {
    backgroundColor: COLORS.primary,
    padding: 12,
    minHeight: 54,
    justifyContent: "center",
  },
  sidebarHeaderText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 23,
  },
  sidebarItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    minHeight: 64,
    justifyContent: "center",
  },
  sidebarItemActive: { backgroundColor: "#d9eef7" },
  sidebarItemText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#444",
    lineHeight: 22,
    textAlign: "center",
  },
  sidebarItemTextActive: { fontFamily: "Inter_600SemiBold", color: "#222" },

  mainContent: { flex: 1 },
  thumbArea: {
    backgroundColor: "#111",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbPlaceholder: {
    flex: 1,
    width: "100%",
    backgroundColor: COLORS.primaryDark,
  },
  playOverlay: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoScroll: { flex: 1 },
  infoContent: { padding: 14, paddingBottom: 28 },
  descHeading: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#222",
    marginBottom: 12,
  },
  descBody: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    color: "#444",
    lineHeight: 27,
  },

  bottomBar: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#e0e0e0" },
  closeBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  closeBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    letterSpacing: 2,
  },
  fullscreenBtn: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  fullscreenBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    letterSpacing: 2,
  },
});
