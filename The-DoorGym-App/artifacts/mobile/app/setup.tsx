import React, { useState } from "react";
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

import { useSetupVideos, AdaloSetupVideo, adaloImageUrl } from "@/hooks/useAdaloApi";
import { AppHeader } from "@/components/AppHeader";
import { DrawerMenu } from "@/components/DrawerMenu";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
import { COLORS } from "@/constants/colors";

const BLUE = "#47B3DD";

function SetupVideoRow({
  video,
  imgWidth,
  onPlay,
}: {
  video: AdaloSetupVideo;
  imgWidth: number;
  onPlay: () => void;
}) {
  const thumbUrl = adaloImageUrl(video["Thumbnail(Optional)"]);
  const imgHeight = imgWidth * (9 / 16);

  return (
    <View style={styles.row}>
      {/* Title above image */}
      <Text style={styles.rowTitle}>{video.Name}</Text>

      {/* Full-width thumbnail with play overlay */}
      <Pressable
        style={({ pressed }) => [
          styles.thumbWrap,
          { width: imgWidth, height: imgHeight, opacity: pressed ? 0.88 : 1 },
        ]}
        onPress={onPlay}
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

      </Pressable>
    </View>
  );
}

export default function SetupScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const IMG_WIDTH = SCREEN_WIDTH - 24;

  const [menuVisible, setMenuVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const { data: videos, isLoading, error } = useSetupVideos();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader showBack onMenuPress={() => setMenuVisible(true)} />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading setup videos...</Text>
        </View>
      )}

      {error && !isLoading && (
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load setup videos.</Text>
        </View>
      )}

      {!isLoading && videos && (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Blue banner */}
          <View style={styles.titleBanner}>
            <Text style={styles.titleBannerText}>Setup Videos</Text>
          </View>

          {/* Video rows */}
          {videos.map(v => (
            <SetupVideoRow
              key={v.id}
              video={v}
              imgWidth={IMG_WIDTH}
              onPlay={() => { setActiveVideo(v["YouTube Link"] || null); setVideoVisible(true); }}
            />
          ))}

          {videos.length === 0 && (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No setup videos found.</Text>
            </View>
          )}
        </ScrollView>
      )}

      <VideoPlayerModal
        visible={videoVisible}
        videoUrl={activeVideo}
        onClose={() => { setVideoVisible(false); setActiveVideo(null); }}
      />

      <DrawerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  loadingText: { color: COLORS.muted, fontFamily: "Inter_400Regular" },
  errorText: { color: "#ff3b30", fontFamily: "Inter_400Regular" },

  scroll: { paddingBottom: 60 },

  titleBanner: {
    backgroundColor: BLUE,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  titleBannerText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
  },

  row: {
    paddingTop: 20,
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  rowTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 10,
  },

  thumbWrap: {
    overflow: "hidden",
    backgroundColor: "#d0dde8",
    borderWidth: 2,
    borderColor: "#47B3DD",
  },
  thumbPlaceholder: {
    flex: 1,
    backgroundColor: "#d0dde8",
  },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center", fontFamily: "Inter_400Regular" },
});
