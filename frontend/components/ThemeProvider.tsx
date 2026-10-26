"use client"

import { createContext, useContext, useState, useEffect } from "react"

type Theme = "dark" | "light"

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")

  // Persist across refreshes
  useEffect(() => {
    const stored = localStorage.getItem("app-theme") as Theme | null
    if (stored === "light" || stored === "dark") setTheme(stored)
  }, [])

  const toggle = () => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark"
      localStorage.setItem("app-theme", next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div data-theme={theme} className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
