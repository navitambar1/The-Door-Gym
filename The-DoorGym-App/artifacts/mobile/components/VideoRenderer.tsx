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
  const src = `https://www.youtube.com/embed/${videoId}?controls=0&autoplay=1&mute=0&loop=1&playlist=${videoId}&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&enablejsapi=1&origin=https://localhost`;
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
  // IMPORTANT: never pass null/undefined to useVideoPlayer — the native VideoPlayer
  // constructor crashes when given null. Always supply the real URI so the native
  // object is created safely. No setup callback: all playback is driven by effects.
  const ownPlayer = useVideoPlayer(uri, undefined);

  // The VideoView shows whichever player is active.
  const activePlayer = externalPlayer ?? ownPlayer;

  // Own-player path: load + play via replaceAsync (off main-thread on iOS).
  // Fires on initial mount and whenever URI or rendererKey changes.
  useEffect(() => {
    if (externalPlayer || !uri) return;
    ownPlayer.replaceAsync({ uri })
      .then(() => {
        ownPlayer.loop = true;
        ownPlayer.play();
      })
      .catch(() => { /* ignore aborted replacements */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri, rendererKey]);

  // External-player path: set loop and start playing as soon as the player arrives.
  useEffect(() => {
    if (!externalPlayer) return;
    try {
      externalPlayer.loop = true;
      externalPlayer.play();
    } catch { /* ignore */ }
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
