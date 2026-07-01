import { useEffect } from "react";
import Head from "next/head";
import { Provider } from "react-redux";
import store from "../src/logic/store";
import { AuthProvider } from "../src/logic/authProvider";
import { initTheme } from "../src/utils/theme";
import "../src/index.css";

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    initTheme();
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
        <Component {...pageProps} />
      </AuthProvider>
    </Provider>
  );
}
