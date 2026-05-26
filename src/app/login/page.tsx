"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Loader2, KeyRound } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { refresh, userId } = useSession()
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Redirect if already logged in
  React.useEffect(() => {
    if (userId) {
      router.push("/dashboard")
    }
  }, [userId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password) {
      setError("Please fill in all fields.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok && data.user) {
        toast({
          title: "Welcome back!",
          description: `Logged in as ${username}`,
          variant: "success",
        })
        await refresh()
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(data.error || "Invalid username or password.")
        toast({
          title: "Login Failed",
          description: data.error || "Invalid username or password.",
          variant: "destructive",
        })
      }
    } catch (err) {
      setError("A network error occurred. Please try again.")
      toast({
        title: "Connection Error",
        description: "Failed to connect to the login server.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-10">
      <Card className="w-full max-w-md premium-card-gradient border-zinc-800 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <KeyRound className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-zinc-150">Welcome Back</CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Sign in to your account to predict matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-950/30 border border-red-500/30 text-xs font-medium text-red-400">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder-zinc-650"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder-zinc-650"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full font-semibold bg-indigo-600 hover:bg-indigo-500 text-white mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-zinc-500">
          <div>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold">
              Sign Up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
