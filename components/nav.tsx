"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; match: RegExp; icon: React.ReactNode };

const items: Item[] = [
  {
    href: "/",
    label: "Home",
    match: /^\/$/,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 9v11a1 1 0 001 1h4v-7h4v7h4a1 1 0 001-1V9" />
      </svg>
    ),
  },
  {
    href: "/workout/new",
    label: "Train",
    match: /^\/(workout|history|exercise)/,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <path d="M6 4v16M18 4v16M3 8h3M3 16h3M18 8h3M18 16h3M6 12h12" />
      </svg>
    ),
  },
  {
    href: "/weight",
    label: "Weight",
    match: /^\/weight/,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <path d="M3 12h18M3 7l3 5-3 5M21 7l-3 5 3 5" />
      </svg>
    ),
  },
  {
    href: "/nutrition",
    label: "Food",
    match: /^\/nutrition/,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <path d="M5 11h14M7 11V7a5 5 0 0110 0v4M6 11l1 9h10l1-9" />
      </svg>
    ),
  },
  {
    href: "/more",
    label: "More",
    match: /^\/(more|mobility|cardio)/,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 safe-bottom md:hidden">
      <ul className="mx-auto flex max-w-md justify-around">
        {items.map((it) => {
          const active = it.match.test(pathname);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-xs",
                  active ? "text-zinc-900 dark:text-white" : "text-zinc-500",
                )}
              >
                {it.icon}
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex md:w-56 md:flex-col md:gap-1 md:border-r md:border-zinc-200 md:p-4 md:dark:border-zinc-800">
      <div className="px-2 pb-4 text-lg font-semibold tracking-tight">work-track</div>
      {items.map((it) => {
        const active = it.match.test(pathname);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
              active
                ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
            )}
          >
            <span className="opacity-80">{it.icon}</span>
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
