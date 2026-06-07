export function getStoredTheme() {
  try {
    const params = new URLSearchParams(window.location.search);
    const queryTheme = params.get("theme");
    if (queryTheme === "dark" || queryTheme === "light") {
      return queryTheme;
    }

    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }
  } catch (error) {
    // localStorage may be unavailable
  }

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

export function applyTheme(theme) {
  const isDark = theme === "dark";

  if (isDark) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }

  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch (error) {
    // localStorage may be unavailable
  }
}

export function initTheme() {
  applyTheme(getStoredTheme());
}
