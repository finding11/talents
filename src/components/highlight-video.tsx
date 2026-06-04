"use client";

type HighlightVideoProps = {
  src: string;
  poster?: string | null;
  title?: string;
  /** preview = muted loop on Discover cards; player = full controls with sound */
  mode?: "preview" | "player";
  className?: string;
};

export function HighlightVideo({
  src,
  poster,
  title,
  mode = "player",
  className = "w-full",
}: HighlightVideoProps) {
  const isPreview = mode === "preview";

  return (
    <video
      className={className}
      controls
      playsInline
      preload="metadata"
      poster={poster ?? undefined}
      muted={isPreview}
      autoPlay={isPreview}
      loop={isPreview}
      aria-label={title ?? "Highlight video"}
      onClick={(e) => e.stopPropagation()}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
