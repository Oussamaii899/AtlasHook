"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  userTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light"
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "dark",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "atlashook-theme",
  userTheme,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {

    if (userTheme) return userTheme
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey) as Theme
      if (stored && ["light", "dark", "system"].includes(stored)) {
        return stored
      }
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    if (userTheme && userTheme !== theme) {
      setTheme(userTheme)
    }
  }, [userTheme])

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    let newResolvedTheme: "light" | "dark" = "dark"

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      newResolvedTheme = systemTheme
      root.classList.add(systemTheme)
    } else {
      newResolvedTheme = theme
      root.classList.add(theme)
    }

    setResolvedTheme(newResolvedTheme)

    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        setResolvedTheme(systemTheme)

        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(systemTheme)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        const newTheme = e.newValue as Theme
        if (["light", "dark", "system"].includes(newTheme)) {
          setTheme(newTheme)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [storageKey])

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      const newTheme = e.detail.theme as Theme
      if (["light", "dark", "system"].includes(newTheme)) {
        setTheme(newTheme)
      }
    }

    window.addEventListener("themeChange", handleThemeChange as EventListener)
    return () => window.removeEventListener("themeChange", handleThemeChange as EventListener)
  }, [])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
    },
    resolvedTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
