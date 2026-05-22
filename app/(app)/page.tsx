import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  getMobilityStreak,
  getTodayCardio,
  getTodayMobility,
  getTodayNutrition,
  getTodayWeight,
} from "@/lib/queries";
import { fmtDate, todayISO } from "@/lib/utils";
import { TodayClient } from "./today-client";

export const dynamic = "force-dynamic";

export default function TodayPage() {
  return (
    <div className="space-y-5">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
          <p className="text-sm text-zinc-500">{fmtDate(todayISO())}</p>
        </div>
        <Link href="/workout/new">
          <Button size="sm">Start workout</Button>
        </Link>
      </header>
      <Suspense fallback={<TodaySkeleton />}>
        <TodayLoader />
      </Suspense>
    </div>
  );
}

async function TodayLoader() {
  const [weight, nutrition, cardio, mobility, streak] = await Promise.all([
    getTodayWeight(),
    getTodayNutrition(),
    getTodayCardio(),
    getTodayMobility(),
    getMobilityStreak(),
  ]);
  return (
    <TodayClient
      weight={weight}
      protein={nutrition.protein_g ?? 0}
      kcal={nutrition.kcal_estimate ?? null}
      cardio={cardio.map((c) => ({
        id: c.id,
        type: c.type,
        duration_min: c.duration_min,
        notes: c.notes ?? null,
      }))}
      mobility={{
        daily_mobility_done: !!mobility.daily_mobility_done,
        knee_to_wall_cm_left:
          mobility.knee_to_wall_cm_left != null ? Number(mobility.knee_to_wall_cm_left) : null,
        knee_to_wall_cm_right:
          mobility.knee_to_wall_cm_right != null ? Number(mobility.knee_to_wall_cm_right) : null,
      }}
      streak={streak}
    />
  );
}

function TodaySkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40"
        />
      ))}
    </div>
  );
}
