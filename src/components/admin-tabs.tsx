import Link from "next/link";

export function AdminTabs({ active }: { active: "matches" | "users" }) {
  const tabs = [
    { href: "/admin", label: "Matches", key: "matches" },
    { href: "/admin/users", label: "Users", key: "users" },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`rounded-full px-4 py-2 text-sm font-black transition ${
            active === tab.key
              ? "bg-lime-300 text-slate-950"
              : "border border-slate-700 bg-slate-900/90 text-slate-100 hover:bg-slate-800"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
