"use client"

import { Head, useForm } from "@inertiajs/react"
import { LoaderCircle, Eye, EyeOff } from "lucide-react"
import { type FormEventHandler, useState } from "react"
import route from "ziggy-js"

import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResetPasswordProps {
  token: string
  email: string
}

type ResetPasswordForm = {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
  const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
    token: token,
    email: email,
    password: "",
    password_confirmation: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route("password.store"), {
      onFinish: () => reset("password", "password_confirmation"),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-colors">
      <Head title="Reset password" />

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-[#202225] bg-white dark:bg-[#2f3136] px-4 py-3 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#FFD700] text-black text-sm font-bold">
              A
            </div>
            <span className="text-lg font-semibold">AtlasHook</span>
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] text-sm px-4 py-2 transition-colors"
              onClick={() => (window.location.href = "/")}
            >
              Back to Home
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] shadow-lg transition-colors">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFD700] text-black text-xl font-bold">
                  🔑
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</CardTitle>
              <p className="text-gray-600 dark:text-[#72767d] mt-2">
                Enter your new password below to complete the reset process
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-white font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={data.email}
                    readOnly
                    onChange={(e) => setData("email", e.target.value)}
                    className="bg-gray-100 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white h-11 transition-colors cursor-not-allowed"
                  />
                  <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 dark:text-white font-medium">
                    New password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
                      value={data.password}
                      autoFocus
                      onChange={(e) => setData("password", e.target.value)}
                      placeholder="Enter your new password"
                      className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white h-11 pr-10 transition-colors focus:border-[#FFD700] focus:ring-[#FFD700]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#72767d] hover:text-gray-700 dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <InputError message={errors.password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation" className="text-gray-900 dark:text-white font-medium">
                    Confirm new password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      name="password_confirmation"
                      autoComplete="new-password"
                      value={data.password_confirmation}
                      onChange={(e) => setData("password_confirmation", e.target.value)}
                      placeholder="Confirm your new password"
                      className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white h-11 pr-10 transition-colors focus:border-[#FFD700] focus:ring-[#FFD700]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#72767d] hover:text-gray-700 dark:hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <InputError message={errors.password_confirmation} />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium h-11 text-base transition-colors"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-[#72767d]">
                  Remember your password?{" "}
                  <a
                    href={route("login")}
                    className="text-[#FFD700] hover:text-[#FFC700] font-medium transition-colors"
                  >
                    Sign in instead
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-[#72767d]">
              This password reset link will expire in 60 minutes for security
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
