"use client"

import { Head, useForm } from "@inertiajs/react"
import { LoaderCircle, Shield, Eye, EyeOff } from "lucide-react"
import { type FormEventHandler, useState } from "react"

import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfirmPassword() {
  const { data, setData, post, processing, errors, reset } = useForm<Required<{ password: string }>>({
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route("password.confirm"), {
      onFinish: () => reset("password"),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-colors">
      <Head title="Confirm password" />

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
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFD700] text-black text-xl">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Secure area access</CardTitle>
              <p className="text-gray-600 dark:text-[#72767d] mt-2">
                Please confirm your password to continue to this secure area
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    This is a secure area of the application. Please confirm your password before continuing.
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 dark:text-white font-medium">
                    Current password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                      value={data.password}
                      autoFocus
                      onChange={(e) => setData("password", e.target.value)}
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

                <Button
                  type="submit"
                  className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium h-11 text-base transition-colors"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Confirm password
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-[#72767d]">
                  Forgot your password?{" "}
                  <a
                    href={route("password.request")}
                    className="text-[#FFD700] hover:text-[#FFC700] font-medium transition-colors"
                  >
                    Reset it here
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-[#72767d]">
              Your session will remain secure after confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
