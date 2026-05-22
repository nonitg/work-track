import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { getRecentWorkouts } from "@/lib/queries";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const workouts = await getRecentWorkouts(50);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
      </header>
      <Card>
        <CardTitle>Workouts</CardTitle>
        {workouts.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Nothing logged yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {workouts.map((w) => {
              const tpl = Array.isArray(w.template) ? w.template[0] : w.template;
              return (
                <li key={w.id} className="py-3">
                  <Link href={`/workout/${w.id}`} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{tpl?.name ?? "Workout"}</div>
                      {tpl?.day_label && <div className="text-xs text-zinc-500">{tpl.day_label}</div>}
                    </div>
                    <span className="text-xs text-zinc-500">{fmtDate(w.date)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
