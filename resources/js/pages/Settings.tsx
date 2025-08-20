"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  SettingsIcon,
  ArrowLeft,
  RefreshCw,
  User,
  Palette,
  Bell,
  Shield,
  Monitor,
  Moon,
  Sun,
  Save,
  Download,
  Trash2,
  RotateCcw,
} from "lucide-react"
import { Head, usePage, router, useForm } from "@inertiajs/react"
import type { SharedData } from "@/types"
import { useThemeSync } from "@/hooks/useThemeSync"

interface SettingsProps extends SharedData {
  user: {
    id: string
    name: string
    email: string
  }
  preferences: {
    theme: "light" | "dark" | "system"
    notifications: boolean
    auto_save: boolean
    compact_mode: boolean
    email_notifications: boolean
    webhook_notifications: boolean
    error_notifications: boolean
  }
}

export default function SettingsPage() {
  const { auth, user, preferences, flash } = usePage<SettingsProps>().props
  const [isExporting, setIsExporting] = useState(false)

  const preferencesForm = useForm({
    theme: preferences.theme,
    notifications: preferences.notifications,
    auto_save: preferences.auto_save,
    compact_mode: preferences.compact_mode,
  })

  const notificationsForm = useForm({
    email_notifications: preferences.email_notifications,
    webhook_notifications: preferences.webhook_notifications,
    error_notifications: preferences.error_notifications,
  })

  const [currentTheme, setCurrentTheme] = useState(preferences.theme)
  const { broadcastThemeChange } = useThemeSync(currentTheme, auth?.user?.id)

  useEffect(() => {
    setCurrentTheme(preferences.theme)
  }, [preferences.theme])

  const handlePreferencesUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    preferencesForm.put("/settings/preferences", {
      preserveScroll: true,
      onSuccess: () => {
        broadcastThemeChange(preferencesForm.data.theme)
        
        setCurrentTheme(preferencesForm.data.theme)
      },
    })
  }

  const handleNotificationsUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    notificationsForm.put("/settings/notifications", {
      preserveScroll: true,
    })
  }

  const handleExportData = () => {
    setIsExporting(true)

    const link = document.createElement("a")
    link.href = "/settings/export"
    link.download = ""
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      setIsExporting(false)
    }, 2000)
  }

  const handleClearCache = () => {
    router.post(
      "/settings/clear-cache",
      {},
      {
        preserveScroll: true,
      },
    )
  }

  const handleResetPreferences = () => {
    router.post(
      "/settings/reset",
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
        
          preferencesForm.setData({
            theme: "system",
            notifications: true,
            auto_save: true,
            compact_mode: false,
          })
          notificationsForm.setData({
            email_notifications: true,
            webhook_notifications: true,
            error_notifications: true,
          })
        },
      },
    )
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />
      case "dark":
        return <Moon className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-all duration-300">
      <Head title=" Settings" />

    
      <header className="border-b border-gray-200/80 dark:border-[#202225] bg-white/95 dark:bg-[#2f3136]/95 backdrop-blur-sm px-4 py-4 transition-all duration-300 sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.get("/dashboard")}
              className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] transition-all duration-200 p-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="hidden sm:flex items-center space-x-3">
              <div className="p-2 bg-[#FFD700] rounded-lg shadow-sm">
                <SettingsIcon className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Customize your AtlasHook experience</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="bg-white/50 dark:bg-[#40444b]/50 border-gray-200 dark:border-[#4f545c] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={() => router.get("/profile")}
              variant="outline"
              size="sm"
              className="bg-white/50 dark:bg-[#40444b]/50 border-gray-200 dark:border-[#4f545c] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
            >
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </div>
        </div>
      </header>


      <div className="sm:hidden bg-white/95 dark:bg-[#2f3136]/95 backdrop-blur-sm border-b border-gray-200/80 dark:border-[#202225] px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FFD700] rounded-lg shadow-sm">
            <SettingsIcon className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customize your AtlasHook experience</p>
          </div>
        </div>
      </div>

  
      {flash?.success && (
        <div className="w-full max-w-4xl mx-auto px-4 pt-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-800 dark:text-green-200 text-sm font-medium">{flash.success}</p>
          </div>
        </div>
      )}

     
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
   
        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 shadow-lg">
          <CardHeader className="p-4">
            <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-3">
              <div className="p-2 bg-[#FFD700] rounded-lg">
                <Palette className="w-4 h-4 text-black" />
              </div>
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <form onSubmit={handlePreferencesUpdate} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Theme</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => {
                        setCurrentTheme(theme.value as any)
                        preferencesForm.setData("theme", theme.value as any)
                  
                        const root = document.documentElement
                        root.classList.remove("light", "dark")
                        if (theme.value === "system") {
                          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                            ? "dark"
                            : "light"
                          root.classList.add(systemTheme)
                        } else {
                          root.classList.add(theme.value)
                        }
                      }}
                      className={`p-4 border rounded-lg transition-all duration-200 flex flex-col items-center gap-2 ${
                        currentTheme === theme.value
                          ? "border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]"
                          : "border-gray-200 dark:border-[#4f545c] hover:border-gray-300 dark:hover:border-[#4f545c] text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <theme.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={preferencesForm.processing}
                  className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium"
                >
                  {preferencesForm.processing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Appearance
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>



        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 shadow-lg">
          <CardHeader className="p-4">
            <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-3">
              <div className="p-2 bg-[#FFD700] rounded-lg">
                <Shield className="w-4 h-4 text-black" />
              </div>
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-[#40444b] border border-gray-200 dark:border-[#4f545c] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Account Security</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Manage your account security settings and password
                </p>
                <Button
                  onClick={() => router.get("/profile")}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#32353b]"
                >
                  <User className="w-4 h-4 mr-2" />
                  Go to Profile
                </Button>
              </div>

              <div className="bg-gray-50 dark:bg-[#40444b] border border-gray-200 dark:border-[#4f545c] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Data Export</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Download a copy of your data including templates and history
                </p>
                <Button
                  onClick={handleExportData}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#32353b]"
                >
                  {isExporting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isExporting ? "Exporting..." : "Export Data"}
                </Button>
              </div>

              <div className="bg-gray-50 dark:bg-[#40444b] border border-gray-200 dark:border-[#4f545c] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Clear Cache</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Clear cached data to improve performance
                </p>
                <Button
                  onClick={handleClearCache}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#32353b]"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-red-200/50 dark:border-red-800/50 shadow-lg">
          <CardHeader className="p-4">
            <CardTitle className="text-red-600 dark:text-red-400 text-lg flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <RotateCcw className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              Reset Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">Reset All Preferences</h3>
              <p className="text-red-700 dark:text-red-400 text-sm mb-4">
                This will reset all your preferences to their default values. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset All Settings
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] mx-4 max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 dark:text-white">Reset all settings?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                      This will reset all your preferences including theme, notifications, and other settings to their
                      default values. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetPreferences} className="bg-red-600 hover:bg-red-700">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Settings
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
            <footer className="border-t border-gray-200 dark:border-[#202225] bg-white dark:bg-[#2f3136] mt-12 transition-colors">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#FFD700] text-black text-xs font-bold">
                A
              </div>
              <span className="text-sm text-gray-600 dark:text-[#72767d]">© 2024 AtlasHook. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <button
                onClick={() => (window.location.href = "/faq")}
                className="text-gray-600 dark:text-[#72767d] hover:text-[#FFD700] dark:hover:text-[#FFD700] transition-colors"
              >
                FAQ
              </button>
              <a
                href='/contact'
                className="text-gray-600 dark:text-[#72767d] hover:text-[#FFD700] dark:hover:text-[#FFD700] transition-colors"
              >
                Contact
              </a>
              
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
