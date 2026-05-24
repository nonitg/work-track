import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getMobilityStreak } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/utils";
import { DateSelector } from "./date-selector";
import { TodayClient } from "./today-client";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ date?: string }>;

function isIsoDate(value: string) {
  if (value.length !== 10) return false;
  const parts = value.split("-");
  return parts.length === 3 && parts.every((part) => /^\d+$/.test(part));
}

function cleanDashboardDate(date: string | undefined, today: string) {
  if (!date || !isIsoDate(date)) return today;
  return date > today ? today : date;
}

export default async function TodayPage({ searchParams }: { searchParams: SearchParams }) {
  const today = todayISO();
  const params = await searchParams;
  const selectedDate = cleanDashboardDate(params.date, today);
  const isToday = selectedDate === today;
  const workoutHref = isToday ? "/workout/new" : `/workout/new?date=${selectedDate}`;

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{isToday ? "Today" : "History"}</h1>
          <DateSelector date={selectedDate} today={today} />
          {!isToday && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Editing selected date</p>
          )}
        </div>
        <Link href={workoutHref}>
          <Button size="sm">Start workout</Button>
        </Link>
      </header>
      <Suspense key={selectedDate} fallback={<TodaySkeleton />}>
        <TodayLoader date={selectedDate} isToday={isToday} />
      </Suspense>
    </div>
  );
}

async function TodayLoader({ date, isToday }: { date: string; isToday: boolean }) {
  const [weightRes, nutritionRes, cardioRes, mobilityRes, streak] = await Promise.all([
    supabase.from("body_weight").select("weight_kg").eq("date", date).maybeSingle(),
    supabase.from("nutrition_log").select("protein_g,kcal_estimate").eq("date", date).maybeSingle(),
    supabase
      .from("cardio_log")
      .select("id,type,duration_min,notes")
      .eq("date", date)
      .order("id", { ascending: true }),
    supabase
      .from("mobility_log")
      .select("daily_mobility_done,knee_to_wall_cm_left,knee_to_wall_cm_right")
      .eq("date", date)
      .maybeSingle(),
    isToday ? getMobilityStreak() : Promise.resolve(0),
  ]);

  const nutrition = nutritionRes.data ?? { protein_g: 0, kcal_estimate: null };
  const mobility = mobilityRes.data ?? {
    daily_mobility_done: false,
    knee_to_wall_cm_left: null,
    knee_to_wall_cm_right: null,
  };

  return (
    <TodayClient
      key={date}
      date={date}
      weight={weightRes.data?.weight_kg ? Number(weightRes.data.weight_kg) : null}
      protein={nutrition.protein_g ?? 0}
      kcal={nutrition.kcal_estimate ?? null}
      cardio={(cardioRes.data ?? []).map((c) => ({
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
