"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Sun,
  Moon,
  Monitor,
  Search,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Zap,
  Shield,
  Code,
  Users,
  HelpCircle,
} from "lucide-react"
import { Head, usePage } from "@inertiajs/react"

export default function FAQPage() {
      const { auth } = usePage<SharedData>().props
    
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFAQs, setFilteredFAQs] = useState<any[]>([])


  const faqCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Zap className="w-5 h-5" />,
      faqs: [
        {
          question: "What is AtlasHook?",
          answer:
            "AtlasHook is a powerful Discord embed builder that allows you to create beautiful, rich embeds and send them directly to your Discord server through webhooks. It features a user-friendly interface, live preview, and template saving capabilities.",
        },
        {
          question: "How do I get started with AtlasHook?",
          answer:
            "Simply visit our embed builder, paste your Discord webhook URL, and start creating! You can build embeds using our intuitive form interface and see a live preview of how they'll look in Discord.",
        },
        {
          question: "Do I need to create an account?",
          answer:
            "No account is required to use the basic embed builder. However, creating an account allows you to save embed templates, view your sending history, and access additional features.",
        },
        {
          question: "Is AtlasHook free to use?",
          answer:
            "Yes! AtlasHook is completely free to use. All core features including embed building, webhook sending, and live preview are available at no cost.",
        },
      ],
    },
    {
      id: "webhooks",
      title: "Discord Webhooks",
      icon: <ExternalLink className="w-5 h-5" />,
      faqs: [
        {
          question: "How do I create a Discord webhook?",
          answer:
            "To create a webhook: 1) Go to your Discord server settings, 2) Navigate to 'Integrations', 3) Click 'Webhooks', 4) Click 'New Webhook', 5) Choose a channel and copy the webhook URL. Paste this URL into AtlasHook to get started.",
        },
        {
          question: "What permissions do webhooks need?",
          answer:
            "Webhooks only need 'Send Messages' permission in the channel they're created for. They automatically have permission to send embeds and cannot perform any other actions in your server.",
        },
        {
          question: "Can I use the same webhook for multiple embeds?",
          answer:
            "Yes! You can reuse the same webhook URL for as many embeds as you want. The webhook will send all messages to the same channel it was created for.",
        },
        {
          question: "Why isn't my webhook working?",
          answer:
            "Common issues include: invalid webhook URL, webhook was deleted from Discord, channel permissions changed, or the server was deleted. Try recreating the webhook or check the URL format.",
        },
      ],
    },
    {
      id: "embeds",
      title: "Creating Embeds",
      icon: <MessageSquare className="w-5 h-5" />,
      faqs: [
        {
          question: "What are Discord embeds?",
          answer:
            "Discord embeds are rich content blocks that can contain formatted text, images, links, and structured information. They appear as colored panels in Discord messages and are great for announcements, information displays, and bot responses.",
        },
        {
          question: "How many embeds can I send at once?",
          answer:
            "You can create and send up to 10 embeds in a single message through AtlasHook. Each embed can contain multiple fields, images, and other content elements.",
        },
        {
          question: "What's the character limit for embed content?",
          answer:
            "Discord has the following limits: Title (256 characters), Description (4096 characters), Field name (256 characters), Field value (1024 characters), Footer text (2048 characters), Author name (256 characters).",
        },
        {
          question: "Can I use markdown in embeds?",
          answer:
            "Yes! Discord supports markdown formatting in embed descriptions and field values. You can use **bold**, *italic*, `code`, and other markdown syntax.",
        },
        {
          question: "How do I add images to embeds?",
          answer:
            "You can add images by providing direct URLs to image files. Use the 'Images' tab in the embed builder to set thumbnail URLs (small images) or main image URLs (large images).",
        },
      ],
    },
    {
      id: "features",
      title: "Features & Tools",
      icon: <Code className="w-5 h-5" />,
      faqs: [
        {
          question: "Can I save my embed templates?",
          answer:
            "Yes! With a free account, you can save embed templates for reuse. This is perfect for recurring announcements, server updates, or any embeds you use frequently.",
        },
        {
          question: "How does the live preview work?",
          answer:
            "Our live preview shows exactly how your embed will appear in Discord, including colors, formatting, images, and layout. It updates in real-time as you make changes.",
        },
        {
          question: "Can I copy the JSON output?",
          answer:
            "AtlasHook generates the raw JSON payload that gets sent to Discord. You can copy this for use in bots, scripts, or other applications.",
        },
        {
          question: "What are embed fields?",
          answer:
            "Fields are structured content blocks within embeds that have a name and value. They can be displayed inline (side by side) or stacked vertically, perfect for displaying lists or key-value information.",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Privacy",
      icon: <Shield className="w-5 h-5" />,
      faqs: [
        {
          question: "What data does AtlasHook store?",
          answer:
            "We only store data you explicitly save: embed templates and sending history (if you're logged in). We don't store webhook URLs, embed content, or any Discord server information.",
        },
        {
          question: "Can I delete my account and data?",
          answer:
            "Yes, you can delete your account and all associated data at any time from your dashboard. This action is permanent and cannot be undone.",
        },
        {
          question: "Do you share data with third parties?",
          answer:
            "No, we never share your personal data or embed content with third parties. Your privacy is important to us.",
        },
        {
          question: "How do I change my password?",
          answer:
            "You can change your password from your account dashboard. We'll send a confirmation email to verify the change.",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: <HelpCircle className="w-5 h-5" />,
      faqs: [
        {
          question: "My embed isn't sending. What's wrong?",
          answer:
            "Check these common issues: 1) Webhook URL is correct and valid, 2) Webhook hasn't been deleted from Discord, 3) You have internet connection, 4) Embed content doesn't exceed Discord's limits, 5) Channel still exists and webhook has permissions.",
        },
        {
          question: "Images aren't showing in my embed",
          answer:
            "Ensure image URLs are: 1) Direct links to image files (ending in .png, .jpg, etc.), 2) Publicly accessible (not behind login), 3) Using HTTPS protocol, 4) Not blocked by Discord's content filters.",
        },
        {
          question: "The preview looks different from Discord",
          answer:
            "Our preview closely matches Discord's appearance, but minor differences may exist due to Discord updates or browser rendering. The actual embed in Discord is always accurate.",
        },
        {
          question: "I'm getting a 'rate limited' error",
          answer:
            "Discord limits webhook requests to prevent spam. If you're sending many embeds quickly, wait a few minutes before trying again. For high-volume use, consider spacing out your requests.",
        },
      ],
    },
  ]

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

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFAQs([])
      return
    }

    const filtered = faqCategories.flatMap((category) =>
      category.faqs
        .filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((faq) => ({ ...faq, category: category.title })),
    )

    setFilteredFAQs(filtered)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#36393f] text-gray-900 dark:text-white transition-colors">
      <Head title="FAQ" />
     
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
              <span className="text-lg font-semibold">AtlasHook FAQ</span>
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 dark:text-[#72767d] max-w-2xl mx-auto">
            Find answers to common questions about AtlasHook, Discord webhooks, and embed creation.
          </p>
        </div>

        <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] mb-8 transition-colors">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#72767d] w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQ..."
                className="pl-10 bg-gray-50 dark:bg-[#40444b] border-gray-200 dark:border-[#202225] text-gray-900 dark:text-white h-12 text-base transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {searchQuery && (
          <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] mb-8 transition-colors">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Search Results ({filteredFAQs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem key={index} value={`search-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{faq.question}</div>
                          <div className="text-sm text-[#FFD700] mt-1">{faq.category}</div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="text-gray-600 dark:text-[#dcddde] leading-relaxed">{faq.answer}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-[#72767d] mb-2">No results found for "{searchQuery}"</div>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] transition-colors"
                  >
                    Clear search
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!searchQuery && (
          <div className="grid gap-8">
            {faqCategories.map((category) => (
              <Card
                key={category.id}
                className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] transition-colors"
              >
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-[#FFD700] rounded-lg text-black">{category.icon}</div>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger className="text-left font-medium text-gray-900 dark:text-white hover:text-[#FFD700] dark:hover:text-[#FFD700] transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="text-gray-600 dark:text-[#dcddde] leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-white dark:bg-[#2f3136] border-gray-200 dark:border-[#202225] mt-12 transition-colors">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Still need help?</h3>
              <p className="text-gray-600 dark:text-[#72767d] mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium"
                onClick={() => (window.location.href = "/contact")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-gray-300 dark:border-[#4f545c] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4f545c] transition-colors"
                onClick={() => (window.location.href = "/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Builder
              </Button>
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
                href='/contact'
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
