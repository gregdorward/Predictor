import { flushAdSenseAds } from "./flushAdSenseAds";

describe("AdSense request scheduling", () => {
  const originalEnv = process.env.NODE_ENV;
  let frames;

  function addAd(width = 600, status) {
    const el = document.createElement("ins");
    el.className = "adsbygoogle";
    el.getBoundingClientRect = () => ({ width });
    if (status) el.setAttribute("data-adsbygoogle-status", status);
    document.body.appendChild(el);
    return el;
  }

  function runFrame() {
    frames.splice(0).forEach((callback) => callback());
  }

  beforeEach(() => {
    process.env.NODE_ENV = "production";
    frames = [];
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    window.adsbygoogle = [];
  });

  afterEach(() => {
    runFrame();
    document.body.innerHTML = "";
    delete window.adsbygoogle;
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it("batches simultaneous mounts while requesting every unit", () => {
    addAd();
    addAd();
    addAd();
    flushAdSenseAds();
    flushAdSenseAds();
    expect(frames).toHaveLength(1);
    runFrame();
    expect(window.adsbygoogle).toHaveLength(3);
  });

  it("does not duplicate queued requests before Google's script loads", () => {
    addAd();
    flushAdSenseAds();
    runFrame();
    addAd();
    flushAdSenseAds();
    runFrame();
    expect(window.adsbygoogle).toHaveLength(2);
  });

  it("skips hidden and already processed units", () => {
    addAd(0);
    addAd(600, "done");
    addAd();
    flushAdSenseAds();
    runFrame();
    expect(window.adsbygoogle).toHaveLength(1);
  });

  it("requests a hidden placement when it becomes measurable", () => {
    const el = addAd(0);
    flushAdSenseAds();
    runFrame();
    expect(window.adsbygoogle).toHaveLength(0);
    el.getBoundingClientRect = () => ({ width: 300 });
    flushAdSenseAds();
    runFrame();
    expect(window.adsbygoogle).toHaveLength(1);
  });

  it("ignores placements unmounted before the scheduled frame", () => {
    const el = addAd();
    flushAdSenseAds();
    el.remove();
    runFrame();
    expect(window.adsbygoogle).toHaveLength(0);
  });

  it("continues other requests after a tag error and allows retry", () => {
    addAd();
    addAd();
    const push = jest.fn().mockImplementationOnce(() => {
      throw new Error("TagError");
    });
    window.adsbygoogle = { push };
    jest.spyOn(console, "warn").mockImplementation(() => {});
    flushAdSenseAds();
    runFrame();
    expect(push).toHaveBeenCalledTimes(2);
    flushAdSenseAds();
    runFrame();
    expect(push).toHaveBeenCalledTimes(3);
  });

  it("does not request real ads in development", () => {
    process.env.NODE_ENV = "development";
    addAd();
    flushAdSenseAds();
    expect(frames).toHaveLength(0);
    expect(window.adsbygoogle).toHaveLength(0);
  });
});
