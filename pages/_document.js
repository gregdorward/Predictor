import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheets } from "@material-ui/core/styles";
import GUEST_LANDING_CRITICAL_CSS from "../src/critical/guestLandingCriticalCss";

// Mediavine's verification crawler reads the served HTML and looks for their
// Ad Setup snippet verbatim. React serialises async={true} as async="" and
// next/script injects client-side, so neither renders a matching tag. The
// snippet is emitted as raw HTML instead, escaping out of an empty <script>
// so the surrounding markup stays valid.
const JOURNEY_ADS_SNIPPET =
  '<script type="text/javascript" async="async" data-noptimize="1" data-cfasync="false" src="//scripts.scriptwrapper.com/tags/71e44a5d-dc3a-499d-8677-800918c94d8a.js"></script>';

// Keep the Mediavine snippet in the HTML for their verification crawler,
// but inert until after hydration. A live head script mutates the DOM
// (mv-ad-box rails) before React hydrates, which throws on these pages.
const JOURNEY_ADS_HTML = `</script><template id="ssh-mediavine-snippet">${JOURNEY_ADS_SNIPPET}</template><script>`;

class SiteHead extends Head {
  getCssLinks(files) {
    const links = super.getCssLinks(files);
    if (!links) return links;

    const deferred = [];
    React.Children.forEach(links, (link) => {
      if (!link) return;
      if (link.props?.rel === "stylesheet") {
        const href = link.props.href;
        deferred.push(
          React.cloneElement(link, {
            key: link.key || href,
            media: "print",
            "data-ssh-css": "1",
          })
        );
        deferred.push(
          <noscript key={`${link.key || href}-ns`}>
            <link rel="stylesheet" href={href} />
          </noscript>
        );
      } else {
        deferred.push(link);
      }
    });
    return deferred;
  }
}

// media="print" stylesheets are not render-blocking. Apply them after parse so
// first paint can use the inlined critical CSS. type=module defers this.
const APPLY_DEFERRED_CSS = `
document.querySelectorAll('link[rel="stylesheet"][data-ssh-css]').forEach(function (link) {
  var apply = function () { link.media = "all"; };
  if (link.sheet) apply();
  else {
    link.addEventListener("load", apply);
    link.addEventListener("error", apply);
  }
});
`;

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
    },
    {
      "@type": "Organization",
      "@id": "https://www.soccerstatshub.com/#organization",
      name: "Soccer Stats Hub",
      url: "https://www.soccerstatshub.com/",
      logo: "https://www.soccerstatshub.com/images/NewLogo.png",
      description:
        "Soccer Stats Hub publishes football statistics, prediction tools, competition trends and transparent match research.",
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

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <SiteHead>
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
            href="/fonts/OpenSans-SemiBold.woff2"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          {/* eslint-disable-next-line react/no-danger */}
          <style dangerouslySetInnerHTML={{ __html: FONT_AND_SPLASH_CSS }} />
          {/* eslint-disable-next-line react/no-danger */}
          <style dangerouslySetInnerHTML={{ __html: GUEST_LANDING_CRITICAL_CSS }} />
          <link rel="preconnect" href="https://scripts.scriptwrapper.com" />
          <link rel="preconnect" href="https://scripts.journeymv.com" />
          <link rel="preconnect" href="https://eu-us-cdn.consentmanager.net" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://eu-us.consentmanager.net" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://scripts.scriptwrapper.com" />
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JOURNEY_ADS_HTML }}
          />
          <script
            type="module"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: APPLY_DEFERRED_CSS }}
          />
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
          />
          <script data-grow-initializer="" />
        </SiteHead>
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
