import {
  getAllowedExportImageUrl,
  MAX_EXPORT_IMAGE_BYTES,
} from "../../src/utils/exportImageProxy";

export const config = { runtime: "edge" };

const CACHE_CONTROL =
  "public, s-maxage=86400, stale-while-revalidate=604800";

function errorResponse(message, status) {
  return new Response(message, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export default async function handler(req) {
  if (req.method !== "GET") {
    return errorResponse("Method not allowed", 405);
  }

  let target;
  try {
    const { searchParams } = new URL(req.url);
    target = getAllowedExportImageUrl(searchParams.get("url"));
  } catch {
    return errorResponse("Invalid url", 400);
  }

  if (!target) {
    return errorResponse("Image host is not allowed", 400);
  }

  const upstream = await fetch(target.href, {
    headers: { accept: "image/*" },
  });
  if (!upstream.ok) {
    return errorResponse("Upstream image failed", upstream.status);
  }

  const contentType = upstream.headers.get("content-type") || "image/png";
  if (!contentType.startsWith("image/")) {
    return errorResponse("Upstream was not an image", 400);
  }

  const buffer = await upstream.arrayBuffer();
  if (!buffer.byteLength || buffer.byteLength > MAX_EXPORT_IMAGE_BYTES) {
    return errorResponse("Image is empty or too large", 413);
  }

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
