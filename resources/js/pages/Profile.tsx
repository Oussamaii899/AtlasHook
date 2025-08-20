"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import {
  User,
  ArrowLeft,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Calendar,
  Mail,
  Activity,
  Camera,
  Edit3,
  X,
} from "lucide-react"
import { Head, usePage, router, useForm } from "@inertiajs/react"
import type { SharedData } from "@/types"

interface ProfileProps extends SharedData {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    created_at: string
    updated_at: string
  }
}

export default function ProfilePage() {
  const { auth, user } = usePage<ProfileProps>().props
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" | "info" }>>([])

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const profileForm = useForm({
    name: user.name,
    email: user.email,
    avatar: null as File | null,
    processing: false,
  })

  const passwordForm = useForm({
    current_password: "",
    password: "",
    password_confirmation: "",
  })

  const deleteForm = useForm({
    password: "",
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Avatar file before submission:", avatarFile)

    const formData = {
      name: profileForm.data.name,
      email: profileForm.data.email,
      avatar: avatarFile,
    }

    console.log("Form data being sent:", formData)

    // Set processing state
    profileForm.setData("processing", true)

    router.post("/profile", formData, {
      forceFormData: true,
      _method: "put",
      preserveScroll: true,
      onStart: () => {
        console.log("Request started")
      },
      onSuccess: () => {
        console.log("Profile updated successfully")
        showToast("✅ Profile updated successfully!", "success")
        setIsEditingProfile(false)
        setAvatarPreview(null)
        setAvatarFile(null)
        profileForm.setData("processing", false)
      },
      onError: (errors) => {
        console.error("Profile update errors:", errors)
        showToast("❌ Failed to update profile. Please try again.", "error")
        profileForm.setErrors(errors)
        profileForm.setData("processing", false)
      },
      onFinish: () => {
        profileForm.setData("processing", false)
      },
    })
  }

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    passwordForm.put("/profile/password", {
      preserveScroll: true,
      onSuccess: () => {
        showToast("✅ Password updated successfully!", "success")
        passwordForm.reset()
      },
      onError: () => {
        showToast("❌ Failed to update password. Please check your current password.", "error")
      },
    })
  }

  const handleAccountDelete = (e: React.FormEvent) => {
    e.preventDefault()
    deleteForm.delete("/profile", {
      preserveScroll: true,
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("❌ File size must be less than 5MB", "error")
        return
      }

      if (!file.type.startsWith("image/")) {
        showToast("❌ Please select an image file", "error")
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatarPreview = () => {
    setAvatarPreview(null)
    setAvatarFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-all duration-300">
      <Head title="Profile" />

      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-10000 space-y-2">
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
                <User className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account information</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="bg-white/50 dark:bg-[#40444b]/50 border-gray-200 dark:border-[#202225] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={() => router.get("/settings")}
              variant="outline"
              size="sm"
              className="bg-white/50 dark:bg-[#40444b]/50 border-gray-200 dark:border-[#202225] hover:bg-gray-50 dark:hover:bg-[#4f545c] transition-all duration-200"
            >
              <Settings className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="sm:hidden bg-white/95 dark:bg-[#2f3136]/95 backdrop-blur-sm border-b border-gray-200/80 dark:border-[#202225]/50 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FFD700] rounded-lg shadow-sm">
            <User className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account information</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-[#FFD700] rounded-full flex items-center justify-center text-black text-2xl font-bold shadow-lg overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview || "/placeholder.svg"}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user.avatar ? (
                    <img src={`${user.avatar}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12" />
                  )}
                </div>
                {isEditingProfile && (
                  <div
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                {avatarPreview && isEditingProfile && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    onClick={removeAvatarPreview}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="text-gray-500 hover:text-[#FFD700]"
                  >
                    {isEditingProfile ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </Button>
                </div>
                {user.bio && <p className="text-gray-600 dark:text-gray-300 mb-3">{user.bio}</p>}
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(user.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <Badge
                      variant="outline"
                      className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                    >
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 shadow-lg">
          <CardHeader className="p-4">
            <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-3">
              <div className="p-2 bg-[#FFD700] rounded-lg">
                <User className="w-4 h-4 text-black" />
              </div>
              Profile Information
              {!isEditingProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                  className="ml-auto text-gray-500 hover:text-[#FFD700]"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isEditingProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Full Name</Label>
                    <Input
                      value={profileForm.data.name}
                      onChange={(e) => profileForm.setData("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-white dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFD700]"
                      disabled={profileForm.data.processing}
                    />
                    {profileForm.errors.name && <p className="text-red-500 text-xs mt-1">{profileForm.errors.name}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={profileForm.data.email}
                      onChange={(e) => profileForm.setData("email", e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-white dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFD700]"
                      disabled={profileForm.data.processing}
                    />
                    {profileForm.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{profileForm.errors.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false)
                      setAvatarPreview(null)
                      setAvatarFile(null)
                      profileForm.reset()
                    }}
                    disabled={profileForm.data.processing}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={profileForm.data.processing}
                    className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium"
                  >
                    {profileForm.data.processing ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Full Name</Label>
                    <p className="text-gray-900 dark:text-white">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Email Address
                    </Label>
                    <p className="text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-gray-200/50 dark:border-[#202225]/50 shadow-lg">
          <CardHeader className="p-4">
            <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-3">
              <div className="p-2 bg-[#FFD700] rounded-lg">
                <Shield className="w-4 h-4 text-black" />
              </div>
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.data.current_password}
                    onChange={(e) => passwordForm.setData("current_password", e.target.value)}
                    placeholder="Enter your current password"
                    className="bg-white dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFD700] pr-10"
                    disabled={passwordForm.processing}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {passwordForm.errors.current_password && (
                  <p className="text-red-500 text-xs mt-1">{passwordForm.errors.current_password}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.data.password}
                      onChange={(e) => passwordForm.setData("password", e.target.value)}
                      placeholder="Enter new password"
                      className="bg-white dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFD700] pr-10"
                      disabled={passwordForm.processing}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {passwordForm.errors.password && (
                    <p className="text-red-500 text-xs mt-1">{passwordForm.errors.password}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.data.password_confirmation}
                      onChange={(e) => passwordForm.setData("password_confirmation", e.target.value)}
                      placeholder="Confirm new password"
                      className="bg-white dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFD700] pr-10"
                      disabled={passwordForm.processing}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={passwordForm.processing}
                  className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium"
                >
                  {passwordForm.processing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-[#2f3136]/80 backdrop-blur-sm border-red-200/50 dark:border-red-800/50 shadow-lg">
          <CardHeader className="p-4">
            <CardTitle className="text-red-600 dark:text-red-400 text-lg flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">Delete Account</h3>
              <p className="text-red-700 dark:text-red-400 text-sm mb-4">
                Once you delete your account, all of your data will be permanently deleted. This action cannot be
                undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] mx-4 max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 dark:text-white">
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                      This action cannot be undone. This will permanently delete your account and remove all your data
                      from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <form onSubmit={handleAccountDelete}>
                    <div className="my-4">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Enter your password to confirm
                      </label>
                      <Input
                        type="password"
                        value={deleteForm.data.password}
                        onChange={(e) => deleteForm.setData("password", e.target.value)}
                        placeholder="Enter your password"
                        className="bg-white dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                        disabled={deleteForm.processing}
                      />
                      {deleteForm.errors.password && (
                        <p className="text-red-500 text-xs mt-1">{deleteForm.errors.password}</p>
                      )}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        type="submit"
                        disabled={deleteForm.processing}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleteForm.processing ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </form>
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
                href="/contact"
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
