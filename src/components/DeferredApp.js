import { useEffect, useLayoutEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LOAD_APP_EVENT } from "../utils/loadApp";

const App = dynamic(() => import("../App"), {
  ssr: false,
  loading: () => null,
});

function AppMountNotifier({ onReady, children }) {
  useLayoutEffect(() => {
    onReady?.();
  }, [onReady]);

  return children;
}

export default function DeferredApp({ shellMounted = false, onAppReady }) {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const enable = () => setLoad((current) => current || true);
    window.addEventListener(LOAD_APP_EVENT, enable);
    return () => window.removeEventListener(LOAD_APP_EVENT, enable);
  }, []);

  if (!load) {
    return null;
  }

  return (
    <AppMountNotifier onReady={onAppReady}>
      <App shellMounted={shellMounted} />
    </AppMountNotifier>
  );
}
