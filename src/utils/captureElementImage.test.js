jest.mock("modern-screenshot", () => ({
  domToPng: jest.fn(async () => "data:image/png;base64,abc"),
}));

import {
  sanitizeImageFilename,
  replaceCanvasesWithImages,
  restoreCanvasReplacements,
  captureCanvasAsPng,
  captureElementAsPng,
} from "./captureElementImage";

describe("captureElementImage", () => {
  beforeAll(() => {
    HTMLImageElement.prototype.decode = jest.fn(() => Promise.resolve());
  });

  test("sanitizes filenames for download", () => {
    expect(sanitizeImageFilename("Arsenal vs Chelsea - Rankings")).toBe(
      "arsenal-vs-chelsea-rankings"
    );
  });

  test("falls back when filename is empty", () => {
    expect(sanitizeImageFilename("!!!")).toBe("soccerstatshub-visual");
  });

  test("swaps canvases for images during export", () => {
    const root = document.createElement("div");
    const canvas = document.createElement("canvas");
    canvas.toDataURL = jest.fn(
      () => "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    );
    Object.defineProperty(canvas, "getBoundingClientRect", {
      value: () => ({ width: 120, height: 80 }),
    });
    root.appendChild(canvas);

    const replacements = replaceCanvasesWithImages(root);
    expect(replacements).toHaveLength(1);
    expect(root.querySelector("img")).not.toBeNull();
    expect(root.querySelector("canvas")).toBeNull();

    restoreCanvasReplacements(replacements);
    expect(root.querySelector("canvas")).toBe(canvas);
    expect(root.querySelector("img")).toBeNull();
  });

  test("captures from a clone without mutating live canvases", async () => {
    const element = document.createElement("div");
    element.className = "ComparisonBarChart";
    document.body.appendChild(element);
    Object.defineProperty(element, "offsetWidth", { value: 320 });
    Object.defineProperty(element, "getBoundingClientRect", {
      value: () => ({ width: 320, height: 240 }),
    });

    const canvas = document.createElement("canvas");
    canvas.toDataURL = jest.fn(
      () =>
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    );
    Object.defineProperty(canvas, "getBoundingClientRect", {
      value: () => ({ width: 280, height: 200 }),
    });
    element.appendChild(canvas);

    const dataUrl = await captureElementAsPng(element);
    expect(dataUrl.startsWith("data:image")).toBe(true);
    expect(element.querySelector("canvas")).toBe(canvas);
    expect(document.querySelector(".is-exporting")).toBeNull();
    document.body.removeChild(element);
  });

  test("exports canvas without leaving ephemeral nodes in the document", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    canvas.toDataURL = jest.fn(
      () =>
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    );
    Object.defineProperty(canvas, "getBoundingClientRect", {
      value: () => ({ width: 120, height: 80 }),
    });

    const dataUrl = await captureCanvasAsPng(canvas);
    expect(dataUrl.startsWith("data:image")).toBe(true);
    expect(document.querySelector(".ShareableVisual__canvasExport")).toBeNull();
  });

  test("appends brand footer on the export shell outside the chart card", async () => {
    const element = document.createElement("div");
    element.setAttribute("data-share-capture", "");
    element.className = "ComparisonBarChart";
    document.body.appendChild(element);
    Object.defineProperty(element, "offsetWidth", { value: 320 });
    Object.defineProperty(element, "getBoundingClientRect", {
      value: () => ({ width: 320, height: 240 }),
    });

    const brand = document.createElement("div");
    brand.className = "ShareableVisual__brand";
    brand.innerHTML = '<span class="ShareableVisual__brandMark"></span>';

    const { domToPng } = require("modern-screenshot");
    domToPng.mockImplementation(async (node) => {
      expect(node.classList.contains("ShareableVisual__exportShell")).toBe(true);
      expect(node.querySelector("[data-share-capture]")).not.toBeNull();
      const brandNode = node.querySelector(".ShareableVisual__brand");
      expect(brandNode).not.toBeNull();
      expect(brandNode.parentElement).toBe(node);
      expect(brandNode.parentElement.classList.contains("ComparisonBarChart")).toBe(
        false
      );
      return "data:image/png;base64,abc";
    });

    const dataUrl = await captureElementAsPng(element, { brandElement: brand });
    expect(dataUrl.startsWith("data:image")).toBe(true);
    expect(element.querySelector(".ShareableVisual__brand")).toBeNull();
    document.body.removeChild(element);
  });
});
