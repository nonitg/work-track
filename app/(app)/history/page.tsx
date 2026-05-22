import { Suspense } from "react";
import {
  getRecentCardio,
  getRecentMobility,
  getRecentWeights,
  getRecentWorkouts,
} from "@/lib/queries";
import { HistoryList, type HistoryEvent } from "./history-list";

export const dynamic = "force-dynamic";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-zinc-500">Everything you&apos;ve logged, by day. Tap × to remove.</p>
      </header>
      <Suspense fallback={<HistorySkeleton />}>
        <Timeline />
      </Suspense>
    </div>
  );
}

async function Timeline() {
  const [workouts, weights, cardio, mobility] = await Promise.all([
    getRecentWorkouts(60),
    getRecentWeights(120),
    getRecentCardio(120),
    getRecentMobility(120),
  ]);

  const events: HistoryEvent[] = [];
  for (const w of workouts) {
    const tpl = Array.isArray(w.template) ? w.template[0] : w.template;
    events.push({
      date: w.date,
      kind: "workout",
      id: w.id,
      name: tpl?.name ?? "Workout",
      sub: tpl?.day_label ?? null,
    });
  }
  for (const r of weights) {
    events.push({ date: r.date, kind: "weight", weight_kg: Number(r.weight_kg) });
  }
  for (const c of cardio) {
    events.push({ date: c.date, kind: "cardio", id: c.id, type: c.type, duration_min: c.duration_min });
  }
  for (const m of mobility) {
    if (
      m.daily_mobility_done ||
      m.knee_to_wall_cm_left != null ||
      m.knee_to_wall_cm_right != null
    ) {
      events.push({
        date: m.date,
        kind: "mobility",
        done: !!m.daily_mobility_done,
        left: m.knee_to_wall_cm_left != null ? Number(m.knee_to_wall_cm_left) : null,
        right: m.knee_to_wall_cm_right != null ? Number(m.knee_to_wall_cm_right) : null,
      });
    }
  }

  const order: Record<HistoryEvent["kind"], number> = {
    workout: 0,
    cardio: 1,
    weight: 2,
    mobility: 3,
  };
  const byDate: Record<string, HistoryEvent[]> = {};
  for (const e of events) {
    (byDate[e.date] ||= []).push(e);
  }
  const dates = Object.keys(byDate).sort().reverse();
  for (const d of dates) byDate[d].sort((a, b) => order[a.kind] - order[b.kind]);

  return <HistoryList initialDates={dates} initialByDate={byDate} />;
}

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40"
        />
      ))}
    </div>
  );
}
