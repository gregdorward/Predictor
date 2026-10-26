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
  loadGA();
}
