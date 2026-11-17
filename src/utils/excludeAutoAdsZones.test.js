import {
  AUTO_ADS_EXCLUDE_CLASS,
  startAutoAdsZoneExclusion,
} from "./excludeAutoAdsZones";

describe("excludeAutoAdsZones", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("removes auto ad nodes inside exclude zones", () => {
    document.body.innerHTML = `
      <div class="${AUTO_ADS_EXCLUDE_CLASS}">
        <ul>
          <li>Benefit</li>
          <div class="google-auto-placed"><ins class="adsbygoogle"></ins></div>
          <li>Ad-free</li>
        </ul>
      </div>
      <div class="google-auto-placed"><ins class="adsbygoogle"></ins></div>
    `;

    const disconnect = startAutoAdsZoneExclusion();
    expect(
      document.querySelector(`.${AUTO_ADS_EXCLUDE_CLASS} .google-auto-placed`)
    ).toBeNull();
    expect(document.querySelectorAll(".google-auto-placed")).toHaveLength(1);
    disconnect();
  });

  test("strips ads injected after the observer starts", async () => {
    document.body.innerHTML = `<div class="${AUTO_ADS_EXCLUDE_CLASS}"><ul></ul></div>`;
    const disconnect = startAutoAdsZoneExclusion();
    const zone = document.querySelector(`.${AUTO_ADS_EXCLUDE_CLASS} ul`);
    const injected = document.createElement("p");
    injected.className = "google-auto-placed";
    zone.appendChild(injected);
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    expect(zone.querySelector(".google-auto-placed")).toBeNull();
    disconnect();
  });
});