"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, GraduationCap, MessageCircle, Clock, CheckCircle2, AlertCircle, LogOut } from "lucide-react"
import { Trash2, RefreshCw, Copy, Wifi, WifiOff, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  status?: "sending" | "sent" | "error"
}

export default function ChatInterface() {
  const [user, setUser] = useState<any>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm Unilorin Student Support, developed by Olamide Bello. I'm here to help you with questions about the University of Ilorin's academic procedures, campus resources, student services, and official policies. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
      status: "sent",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Quick action suggestions
  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    router.push('/')
  }

  // Quick action suggestions
  const quickActions = [
    "How do I register for courses?",
    "Where is the student portal?",
    "How do I apply for hostel accommodation?",
    "What are the graduation requirements?",
    "How do I reset my student portal password?",
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }

  useEffect(() => {
    // Scroll to bottom whenever messages change
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100) // Small delay to ensure DOM is updated

    return () => clearTimeout(timer)
  }, [messages])

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user')
      const token = localStorage.getItem('authToken')
      
      if (!userData || !token) {
        router.push('/login')
        return
      }
      
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthChecking(false)
      } catch (error) {
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim()
    if (!textToSend || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Focus back to input after sending
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    // Add a temporary bot message with loading state
    const tempBotMessage: Message = {
      id: `temp_${Date.now()}`,
      content: "",
      sender: "bot",
      timestamp: new Date(),
      status: "sending",
    }
    setMessages((prev) => [...prev, tempBotMessage])

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://unisup-9n5t.onrender.com"
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          user_id: userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Remove temp message and add real response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempBotMessage.id)
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            content: data.output || "Sorry, I encountered an error processing your request.",
            sender: "bot",
            timestamp: new Date(),
            status: "sent",
          },
        ]
      })
      setRetryCount(0) // Reset retry count on success
    } catch (error) {
      console.error("Error sending message:", error)
      // Remove temp message and add error message
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempBotMessage.id)
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            content: "Sorry, I'm having trouble connecting right now. Please check your connection and try again.",
            sender: "bot",
            timestamp: new Date(),
            status: "error",
          },
        ]
      })
      setRetryCount((prev) => prev + 1)

      toast({
        title: "Connection Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const retryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find((msg) => msg.sender === "user")
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        content:
          "Hi! I'm Unilorin Student Support, developed by Olamide Bello. I'm here to help you with questions about the University of Ilorin's academic procedures, campus resources, and student services, and official policies. How can I assist you today?",
        sender: "bot",
        timestamp: new Date(),
        status: "sent",
      },
    ])
    toast({
      title: "Chat Cleared",
      description: "Your conversation has been reset.",
    })
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Auto-focus input on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Show loading screen while checking authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Verifying your account...</p>
        </div>
      </div>
    )
  }

  // Show error if user not found
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Please login to continue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-md",
                    isOnline ? "bg-green-500" : "bg-red-500",
                  )}
                ></div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  UNILORIN Student Support
                </h1>
                <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                  {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                  <span className={isOnline ? "text-green-600" : "text-red-600"}>
                    {isOnline ? "Online" : "Offline"}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>AI-Powered Support</span>
                </p>
              </div>
            </div>

            {/* User Info & Logout */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.matricNumber}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className="text-gray-600 hover:text-red-600 bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                {retryCount > 0 && (
                  <Button variant="outline" size="sm" onClick={retryLastMessage} className="text-blue-600 bg-transparent">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-120px)] flex flex-col">
        <Card className="flex-1 flex flex-col shadow-xl border-blue-200 min-h-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="w-5 h-5" />
              Chat with Unilorin Student Support
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 min-h-0">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 max-w-[85%] group animate-in slide-in-from-bottom-2 duration-300",
                      message.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
                    )}
                  >
                    <Avatar
                      className={cn(
                        "w-8 h-8 border-2",
                        message.sender === "user" ? "border-blue-200" : "border-blue-300",
                      )}
                    >
                      <AvatarFallback
                        className={cn(
                          message.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gradient-to-br from-blue-600 to-blue-700 text-white",
                        )}
                      >
                        {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn("flex flex-col gap-1", message.sender === "user" ? "items-end" : "items-start")}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 shadow-sm border relative",
                          message.sender === "user"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-800 border-blue-200",
                        )}
                      >
                        {message.status === "sending" ? (
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            </div>
                            <span className="text-sm">Thinking...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              onClick={() => copyMessage(message.content)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>

                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs text-gray-500",
                          message.sender === "user" ? "flex-row-reverse" : "flex-row",
                        )}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sender === "user" && (
                          <>
                            {message.status === "sent" && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                            {message.status === "error" && <AlertCircle className="w-3 h-3 text-red-500" />}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </ScrollArea>

            <Separator className="bg-blue-100 flex-shrink-0" />

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="p-4 bg-blue-50 border-b flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Quick Questions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(action)}
                      className="text-xs bg-white hover:bg-blue-100 border-blue-200"
                      disabled={isLoading}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-gray-50 flex-shrink-0">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about UNILORIN academic procedures, campus resources, or student services..."
                    className="pr-12 py-3 border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl resize-none"
                    disabled={isLoading || !isOnline}
                    maxLength={500}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    {inputMessage.length}/500
                  </div>
                </div>
                <Button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading || !isOnline}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 flex-shrink-0"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="mt-2 text-xs text-gray-500 text-center">
                Powered by AI • Developed by Olamide Bello, IT Dept. UNILORIN
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
