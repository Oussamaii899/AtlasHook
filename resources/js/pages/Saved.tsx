"use client"

import { useState, useEffect } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Bookmark,
  Search,
  Plus,
  MoreVertical,
  Send,
  Edit,
  Trash2,
  Copy,
  ArrowLeft,
  RefreshCw,
  Star,
  StarOff,
  Calendar,
  Eye,
  Download,
} from "lucide-react"
import { Head, usePage, router } from "@inertiajs/react"

interface SavedEmbed {
  id: string
  name: string
  description?: string
  color: string
  is_favorite: boolean
  created_at: string
  updated_at: string
  embed_data: any
  usage_count: number
}

interface SavedPageProps {
  saved: SavedEmbed[]
  total: number
  current_page: number
  per_page: number
  filters: {
    search?: string
    favorites_only?: boolean
  }
}

export default function SavedPage() {
  const { saved, total, current_page, per_page, filters } = usePage<SavedPageProps>().props
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [favoritesOnly, setFavoritesOnly] = useState(filters.favorites_only || false)
  const [selectedEmbeds, setSelectedEmbeds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newEmbedName, setNewEmbedName] = useState("")
  const [newEmbedDescription, setNewEmbedDescription] = useState("")
  const [sortBy, setSortBy] = useState<"updated" | "created" | "name" | "usage">("updated")

  const handleSearch = () => {
    setIsLoading(true)
    router.get(
      "/saved",
      {
        search: searchTerm,
        favorites_only: favoritesOnly,
        sort: sortBy,
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
      "/saved",
      {
        search: searchTerm,
        favorites_only: favoritesOnly,
        sort: sortBy,
        page,
      },
      {
        preserveState: true,
        onFinish: () => setIsLoading(false),
      },
    )
  }

  const handleCreateNew = () => {
    setShowCreateDialog(false)
    router.get("/", {
      save_as: newEmbedName,
      description: newEmbedDescription,
    })
  }

  const handleEditEmbed = (embed: SavedEmbed) => {
    
    router.post(
      `/saved/${embed.id}/use`,
      {},
      {
        preserveState: true,
        onSuccess: () => {
          router.get("/", {
            template: JSON.stringify(embed.embed_data),
            edit_saved_id: embed.id,
          })
        },
        onError: (errors) => {
          console.error("Failed to increment usage count:", errors)
        
          router.get("/", {
            template: JSON.stringify(embed.embed_data),
            edit_saved_id: embed.id,
          })
        },
      },
    )
  }

  const handleSendEmbed = (embed: SavedEmbed) => {
   
    router.post(
      `/saved/${embed.id}/use`,
      {},
      {
        preserveState: true,
        onSuccess: () => {
          router.get("/", {
            template: JSON.stringify(embed.embed_data),
            quick_send: true,
          })
        },
        onError: (errors) => {
          console.error("Failed to increment usage count:", errors)
      
          router.get("/", {
            template: JSON.stringify(embed.embed_data),
            quick_send: true,
          })
        },
      },
    )
  }

  const handleToggleFavorite = (embedId: string, isFavorite: boolean) => {
    router.patch(
      `/saved/${embedId}/favorite`,
      {
        is_favorite: !isFavorite,
      },
      {
        preserveState: true,
        onError: (errors) => {
          console.error("Failed to toggle favorite:", errors)
        },
      },
    )
  }

  const handleDeleteEmbed = (embedId: string) => {
    router.delete(
      `/saved/${embedId}`,
      {},
      {
        onError: (errors) => {
          console.error("Failed to delete embed:", errors)
        },
      },
    )
  }

  const handleBulkDelete = () => {
    router.post(
      "/saved/bulk-delete",
      {
        embed_ids: selectedEmbeds,
      },
      {
        onSuccess: () => {
          setSelectedEmbeds([])
        },
        onError: (errors) => {
          console.error("Failed to delete embeds:", errors)
        },
      },
    )
  }

  const handleExportSelected = () => {
    const selectedData = saved.filter((embed) => selectedEmbeds.includes(embed.id))
    const dataStr = JSON.stringify(selectedData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `saved-templates-${new Date().toISOString().split("T")[0]}.json`
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

  const totalPages = Math.ceil(total / per_page)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search || favoritesOnly !== filters.favorites_only) {
        handleSearch()
      }
    }, 500) 

    return () => clearTimeout(timeoutId)
  }, [searchTerm, favoritesOnly, sortBy])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-all duration-300">
      <Head title="Saved Templates" />

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
                <Bookmark className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Saved Templates</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your embed templates</p>
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
              onClick={() => router.get("/history")}
              variant="outline"
              size="sm"
              className="bg-white/50 dark:bg-[#40444b]/50 border-gray-200 dark:border-[#4f545c] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
            >
              <span className="text-sm">History</span>
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Create New</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] mx-4 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#FFD700]" />
                    Create New Template
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-300">
                    Start creating a new embed template that you can save and reuse.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Template Name *
                    </label>
                    <Input
                      value={newEmbedName}
                      onChange={(e) => setNewEmbedName(e.target.value)}
                      placeholder="Enter template name..."
                      className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Description (Optional)
                    </label>
                    <Input
                      value={newEmbedDescription}
                      onChange={(e) => setNewEmbedDescription(e.target.value)}
                      placeholder="Describe this template..."
                      className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFD700]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="bg-gray-100 dark:bg-[#40444b] text-gray-900 dark:text-white border-gray-200 dark:border-[#202225]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateNew}
                    disabled={!newEmbedName.trim()}
                    className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium"
                  >
                    Create & Edit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Mobile Title Section */}
      <div className="sm:hidden bg-white/95 dark:bg-[#2f3136]/95 backdrop-blur-sm border-b border-gray-200/80 dark:border-[#202225] px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FFD700] rounded-lg shadow-sm">
            <Bookmark className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Saved Templates</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your embed templates</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        {/* Compact Search Section */}
        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 mb-6 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, description, or content..."
                    className="pl-10 bg-white dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFD700]"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white dark:bg-[#40444b] border border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFD700] text-sm"
                >
                  <option value="updated">Last Updated</option>
                  <option value="created">Date Created</option>
                  <option value="name">Name</option>
                  <option value="usage">Usage Count</option>
                </select>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="favorites"
                      checked={favoritesOnly}
                      onChange={(e) => setFavoritesOnly(e.target.checked)}
                      className="rounded border-gray-300 text-[#FFD700] focus:ring-[#FFD700]"
                    />
                    <label
                      htmlFor="favorites"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"
                    >
                      <Star className="w-3 h-3 text-[#FFD700]" />
                      Favorites
                    </label>
                  </div>
                  {selectedEmbeds.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportSelected}
                        className="text-gray-600 border-gray-200 hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export ({selectedEmbeds.length})
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete ({selectedEmbeds.length})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] mx-4">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900 dark:text-white">
                              Delete Selected Templates
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                              Are you sure you want to delete {selectedEmbeds.length} selected template(s)? This action
                              cannot be undone.
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
                    <Bookmark className="w-4 h-4 text-black" />
                  </div>
                  Saved Templates
                  <Badge variant="secondary" className="ml-2">
                    {total} total
                  </Badge>
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {saved.length > 0 ? `Showing ${saved.length} of ${total} templates` : "No templates found"}
                </p>
              </div>
              {saved.length > 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedEmbeds.length === saved.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmbeds(saved.map((s) => s.id))
                      } else {
                        setSelectedEmbeds([])
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
            {saved.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Bookmark className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved templates found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto text-sm">
                  Create and save embed templates to reuse them later.
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {saved.map((embed) => (
                  <div
                    key={embed.id}
                    className="group border border-gray-200/60 dark:border-[#4f545c]/60 rounded-lg p-3 hover:bg-gray-50/50 dark:hover:bg-[#32353b]/50 hover:border-gray-300 dark:hover:border-[#4f545c] hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedEmbeds.includes(embed.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmbeds([...selectedEmbeds, embed.id])
                            } else {
                              setSelectedEmbeds(selectedEmbeds.filter((id) => id !== embed.id))
                            }
                          }}
                          className="rounded border-gray-300 text-[#FFD700] focus:ring-[#FFD700] flex-shrink-0"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(embed.id, embed.is_favorite)}
                          className="p-0 h-auto hover:bg-transparent"
                        >
                          {embed.is_favorite ? (
                            <Star className="w-4 h-4 text-[#FFD700] fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-400 hover:text-[#FFD700] transition-colors" />
                          )}
                        </Button>
                        {embed.usage_count > 10 && (
                          <Badge
                            variant="outline"
                            className="bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20 text-xs px-1.5 py-0.5"
                          >
                            POPULAR
                          </Badge>
                        )}
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
                            onClick={() => handleSendEmbed(embed)}
                            className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4f545c] text-sm"
                          >
                            <Send className="w-3 h-3 mr-2" />
                            Send Now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditEmbed(embed)}
                            className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4f545c] text-sm"
                          >
                            <Edit className="w-3 h-3 mr-2" />
                            Edit Template
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleFavorite(embed.id, embed.is_favorite)}
                            className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4f545c] text-sm"
                          >
                            {embed.is_favorite ? (
                              <>
                                <StarOff className="w-3 h-3 mr-2" />
                                Remove Favorite
                              </>
                            ) : (
                              <>
                                <Star className="w-3 h-3 mr-2" />
                                Add to Favorites
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(embed.embed_data, null, 2))}
                            className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4f545c] text-sm"
                          >
                            <Copy className="w-3 h-3 mr-2" />
                            Copy JSON
                          </DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteEmbed(embed.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Delete Template
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm group-hover:text-[#FFD700] transition-colors line-clamp-2">
                      {embed.name}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{embed.usage_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{getRelativeTime(embed.updated_at)}</span>
                      </div>
                    </div>

                    {/* Compact Embed Preview */}
                    <div
                      className="bg-gray-50 dark:bg-[#40444b] border-l-2 rounded p-2 mb-3 text-xs"
                      style={{ borderLeftColor: embed.embed_data.color || "#FFD700" }}
                    >
                      <div className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {embed.embed_data.title || "Untitled Embed"}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 line-clamp-1">
                        {embed.embed_data.description || "No description provided"}
                      </div>
                      {embed.embed_data.fields && embed.embed_data.fields.length > 0 && (
                        <div className="mt-1 text-gray-500 dark:text-gray-400">
                          {embed.embed_data.fields.length} field{embed.embed_data.fields.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSendEmbed(embed)}
                        className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium flex-1 text-xs h-7"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditEmbed(embed)}
                        className="bg-white dark:bg-[#40444b] border-gray-200 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#4f545c] flex-1 text-xs h-7"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
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
