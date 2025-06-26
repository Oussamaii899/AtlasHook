"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Sun,
  Moon,
  Monitor,
  ArrowLeft,
  MessageSquare,
  Users,
  Clock,
  Shield,
  Zap,
  ExternalLink,
  CheckCircle,
} from "lucide-react"
import { Head, usePage } from "@inertiajs/react"
import type { SharedData } from "@/types"

export default function ContactPage() {
  const { auth } = usePage<SharedData>().props

  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    const savedTheme = localStorage.getItem("atlashook-theme") as "light" | "dark" | "system" | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const updateTheme = () => {
      let newResolvedTheme: "light" | "dark" = "dark"

      if (theme === "system") {
        newResolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      } else {
        newResolvedTheme = theme
      }

      setResolvedTheme(newResolvedTheme)

      if (newResolvedTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }

      localStorage.setItem("atlashook-theme", theme)
    }

    updateTheme()

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") {
        updateTheme()
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const changeTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-colors">
      <Head title="Contact" />
     
      <header className="border-b border-gray-200 dark:border-[#202225] bg-white dark:bg-[#2f3136] px-4 py-3 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#FFD700] text-black text-sm font-bold">
                A
              </div>
              <span className="text-lg font-semibold">AtlasHook Support</span>
            </div>
          </div>

          <nav className="flex items-center space-x-2">
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] transition-colors p-2"
                >
                  {theme === "light" ? (
                    <Sun className="h-4 w-4" />
                  ) : theme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Monitor className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-70 bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#4f545c]"
              >
                <div className="p-2">
                  <div className="grid gap-1">
                    <Button
                      variant={theme === "light" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => changeTheme("light")}
                      className={`justify-start w-full ${
                        theme === "light"
                          ? "bg-[#FFD700] text-black hover:bg-[#FFC700]"
                          : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c]"
                      }`}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => changeTheme("dark")}
                      className={`justify-start w-full ${
                        theme === "dark"
                          ? "bg-[#FFD700] text-black hover:bg-[#FFC700]"
                          : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c]"
                      }`}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => changeTheme("system")}
                      className={`justify-start w-full ${
                        theme === "system"
                          ? "bg-[#FFD700] text-black hover:bg-[#FFC700]"
                          : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c]"
                      }`}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#4f545c]" />
                <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-[#72767d]">
                  {theme === "system" ? `Following system (${resolvedTheme})` : `Using ${theme} theme`}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {auth.user ? (
              <Button
                variant="outline"
                className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 transition-colors"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Dashboard
              </Button>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button
                  variant="ghost"
                  className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] hidden sm:inline-flex text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 transition-colors"
                  onClick={() => (window.location.href = "/login")}
                >
                  Log in
                </Button>
                <Button
                  className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 transition-colors"
                  onClick={() => (window.location.href = "/register")}
                >
                  Sign up
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <div className="w-full max-w-6xl mx-auto px-4 py-8 lg:px-6">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Get Support</h1>
          <p className="text-lg text-gray-600 dark:text-[#72767d] max-w-2xl mx-auto">
            Need help with AtlasHook? Our community and support team are here to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
          
          <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] transition-colors">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-3 bg-[#5865F2] rounded-lg text-white">
                  <Users className="w-6 h-6" />
                </div>
                Join Our Discord Server
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-[#5865F2]/10 dark:bg-[#5865F2]/20 border border-[#5865F2]/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-[#5865F2]">Primary Support Channel</span>
                </div>
                <p className="text-gray-600 dark:text-[#dcddde] mb-6 leading-relaxed">
                  Our Discord server is the best place to get help, ask questions, and connect with other AtlasHook
                  users. Our community and support team are active and ready to help!
                </p>
                <Button
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-3 text-base transition-colors"
                  onClick={() => window.open("https://discord.gg/SSr3eURZ27 ", "_blank")}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Join Discord Server
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#40444b] rounded-lg transition-colors">
                  <Clock className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">Fast Response</div>
                    <div className="text-xs text-gray-600 dark:text-[#72767d]">Usually within hours</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#40444b] rounded-lg transition-colors">
                  <Users className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">Community Help</div>
                    <div className="text-xs text-gray-600 dark:text-[#72767d]">Active user community</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">What you can get help with:</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-[#dcddde]">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Discord webhook setup and troubleshooting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Embed creation and formatting questions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Account and feature support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Bug reports and feature requests
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

      
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#FFD700] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">FAQ</h3>
              <p className="text-sm text-gray-600 dark:text-[#72767d] mb-4">
                Check our frequently asked questions for quick answers.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/faq")}
                className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] transition-colors"
              >
                View FAQ
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#FFD700] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Start</h3>
              <p className="text-sm text-gray-600 dark:text-[#72767d] mb-4">
                New to AtlasHook? Learn the basics and get started quickly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/")}
                className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] transition-colors"
              >
                Try Builder
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#FFD700] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community</h3>
              <p className="text-sm text-gray-600 dark:text-[#72767d] mb-4">
                Connect with other users and share your creations.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://discord.gg/SSr3eURZ27", "_blank")}
                className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] transition-colors"
              >
                Join Discord
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] mt-8 transition-colors">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support Information</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Discord Support</h4>
                  <p className="text-gray-600 dark:text-[#72767d]">
                    Available 24/7 through our community
                    <br />
                    Staff typically respond within a few hours
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Email Support</h4>
                  <p className="text-gray-600 dark:text-[#72767d]">
                    Response within 24-48 hours
                    <br />
                    Monday - Friday, 9 AM - 6 PM EST
                  </p>
                </div>
              </div>
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
            href="/contact"
            className="text-gray-600 dark:text-[#72767d] hover:text-[#FFD700] dark:hover:text-[#FFD700] transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </div>
  </footer>
  </div>
  )
}
