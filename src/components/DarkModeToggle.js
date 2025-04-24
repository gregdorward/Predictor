import React, { useState, useEffect } from 'react';

function ThemeToggle() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark') {
        return true;
      } else if (storedTheme === 'light') {
        return false;
      } else {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    });
  
    useEffect(() => {
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
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