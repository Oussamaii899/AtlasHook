"use client"

import { Head, useForm } from "@inertiajs/react"
import { LoaderCircle, Mail } from "lucide-react"
import type { FormEventHandler } from "react"

import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPassword({ status }: { status?: string }) {
  const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
    email: "",
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route("password.email"))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-colors">
      <Head title="Forgot password" />

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
                  <Mail className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Forgot your password?</CardTitle>
              <p className="text-gray-600 dark:text-[#72767d] mt-2">
                No worries! Enter your email and we'll send you a reset link
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {status && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="text-center text-sm font-medium text-green-600 dark:text-green-400">{status}</div>
                </div>
              )}

              <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-white font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="off"
                    value={data.email}
                    autoFocus
                    onChange={(e) => setData("email", e.target.value)}
                    placeholder="email@example.com"
                    className="bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white h-11 transition-colors focus:border-[#FFD700] focus:ring-[#FFD700]"
                  />
                  <InputError message={errors.email} />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium h-11 text-base transition-colors"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send password reset link
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-[#4f545c]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#2f3136] px-2 text-gray-500 dark:text-[#72767d]">
                    Remember your password?
                  </span>
                </div>
              </div>

              <div className="text-center">
                <TextLink
                  href={route("login")}
                  className="text-[#FFD700] hover:text-[#FFC700] font-medium transition-colors"
                >
                  Back to sign in →
                </TextLink>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-[#72767d]">
              Didn't receive the email? Check your spam folder or try again
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
