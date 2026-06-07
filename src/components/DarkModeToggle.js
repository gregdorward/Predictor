import { useState, useEffect } from "react";
import { getStoredTheme, applyTheme } from "../utils/theme";

function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => getStoredTheme() === "dark"
  );

  useEffect(() => {
    applyTheme(isDarkMode ? "dark" : "light");
  }, [isDarkMode]);
  
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