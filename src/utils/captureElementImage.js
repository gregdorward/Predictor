import { Chart as ChartJS } from "chart.js";
import {
  exportImageProxyPath,
  getAllowedExportImageUrl,
} from "./exportImageProxy";

const inlinedExportImageCache = new Map();

export function sanitizeImageFilename(value) {
  return String(value || "soccerstatshub-visual")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "soccerstatshub-visual";
}

export function getExportBackgroundColor() {
  if (typeof document === "undefined") {
    return "#ffffff";
  }
  return document.body.classList.contains("dark-mode") ? "#000000" : "#ffffff";
}

function dataUrlToBlobSync(dataUrl) {
  const parts = dataUrl.split(",");
  if (parts.length < 2) {
    throw new Error("Invalid image data");
  }

  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function getCanvasDataUrl(canvas) {
  const chart = ChartJS.getChart(canvas);
  if (chart && typeof chart.toBase64Image === "function") {
    return chart.toBase64Image("image/png", 1);
  }

  return canvas.toDataURL("image/png");
}

export function replaceCanvasesWithImages(root, liveCanvases = null) {
  const replacements = [];
  const sourceCanvases = liveCanvases ?? [...root.querySelectorAll("canvas")];
  const targetCanvases = [...root.querySelectorAll("canvas")];

  targetCanvases.forEach((canvas, index) => {
    const sourceCanvas = sourceCanvases[index] ?? canvas;
    let dataUrl = null;
    try {
      dataUrl = getCanvasDataUrl(sourceCanvas);
    } catch (error) {
      console.warn("Unable to export chart canvas", error);
      return;
    }

    if (!dataUrl || dataUrl === "data:," || dataUrl.length < 32) {
      return;
    }

    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = "";
    img.setAttribute("role", "presentation");

    const rect = sourceCanvas.getBoundingClientRect();
    img.style.width = `${rect.width}px`;
    img.style.height = `${rect.height}px`;
    img.style.display = "block";
    img.style.maxWidth = "100%";

    const parent = canvas.parentElement;
    const sourceParent = sourceCanvas.parentElement;
    if (parent && sourceParent) {
      const parentRect = sourceParent.getBoundingClientRect();
      parent.style.width = `${parentRect.width}px`;
      parent.style.height = `${parentRect.height}px`;
      parent.replaceChild(img, canvas);
      replacements.push({ canvas, img, parent });
    }
  });

  return replacements;
}

function waitForImage(img) {
  if (!img) return Promise.resolve();
  if (typeof img.decode === "function") {
    return img.decode().catch(() => {});
  }
  if (img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

export async function waitForReplacementImages(replacements = []) {
  await Promise.all(replacements.map(({ img }) => waitForImage(img)));
}

async function waitForImages(root) {
  if (!root?.querySelectorAll) return;
  await Promise.all([...root.querySelectorAll("img")].map(waitForImage));
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : null);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function fetchAsDataUrl(url) {
  if (typeof fetch !== "function") return null;
  const response = await fetch(url, {
    mode: "cors",
    credentials: "omit",
    headers: { accept: "image/*" },
  });
  if (!response.ok) return null;
  const blob = await response.blob();
  if (!blob.type.startsWith("image/") || !blob.size) return null;
  return blobToDataUrl(blob);
}

async function imageUrlToDataUrl(url) {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) {
    return url || null;
  }
  const cached = inlinedExportImageCache.get(url);
  if (cached) return cached;

  try {
    const direct = await fetchAsDataUrl(url);
    if (direct) {
      inlinedExportImageCache.set(url, direct);
      return direct;
    }
  } catch {
    // Cross-origin CDNs (FootyStats) usually block this; try the same-origin proxy.
  }

  if (getAllowedExportImageUrl(url)) {
    try {
      const proxied = await fetchAsDataUrl(exportImageProxyPath(url));
      if (proxied) {
        inlinedExportImageCache.set(url, proxied);
        return proxied;
      }
    } catch {
      return null;
    }
  }

  return null;
}

async function inlineExternalImages(root) {
  if (!root?.querySelectorAll) return;
  const images = [...root.querySelectorAll("img")];
  await Promise.all(
    images.map(async (img) => {
      const src = img.currentSrc || img.getAttribute("src") || img.src;
      if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;
      const dataUrl = await imageUrlToDataUrl(src);
      if (dataUrl) {
        img.src = dataUrl;
      }
    })
  );
}

export function restoreCanvasReplacements(replacements = []) {
  replacements.forEach(({ canvas, img, parent }) => {
    if (img.parentElement === parent) {
      parent.replaceChild(canvas, img);
    }
  });
}

export async function waitForNextPaint() {
  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

function prepareBrandClone(brandElement) {
  if (!brandElement) return null;
  const brand = brandElement.cloneNode(true);
  brand.style.display = "block";
  brand.setAttribute("aria-hidden", "true");
  return brand;
}

/**
 * Mount an export shell in the viewport (behind page content).
 * Brand footer is a sibling under the chart card so border-radius
 * on ComparisonBarChart etc. cannot clip it.
 * Live charts are never mutated — only read via toBase64Image.
 *
 * Uses content-box sizing so border/padding do not shrink the chart
 * width (border-box + mobile viewport was clipping the right edge).
 */
function mountExportShell(element) {
  const rect = element.getBoundingClientRect();
  const width = Math.ceil(rect.width || element.offsetWidth || 0);
  const shell = document.createElement("div");
  const clone = element.cloneNode(true);

  shell.className = "ShareableVisual__exportShell is-exporting";
  shell.setAttribute("aria-hidden", "true");
  shell.style.position = "fixed";
  shell.style.left = "0";
  shell.style.top = "0";
  shell.style.zIndex = "-1";
  shell.style.pointerEvents = "none";
  shell.style.margin = "0";
  shell.style.boxSizing = "content-box";
  shell.style.width = width ? `${width}px` : element.style.width;
  shell.style.maxWidth = "none";
  shell.style.backgroundColor = getExportBackgroundColor();
  shell.style.overflow = "visible";

  clone.classList.add("is-exporting");
  clone.style.position = "relative";
  clone.style.left = "auto";
  clone.style.top = "auto";
  clone.style.zIndex = "auto";
  clone.style.boxSizing = "border-box";
  clone.style.width = "100%";
  clone.style.maxWidth = "100%";
  clone.style.margin = "0";
  clone.style.overflow = "visible";

  shell.appendChild(clone);
  document.body.appendChild(shell);
  return { shell, clone };
}

function withDocumentOverflowVisible(run) {
  const html = document.documentElement;
  const { body } = document;
  const prev = {
    htmlOverflowX: html.style.overflowX,
    bodyOverflowX: body.style.overflowX,
  };
  html.style.overflowX = "visible";
  body.style.overflowX = "visible";
  return Promise.resolve()
    .then(run)
    .finally(() => {
      html.style.overflowX = prev.htmlOverflowX;
      body.style.overflowX = prev.bodyOverflowX;
    });
}

function fitExportImages(replacements = []) {
  replacements.forEach(({ img, parent }) => {
    if (parent) {
      parent.style.width = "100%";
      parent.style.maxWidth = "100%";
      parent.style.height = "auto";
    }
    img.style.width = "100%";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
  });
}

export async function captureCanvasAsPng(
  canvas,
  { brandElement, scale = 2 } = {}
) {
  if (!canvas) {
    throw new Error("Nothing to capture");
  }

  const wrapper = document.createElement("div");
  wrapper.className = "ShareableVisual__canvasExport ShareableVisual__exportShell is-exporting";
  wrapper.style.background = getExportBackgroundColor();
  wrapper.style.display = "inline-block";
  wrapper.style.position = "fixed";
  wrapper.style.left = "0";
  wrapper.style.top = "0";
  wrapper.style.zIndex = "-1";
  wrapper.style.pointerEvents = "none";
  wrapper.style.overflow = "visible";
  wrapper.style.boxSizing = "content-box";
  wrapper.style.maxWidth = "none";

  const img = document.createElement("img");
  img.src = getCanvasDataUrl(canvas);
  img.alt = "";
  img.setAttribute("role", "presentation");

  const rect = canvas.getBoundingClientRect();
  img.style.width = `${rect.width}px`;
  img.style.height = `${rect.height}px`;
  img.style.display = "block";
  img.style.maxWidth = "none";

  wrapper.appendChild(img);

  const brand = prepareBrandClone(brandElement);
  if (brand) {
    wrapper.appendChild(brand);
  }

  document.body.appendChild(wrapper);

  try {
    await waitForReplacementImages([{ img }]);
    await waitForNextPaint();

    const { domToPng } = await import("modern-screenshot");
    const dataUrl = await domToPng(wrapper, {
      scale,
      backgroundColor: getExportBackgroundColor(),
    });

    if (!dataUrl || !dataUrl.startsWith("data:image")) {
      throw new Error("Capture returned invalid image data");
    }

    return dataUrl;
  } finally {
    document.body.removeChild(wrapper);
  }
}

export async function captureElementAsPng(
  element,
  { scale = 2, brandElement } = {}
) {
  if (!element) {
    throw new Error("Nothing to capture");
  }

  // Read pixels from live charts, then swap only on the clone.
  const liveCanvases = [...element.querySelectorAll("canvas")];
  const { shell, clone } = mountExportShell(element);

  clone
    .querySelectorAll(".ShareableVisual__brand")
    .forEach((node) => node.remove());

  const brand = prepareBrandClone(brandElement);
  if (brand) {
    // Keep brand outside the rounded chart card so it is not clipped.
    shell.appendChild(brand);
  }

  const replacements = replaceCanvasesWithImages(clone, liveCanvases);
  fitExportImages(replacements);

  try {
    await inlineExternalImages(shell);
    await waitForReplacementImages(replacements);
    await waitForImages(shell);
    await waitForNextPaint();

    const { domToPng } = await import("modern-screenshot");
    const dataUrl = await withDocumentOverflowVisible(() =>
      domToPng(shell, {
        scale,
        backgroundColor: getExportBackgroundColor(),
        filter: (node) => node.tagName !== "CANVAS",
        fetchFn: imageUrlToDataUrl,
      })
    );

    if (!dataUrl || !dataUrl.startsWith("data:image")) {
      throw new Error("Capture returned invalid image data");
    }

    return dataUrl;
  } finally {
    document.body.removeChild(shell);
  }
}

export async function dataUrlToBlob(dataUrl) {
  return dataUrlToBlobSync(dataUrl);
}

export function downloadDataUrl(dataUrl, filename) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = `${sanitizeImageFilename(filename)}.png`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function copyImageDataUrl(dataUrl) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    return false;
  }

  try {
    const blob = await dataUrlToBlob(dataUrl);
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": Promise.resolve(blob),
      }),
    ]);
    return true;
  } catch (error) {
    console.warn("Clipboard image copy failed", error);
    return false;
  }
}

export function canShareImageFiles() {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  );
}

export async function shareImageDataUrl(dataUrl, { filename, title, text }) {
  const blob = await dataUrlToBlob(dataUrl);
  const file = new File([blob], `${sanitizeImageFilename(filename)}.png`, {
    type: "image/png",
  });
  const payload = { files: [file], title };
  if (text && text !== title) {
    payload.text = text;
  }

  if (!navigator.share) {
    return false;
  }

  if (navigator.canShare && !navigator.canShare(payload)) {
    return false;
  }

  await navigator.share(payload);
  return true;
}
