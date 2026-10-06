import {
  formatMatchPreviewParagraphs,
  matchPreviewErrorMessage,
} from "./matchPreviewFormat";

describe("formatMatchPreviewParagraphs", () => {
  it("keeps one paragraph per preview block", () => {
    const text =
      "They average 1.4 xG at home. The away side concede often.";
    expect(formatMatchPreviewParagraphs(text)).toEqual([text]);
  });

  it("splits on explicit newlines", () => {
    expect(formatMatchPreviewParagraphs("Line one\nLine two")).toEqual([
      "Line one",
      "Line two",
    ]);
  });
});

describe("matchPreviewErrorMessage", () => {
  it("maps HTTP failures to plain language", () => {
    expect(
      matchPreviewErrorMessage(new Error("HTTP error! Status: 500"))
    ).toMatch(/preview service/i);
  });
});
