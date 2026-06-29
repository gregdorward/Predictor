import { useLayoutEffect } from "react";

function equalizeTableRowHeights(table) {
  const rows = table.querySelectorAll("tbody tr");
  if (!rows.length) {
    return;
  }

  rows.forEach((row) => {
    row.style.height = "auto";
  });

  let maxHeight = 0;
  rows.forEach((row) => {
    maxHeight = Math.max(maxHeight, row.getBoundingClientRect().height);
  });

  if (maxHeight <= 0) {
    return;
  }

  rows.forEach((row) => {
    row.style.height = `${maxHeight}px`;
  });
}

export function useEqualTableRowHeights(tableRef, deps = []) {
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table) {
      return undefined;
    }

    const run = () => equalizeTableRowHeights(table);

    run();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(run)
        : null;

    observer?.observe(table);

    window.addEventListener("resize", run);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", run);
    };
  }, deps);
}
