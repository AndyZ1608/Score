import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import messiImage from "../../assets/messi.jpg";
import ronaldoImage from "../../assets/ronaldo.jpg";
import wcImage from "../../assets/wc2026.jpg";

const heroImages: Array<{ src: StaticImageData; alt: string; className: string; priority?: boolean }> = [
  {
    src: wcImage,
    alt: "World Cup 2026 tournament artwork",
    className: "col-span-2 aspect-[16/9] w-full",
    priority: true,
  },
  {
    src: messiImage,
    alt: "Lionel Messi football portrait",
    className: "aspect-[4/5] w-full",
  },
  {
    src: ronaldoImage,
    alt: "Cristiano Ronaldo football portrait",
    className: "aspect-[4/5] w-full",
  },
];

export function FootballHero({ username }: { username?: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-950 via-green-900 to-slate-950 p-6 shadow-2xl shadow-emerald-950/40 sm:p-8">
      <div className="football-pitch-lines absolute inset-0 opacity-35" aria-hidden="true" />
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime-300/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden="true" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-emerald-100">
            <Trophy className="h-4 w-4 text-amber-300" aria-hidden="true" />
            World Cup 2026 Predictor
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-emerald-200">{username ? `Welcome back, ${username}` : "Football prediction league"}</p>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Predict the World Cup. Climb the leaderboard.
            </h1>
            <p className="max-w-xl text-base leading-7 text-emerald-50/85">
              Pick exact scores, back the right result, and turn every matchday into a friendly competition.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/matches"
              className="inline-flex items-center justify-center rounded-xl bg-lime-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-lime-950/20 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-lime-100"
            >
              Make Predictions
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              View Leaderboard
            </Link>
          </div>
        </div>

        <div className="hidden grid-cols-2 gap-3 md:grid">
          {heroImages.map((image) => (
            <div key={image.alt} className={`${image.className} relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl`}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={image.priority}
                className="object-cover"
                sizes="(min-width: 1024px) 340px, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-emerald-900/15" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
