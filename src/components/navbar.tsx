"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Trophy, Calendar, LayoutDashboard, LogOut } from "lucide-react"
import { useSession } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { UserAvatar } from "@/components/user-avatar"

export function Navbar() {
  const { userId, username, refresh } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (res.ok) {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
          variant: "success",
        })
        await refresh()
        router.push("/login")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/matches", label: "Matches", icon: Calendar },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ]

  const isActive = (href: string) => pathname === href
  const logoutButtonClass =
    "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100 hover:text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:hover:text-white"

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-200/70 bg-white/95 shadow-sm shadow-emerald-950/5 backdrop-blur dark:border-emerald-500/20 dark:bg-slate-950/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-sm font-extrabold text-white shadow-sm shadow-emerald-900/25 dark:bg-lime-300 dark:text-slate-950">
                SCORE
              </span>
            </Link>

            <div className="hidden md:flex space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(link.href)
                        ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-400/15 dark:text-emerald-100"
                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-950 dark:text-slate-300 dark:hover:bg-emerald-400/10 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Desktop Right Nav (Auth) */}
          <div className="hidden md:flex items-center space-x-4">
            {userId ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <UserAvatar seed={userId} name={username} size="sm" />
                  <span>Hello, <span className="font-semibold">{username}</span></span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className={`flex items-center space-x-1 font-medium ${logoutButtonClass}`}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-zinc-500 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-500 dark:hover:bg-zinc-800"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="space-y-1 border-t border-emerald-200/70 bg-white/95 px-2 pb-4 pt-2 dark:border-emerald-500/20 dark:bg-slate-950/95 md:hidden">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                  isActive(link.href)
                    ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-400/15 dark:text-emerald-100"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-950 dark:text-slate-300 dark:hover:bg-emerald-400/10 dark:hover:text-white"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
          <div className="border-t border-zinc-200 dark:border-zinc-800 my-2 pt-2">
            {userId ? (
              <div className="px-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <UserAvatar seed={userId} name={username} size="sm" />
                  <span>Logged in as <span className="font-semibold">{username}</span></span>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setIsOpen(false); handleLogout(); }} className={`w-full flex items-center justify-center space-x-1 font-medium ${logoutButtonClass}`}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="px-3 flex flex-col space-y-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
