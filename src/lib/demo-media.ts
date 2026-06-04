import { demoClipUrl } from "./demo-clips";

export type DemoHighlight = {
  title: string;
  url: string;
  thumbUrl: string;
};

/** Soccer thumbnails + same-origin proxied highlight videos. */
export const DEMO_PLAYER_HIGHLIGHTS: Record<string, DemoHighlight[]> = {
  "marco-silva": [
    {
      title: "Midfield highlights",
      url: demoClipUrl("marco-1"),
      thumbUrl:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Training session",
      url: demoClipUrl("marco-2"),
      thumbUrl:
        "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80",
    },
  ],
  "alex-rivera": [
    {
      title: "Winger highlights",
      url: demoClipUrl("alex-1"),
      thumbUrl:
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Match clips",
      url: demoClipUrl("alex-2"),
      thumbUrl:
        "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

export function isBrokenDemoVideoUrl(url: string): boolean {
  return !url.startsWith("/api/media/demo/");
}
