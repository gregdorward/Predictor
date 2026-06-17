import { useState, useEffect } from "react";
import { getStoredTheme, applyTheme } from "../utils/theme";

function ThemeToggle() {
  // Start unchecked so server and first client render match (avoids hydration
  // mismatch); read the real stored theme after mount.
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDarkMode(getStoredTheme() === "dark");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      applyTheme(isDarkMode ? "dark" : "light");
    }
  }, [isDarkMode, mounted]);
  
    const handleThemeToggle = () => {
      setIsDarkMode(!isDarkMode);
    };
  
    return (
      <div>
        <label className="theme-switch" htmlFor="checkbox">
          <input
            type="checkbox"
            id="checkbox"
            checked={isDarkMode}
            onChange={handleThemeToggle}
            aria-label="Toggle light and dark theme"
          />
          <div className="slider round"></div>
        </label>
      </div>
    );
  }
  
  export default ThemeToggle;