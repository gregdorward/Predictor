import { useEffect, useRef, useState } from "react";

function canObserve() {
  return typeof window !== "undefined" && "IntersectionObserver" in window;
}

/**
 * Mounts its chart only once the slot nears the viewport, so off-screen
 * canvases cost nothing on load and their entry animation plays in view.
 *
 * Reserve the slot with `aspectRatio` (width / height, for charts that keep
 * their aspect ratio) or `height` (px or CSS length). `fill` stretches the slot
 * to a parent that already sets a height.
 */
export default function LazyChart({
  children,
  aspectRatio,
  height,
  fill = false,
  rootMargin = "200px 0px",
  className = "",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return undefined;
    const el = ref.current;
    if (!el || !canObserve()) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  const style = { position: "relative", width: "100%" };
  if (fill) style.height = "100%";
  if (height != null) style.height = typeof height === "number" ? `${height}px` : height;
  if (!visible && aspectRatio && height == null && !fill) style.aspectRatio = String(aspectRatio);

  return (
    <div
      ref={ref}
      className={`LazyChart${visible ? " is-ready" : ""}${className ? ` ${className}` : ""}`}
      style={style}
    >
      {visible ? children : null}
    </div>
  );
}
