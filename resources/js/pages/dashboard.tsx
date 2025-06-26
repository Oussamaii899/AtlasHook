"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Activity,
  Bookmark,
  Send,
  Plus,
  Clock,
  Star,
  ArrowRight,
  Zap,
  BarChart3,
  RefreshCw,
  Calendar,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { Head, router, usePage } from "@inertiajs/react"
import type { SharedData } from "@/types"

interface DashboardStats {
  totalSent: number
  totalSaved: number
  recentActivity: number
}

interface RecentEmbed {
  id: string
  title: string
  status: "success" | "failed"
  timestamp: string
  color: string
}

interface RecentTemplate {
  id: string
  name: string
  created_at: string
  color: string
}

interface DailyActivity {
  date: string
  count: number
}

interface DashboardProps extends SharedData {
  stats: DashboardStats
  recentEmbeds: RecentEmbed[]
  recentTemplates: RecentTemplate[]
  dailyActivity: DailyActivity[]
}

export default function Dashboard() {
  const { auth, stats, recentEmbeds, recentTemplates, dailyActivity } = usePage<DashboardProps>().props
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    router.get(
      "/dashboard",
      {},
      {
        preserveState: true,
        onFinish: () => setIsLoading(false),
      },
    )
  }

  const handleLogout = () => {
    router.post("/logout")
  }

  const quickActions = [
    {
      title: "Create New Embed",
      description: "Start building a new Discord embed",
      icon: Plus,
      action: () => router.get("/"),
      color: "bg-[#FFD700]",
      textColor: "text-black",
    },
    {
      title: "View Templates",
      description: `Browse your ${stats.totalSaved} saved templates`,
      icon: Bookmark,
      action: () => router.get("/saved"),
      color: "bg-blue-500",
      textColor: "text-white",
    },
    {
      title: "Check History",
      description: `Review your ${stats.totalSent} embed sends`,
      icon: Activity,
      action: () => router.get("/history"),
      color: "bg-green-500",
      textColor: "text-white",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-all duration-300">
      <Head title="Dashboard" />

      <header className="border-b border-gray-200/80 dark:border-[#202225] bg-white/95 dark:bg-[#2f3136]/95 backdrop-blur-sm px-4 py-4 transition-all duration-300 sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="p-2 bg-[#FFD700] rounded-lg shadow-sm">
                <BarChart3 className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Overview of your AtlasHook activity</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-white/50 dark:bg-[#40444b]/50 border-gray-200 dark:border-[#4f545c] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 sm:mr-2 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={() => router.get("/saved")}
              variant="outline"
              size="sm"
              className="bg-white/50 dark:bg-[#40444b]/50 border-gray-200 dark:border-[#4f545c] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
            >
              <span className="text-sm">Saved</span>
            </Button>
            <Button
              onClick={() => router.get("/history")}
              variant="outline"
              size="sm"
              className="bg-white/50 dark:bg-[#40444b]/50 border-gray-200 dark:border-[#4f545c] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
            >
              <span className="text-sm">History</span>
            </Button>
            <Button
              onClick={() => router.get("/")}
              size="sm"
              className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Create Embed</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild >
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex bg-white/50 dark:bg-[#40444b]/50 border-gray-200 dark:border-[#4f545c] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200 items-center gap-2"
                >
                  <div className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-black text-xs font-bold ">
                    {
                        auth.user?.avatar
                          ? <img src={auth.user.avatar} alt="User Avatar" className="w-full h-full rounded-full" />
                            : auth.user?.name?.charAt(0).toUpperCase() || "U"
                    }
                  </div>
                  <span className="hidden sm:inline text-sm truncate max-w-24">{auth.user?.name || "User"}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#4f545c] shadow-xl"
              >
                <div className="px-3 py-2 border-b border-gray-200 dark:border-[#4f545c]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-black text-sm font-bold">
                    {
                        auth.user?.avatar
                          ? <img src={auth.user.avatar} alt="User Avatar" className="w-full h-full rounded-full" />
                            : auth.user?.name?.charAt(0).toUpperCase() || "U"
                    }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {auth.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {auth.user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                <DropdownMenuItem
                  onClick={() => router.get("/profile")}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4f545c] cursor-pointer"
                >
                  <User className="w-4 h-4 mr-3" />
                  View Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.get("/settings")}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4f545c] cursor-pointer"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#4f545c]" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="sm:hidden bg-white/95 dark:bg-[#2f3136]/95 backdrop-blur-sm border-b border-gray-200/80 dark:border-[#202225] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#FFD700] rounded-lg shadow-sm">
              <BarChart3 className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Overview of your AtlasHook activity</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild >
              <Button
                variant="outline"
                size="sm"
                className="bg-white/50 dark:bg-[#40444b]/50 border-gray-200 dark:border-[#4f545c] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200 p-2"
              >
                <div className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-black text-xs font-bold">
                    {
                        auth.user?.avatar
                          ? <img src={auth.user.avatar} alt="User Avatar" className="w-full h-full rounded-full" />
                            : auth.user?.name?.charAt(0).toUpperCase() || "U"
                    }
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#4f545c] shadow-xl"
            >
              <div className="px-3 py-2 border-b border-gray-200 dark:border-[#4f545c]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-black text-sm font-bold">
                    {
                        auth.user?.avatar
                          ? <img src={auth.user.avatar} alt="User Avatar" className="w-full h-full rounded-full" />
                            : auth.user?.name?.charAt(0).toUpperCase() || "U"
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {auth.user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {auth.user?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
              </div>

              <DropdownMenuItem
                onClick={() => router.get("/profile")}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4f545c] cursor-pointer"
              >
                <User className="w-4 h-4 mr-3" />
                View Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.get("/settings")}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4f545c] cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#4f545c]" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 py-6">
   
        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {auth.user?.name || "User"}! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {stats.totalSent > 0
                    ? `You've sent ${stats.totalSent} embeds and saved ${stats.totalSaved} templates. Keep up the great work!`
                    : "Ready to create your first amazing Discord embed? Let's get started!"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-3 bg-[#FFD700] rounded-full">
                  <Zap className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFD700] rounded-lg">
                  <Send className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSent.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Bookmark className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalSaved.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Templates Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.recentActivity.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 mb-6 shadow-lg">
          <CardHeader className="p-4">
            <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-3">
              <div className="p-2 bg-[#FFD700] rounded-lg">
                <Zap className="w-4 h-4 text-black" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  onClick={action.action}
                  className="group cursor-pointer border border-gray-200/60 dark:border-[#4f545c]/60 rounded-lg p-4 hover:bg-gray-50/50 dark:hover:bg-[#32353b]/50 hover:border-gray-300 dark:hover:border-[#4f545c] hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${action.color} rounded-lg`}>
                      <action.icon className={`w-5 h-5 ${action.textColor}`} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#FFD700] transition-colors ml-auto" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-[#FFD700] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
          <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 shadow-lg">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-3">
                  <div className="p-2 bg-[#FFD700] rounded-lg">
                    <Clock className="w-4 h-4 text-black" />
                  </div>
                  Recent Activity
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get("/history")}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#FFD700] dark:hover:text-[#FFD700]"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {recentEmbeds.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Your recent embeds will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEmbeds.map((embed) => (
                    <div
                      key={embed.id}
                      className="flex items-center gap-3 p-3 border border-gray-200/60 dark:border-[#4f545c]/60 rounded-lg hover:bg-gray-50/50 dark:hover:bg-[#32353b]/50 transition-all duration-200 cursor-pointer"
                       onClick={() => router.get("/history")}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: embed.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{embed.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{embed.timestamp}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          embed.status === "success"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                        }
                      >
                        {embed.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 shadow-lg">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-3">
                  <div className="p-2 bg-[#FFD700] rounded-lg">
                    <Star className="w-4 h-4 text-black" />
                  </div>
                  Saved Templates
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get("/saved")}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#FFD700] dark:hover:text-[#FFD700]"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {recentTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No saved templates</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Create and save templates to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center gap-3 p-3 border border-gray-200/60 dark:border-[#4f545c]/60 rounded-lg hover:bg-gray-50/50 dark:hover:bg-[#32353b]/50 transition-all duration-200 cursor-pointer"
                      onClick={() => router.get("/saved")}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: template.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{template.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>Created {template.created_at}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
      </div>
    <footer className="border-t border-gray-200 dark:border-[#202225] bg-white dark:bg-[#2f3136] mt-12 transition-colors w-full z-40
      sm:absolute sm:bottom-0 sm:left-0 sm:right-0">
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
              Support
            </a>

          </div>
        </div>
      </div>
    </footer>
    </div>
  )
}
