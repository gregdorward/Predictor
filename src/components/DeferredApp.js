import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LOAD_APP_EVENT } from "../utils/loadApp";

const App = dynamic(() => import("../App"), {
  ssr: false,
  loading: () => null,
});

const IDLE_TIMEOUT_MS = 3500;

export default function DeferredApp() {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const enable = () => setLoad((current) => current || true);

    window.addEventListener(LOAD_APP_EVENT, enable);

    let idleId;
    if (typeof requestIdleCallback !== "undefined") {
      idleId = requestIdleCallback(enable, { timeout: IDLE_TIMEOUT_MS });
    } else {
      idleId = setTimeout(enable, IDLE_TIMEOUT_MS);
    }

    return () => {
      window.removeEventListener(LOAD_APP_EVENT, enable);
      if (typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, []);

  if (!load) {
    return null;
  }

  return <App />;
}
