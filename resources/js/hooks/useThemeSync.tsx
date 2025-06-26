"use client"

import { useEffect } from "react"
import { router } from "@inertiajs/react"

export function useThemeSync(currentTheme: string, userId?: string) {
  useEffect(() => {
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "atlashook-theme" && e.newValue && e.newValue !== currentTheme) {
        if (userId) {
          router.put(
            "/settings/preferences",
            {
              theme: e.newValue,
              notifications: true, 
              auto_save: true,
              compact_mode: false,
            },
            {
              preserveState: true,
              preserveScroll: true,
              only: ["auth"], 
            },
          )
        }

        const root = document.documentElement
        root.classList.remove("light", "dark")

        if (e.newValue === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
          root.classList.add(systemTheme)
        } else {
          root.classList.add(e.newValue)
        }
      }
    }

    const handleThemeChange = (e: CustomEvent) => {
      const newTheme = e.detail.theme
      if (newTheme !== currentTheme) {

        if (userId) {
          router.put(
            "/settings/preferences",
            {
              theme: newTheme,
              notifications: true,
              auto_save: true,
              compact_mode: false,
            },
            {
              preserveState: true,
              preserveScroll: true,
              only: ["auth"],
            },
          )
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("themeChange", handleThemeChange as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("themeChange", handleThemeChange as EventListener)
    }
  }, [currentTheme, userId])

  const broadcastThemeChange = (newTheme: string) => {

    localStorage.setItem("atlashook-theme", newTheme)

    window.dispatchEvent(
      new CustomEvent("themeChange", {
        detail: { theme: newTheme },
      }),
    )
  }

  return { broadcastThemeChange }
}
