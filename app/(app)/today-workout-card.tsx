"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { ScheduleKind } from "@/lib/schedule";

type Scheduled = { day: string; plan: string; templateId: number | null; kind: ScheduleKind };
type Existing = { id: number; templateName: string | null; setCount: number } | null;

export function TodayWorkoutCard({
  date,
  isToday,
  scheduled,
  existing,
}: {
  date: string;
  isToday: boolean;
  scheduled: Scheduled;
  existing: Existing;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const freestyleHref = isToday ? "/workout/new" : `/workout/new?date=${date}`;

  async function startWorkout() {
    setBusy(true);
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });
    if (!res.ok) {
      setBusy(false);
      return;
    }
    const j = await res.json();
    start(() => router.push(`/workout/${j.id}`));
  }

  // 1. A workout already exists for this day — resume it.
  if (existing) {
    const sub =
      existing.setCount > 0
        ? `${existing.setCount} set${existing.setCount > 1 ? "s" : ""} logged`
        : "Started — nothing logged yet";
    return (
      <Shell>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-zinc-400">
            {isToday ? "Today's workout" : "Workout"}
          </div>
          <div className="truncate font-semibold">{existing.templateName ?? scheduled.plan}</div>
          <div className="text-xs text-zinc-500">{sub}</div>
        </div>
        <Button
          size="sm"
          disabled={pending}
          onClick={() => start(() => router.push(`/workout/${existing.id}`))}
        >
          Resume
        </Button>
      </Shell>
    );
  }

  // 2. Scheduled lifting day with nothing started yet — start it.
  if (scheduled.kind === "lift") {
    return (
      <Shell>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-zinc-400">
            {scheduled.day}
            {isToday ? " · today" : ""}
          </div>
          <div className="truncate font-semibold">{scheduled.plan}</div>
          <div className="text-xs text-zinc-500">Scheduled — sets prefilled from last time</div>
        </div>
        <Button size="sm" disabled={busy || pending} onClick={startWorkout}>
          {busy || pending ? "Starting…" : "Start"}
        </Button>
      </Shell>
    );
  }

  // 3. Rest / cardio day — no lifting workout, but allow an optional freestyle one.
  const restSub =
    scheduled.kind === "cardio" ? "Conditioning day — log cardio below" : "Rest day — calf mobility below";
  return (
    <Shell>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-zinc-400">
          {scheduled.day}
          {isToday ? " · today" : ""}
        </div>
        <div className="truncate font-semibold">{scheduled.plan}</div>
        <div className="text-xs text-zinc-500">{restSub}</div>
        <Link
          href={freestyleHref}
          className="mt-1 inline-block text-xs text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
        >
          + Start a freestyle workout
        </Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {children}
    </div>
  );
}
