import { useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import { Provider } from "react-redux";
import store from "../src/logic/store";
import { AuthProvider } from "../src/logic/authProvider";
import { initTheme } from "../src/utils/theme";
import reportWebVitals from "../src/reportWebVitals";
import "../src/index.css";

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    initTheme();
    document.body.classList.add("js-loaded");
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
            content="width=device-width, initial-scale=1"
          />
        </Head>
        <Script
          src="//scripts.scriptwrapper.com/tags/71e44a5d-dc3a-499d-8677-800918c94d8a.js"
          strategy="afterInteractive"
          data-noptimize="1"
          data-cfasync="false"
        />
        <Component {...pageProps} />
      </AuthProvider>
    </Provider>
  );
}
