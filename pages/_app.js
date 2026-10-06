import { useEffect } from "react";
import Head from "next/head";
import { Provider } from "react-redux";
import store from "../src/logic/store";
import { AuthProvider } from "../src/logic/authProvider";
import { initTheme } from "../src/utils/theme";
import { loadThirdPartyScripts } from "../src/utils/loadThirdPartyScripts";
import reportWebVitals from "../src/reportWebVitals";
import "../src/index.css";
import "../src/styles/home-guest-landing-polish.css";
import "../src/styles/premium-upsell-polish.css";
import "../src/styles/rankings-duel.css";
import "../src/styles/competitions-index-layout.css";
import "../src/styles/fixtures-index-layout.css";
import "../src/styles/competitions-polish.css";
import "../src/styles/competition-form-chart.css";
import "../src/styles/competition-hub-polish.css";
import "../src/styles/fixture-markets-snapshot.css";
import "../src/styles/fixture-page-adapt.css";
import "../src/styles/articles-desktop-type.css";

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    initTheme();
    document.body.classList.add("js-loaded");
    if (process.env.NODE_ENV === "production") {
      loadThirdPartyScripts();
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      reportWebVitals((metric) => {
        if (typeof window.gtag === "function") {
          window.gtag("event", metric.name, {
            value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
            event_category: "Web Vitals",
            event_label: metric.id,
            non_interaction: true,
          });
        }
      });
    }
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <Head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, viewport-fit=cover"
          />
        </Head>
        <Component {...pageProps} />
      </AuthProvider>
    </Provider>
  );
}
