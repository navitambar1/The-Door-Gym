import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { VideoView, useVideoPlayer, type VideoPlayer } from "expo-video";
import { WebView } from "react-native-webview";

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

function buildEmbedHtml(videoId: string): string {
  // mute=1 is required for autoplay on iOS/Android WebViews (YouTube policy).
  // controls=1 lets users tap to unmute.
  const src = `https://www.youtube.com/embed/${videoId}?controls=1&autoplay=1&mute=1&loop=1&playlist=${videoId}&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&enablejsapi=1&origin=https://localhost`;
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:#000;width:100%;height:100%;overflow:hidden}
.wrap{position:fixed;top:-68px;left:0;right:0;bottom:-48px}
iframe{width:100%;height:100%;border:none;display:block}
</style>
</head>
<body>
<div class="wrap">
<iframe
  src="${src}"
  frameborder="0"
  allow="autoplay;encrypted-media;fullscreen;picture-in-picture"
></iframe>
</div>
</body>
</html>`;
}

export interface VideoRendererProps {
  uri: string;
  /** Pre-created VideoPlayer for instant playback (native videos only). */
  player?: VideoPlayer | null;
  rendererKey?: string | number;
  onLoad?: () => void;
  onLoadStart?: () => void;
  onError?: () => void;
}

function YouTubeRenderer({ uri, rendererKey }: Pick<VideoRendererProps, "uri" | "rendererKey">) {
  const videoId = getYouTubeVideoId(uri);
  if (!videoId) return <View style={styles.video} />;
  return (
    <WebView
      key={rendererKey}
      style={styles.video}
      source={{ html: buildEmbedHtml(videoId), baseUrl: "https://localhost" }}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      allowsFullscreenVideo={false}
      scrollEnabled={false}
      javaScriptEnabled
      originWhitelist={["*"]}
      allowsProtectedMedia
    />
  );
}

function NativeRenderer({ uri, player: externalPlayer, rendererKey, onLoad, onLoadStart, onError }: VideoRendererProps) {
  // IMPORTANT: never pass null/undefined to useVideoPlayer — crashes natively.
  // useVideoPlayer(uri) already starts loading the video in the background.
  // Do NOT call replaceAsync with the same uri — it restarts loading and causes
  // a black frame on mobile until the async completes (the "nav-away-and-back" bug).
  const ownPlayer = useVideoPlayer(uri, undefined);

  const activePlayer = externalPlayer ?? ownPlayer;

  // Own-player path: video is already loading via useVideoPlayer(uri).
  // Wait for readyToPlay, then start looped playback.
  useEffect(() => {
    if (externalPlayer || !uri) return;

    const play = () => {
      try { ownPlayer.loop = true; ownPlayer.play(); } catch { /* ignore */ }
    };

    if ((ownPlayer as any).status === "readyToPlay") {
      play();
      return;
    }

    const sub = ownPlayer.addListener("statusChange", (event) => {
      if (event.status === "readyToPlay") play();
    });
    return () => sub.remove();
  // rendererKey in deps ensures this re-runs when the component remounts for a new video
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri, rendererKey, externalPlayer]);

  // External-player path: wait for readyToPlay before starting, so we never
  // get a black frame when the preloaded player hasn't finished buffering yet.
  useEffect(() => {
    if (!externalPlayer) return;

    const play = () => {
      try { externalPlayer.loop = true; externalPlayer.play(); } catch { /* ignore */ }
    };

    if ((externalPlayer as any).status === "readyToPlay") {
      play();
      return;
    }

    const sub = externalPlayer.addListener("statusChange", (event) => {
      if (event.status === "readyToPlay") play();
    });
    return () => sub.remove();
  }, [externalPlayer]);

  // Forward status events to optional callbacks.
  useEffect(() => {
    const sub = activePlayer.addListener("statusChange", (event) => {
      if (event.status === "loading") onLoadStart?.();
      if (event.status === "readyToPlay") onLoad?.();
      if (event.status === "error") onError?.();
    });
    return () => sub.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlayer]);

  return (
    <VideoView
      player={activePlayer}
      style={styles.video}
      nativeControls={false}
      contentFit="contain"
    />
  );
}

export function VideoRenderer(props: VideoRendererProps) {
  if (isYouTubeUrl(props.uri)) {
    return <YouTubeRenderer uri={props.uri} rendererKey={props.rendererKey} />;
  }
  return <NativeRenderer {...props} />;
}

const styles = StyleSheet.create({
  video: { flex: 1, backgroundColor: "#000" },
});