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

  let entry = roots.get(containerId);
  if (!entry || entry.container !== container) {
    if (hasPrerenderedAppContent(container)) {
      entry = { container, root: hydrateRoot(container, element) };
    } else {
      entry = { container, root: createRoot(container) };
      entry.root.render(element);
    }
    roots.set(containerId, entry);
    return;
  }

  entry.root.render(element);
}

export function clearRender(containerId) {
  const entry = roots.get(containerId);
  if (entry) {
    entry.root.unmount();
    roots.delete(containerId);
  }

  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
  }
}
