"use client"

import { useState, useEffect } from "react"
import type { SharedData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  X,
  Send,
  Copy,
  Trash2,
  ExternalLink,
  Server,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Bookmark,
  RefreshCw,
} from "lucide-react"
import { Head, usePage } from "@inertiajs/react"
import { router } from "@inertiajs/react"
import { useThemeSync } from "@/hooks/useThemeSync"

const route = (name: string, params?: any) => {
  const routes = {
    home: "/",
    "saved.index": "/saved",
    "saved.store": "/saved",
    "history.index": "/history",
    "history.store": "/history",
  }
  return routes[name] || "/"
}

interface EmbedField {
  name: string
  value: string
  inline: boolean
}

interface EmbedData {
  title: string
  description: string
  color: string
  author: {
    name: string
    url: string
    icon_url: string
  }
  thumbnail: {
    url: string
  }
  image: {
    url: string
  }
  footer: {
    text: string
    icon_url: string
  }
  timestamp: boolean
  fields: EmbedField[]
}

interface WebhookInfo {
  id: string
  token: string
  serverName: string
  serverId: string
  channelName: string
  channelId: string
  webhookName: string
  webhookAvatar: string
}

interface WelcomePageProps {
  template?: string
  save_as?: string
  description?: string
  edit_saved_id?: string
  quick_send?: boolean
  webhook_url?: string
}

