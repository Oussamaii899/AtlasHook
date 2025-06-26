"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
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
import { Separator } from "@/components/ui/separator"
import {
  Search,
  MoreVertical,
  Send,
  Trash2,
  Copy,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Download,
  AlertTriangle,
  Activity,
} from "lucide-react"
import { Head, usePage, router } from "@inertiajs/react"

interface EmbedHistory {
  id: string
  title?: string
  description?: string
  color?: string
  webhook_url: string
  embed_data: any
  status: "success" | "failed"
  error_message?: string
  created_at: string
  updated_at: string
}

interface HistoryPageProps {
  histories: EmbedHistory[]
  total: number
  current_page: number
  per_page: number
  filters: {
    search?: string
    status?: string
  }
}

export default function HistoryPage() {
  const { histories, total, current_page, per_page, filters } = usePage<HistoryPageProps>().props
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [selectedHistories, setSelectedHistories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState(filters.status || "")

  const handleSearch = () => {
    setIsLoading(true)
    router.get(
      "/history",
      {
        search: searchTerm,
        status: statusFilter,
        page: 1,
      },
      {
        preserveState: true,
        onFinish: () => setIsLoading(false),
      },
    )
  }

  const handlePageChange = (page: number) => {
    setIsLoading(true)
    router.get(
      "/history",
      {
        search: searchTerm,
        status: statusFilter,
        page,
      },
      {
        preserveState: true,
        onFinish: () => setIsLoading(false),
      },
    )
  }

  const handleResendEmbed = (historyId: string) => {
    router.post(
      `/history/${historyId}/resend`,
      {},
      {
        onError: (errors) => {
          console.error("Failed to resend embed:", errors)
        },
      },
    )
  }

  const handleDeleteHistory = (historyId: string) => {
    router.delete(
      `/history/${historyId}`,
      {},
      {
        onError: (errors) => {
          console.error("Failed to delete history:", errors)
        },
      },
    )
  }

  const handleBulkDelete = () => {
    router.post(
      "/history/bulk-delete",
      {
        history_ids: selectedHistories,
      },
      {
        onSuccess: () => {
          setSelectedHistories([])
        },
        onError: (errors) => {
          console.error("Failed to delete history:", errors)
        },
      },
    )
  }

  const handleExportSelected = () => {
    const selectedData = histories.filter((history) => selectedHistories.includes(history.id))
    const dataStr = JSON.stringify(selectedData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `embed-history-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "failed":
        return <XCircle className="w-3 h-3 text-red-500" />
      default:
        return <Clock className="w-3 h-3 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
      case "failed":
        return "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
      default:
        return "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
    }
  }

  const totalPages = Math.ceil(total / per_page)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-all duration-300">
      <Head title="Send History" />

      {/* Header */}
      <header className="border-b border-gray-200/80 dark:border-[#202225] bg-white/95 dark:bg-[#2f3136]/95 backdrop-blur-sm px-4 py-4 transition-all duration-300 sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.get("/")}
              className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] transition-all duration-200 p-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Builder</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="hidden sm:flex items-center space-x-3">
              <div className="p-2 bg-[#FFD700] rounded-lg shadow-sm">
                <Activity className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Send History</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Track your embed deliveries</p>
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
              onClick={() => router.get("/saved")}
              variant="outline"
              size="sm"
              className="bg-white/50 dark:bg-[#40444b]/50 border-gray-200 dark:border-[#4f545c] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
            >
              <span className="text-sm">Saved</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Title Section */}
      <div className="sm:hidden bg-white/95 dark:bg-[#2f3136]/95 backdrop-blur-sm border-b border-gray-200/80 dark:border-[#202225] px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FFD700] rounded-lg shadow-sm">
            <Activity className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Send History</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track your embed deliveries</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        {/* Compact Search Section */}
        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 mb-6 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, description, or webhook URL..."
                    className="pl-10 bg-white dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFD700]"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-[#40444b] border border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFD700] text-sm"
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
              <div className="flex items-center gap-2">
                {selectedHistories.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportSelected}
                      className="text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export ({selectedHistories.length})
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete ({selectedHistories.length})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] mx-4">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 dark:text-white">
                            Delete Selected History
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete {selectedHistories.length} selected history entries? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 shadow-lg">
          <CardHeader className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-3">
                  <div className="p-2 bg-[#FFD700] rounded-lg">
                    <Activity className="w-4 h-4 text-black" />
                  </div>
                  Send History
                  <Badge variant="secondary" className="ml-2">
                    {total} total
                  </Badge>
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {histories.length > 0 ? `Showing ${histories.length} of ${total} entries` : "No history found"}
                </p>
              </div>
              {histories.length > 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedHistories.length === histories.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedHistories(histories.map((h) => h.id))
                      } else {
                        setSelectedHistories([])
                      }
                    }}
                    className="rounded border-gray-300 text-[#FFD700] focus:ring-[#FFD700]"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Select All</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {histories.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Activity className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No history found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto text-sm">
                  Your embed send history will appear here after you send embeds.
                </p>
                <Button
                  onClick={() => router.get("/")}
                  className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Your First Embed
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {histories.map((history) => (
                  <div
                    key={history.id}
                    className="group border border-gray-200/60 dark:border-[#4f545c]/60 rounded-lg p-3 hover:bg-gray-50/50 dark:hover:bg-[#32353b]/50 hover:border-gray-300 dark:hover:border-[#4f545c] hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedHistories.includes(history.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedHistories([...selectedHistories, history.id])
                            } else {
                              setSelectedHistories(selectedHistories.filter((id) => id !== history.id))
                            }
                          }}
                          className="rounded border-gray-300 text-[#FFD700] focus:ring-[#FFD700] flex-shrink-0"
                        />
                        <div className="flex items-center gap-1">
                          {getStatusIcon(history.status)}
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(history.status)} text-xs px-1.5 py-0.5`}
                          >
                            {history.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-200 h-6 w-6 p-0"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#4f545c] shadow-xl"
                        >
                          <DropdownMenuItem
                            onClick={() => handleResendEmbed(history.id)}
                            className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4f545c] text-sm"
                          >
                            <Send className="w-3 h-3 mr-2" />
                            Resend
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(history.embed_data, null, 2))}
                            className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4f545c] text-sm"
                          >
                            <Copy className="w-3 h-3 mr-2" />
                            Copy JSON
                          </DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteHistory(history.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm group-hover:text-[#FFD700] transition-colors line-clamp-2">
                      {history.title || "Untitled Embed"}
                    </h3>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {getRelativeTime(history.created_at)}
                    </div>

                    {/* Compact Embed Preview */}
                    <div
                      className="bg-gray-50 dark:bg-[#40444b] border-l-2 rounded p-2 mb-3 text-xs"
                      style={{ borderLeftColor: history.color || "#FFD700" }}
                    >
                      <div className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {history.embed_data.title || "Untitled"}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 line-clamp-1">
                        {history.embed_data.description || "No description"}
                      </div>
                    </div>

                    {history.error_message && (
                      <div className="flex items-start gap-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded mb-3">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <div className="line-clamp-2">{history.error_message}</div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleResendEmbed(history.id)}
                        className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium flex-1 text-xs h-7"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Resend
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(history.embed_data, null, 2))}
                        className="bg-white dark:bg-[#40444b] border-gray-200 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#4f545c] flex-1 text-xs h-7"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200/60 dark:border-[#4f545c]/60 mt-6 gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing <span className="font-medium">{(current_page - 1) * per_page + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(current_page * per_page, total)}</span> of{" "}
                  <span className="font-medium">{total}</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(current_page - 1)}
                    disabled={current_page === 1 || isLoading}
                    className="bg-white dark:bg-[#40444b] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, current_page - 2)
                    if (page > totalPages) return null

                    return (
                      <Button
                        key={page}
                        variant={page === current_page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={isLoading}
                        className={
                          page === current_page
                            ? "bg-[#FFD700] text-black hover:bg-[#FFC700] shadow-md"
                            : "bg-white dark:bg-[#40444b] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
                        }
                      >
                        {page}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(current_page + 1)}
                    disabled={current_page === totalPages || isLoading}
                    className="bg-white dark:bg-[#40444b] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
