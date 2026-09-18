import { getAllowedExportImageUrl, exportImageProxyPath } from "./exportImageProxy";

describe("exportImageProxy", () => {
  test("allows FootyStats CDN badge URLs", () => {
    const url = getAllowedExportImageUrl(
      "https://cdn.footystats.org/img/teams/england-arsenal-fc.png"
    );
    expect(url?.href).toBe(
      "https://cdn.footystats.org/img/teams/england-arsenal-fc.png"
    );
  });

  test("rejects other hosts and non-https URLs", () => {
    expect(getAllowedExportImageUrl("https://example.com/badge.png")).toBeNull();
    expect(
      getAllowedExportImageUrl("http://cdn.footystats.org/img/teams/x.png")
    ).toBeNull();
    expect(getAllowedExportImageUrl("not-a-url")).toBeNull();
  });

  test("builds a same-origin proxy path", () => {
    expect(
      exportImageProxyPath("https://cdn.footystats.org/img/teams/x.png")
    ).toBe(
      "/api/export-image?url=https%3A%2F%2Fcdn.footystats.org%2Fimg%2Fteams%2Fx.png"
    );
  });
});
