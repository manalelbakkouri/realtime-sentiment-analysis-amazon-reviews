
import React, { createContext, useState, useEffect, useContext } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create the context with an initial undefined value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define the ThemeProvider component properly as a function component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if user has a preferred theme from system or previous visit
  const [theme, setTheme] = useState<Theme>(() => {
    // When running in the browser, check localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
    }
    
    // Default to dark theme if no saved preference
    return "dark";
  });

  useEffect(() => {
    // Only run this effect in the browser
    if (typeof window === 'undefined') return;
    
    // Update data-theme attribute on document for CSS variables
    document.documentElement.setAttribute("data-theme", theme);
    // Save theme preference
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "dark" ? "light" : "dark"));
  };

  // Create the context value object
  const contextValue: ThemeContextType = {
    theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
