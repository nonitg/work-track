import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { getExercises } from "@/lib/queries";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

export default async function MorePage() {
  const exercises = await getExercises();
  const byCategory = exercises.reduce<Record<string, typeof exercises>>((acc, e) => {
    const k = e.category ?? "Other";
    (acc[k] ||= []).push(e);
    return acc;
  }, {});
  const categories = Object.keys(byCategory).sort();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">More</h1>
        <p className="mt-1 text-sm text-zinc-500">Plan, exercises, and account.</p>
      </header>

      <Link href="/plan" className="block">
        <Card className="cursor-pointer transition hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-700">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-zinc-900 dark:text-zinc-100">Plan</CardTitle>
              <p className="mt-1 text-xs text-zinc-500">
                Weekly schedule, warm-ups, diet, mobility, supplements
              </p>
            </div>
            <span aria-hidden className="shrink-0 text-zinc-400">→</span>
          </div>
        </Card>
      </Link>

      <Card>
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <CardTitle className="text-zinc-900 dark:text-zinc-100">Exercises</CardTitle>
            <p className="mt-1 text-xs text-zinc-500">
              {exercises.length} total · tap one to see progression
            </p>
          </div>
        </div>
        <div className="mt-4 max-h-[28rem] space-y-4 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="sticky top-0 z-10 -mx-1 bg-white/95 px-1 py-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500 backdrop-blur dark:bg-zinc-900/95">
                {cat}
              </div>
              <ul className="mt-1 space-y-0.5">
                {byCategory[cat].map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/exercise/${e.id}`}
                      className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <span className="min-w-0 truncate">{e.name}</span>
                      <span className="shrink-0 text-xs text-zinc-400">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {exercises.length === 0 && (
            <p className="text-sm text-zinc-500">No exercises yet.</p>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle className="text-zinc-900 dark:text-zinc-100">Account</CardTitle>
        <p className="mt-1 text-xs text-zinc-500">Sign out of work-track on this device.</p>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </Card>
    </div>
  );
}
