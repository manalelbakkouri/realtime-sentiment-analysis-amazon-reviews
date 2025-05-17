"use client"

import { Link, useLocation } from "react-router-dom"
import { Sun, Moon, BarChart2, Home, MessageSquare, Search, Bell } from "lucide-react"
import { useTheme } from "./contexts/ThemeContext"
import { useState, useEffect } from "react"

const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Amazon Reviews Analysis
            </span>
          </Link>
        </div>

        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Rechercher..."
              className="input pl-10 w-64 bg-gray-100 dark:bg-gray-800 border-0"
            />
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <Link to="/" className={`nav-link flex items-center gap-1 ${isActive("/") ? "active" : ""}`}>
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link to="/reviews" className={`nav-link flex items-center gap-1 ${isActive("/reviews") ? "active" : ""}`}>
            <MessageSquare className="h-4 w-4" />
            <span>Reviews</span>
          </Link>

          <Link
            to="/analytics"
            className={`nav-link flex items-center gap-1 ${isActive("/analytics") ? "active" : ""}`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </Link>

          <div className="relative tooltip">
            <button className="theme-toggle relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
                  {notifications}
                </span>
              )}
            </button>
            <span className="tooltip-text">Notifications</span>
          </div>

          <div className="tooltip">
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <span className="tooltip-text">Changer de thème</span>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
