import { createRoot, hydrateRoot } from "react-dom/client";

const roots = new Map();

function hasPrerenderedAppContent(container) {
  return Boolean(
    container.querySelector(".App, .SubpageContent, .WC26, .p-4")
  );
}

export function render(element, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let root = roots.get(containerId);
  if (!root) {
    if (hasPrerenderedAppContent(container)) {
      root = hydrateRoot(container, element);
    } else {
      root = createRoot(container);
      root.render(element);
    }
    roots.set(containerId, root);
    return;
  }

  root.render(element);
}

export function clearRender(containerId) {
  const root = roots.get(containerId);
  if (root) {
    root.unmount();
    roots.delete(containerId);
  }

  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
  }
}
