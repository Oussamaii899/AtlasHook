"use client"

import { Head, useForm } from "@inertiajs/react"
import { LoaderCircle, Eye, EyeOff } from "lucide-react"
import type { FormEventHandler } from "react"
import { useState } from "react"

import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type RegisterForm = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route("register"), {
      onFinish: () => reset("password", "password_confirmation"),
    })
  }

  const handleDiscordRegister = () => {
    window.location.href = route("discord.redirect")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-colors">
      <Head title="Register" />

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
                  A
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</CardTitle>
              <p className="text-gray-600 dark:text-[#72767d] mt-2">
                Join AtlasHook and start building amazing Discord embeds
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Discord Registration Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4] border-[#5865F2] hover:border-[#4752C4] h-11 font-medium transition-colors"
                onClick={handleDiscordRegister}
                disabled={processing}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Continue with Discord
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-[#4f545c]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#2f3136] px-2 text-gray-500 dark:text-[#72767d]">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Registration Form */}
              <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900 dark:text-white font-medium">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    disabled={processing}
                    placeholder="Enter your full name"
                    className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white h-11 transition-colors focus:border-[#FFD700] focus:ring-[#FFD700]"
                  />
                  <InputError message={errors.name} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-white font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    tabIndex={2}
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    disabled={processing}
                    placeholder="email@example.com"
                    className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white h-11 transition-colors focus:border-[#FFD700] focus:ring-[#FFD700]"
                  />
                  <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 dark:text-white font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      tabIndex={3}
                      autoComplete="new-password"
                      value={data.password}
                      onChange={(e) => setData("password", e.target.value)}
                      disabled={processing}
                      placeholder="Create a strong password"
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
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      tabIndex={4}
                      autoComplete="new-password"
                      value={data.password_confirmation}
                      onChange={(e) => setData("password_confirmation", e.target.value)}
                      disabled={processing}
                      placeholder="Confirm your password"
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
                  tabIndex={5}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-[#4f545c]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#2f3136] px-2 text-gray-500 dark:text-[#72767d]">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="text-center">
                <TextLink
                  href={route("login")}
                  tabIndex={6}
                  className="text-[#FFD700] hover:text-[#FFC700] font-medium transition-colors"
                >
                  Sign in instead →
                </TextLink>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-[#72767d]">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
