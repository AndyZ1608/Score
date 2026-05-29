import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { getSession } from "@/lib/auth"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "SCORE - World Cup 2026 Prediction League",
  description: "Predict match outcomes, score exact matches, and compete with friends in the ultimate World Cup 2026 Prediction game.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const initialUser = session.userId
    ? { userId: session.userId, username: session.username, role: session.role, avatarId: session.avatarId }
    : undefined

  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-zinc-950 text-zinc-50 premium-gradient">
        <Providers initialUser={initialUser}>
          <Navbar />
          <main className="flex-1 flex flex-col w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-zinc-900 bg-zinc-950/60 py-6 text-center text-xs text-zinc-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="font-semibold text-zinc-300 flex items-center space-x-1.5">
                  <span className="bg-zinc-800 text-zinc-50 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider">
                    SCORE
                  </span>
                  <span className="text-[10px] font-normal text-zinc-500">
                    World Cup Predictor
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="cursor-pointer hover:text-zinc-300 transition-colors">Rules</span>
                  <span className="cursor-pointer hover:text-zinc-300 transition-colors">Privacy Policy</span>
                  <span className="cursor-pointer hover:text-zinc-300 transition-colors">Terms of Service</span>
                </div>
                <div>
                  &copy; {new Date().getFullYear()} SCORE. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