export default function AtlasHookWelcome() {
  const { auth, template, save_as, description, edit_saved_id, quick_send, webhook_url } = usePage<
    SharedData & WelcomePageProps
  >().props
  const [embeds, setEmbeds] = useState<EmbedData[]>([
    {
      title: "Welcome to AtlasHook!",
      description:
        "The powerful Discord embed builder with webhook integration. Create beautiful embeds and send them directly to your Discord server.",
      color: "#FFD700",
      author: { name: "AtlasHook", url: "", icon_url: "" },
      thumbnail: { url: "" },
      image: { url: "" },
      footer: { text: "Powered by AtlasHook", icon_url: "" },
      timestamp: true,
      fields: [],
    },
  ])

  const [webhookSettings, setWebhookSettings] = useState({
    url: "",
    username: "AtlasHook Bot",
    avatar_url: "",
  })

  const [defaultWebhookSettings] = useState({
    username: "AtlasHook Bot",
    avatar_url: "",
  })

  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null)
  const [isAuthenticated] = useState(false)
  const [activeEmbed, setActiveEmbed] = useState(0)
  const [jsonOutput, setJsonOutput] = useState("")
  const [embedScrollPosition, setEmbedScrollPosition] = useState(0)
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [webhookError, setWebhookError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" | "info" }>>([])
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark")
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)

  const { broadcastThemeChange } = useThemeSync(theme, auth?.user?.id)

  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveEmbedName, setSaveEmbedName] = useState("")
  const [saveEmbedDescription, setSaveEmbedDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const showToast = (message: string, type: "success" | "error" = "info") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const parseWebhookUrl = async (url: string) => {
    if (!url || !url.startsWith("https://discord.com/api/webhooks/")) {
      setWebhookInfo(null)
      setWebhookError(null)
      setIsTestingWebhook(false)
      setWebhookSettings((prev) => ({
        ...prev,
        username: defaultWebhookSettings.username,
        avatar_url: defaultWebhookSettings.avatar_url,
      }))
      return
    }

    setIsTestingWebhook(true)
    setWebhookError(null)

    try {
      const urlParts = url.split("/")
      const webhookId = urlParts[5]
      const webhookToken = urlParts[6]

      if (webhookId && webhookToken) {
        try {
          const response = await fetch(`https://discord.com/api/webhooks/${webhookId}/${webhookToken}`)
          if (response.ok) {
            const data = await response.json()
            const info: WebhookInfo = {
              id: webhookId,
              token: webhookToken,
              serverName: `Server`,
              serverId: data.guild_id || "Unknown",
              channelName: `Channel`,
              channelId: data.channel_id || "Unknown",
              webhookName: data.name || "AtlasHook Bot",
              webhookAvatar: data.avatar ? `https://cdn.discordapp.com/avatars/${webhookId}/${data.avatar}.png` : "",
            }
            setWebhookInfo(info)
            setWebhookError(null)

            setWebhookSettings((prev) => ({
              ...prev,
              username: info.webhookName,
              avatar_url: info.webhookAvatar,
            }))
          } else if (response.status === 404) {
            setWebhookError("Webhook not found. Please check the URL.")
            setWebhookInfo(null)
          } else if (response.status === 401) {
            setWebhookError("Invalid webhook token. Please check the URL.")
            setWebhookInfo(null)
          } else {
            setWebhookError("Failed to connect to webhook. Please try again.")
            setWebhookInfo(null)
          }
        } catch (apiError) {
          setWebhookError("Network error. Please check your connection and try again.")
          setWebhookInfo(null)
        }
      } else {
        setWebhookError("Invalid webhook URL format.")
        setWebhookInfo(null)
      }
    } catch (error) {
      console.error("Error parsing webhook URL:", error)
      setWebhookError("Invalid webhook URL.")
      setWebhookInfo(null)
    } finally {
      setIsTestingWebhook(false)
    }
  }

  useEffect(() => {
    parseWebhookUrl(webhookSettings.url)
  }, [webhookSettings.url])

  const hexToDecimal = (hex: string): number => {
    return Number.parseInt(hex.replace("#", ""), 16)
  }

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

  useEffect(() => {
    if (template) {
      try {
        const templateData = JSON.parse(template)

        if (templateData && !Array.isArray(templateData)) {
          setEmbeds([templateData])
          setActiveEmbed(0)
        } else if (Array.isArray(templateData) && templateData.length > 0) {
          setEmbeds(templateData)
          setActiveEmbed(0)
        }

        showToast("✅ Template loaded successfully!", "success")
      } catch (error) {
        console.error("Failed to parse template data:", error)
        showToast("❌ Failed to load template data", "error")
      }
    }

    if (webhook_url) {
      setWebhookSettings((prev) => ({
        ...prev,
        url: webhook_url,
      }))
    }

    if (save_as) {
      setSaveEmbedName(save_as)
      if (description) {
        setSaveEmbedDescription(description)
      }
      setTimeout(() => {
        setShowSaveDialog(true)
      }, 500)
    }

    if (quick_send && webhook_url) {
      showToast("🚀 Template loaded! Ready to send when you're ready.", "info")
    }
  }, [template, save_as, description, edit_saved_id, quick_send, webhook_url])

  const changeTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    broadcastThemeChange(newTheme)
    showToast(`🎨 Theme changed to ${newTheme === "system" ? "system preference" : newTheme}`, "success")
  }

  const generateJSON = () => {
    const payload = {
      username: webhookSettings.username || undefined,
      avatar_url: webhookSettings.avatar_url || undefined,
      embeds: embeds.map((embed) => ({
        title: embed.title || undefined,
        description: embed.description || undefined,
        color: embed.color ? hexToDecimal(embed.color) : undefined,
        author: embed.author.name
          ? {
              name: embed.author.name,
              url: embed.author.url || undefined,
              icon_url: embed.author.icon_url || undefined,
            }
          : undefined,
        thumbnail: embed.thumbnail.url ? { url: embed.thumbnail.url } : undefined,
        image: embed.image.url ? { url: embed.image.url } : undefined,
        footer: embed.footer.text
          ? {
              text: embed.footer.text,
              icon_url: embed.footer.icon_url || undefined,
            }
          : undefined,
        timestamp: embed.timestamp ? new Date().toISOString() : undefined,
        fields: embed.fields.length > 0 ? embed.fields : undefined,
      })),
    }
    return JSON.stringify(payload, null, 2)
  }

  useEffect(() => {
    setJsonOutput(generateJSON())
  }, [embeds, webhookSettings])

  const addEmbed = () => {
    if (embeds.length >= 10) {
      showToast("❌ You can only create up to 10 embeds.", "error")
      return
    }
    const newEmbed: EmbedData = {
      title: "",
      description: "",
      color: "#FFD700",
      author: { name: "", url: "", icon_url: "" },
      thumbnail: { url: "" },
      image: { url: "" },
      footer: { text: "", icon_url: "" },
      timestamp: false,
      fields: [],
    }
    setEmbeds([...embeds, newEmbed])
    setActiveEmbed(embeds.length)

    setTimeout(() => {
      const container = document.getElementById("embed-selector")
      if (container) {
        container.scrollLeft = container.scrollWidth
      }
    }, 100)
  }

  const removeEmbed = (index: number) => {
    const newEmbeds = embeds.filter((_, i) => i !== index)
    setEmbeds(newEmbeds)
    if (activeEmbed >= newEmbeds.length) {
      setActiveEmbed(Math.max(0, newEmbeds.length - 1))
    }
  }

  const updateEmbed = (index: number, field: string, value: any) => {
    const newEmbeds = [...embeds]
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      newEmbeds[index] = {
        ...newEmbeds[index],
        [parent]: {
          ...newEmbeds[index][parent as keyof EmbedData],
          [child]: value,
        },
      }
    } else {
      newEmbeds[index] = { ...newEmbeds[index], [field]: value }
    }
    setEmbeds(newEmbeds)
  }

  const addField = (embedIndex: number) => {
    const newEmbeds = [...embeds]
    newEmbeds[embedIndex].fields.push({ name: "", value: "", inline: false })
    setEmbeds(newEmbeds)
  }

  const removeField = (embedIndex: number, fieldIndex: number) => {
    const newEmbeds = [...embeds]
    newEmbeds[embedIndex].fields.splice(fieldIndex, 1)
    setEmbeds(newEmbeds)
  }

  const updateField = (embedIndex: number, fieldIndex: number, field: string, value: any) => {
    const newEmbeds = [...embeds]
    newEmbeds[embedIndex].fields[fieldIndex] = {
      ...newEmbeds[embedIndex].fields[fieldIndex],
      [field]: value,
    }
    setEmbeds(newEmbeds)
  }

  const handleSaveEmbed = async () => {
    if (!auth.user) {
      showToast("🔒 You must be logged in to save embed templates.", "error")
      return
    }

    if (!saveEmbedName.trim()) {
      showToast("❌ Please enter a name for your embed template.", "error")
      return
    }

    setIsSaving(true)

    router.post(
      "/saved",
      {
        name: saveEmbedName,
        description: saveEmbedDescription,
        embed_data: embeds[activeEmbed],
      },
      {
        onSuccess: (page) => {
          showToast("✅ Embed template saved successfully!", "success")
          setShowSaveDialog(false)
          setSaveEmbedName("")
          setSaveEmbedDescription("")

          setTimeout(() => {
            router.get("/saved")
          }, 1500)
        },
        onError: (errors) => {
          console.error("Save errors:", errors)
          const errorMessage = errors.message || Object.values(errors)[0] || "Failed to save embed template."
          showToast(`❌ ${errorMessage}`, "error")
        },
        onFinish: () => {
          setIsSaving(false)
        },
      },
    )
  }

  const handleSaveToHistory = async (embedData: any, status: "success" | "failed", errorMessage?: string) => {
    if (!auth.user) return

    router.post(
      "/history",
      {
        title: embedData.title || "Untitled Embed",
        description: embedData.description || "",
        color: embedData.color || "#FFD700",
        webhook_url: webhookSettings.url,
        embed_data: embedData,
        status: status,
        error_message: errorMessage || null,
      },
      {
        preserveState: true,
        preserveScroll: true,
        onError: (errors) => {
          console.error("Failed to save to history:", errors)
        },
      },
    )
  }

  const sendEmbed = async () => {
    if (!webhookSettings.url || !webhookSettings.url.startsWith("https://discord.com/api/webhooks/")) {
      showToast("❌ Please enter a valid Discord webhook URL.", "error")
      return
    }

    try {
      const payload = JSON.parse(jsonOutput)
      const response = await fetch(webhookSettings.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        showToast("✅ Embed sent successfully!", "success")
        
        await handleSaveToHistory(embeds[activeEmbed], "success")
      } else {
        const errorText = await response.text()
        console.error("Webhook Error:", errorText)
        showToast("❌ Failed to send embed. Check the console for details.", "error")
      
        await handleSaveToHistory(embeds[activeEmbed], "failed", errorText)
      }
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      showToast("⚠️ Error sending embed. Please check your internet connection.", "error")
    
      await handleSaveToHistory(embeds[activeEmbed], "failed", errorMessage)
    }
  }

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput)
      showToast("📋 JSON copied to clipboard!", "success")
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const scrollEmbedSelector = (direction: "left" | "right") => {
    const container = document.getElementById("embed-selector")
    if (container) {
      const scrollAmount = 200
      const newScrollLeft =
        direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount

      container.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  const getCurrentTimestamp = () => {
    return new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const currentEmbed = embeds[activeEmbed] || embeds[0]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-colors">
      <Head title=" Discord Embed Builder" />

      <header className="border-b border-gray-200 dark:border-[#202225] bg-white dark:bg-[#2f3136] px-4 py-3 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#FFD700] text-black text-sm font-bold">
              A
            </div>
            <span className="text-lg font-semibold">AtlasHook</span>
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

      <div className="w-full max-w-7xl mx-auto px-4 py-4 lg:px-6">
        
        <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] mb-6 w-full transition-colors">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-lg">
              <ExternalLink className="w-5 h-5 text-[#FFD700]" />
              Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="webhook" className="text-gray-900 dark:text-white text-sm">
                  Discord Webhook URL
                </Label>
                <Input
                  id="webhook"
                  value={webhookSettings.url}
                  onChange={(e) => setWebhookSettings((prev) => ({ ...prev, url: e.target.value }))}
                  className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white mt-1 transition-colors"
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <p className="text-xs text-gray-500 dark:text-[#72767d] mt-1">
                  Get your webhook URL from Discord: Server Settings → Integrations → Webhooks
                </p>
              </div>


              {(webhookSettings.url || isTestingWebhook || webhookError) && (
                <div className="bg-gray-100 dark:bg-[#40444b] rounded-lg p-4 border border-gray-200 dark:border-[#4f545c] transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="w-4 h-4 text-[#FFD700]" />
                    <span className="text-sm font-medium text-[#FFD700]">Webhook Status</span>
                    {isTestingWebhook && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded animate-pulse">Testing...</span>
                    )}
                    {webhookError && !isTestingWebhook && (
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Not Connected</span>
                    )}
                  </div>

                  {isTestingWebhook && (
                    <div className="text-sm text-gray-500 dark:text-[#72767d]">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                        Testing webhook connection...
                      </div>
                    </div>
                  )}

                  {webhookError && !isTestingWebhook && (
                    <div className="text-sm">
                      <div className="text-red-500 dark:text-red-400 mb-2">❌ {webhookError}</div>
                      <div className="text-gray-500 dark:text-[#72767d] text-xs">
                        Make sure the webhook URL is correct and the webhook hasn't been deleted.
                      </div>
                    </div>
                  )}

                  {webhookInfo && !isTestingWebhook && (
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-[#72767d]">Server ID:</span>
                        <span className="text-gray-900 dark:text-white ml-2">{webhookInfo.serverId}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-[#72767d]">Channel ID:</span>
                        <span className="text-gray-900 dark:text-white ml-2">{webhookInfo.channelId}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-[#72767d]">Webhook:</span>
                          {webhookInfo.webhookAvatar && (
                            <img
                              src={webhookInfo.webhookAvatar || "/placeholder.svg"}
                              alt="Webhook Avatar"
                              className="w-5 h-5 rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          )}
                          <span className="text-gray-900 dark:text-white font-medium">{webhookInfo.webhookName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-[#72767d]">Status:</span>
                          <span className="text-green-500 dark:text-green-400 ml-2 font-medium">✅ Ready to send</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhookUsername" className="text-gray-900 dark:text-white text-sm">
                    Bot Username
                  </Label>
                  <Input
                    id="webhookUsername"
                    value={webhookSettings.username}
                    onChange={(e) => setWebhookSettings((prev) => ({ ...prev, username: e.target.value }))}
                    className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white mt-1 transition-colors"
                    placeholder="AtlasHook Bot"
                  />
                  <p className="text-xs text-gray-500 dark:text-[#72767d] mt-1">
                    {webhookInfo ? "Auto-filled from webhook" : "Default username"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="webhookAvatar" className="text-gray-900 dark:text-white text-sm">
                    Bot Avatar URL
                  </Label>
                  <Input
                    id="webhookAvatar"
                    value={webhookSettings.avatar_url}
                    onChange={(e) => setWebhookSettings((prev) => ({ ...prev, avatar_url: e.target.value }))}
                    className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white mt-1 transition-colors"
                    placeholder="https://example.com/avatar.png"
                  />
                  <p className="text-xs text-gray-500 dark:text-[#72767d] mt-1">
                    {webhookInfo && webhookInfo.webhookAvatar ? "Auto-filled from webhook" : "Custom avatar URL"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={sendEmbed}
                className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium flex-1 text-sm sm:text-base py-2 sm:py-2.5 transition-colors"
                disabled={!webhookSettings.url}
              >
                <Send className="w-4 h-4 mr-2" />
                <span className="truncate">Send to Server ({webhookInfo?.serverId || "Discord"})</span>
              </Button>

              <Button
                onClick={() => {
                  if (!auth.user) {
                    showToast("🔒 You must be logged in to save embed templates.", "error")
                    return
                  }
                  setShowSaveDialog(true)
                }}
                variant="outline"
                className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] sm:flex-initial text-sm sm:text-base py-2 sm:py-2.5 transition-colors"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>

              <Button
                onClick={copyJSON}
                variant="outline"
                className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] sm:flex-initial text-sm sm:text-base py-2 sm:py-2.5 transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
       
          <div className="space-y-6 min-w-0">
            
            <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] w-full transition-colors">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-gray-900 dark:text-white text-lg">
                  Embed Builder ({embeds.length}/10)
                </CardTitle>
                <Button
                  onClick={addEmbed}
                  size="sm"
                  className="bg-[#FFD700] hover:bg-[#FFC700] text-black w-full sm:w-auto text-sm sm:text-base py-2 sm:py-2.5 px-3 sm:px-4 transition-colors"
                  disabled={embeds.length >= 10}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Embed
                </Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">

                <div className="relative mb-6">
                  
                  <div className="block sm:hidden">
                    <Label className="text-gray-900 dark:text-white text-sm mb-2 block">Select Embed</Label>
                    <select
                      value={activeEmbed}
                      onChange={(e) => setActiveEmbed(Number(e.target.value))}
                      className="w-full bg-gray-50 dark:bg-[#40444b] border border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white rounded px-3 py-2 text-sm transition-colors"
                    >
                      {embeds.map((embed, index) => (
                        <option key={index} value={index}>
                          Embed {index + 1}
                          {embed.title ? ` - ${embed.title.slice(0, 20)}${embed.title.length > 20 ? "..." : ""}` : ""}
                        </option>
                      ))}
                    </select>

                    {embeds.length > 1 && (
                      <Button
                        onClick={() => removeEmbed(activeEmbed)}
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full bg-transparent border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 text-sm py-2.5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Embed {activeEmbed + 1}
                      </Button>
                    )}
                  </div>

                  <div className="hidden sm:block">
                    <div className="flex items-center">
                      {embeds.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => scrollEmbedSelector("left")}
                          className="mr-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] flex-shrink-0 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                      )}

                      <div
                        id="embed-selector"
                        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 flex-1"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {embeds.map((embed, index) => (
                          <div key={index} className="flex items-center flex-shrink-0">
                            <div className="relative">
                              <Button
                                variant={activeEmbed === index ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveEmbed(index)}
                                className={
                                  activeEmbed === index
                                    ? "bg-[#FFD700] text-black hover:bg-[#FFC700] whitespace-nowrap min-w-[100px] relative transition-colors"
                                    : "bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] whitespace-nowrap min-w-[100px] transition-colors"
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <span>Embed {index + 1}</span>
                                  {embed.title && (
                                    <div
                                      className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
                                      title="Has content"
                                    />
                                  )}
                                </div>
                              </Button>
                              {embeds.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEmbed(index)}
                                  className="absolute -top-1 -right-1 w-5 h-5 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full bg-white dark:bg-[#2f3136] border border-gray-200 dark:border-[#4f545c] transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {embeds.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => scrollEmbedSelector("right")}
                          className="ml-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] flex-shrink-0 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {embeds.length > 3 && (
                      <div className="flex justify-center mt-2 gap-1">
                        {Array.from({ length: Math.ceil(embeds.length / 3) }).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-[#4f545c]" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Tabs defaultValue="content" className="w-full">
                  <div className="w-full bg-gray-200 dark:bg-[#4f545c] p-1 sm:p-1.5 rounded-lg mb-4 transition-colors">
                    <TabsList className="w-full bg-transparent p-0 h-auto">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 w-full">
                        <TabsTrigger
                          value="content"
                          className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black data-[state=inactive]:text-gray-700 data-[state=inactive]:dark:text-white text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-3 rounded font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center"
                        >
                          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                            <span className="text-sm sm:hidden">📝</span>
                            <span className="hidden sm:inline">📝 </span>
                            <span className="text-xs sm:text-sm">Content</span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="author"
                          className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black data-[state=inactive]:text-gray-700 data-[state=inactive]:dark:text-white text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-3 rounded font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center"
                        >
                          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                            <span className="text-sm sm:hidden">👤</span>
                            <span className="hidden sm:inline">👤 </span>
                            <span className="text-xs sm:text-sm">Author</span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="images"
                          className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black data-[state=inactive]:text-gray-700 data-[state=inactive]:dark:text-white text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-3 rounded font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center"
                        >
                          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                            <span className="text-sm sm:hidden">🖼️</span>
                            <span className="hidden sm:inline">🖼️ </span>
                            <span className="text-xs sm:text-sm">Images</span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="fields"
                          className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black data-[state=inactive]:text-gray-700 data-[state=inactive]:dark:text-white text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-3 rounded font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center"
                        >
                          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                            <span className="text-sm sm:hidden">📋</span>
                            <span className="hidden sm:inline">📋 </span>
                            <span className="text-xs sm:text-sm">Fields</span>
                          </div>
                        </TabsTrigger>
                      </div>
                    </TabsList>
                  </div>

                  <TabsContent value="content" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="title" className="text-gray-900 dark:text-white text-sm sm:text-base">
                          Title
                        </Label>
                        <span className="text-xs text-gray-500 dark:text-[#72767d]">
                          {currentEmbed.title.length}/256
                        </span>
                      </div>
                      <Input
                        id="title"
                        value={currentEmbed.title}
                        onChange={(e) => updateEmbed(activeEmbed, "title", e.target.value)}
                        maxLength={256}
                        className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white text-sm sm:text-base h-10 sm:h-11 transition-colors"
                        placeholder="Embed title"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="description" className="text-gray-900 dark:text-white text-sm sm:text-base">
                          Description
                        </Label>
                        <span className="text-xs text-gray-500 dark:text-[#72767d]">
                          {currentEmbed.description.length}/4096
                        </span>
                      </div>
                      <Textarea
                        id="description"
                        value={currentEmbed.description}
                        onChange={(e) => updateEmbed(activeEmbed, "description", e.target.value)}
                        maxLength={4096}
                        className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white min-h-24 sm:min-h-28 text-sm sm:text-base resize-none transition-colors"
                        placeholder="Embed description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color" className="text-gray-900 dark:text-white text-sm sm:text-base">
                        Color
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id="color"
                          type="color"
                          value={currentEmbed.color}
                          onChange={(e) => updateEmbed(activeEmbed, "color", e.target.value)}
                          className="w-12 h-10 sm:w-14 sm:h-11 bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] p-1 flex-shrink-0 transition-colors"
                        />
                        <Input
                          value={currentEmbed.color}
                          onChange={(e) => updateEmbed(activeEmbed, "color", e.target.value)}
                          className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white text-sm sm:text-base h-10 sm:h-11 transition-colors"
                          placeholder="#FFD700"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="author" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="authorName" className="text-gray-900 dark:text-white text-sm sm:text-base">
                          Author Name
                        </Label>
                        <span className="text-xs text-gray-500 dark:text-[#72767d]">
                          {currentEmbed.author.name.length}/256
                        </span>
                      </div>
                      <Input
                        id="authorName"
                        value={currentEmbed.author.name}
                        onChange={(e) => updateEmbed(activeEmbed, "author.name", e.target.value)}
                        maxLength={256}
                        className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white text-sm sm:text-base h-10 sm:h-11 transition-colors"
                        placeholder="Author name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authorUrl" className="text-gray-900 dark:text-white text-sm sm:text-base">
                        Author URL
                      </Label>
                      <Input
                        id="authorUrl"
                        value={currentEmbed.author.url}
                        onChange={(e) => updateEmbed(activeEmbed, "author.url", e.target.value)}
                        className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white text-sm sm:text-base h-10 sm:h-11 transition-colors"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authorIcon" className="text-gray-900 dark:text-white text-sm sm:text-base">
                        Author Icon URL
                      </Label>
                      <Input
                        id="authorIcon"
                        value={currentEmbed.author.icon_url}
                        onChange={(e) => updateEmbed(activeEmbed, "author.icon_url", e.target.value)}
                        className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white text-sm sm:text-base h-10 sm:h-11 transition-colors"
                        placeholder="https://example.com/icon.png"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="footerText" className="text-gray-900 dark:text-white text-sm sm:text-base">
                          Footer Text
                        </Label>
                        <span className="text-xs text-gray-500 dark:text-[#72767d]">
                          {currentEmbed.footer.text.length}/2048
                        </span>
                      </div>
                      <Input
                        id="footerText"
                        value={currentEmbed.footer.text}
                        onChange={(e) => updateEmbed(activeEmbed, "footer.text", e.target.value)}
                        maxLength={2048}
                        className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white text-sm sm:text-base h-10 sm:h-11 transition-colors"
                        placeholder="Footer text"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="footerIcon" className="text-gray-900 dark:text-white text-sm sm:text-base">
                        Footer Icon URL
                      </Label>
                      <Input
                        id="footerIcon"
                        value={currentEmbed.footer.icon_url}
                        onChange={(e) => updateEmbed(activeEmbed, "footer.icon_url", e.target.value)}
                        className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white text-sm sm:text-base h-10 sm:h-11 transition-colors"
                        placeholder="https://example.com/footer-icon.png"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="timestamp"
                        checked={currentEmbed.timestamp}
                        onChange={(e) => updateEmbed(activeEmbed, "timestamp", e.target.checked)}
                        className="rounded bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] w-4 h-4 sm:w-5 sm:h-5 transition-colors"
                      />
                      <Label htmlFor="timestamp" className="text-gray-900 dark:text-white text-sm sm:text-base">
                        Include timestamp
                      </Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="images" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail" className="text-gray-900 dark:text-white text-sm sm:text-base">
                        Thumbnail URL
                      </Label>
                      <Input
                        id="thumbnail"
                        value={currentEmbed.thumbnail.url}
                        onChange={(e) => updateEmbed(activeEmbed, "thumbnail.url", e.target.value)}
                        className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white text-sm sm:text-base h-10 sm:h-11 transition-colors"
                        placeholder="https://example.com/thumbnail.png"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image" className="text-gray-900 dark:text-white text-sm sm:text-base">
                        Image URL
                      </Label>
                      <Input
                        id="image"
                        value={currentEmbed.image.url}
                        onChange={(e) => updateEmbed(activeEmbed, "image.url", e.target.value)}
                        className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white text-sm sm:text-base h-10 sm:h-11 transition-colors"
                        placeholder="https://example.com/image.png"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="fields" className="space-y-4 mt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <Label className="text-gray-900 dark:text-white text-sm sm:text-base">
                        Fields ({currentEmbed.fields.length}/25)
                      </Label>
                      <Button
                        onClick={() => addField(activeEmbed)}
                        size="sm"
                        className="bg-[#FFD700] hover:bg-[#FFC700] text-black w-full sm:w-auto text-sm py-2.5 px-4 transition-colors"
                        disabled={currentEmbed.fields.length >= 25}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Field
                      </Button>
                    </div>

                    {currentEmbed.fields.map((field, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-[#4f545c] rounded p-3 space-y-3 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm sm:text-base text-[#FFD700]">Field {index + 1}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-[#72767d]">{field.name.length}/256</span>
                            <Button
                              onClick={() => removeField(activeEmbed, index)}
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <Input
                          value={field.name}
                          onChange={(e) => updateField(activeEmbed, index, "name", e.target.value)}
                          maxLength={256}
                          className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white text-sm sm:text-base h-10 sm:h-11 transition-colors"
                          placeholder="Field name"
                        />

                        <div className="space-y-2">
                          <div className="flex items-center justify-end">
                            <span className="text-xs text-gray-500 dark:text-[#72767d]">{field.value.length}/1024</span>
                          </div>
                          <Textarea
                            value={field.value}
                            onChange={(e) => updateField(activeEmbed, index, "value", e.target.value)}
                            maxLength={1024}
                            className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white text-sm sm:text-base resize-none min-h-20 transition-colors"
                            placeholder="Field value"
                            rows={2}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`inline-${index}`}
                            checked={field.inline}
                            onChange={(e) => updateField(activeEmbed, index, "inline", e.target.checked)}
                            className="rounded bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] w-4 h-4 sm:w-5 sm:h-5 transition-colors"
                          />
                          <Label
                            htmlFor={`inline-${index}`}
                            className="text-gray-900 dark:text-white text-sm sm:text-base"
                          >
                            Inline
                          </Label>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] mt-5 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white text-lg">Quick Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] justify-start text-sm py-2.5 px-4 transition-colors"
                        onClick={() => updateEmbed(activeEmbed, "title", "📢 Server Announcement")}
                      >
                        📢 Announcement
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] justify-start text-sm py-2.5 px-4 transition-colors"
                        onClick={() => updateEmbed(activeEmbed, "title", "👋 Welcome to the Server!")}
                      >
                        👋 Welcome
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] justify-start text-sm py-2.5 px-4 transition-colors"
                        onClick={() => updateEmbed(activeEmbed, "title", "🎉 Event Announcement")}
                      >
                        🎉 Event
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] justify-start text-sm py-2.5 px-4 transition-colors"
                        onClick={() => {
                          const newEmbeds = [...embeds]
                          newEmbeds[activeEmbed] = {
                            title: "",
                            description: "",
                            color: "#FFD700",
                            author: { name: "", url: "", icon_url: "" },
                            thumbnail: { url: "" },
                            image: { url: "" },
                            footer: { text: "", icon_url: "" },
                            timestamp: false,
                            fields: [],
                          }
                          setEmbeds(newEmbeds)
                        }}
                      >
                        🗑️ Clear Embed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] xl:hidden transition-colors">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white text-lg">JSON Output</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative">
                  <pre className="bg-gray-50 dark:bg-[#40444b] p-3 rounded text-xs text-gray-900 dark:text-white overflow-auto max-h-64 whitespace-pre-wrap border border-gray-200 dark:border-[#202225] break-all transition-colors">
                    {jsonOutput}
                  </pre>
                  <Button
                    onClick={copyJSON}
                    size="sm"
                    className="absolute top-2 right-2 bg-[#FFD700] hover:bg-[#FFC700] text-black p-1 h-6 w-6 transition-colors"
                    title="Copy JSON"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>


          <div className="space-y-6 min-w-0">
            <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                    Discord Preview
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                      className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] transition-colors"
                    >
                      {isPreviewExpanded ? (
                        <>
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Expand
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={`transition-all duration-300 ${isPreviewExpanded ? "p-0" : "p-4 sm:p-6"}`}>
            
                {isPreviewExpanded && (
                  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2f3136] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-[#202225]">
                    
                      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#202225]">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Discord Preview - Detailed View
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-[#72767d]">
                            {embeds.length} embed{embeds.length !== 1 ? "s" : ""}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPreviewExpanded(false)}
                            className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-h-[calc(90vh-80px)]">
                        <div className="bg-gray-100 dark:bg-[#36393f] p-6 transition-colors">
       
                          <div className="mb-4 pb-3 border-b border-gray-300 dark:border-[#4f545c]">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-[#72767d]">
                              <div className="w-5 h-5 bg-gray-400 dark:bg-[#4f545c] rounded flex items-center justify-center">
                                <span className="text-xs">#</span>
                              </div>
                              <span className="font-medium">general</span>
                              <span className="text-xs">•</span>
                              <span className="text-xs">Preview Channel</span>
                            </div>
                          </div>

                          <div className="space-y-4 overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            {embeds.map((embed, embedIndex) => (
                              <div key={`expanded-${embedIndex}`} className="group">
                                
                                <div className="flex space-x-4 hover:bg-gray-50 dark:hover:bg-[#32353b] p-2 rounded transition-colors">
                                
                                  <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center text-black font-medium flex-shrink-0">
                                    {webhookSettings.avatar_url ? (
                                      <img
                                        src={webhookSettings.avatar_url || "/placeholder.svg"}
                                        alt="Bot Avatar"
                                        className="w-10 h-10 rounded-full"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none"
                                          e.currentTarget.nextElementSibling.style.display = "flex"
                                        }}
                                      />
                                    ) : null}
                                    <span className={webhookSettings.avatar_url ? "hidden" : ""}>A</span>
                                  </div>

                     
                                  <div className="flex-1 min-w-0">
                               
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="font-medium text-gray-900 dark:text-white text-base">
                                        {webhookSettings.username}
                                      </span>
                                      <span className="bg-[#FFD700] text-xs px-1.5 py-0.5 rounded text-black font-medium">
                                        BOT
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-[#72767d]">
                                        Today at {getCurrentTimestamp().split(" ").slice(-2).join(" ")}
                                      </span>
                                    </div>

                                    
                                    <div
                                      className="bg-white dark:bg-[#2f3136] border-l-4 rounded max-w-lg transition-colors relative"
                                      style={{ borderLeftColor: embed.color }}
                                    >
                                      <div className="p-4">
                                        {embed.thumbnail.url && (
                                          <div className="absolute top-4 right-4">
                                            <img
                                              src={embed.thumbnail.url || "/placeholder.svg"}
                                              alt="Thumbnail"
                                              className="w-20 h-20 rounded object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                              onError={(e) => {
                                                e.currentTarget.style.display = "none"
                                              }}
                                            />
                                          </div>
                                        )}

                                        <div className={embed.thumbnail.url ? "pr-24" : ""}>
                                      
                                          {embed.author.name && (
                                            <div className="flex items-center space-x-2 mb-2">
                                              {embed.author.icon_url && (
                                                <img
                                                  src={embed.author.icon_url || "/placeholder.svg"}
                                                  alt="Author"
                                                  className="w-6 h-6 rounded-full"
                                                  onError={(e) => {
                                                    e.currentTarget.style.display = "none"
                                                  }}
                                                />
                                              )}
                                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {embed.author.name}
                                              </span>
                                            </div>
                                          )}

                                          {embed.title && (
                                            <h3 className="text-[#00b0f4] font-medium mb-2 hover:underline cursor-pointer text-base break-words">
                                              {embed.title}
                                            </h3>
                                          )}
                                        </div>

                                        {embed.description && (
                                          <div className="mb-3">
                                            <p className="text-gray-600 dark:text-[#dcddde] text-sm whitespace-pre-wrap break-words leading-relaxed">
                                              {embed.description}
                                            </p>
                                          </div>
                                        )}

                                        {embed.fields.length > 0 && (
                                          <div className="mb-3">
                                            <div className="space-y-2">
                                              {embed.fields.map((field, fieldIndex) => (
                                                <div
                                                  key={fieldIndex}
                                                  className="border-b border-gray-100 dark:border-[#4f545c] pb-2 last:border-b-0"
                                                >
                                                  <div className="font-medium text-gray-900 dark:text-white text-sm mb-1 break-words">
                                                    {field.name}
                                                  </div>
                                                  <div className="text-gray-600 dark:text-[#dcddde] text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                    {field.value}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {embed.image.url && (
                                          <div className="mb-3">
                                            <img
                                              src={embed.image.url || "/placeholder.svg"}
                                              alt="Embed"
                                              className="max-w-full h-auto rounded max-h-80 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                              onError={(e) => {
                                                e.currentTarget.style.display = "none"
                                              }}
                                            />
                                          </div>
                                        )}

                                        <div className="flex items-end justify-between">
                                          
                                          {embed.footer.text && (
                                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                                              {embed.footer.icon_url && (
                                                <img
                                                  src={embed.footer.icon_url || "/placeholder.svg"}
                                                  alt="Footer"
                                                  className="w-5 h-5 rounded flex-shrink-0"
                                                  onError={(e) => {
                                                    e.currentTarget.style.display = "none"
                                                  }}
                                                />
                                              )}
                                              <span className="text-xs text-gray-500 dark:text-[#72767d]">
                                                {embed.footer.text}
                                                {embed.timestamp && <span> • {getCurrentTimestamp()}</span>}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs text-gray-500 dark:text-[#72767d] hover:bg-gray-200 dark:hover:bg-[#4f545c]"
                                      >
                                        Add Reaction
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs text-gray-500 dark:text-[#72767d] hover:bg-gray-200 dark:hover:bg-[#4f545c]"
                                      >
                                        Reply
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 pt-4 border-t border-gray-300 dark:border-[#4f545c]">
                            <div className="bg-gray-200 dark:bg-[#40444b] rounded-lg p-3 text-gray-500 dark:text-[#72767d] text-sm">
                              Message #general
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isPreviewExpanded && (
                  <div className="space-y-4">
                    <div className="bg-gray-100 dark:bg-[#36393f] p-3 sm:p-4 rounded-lg max-h-[50vh] xl:max-h-[45vh] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-colors">
   
                      <div className="overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {embeds.map((embed, embedIndex) => (
                          <div key={`mobile-${embedIndex}`} className="flex space-x-3 mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFD700] flex items-center justify-center text-black font-medium flex-shrink-0">
                              {webhookSettings.avatar_url ? (
                                <img
                                  src={webhookSettings.avatar_url || "/placeholder.svg"}
                                  alt="Bot Avatar"
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                    e.currentTarget.nextElementSibling.style.display = "flex"
                                  }}
                                />
                              ) : null}
                              <span className={webhookSettings.avatar_url ? "hidden" : "text-sm sm:text-base"}>A</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1 flex-wrap">
                                <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                  {webhookSettings.username}
                                </span>
                                <span className="bg-[#FFD700] text-xs px-1 rounded text-black font-medium">BOT</span>
                                <span className="text-xs text-gray-500 dark:text-[#72767d] hidden sm:inline">
                                  Today at {getCurrentTimestamp().split(" ").slice(-2).join(" ")}
                                </span>
                              </div>

                              <div
                                className="bg-white dark:bg-[#2f3136] border-l-4 pl-3 py-2 rounded w-full transition-colors relative"
                                style={{ borderLeftColor: embed.color }}
                              >
                                {embed.thumbnail.url && (
                                  <div className="absolute top-2 right-2">
                                    <img
                                      src={embed.thumbnail.url || "/placeholder.svg"}
                                      alt="Thumbnail"
                                      className="w-12 h-12 sm:w-16 sm:h-16 rounded object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none"
                                      }}
                                      onClick={() => setIsPreviewExpanded(true)}
                                    />
                                  </div>
                                )}

                                <div className={embed.thumbnail.url ? "pr-16 sm:pr-20" : ""}>
                                  {embed.author.name && (
                                    <div className="flex items-center space-x-2 mb-2">
                                      {embed.author.icon_url && (
                                        <img
                                          src={embed.author.icon_url || "/placeholder.svg"}
                                          alt="Author"
                                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                                          onError={(e) => {
                                            e.currentTarget.style.display = "none"
                                          }}
                                        />
                                      )}
                                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {embed.author.name}
                                      </span>
                                    </div>
                                  )}

                                  {embed.title && (
                                    <h3 className="text-[#00b0f4] font-medium mb-1 hover:underline cursor-pointer text-sm sm:text-base break-words">
                                      {embed.title}
                                    </h3>
                                  )}
                                </div>

                                {embed.description && (
                                  <div className="mb-2">
                                    <p className="text-gray-600 dark:text-[#dcddde] text-xs sm:text-sm whitespace-pre-wrap break-words">
                                      {embed.description}
                                    </p>
                                  </div>
                                )}

                                {embed.fields.length > 0 && (
                                  <div className="mb-2">
                                    <div className="space-y-1">
                                      {embed.fields.slice(0, 3).map((field, fieldIndex) => (
                                        <div
                                          key={fieldIndex}
                                          className="border-b border-gray-100 dark:border-[#4f545c] pb-1 last:border-b-0"
                                        >
                                          <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm break-words">
                                            {field.name}
                                          </div>
                                          <div className="text-gray-600 dark:text-[#dcddde] text-xs sm:text-sm whitespace-pre-wrap break-words line-clamp-2">
                                            {field.value}
                                          </div>
                                        </div>
                                      ))}
                                      {embed.fields.length > 3 && (
                                        <div className="text-xs text-gray-500 dark:text-[#72767d]">
                                          +{embed.fields.length - 3} more fields
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {embed.image.url && (
                                  <div className="mb-2">
                                    <img
                                      src={embed.image.url || "/placeholder.svg"}
                                      alt="Embed"
                                      className="max-w-full h-auto rounded max-h-48 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none"
                                      }}
                                    />
                                  </div>
                                )}

                                {embed.footer.text && (
                                  <div className="flex items-center space-x-2">
                                    {embed.footer.icon_url && (
                                      <img
                                        src={embed.footer.icon_url || "/placeholder.svg"}
                                        alt="Footer"
                                        className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none"
                                        }}
                                      />
                                    )}
                                    <span className="text-xs text-gray-500 dark:text-[#72767d] truncate">
                                      {embed.footer.text}
                                      {embed.timestamp && <span> • {getCurrentTimestamp()}</span>}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center mt-4 pt-3 border-t border-gray-300 dark:border-[#4f545c]">
                        <p className="text-xs text-gray-500 dark:text-[#72767d]">
                          Click "Expand" for detailed preview or click images for full view
                        </p>
                      </div>
                    </div>

                    <div className="hidden xl:block">
                      <div className="border-t border-gray-200 dark:border-[#202225] pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-gray-900 dark:text-white font-medium text-base">JSON Output</h4>
                          <Button
                            onClick={copyJSON}
                            size="sm"
                            className="bg-[#FFD700] hover:bg-[#FFC700] text-black text-xs px-3 py-1.5 transition-colors"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="relative">
                          <pre className="bg-gray-50 dark:bg-[#40444b] p-3 rounded text-xs text-gray-900 dark:text-white overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-h-48 whitespace-pre-wrap break-all border border-gray-200 dark:border-[#202225] transition-colors">
                            {jsonOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#2f3136] rounded-lg shadow-2xl w-full max-w-md border border-gray-200 dark:border-[#202225]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Save Embed Template</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSaveDialog(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Template Name *
                  </label>
                  <Input
                    value={saveEmbedName}
                    onChange={(e) => setSaveEmbedName(e.target.value)}
                    placeholder="Enter template name..."
                    className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Description (Optional)
                  </label>
                  <Input
                    value={saveEmbedDescription}
                    onChange={(e) => setSaveEmbedDescription(e.target.value)}
                    placeholder="Describe this template..."
                    className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white"
                  />
                </div>

                <div className="border border-gray-200 dark:border-[#4f545c] rounded p-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</div>
                  <div
                    className="bg-gray-100 dark:bg-[#40444b] border-l-4 rounded p-2 text-sm"
                    style={{ borderLeftColor: currentEmbed.color || "#FFD700" }}
                  >
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {currentEmbed.title || "Untitled"}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 line-clamp-2">
                      {currentEmbed.description || "No description"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 bg-gray-100 dark:bg-[#40444b] text-gray-900 dark:text-white border-gray-200 dark:border-[#202225]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEmbed}
                  disabled={!saveEmbedName.trim() || isSaving}
                  className="flex-1 bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save Template
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`
                max-w-sm p-4 rounded-lg shadow-lg border transition-all duration-300 transform translate-x-0
                ${toast.type === "success" ? "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-100" : ""}
                ${toast.type === "error" ? "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-800 dark:text-red-100" : ""}
                ${toast.type === "info" ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-100" : ""}
              `}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{toast.message}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeToast(toast.id)}
                  className="h-6 w-6 p-0 text-current hover:bg-white/10 dark:hover:bg-black/10 ml-2 flex-shrink-0 transition-colors"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
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
                href={() => (window.location.href = "/contact")}
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
