"use client"

import { Link } from "react-router-dom"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "./contexts/ThemeContext"

const Header = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold">
            Amazon Reviews Analysis
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:underline">
            Dashboard
          </Link>
          <Link to="/reviews" className="text-sm font-medium hover:underline">
            Reviews
          </Link>
          <Link to="/analytics" className="text-sm font-medium hover:underline">
            Analytics
          </Link>
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header
