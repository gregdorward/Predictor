import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheets } from "@material-ui/core/styles";
import GUEST_LANDING_CRITICAL_CSS from "../src/critical/guestLandingCriticalCss";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.soccerstatshub.com/#website",
      url: "https://www.soccerstatshub.com/",
      name: "Soccer Stats Hub",
      description:
        "Football stats, BTTS, Under 2.5, xG, form, correct score analysis and prediction tools.",
      inLanguage: "en-GB",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://www.soccerstatshub.com/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://www.soccerstatshub.com/#organization",
      name: "Soccer Stats Hub",
      url: "https://www.soccerstatshub.com/",
      logo: "https://www.soccerstatshub.com/images/NewLogo.png",
      description:
        "Soccer Stats Hub publishes football statistics, prediction tools, competition trends and transparent match research.",
      sameAs: ["https://www.soccerstatshub.com/about/"],
    },
  ],
};

const FONT_AND_SPLASH_CSS = `
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/OpenSans-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/OpenSans-SemiBold.woff2') format('woff2');
}
html, body { margin: 0; min-height: 100%; }
body { background-color: #ffffff; }
body.dark-mode { background-color: #000000; color: #ffffff; }
.app-splash {
  display: flex; flex-direction: column; justify-content: center;
  align-items: center; min-height: 100vh; gap: 1rem; padding: 2rem;
  box-sizing: border-box;
}
.app-splash__spinner {
  width: 2.75rem; height: 2.75rem; border: 0.2rem solid rgba(2, 0, 41, 0.12);
  border-top-color: #fe8c00; border-radius: 50%;
  animation: app-splash-spin 0.75s linear infinite;
}
body.dark-mode .app-splash__spinner {
  border-color: rgba(255, 255, 255, 0.15); border-top-color: #fe8c00;
}
.app-splash__text {
  margin: 0; font-family: 'Open Sans', system-ui, sans-serif;
  font-size: 1.1rem; font-weight: 600; color: #020029; letter-spacing: 0.02em;
}
body.dark-mode .app-splash__text { color: #ffffff; }
@keyframes app-splash-spin { to { transform: rotate(360deg); } }
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
`;

// Runs before hydration to avoid a flash of the wrong theme.
const THEME_BOOT_SCRIPT = `
(function () {
  try {
    var params = new URLSearchParams(window.location.search);
    var theme = params.get("theme") || localStorage.getItem("theme");
    var isDark =
      theme === "dark" ||
      (!theme && window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) { document.body.classList.add("dark-mode"); }
  } catch (error) {}
})();
`;

// Load Google Analytics after the page is idle so it doesn't compete with LCP.
const DEFERRED_GA_SCRIPT = `
(function () {
  function loadGA() {
    if (window.__sshGaLoaded) return;
    window.__sshGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
  }
  function injectGtag() {
    loadGA();
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=G-9F3KSWZWEQ";
    s.onload = function () { gtag("config", "G-9F3KSWZWEQ"); };
    document.head.appendChild(s);
  }
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(injectGtag, { timeout: 5000 });
  } else {
    window.addEventListener("load", function () { setTimeout(injectGtag, 2000); });
  }
})();
`;

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/logo192.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#000000" />
          <meta
            name="msvalidate.01"
            content="6F676F15115DB2A7E13109B4A7C0BA02"
          />
          <link
            rel="preload"
            as="font"
            href="/fonts/OpenSans-Regular.woff2"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            as="font"
            href="/fonts/OpenSans-SemiBold.woff2"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            as="image"
            href="/images/landing-fixtures-laptop.png"
            type="image/png"
          />
          {/* eslint-disable-next-line react/no-danger */}
          <style dangerouslySetInnerHTML={{ __html: FONT_AND_SPLASH_CSS }} />
          {/* eslint-disable-next-line react/no-danger */}
          <style dangerouslySetInnerHTML={{ __html: GUEST_LANDING_CRITICAL_CSS }} />
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
          />
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2835838153738108"
            crossOrigin="anonymous"
          />
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: DEFERRED_GA_SCRIPT }}
          />
        </Head>
        <body>
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
          />
          <noscript>
            <p>
              Soccer Stats Hub - football stats, BTTS tips, Over 2.5 predictions,
              correct score analysis and daily multis for today&apos;s matches.
            </p>
            <p>You need to enable JavaScript to use the full interactive app.</p>
          </noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// Collect Material-UI v4 (JSS / makeStyles) styles at build time so
// statically exported pages render with their styles inlined.
MyDocument.getInitialProps = async (ctx) => {
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
    });

  const initialProps = await Document.getInitialProps(ctx);

  return {
    ...initialProps,
    styles: [
      ...React.Children.toArray(initialProps.styles),
      sheets.getStyleElement(),
    ],
  };
};
