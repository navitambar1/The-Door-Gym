import React from "react";
import { StyleSheet, View } from "react-native";

const IFrame = "iframe" as unknown as React.ElementType;
const Video = "video" as unknown as React.ElementType;

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtu.be") || url.includes("youtube.com");
}

function getYouTubeVideoId(url: string): string | null {
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1]?.split("?")[0] ?? null;
  if (url.includes("youtube.com/embed/")) return url.split("/embed/")[1]?.split("?")[0] ?? null;
  if (url.includes("youtube.com/watch")) {
    const m = url.match(/[?&]v=([^&]+)/);
    return m ? m[1] : null;
  }
  return null;
}

interface VideoRendererProps {
  uri: string;
  rendererKey?: string | number;
  onLoad?: () => void;
  onLoadStart?: () => void;
  onError?: () => void;
}

export function VideoRenderer({ uri, rendererKey, onLoad, onLoadStart, onError }: VideoRendererProps) {
  if (isYouTubeUrl(uri)) {
    const videoId = getYouTubeVideoId(uri);
    const src = videoId
      ? `https://www.youtube.com/embed/${videoId}?controls=0&autoplay=1&mute=1&loop=1&playlist=${videoId}&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3`
      : "";
    return (
      <View style={styles.container}>
        <View style={styles.youtubeWrap}>
          <IFrame
            key={rendererKey}
            src={src}
            style={styles.youtubeFrame}
            frameBorder="0"
            allow="autoplay; encrypted-media"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        key={rendererKey}
        src={uri}
        style={styles.nativeVideo}
        autoPlay
        loop
        playsInline
        muted
        controls={false}
        onCanPlay={onLoad}
        onLoadStart={onLoadStart}
        onError={onError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  youtubeWrap: {
    flex: 1,
    overflow: "hidden" as never,
    position: "relative" as never,
  },
  youtubeFrame: {
    position: "absolute" as never,
    top: -68,
    left: 0,
    right: 0,
    bottom: -48,
    width: "100%" as never,
    height: "calc(100% + 116px)" as never,
  },
  nativeVideo: {
    width: "100%" as never,
    height: "100%" as never,
    objectFit: "contain" as never,
  },
});
