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

  test("captures from an off-screen clone without mutating live canvases", async () => {
    const element = document.createElement("div");
    element.className = "ComparisonBarChart";
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
});
