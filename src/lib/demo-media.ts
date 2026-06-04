export type DemoHighlight = {
  title: string;
  url: string;
  thumbUrl: string;
};

/** Mixkit soccer clips — direct MP4, works in HTML5 video with sound. */
export const DEMO_PLAYER_HIGHLIGHTS: Record<string, DemoHighlight[]> = {
  "marco-silva": [
    {
      title: "Midfield highlights",
      url: "https://assets.mixkit.co/videos/preview/mixkit-soccer-player-dribbling-the-ball-4354-large.mp4",
      thumbUrl:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Training session",
      url: "https://assets.mixkit.co/videos/preview/mixkit-football-player-training-4340-large.mp4",
      thumbUrl:
        "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80",
    },
  ],
  "alex-rivera": [
    {
      title: "Winger highlights",
      url: "https://assets.mixkit.co/videos/preview/mixkit-young-football-player-kicking-4313-large.mp4",
      thumbUrl:
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Match clips",
      url: "https://assets.mixkit.co/videos/preview/mixkit-man-playing-soccer-5017-large.mp4",
      thumbUrl:
        "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

export function isBrokenDemoVideoUrl(url: string): boolean {
  return (
    url.includes("flower.mp4") ||
    url.includes("pexels.com") ||
    url.includes("interactive-examples.mdn.mozilla.net")
  );
}
