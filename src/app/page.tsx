import Link from "next/link"
import { getSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, ShieldCheck, ArrowRight, Zap, Target, Users } from "lucide-react"

export default async function LandingPage() {
  const session = await getSession()
  const isLoggedIn = !!session.userId

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-24 space-y-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase">
          <Zap className="h-3 w-3 text-indigo-400" />
          World Cup 2026 Predictions
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-150 to-zinc-400 bg-clip-text text-transparent">
          Predict the Game. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Conquer the Leaderboard.
          </span>
        </h1>

        <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Predict World Cup scores with your friends. Submit your score predictions for the 2026 tournament, earn points, and compete on the leaderboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="lg" className="font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-zinc-800 hover:bg-zinc-900 font-semibold">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Glassmorphic Rules & Features Showcase */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Rules Card */}
        <div className="premium-card-gradient rounded-2xl p-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Prediction Rules</h2>
            </div>
            
            <p className="text-sm text-zinc-400 leading-relaxed">
              Predicting scores is easy, but getting high scores requires skill! Points are distributed after each match concludes:
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                  +1
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Correct Outcome</h4>
                  <p className="text-xs text-zinc-450 mt-0.5">Earn 1 point for correctly predicting the match result (Home Win, Away Win, or Draw).</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-xs">
                  +3
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Exact Score</h4>
                  <p className="text-xs text-zinc-450 mt-0.5">Earn an additional 3 points if you predict the exact goals scored by both teams.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-xs">
                  4
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Maximum Points per Match</h4>
                  <p className="text-xs text-zinc-450 mt-0.5">A perfect scoreline prediction yields a maximum of 4 points in total.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-zinc-800/40 text-xs text-zinc-500">
            Predictions lock precisely at kickoff time.
          </div>
        </div>

        {/* Features Card */}
        <div className="premium-card-gradient rounded-2xl p-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Trophy className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Why Join SCORE?</h2>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed">
              We offer a simple yet premium tournament dashboard experience built for true fans:
            </p>

            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-zinc-800/50 text-zinc-300">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">All Match Schedules</h4>
                  <p className="text-xs text-zinc-450">Easily browse matches, filter by status, and plan predictions.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-zinc-800/50 text-zinc-300">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Global Leaderboard</h4>
                  <p className="text-xs text-zinc-450">Track your standing against the community and climb to the top.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-zinc-800/50 text-zinc-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Fair and Automated</h4>
                  <p className="text-xs text-zinc-450">Automatic verification and scoring as soon as official scores sync.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-zinc-800/40 text-xs text-zinc-550 flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            Real-time fixture and score synchronization.
          </div>
        </div>
      </div>
    </div>
  )
}
