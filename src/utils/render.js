// utils/render.js
import { createRoot } from 'react-dom/client';

const roots = new Map();

export function render(element, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Reuse existing root if it exists
  let root = roots.get(containerId);
  if (!root) {
    root = createRoot(container);
    roots.set(containerId, root);
  }

  root.render(element);
}
