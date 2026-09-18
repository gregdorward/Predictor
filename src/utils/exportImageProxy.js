export const EXPORT_IMAGE_HOSTS = ["cdn.footystats.org"];

const MAX_EXPORT_IMAGE_BYTES = 512 * 1024;

export function getAllowedExportImageUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(String(value));
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    if (!EXPORT_IMAGE_HOSTS.includes(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

export function exportImageProxyPath(imageUrl) {
  return `/api/export-image?url=${encodeURIComponent(imageUrl)}`;
}

export { MAX_EXPORT_IMAGE_BYTES };
