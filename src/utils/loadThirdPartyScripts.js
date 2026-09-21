const JOURNEY_SRC =
  "//scripts.scriptwrapper.com/tags/71e44a5d-dc3a-499d-8677-800918c94d8a.js";

function loadJourneyAds() {
  if (window.__sshJourneyLoaded) return;
  window.__sshJourneyLoaded = true;
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.setAttribute("data-noptimize", "1");
  script.setAttribute("data-cfasync", "false");
  script.src = JOURNEY_SRC;
  document.head.appendChild(script);
}

function loadGrow() {
  if (window.__sshGrowLoaded) return;
  window.__sshGrowLoaded = true;
  window.growMe ||
    ((window.growMe = function (e) {
      window.growMe._.push(e);
    }),
    (window.growMe._ = []));
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.defer = true;
  script.src = "https://faves.grow.me/main.js";
  script.setAttribute(
    "data-grow-faves-site-id",
    "U2l0ZTpiZjJjMTc3NS1kOGU1LTRlMTQtOTM3Yy1jZWU4MmU3OTUwMzM="
  );
  document.head.appendChild(script);
}

function hasDiscernibleText(el) {
  return (
    (el.textContent && el.textContent.trim()) ||
    el.getAttribute("aria-label") ||
    el.getAttribute("title")
  );
}

function patchOfferingLogo(img) {
  if (img.getAttribute("alt") !== "" || !img.getAttribute("aria-label")) return;
  img.removeAttribute("aria-label");
}

function patchGrowAccessibility(root) {
  const scope = root && root.querySelector ? root : document;
  scope.querySelectorAll("a.grow-housead").forEach((link) => {
    if (!hasDiscernibleText(link)) {
      link.setAttribute("aria-label", "Grow - Want fewer ads");
    }
  });
  scope.querySelectorAll("#offeringLogo").forEach(patchOfferingLogo);
}

function startGrowA11yPatch() {
  if (window.__sshGrowA11yStarted) return;
  window.__sshGrowA11yStarted = true;

  function schedulePatches() {
    patchGrowAccessibility(document);
    [0, 250, 1000, 3000, 8000].forEach((delay) => {
      window.setTimeout(() => {
        patchGrowAccessibility(document);
      }, delay);
    });
  }

  schedulePatches();
  if (!window.__sshGrowA11yObserver) {
    window.__sshGrowA11yObserver = new MutationObserver(() => {
      patchGrowAccessibility(document);
    });
    window.__sshGrowA11yObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["alt", "aria-label"],
    });
  }

  if (typeof window.growMe === "function") {
    window.growMe(() => {
      schedulePatches();
    });
  }
}

function loadGA() {
  if (window.__sshGaLoaded) return;
  window.__sshGaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-9F3KSWZWEQ";
  script.onload = () => {
    gtag("config", "G-9F3KSWZWEQ");
  };
  document.head.appendChild(script);
}

export function loadThirdPartyScripts() {
  if (typeof window === "undefined" || window.__sshThirdPartyLoaded) return;
  window.__sshThirdPartyLoaded = true;
  loadJourneyAds();
  loadGrow();
  startGrowA11yPatch();
  loadGA();
}
