"use client"

import { useTheme } from "./contexts/ThemeContext"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
      onClick={toggleTheme}
    >
      {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
