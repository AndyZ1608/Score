"use client"

import * as React from "react"
import { Toaster } from "sonner"

interface SessionContextType {
  userId?: string
  username?: string
  role?: string
  avatarId?: number | null
  isLoading: boolean
  refresh: () => Promise<void>
}

const SessionContext = React.createContext<SessionContextType>({
  isLoading: true,
  refresh: async () => {},
})

export function SessionProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser?: { userId?: string; username?: string; role?: string; avatarId?: number | null }
}) {
  const [session, setSession] = React.useState<{ userId?: string; username?: string; role?: string; avatarId?: number | null }>({
    userId: initialUser?.userId,
    username: initialUser?.username,
    role: initialUser?.role,
    avatarId: initialUser?.avatarId,
  })
  const [isLoading, setIsLoading] = React.useState(!initialUser)

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setSession({
            userId: data.user.id,
            username: data.user.username,
            role: data.user.role,
            avatarId: data.user.avatarId,
          })
        } else {
          setSession({})
        }
      } else {
        setSession({})
      }
    } catch (error) {
      console.error("Failed to fetch session", error)
      setSession({})
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (!initialUser) {
      refresh()
    }
  }, [initialUser, refresh])

  return (
    <SessionContext.Provider value={{ ...session, isLoading, refresh }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return React.useContext(SessionContext)
}

export function Providers({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser?: { userId?: string; username?: string; role?: string; avatarId?: number | null }
}) {
  return (
    <SessionProvider initialUser={initialUser}>
      {children}
      <Toaster position="top-right" richColors />
    </SessionProvider>
  )
}
