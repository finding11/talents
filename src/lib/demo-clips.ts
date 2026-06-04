/** Upstream sources proxied through /api/media/demo/[clipId] (same-origin playback). */
export const DEMO_CLIP_SOURCES: Record<string, string> = {
  "marco-1":
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "marco-2":
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "alex-1":
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "alex-2":
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
};

export function demoClipUrl(clipId: string): string {
  return `/api/media/demo/${clipId}`;
}

export function isProxiedDemoVideoUrl(url: string): boolean {
  return url.startsWith("/api/media/demo/");
}
