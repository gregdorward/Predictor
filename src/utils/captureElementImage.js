import { Chart as ChartJS } from "chart.js";

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

export async function waitForReplacementImages(replacements = []) {
  await Promise.all(
    replacements.map(
      ({ img }) =>
        img.decode?.() ??
        new Promise((resolve, reject) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = reject;
        })
    )
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

function mountExportClone(element) {
  const rect = element.getBoundingClientRect();
  const width = rect.width || element.offsetWidth;
  const clone = element.cloneNode(true);

  clone.classList.add("is-exporting");
  clone.setAttribute("aria-hidden", "true");
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.zIndex = "-1";
  clone.style.pointerEvents = "none";
  clone.style.margin = "0";
  clone.style.width = width ? `${width}px` : element.style.width;
  clone.style.maxWidth = width ? `${width}px` : element.style.maxWidth;

  document.body.appendChild(clone);
  return clone;
}

export async function captureCanvasAsPng(
  canvas,
  { brandElement, scale = 2 } = {}
) {
  if (!canvas) {
    throw new Error("Nothing to capture");
  }

  const wrapper = document.createElement("div");
  wrapper.className = "ShareableVisual__canvasExport";
  wrapper.style.background = getExportBackgroundColor();
  wrapper.style.display = "inline-block";
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.style.pointerEvents = "none";

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

  if (brandElement) {
    const brand = brandElement.cloneNode(true);
    brand.style.display = "block";
    brand.setAttribute("aria-hidden", "true");
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

  const liveCanvases = [...element.querySelectorAll("canvas")];
  const clone = mountExportClone(element);

  if (brandElement) {
    const brand = brandElement.cloneNode(true);
    brand.style.display = "block";
    brand.setAttribute("aria-hidden", "true");
    clone.appendChild(brand);
  }

  const replacements = replaceCanvasesWithImages(clone, liveCanvases);

  try {
    await waitForReplacementImages(replacements);
    await waitForNextPaint();

    const { domToPng } = await import("modern-screenshot");
    const dataUrl = await domToPng(clone, {
      scale,
      backgroundColor: getExportBackgroundColor(),
      filter: (node) => node.tagName !== "CANVAS",
    });

    if (!dataUrl || !dataUrl.startsWith("data:image")) {
      throw new Error("Capture returned invalid image data");
    }

    return dataUrl;
  } finally {
    document.body.removeChild(clone);
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
