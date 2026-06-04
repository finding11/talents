import { NextResponse } from "next/server";
import { DEMO_CLIP_SOURCES } from "@/lib/demo-clips";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ clipId: string }> }
) {
  const { clipId } = await context.params;
  const upstream = DEMO_CLIP_SOURCES[clipId];

  if (!upstream) {
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });
  }

  const range = req.headers.get("range");
  const upstreamRes = await fetch(upstream, {
    headers: range ? { Range: range } : undefined,
  });

  if (!upstreamRes.ok && upstreamRes.status !== 206) {
    return NextResponse.json({ error: "Video source unavailable" }, { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstreamRes.headers.get("content-type") ?? "video/mp4");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=86400");

  const contentLength = upstreamRes.headers.get("content-length");
  const contentRange = upstreamRes.headers.get("content-range");
  if (contentLength) headers.set("Content-Length", contentLength);
  if (contentRange) headers.set("Content-Range", contentRange);

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers,
  });
}
