"use client";
import { useMemo, useState } from "react";
import type { CommitDay } from "@/lib/queries";
import { cn, fmtDate } from "@/lib/utils";

const LEVEL_CLASS: Record<number, string> = {
  0: "bg-zinc-100 dark:bg-zinc-800",
  1: "bg-emerald-200 dark:bg-emerald-900",
  2: "bg-emerald-300 dark:bg-emerald-800",
  3: "bg-emerald-500 dark:bg-emerald-600",
  4: "bg-emerald-600 dark:bg-emerald-400",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WINDOW_WEEKS = 18; // ~4 months — fits comfortably on mobile without scrolling
const STEP_WEEKS = 9;

type Week = (CommitDay | null)[]; // 7 entries, indexed by day-of-week (0=Sun)

export function CommitGraph({ data }: { data: CommitDay[] }) {
  const { weeks, monthLabels } = useMemo(() => buildWeeks(data), [data]);
  const totalWeeks = weeks.length;
  const [endIdx, setEndIdx] = useState<number>(totalWeeks); // exclusive
  const startIdx = Math.max(0, endIdx - WINDOW_WEEKS);
  const viewWeeks = weeks.slice(startIdx, endIdx);
  const viewMonths = monthLabels.slice(startIdx, endIdx);
  const [hover, setHover] = useState<CommitDay | null>(null);

  const canPrev = startIdx > 0;
  const canNext = endIdx < totalWeeks;
  const rangeLabel = useMemo(() => {
    const firstDay = viewWeeks[0]?.find((d) => d != null);
    const lastWeek = viewWeeks[viewWeeks.length - 1];
    const lastDay = lastWeek ? [...lastWeek].reverse().find((d) => d != null) : null;
    if (!firstDay || !lastDay) return "";
    return `${shortDate(firstDay.date)} – ${shortDate(lastDay.date)}`;
  }, [viewWeeks]);

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
        <button
          type="button"
          onClick={() => setEndIdx((e) => Math.max(WINDOW_WEEKS, e - STEP_WEEKS))}
          disabled={!canPrev}
          className="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          aria-label="Earlier"
        >
          ‹
        </button>
        <span className="tabular-nums">{rangeLabel}</span>
        <button
          type="button"
          onClick={() => setEndIdx((e) => Math.min(totalWeeks, e + STEP_WEEKS))}
          disabled={!canNext}
          className="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          aria-label="Later"
        >
          ›
        </button>
      </div>

      <div className="flex gap-2">
        <div className="mt-5 flex flex-col justify-between pr-1 text-[10px] leading-none text-zinc-400">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="grid gap-[3px] pl-px text-[10px] text-zinc-400"
            style={{ gridTemplateColumns: `repeat(${viewWeeks.length}, minmax(0, 1fr))` }}
          >
            {viewMonths.map((m, i) => (
              <span key={i} className="truncate text-left">
                {m ?? ""}
              </span>
            ))}
          </div>
          <div
            className="mt-1 grid gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${viewWeeks.length}, minmax(0, 1fr))` }}
          >
            {viewWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((d, di) => (
                  <button
                    key={di}
                    type="button"
                    onMouseEnter={() => d && setHover(d)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => d && setHover(d)}
                    onBlur={() => setHover(null)}
                    aria-label={d ? cellLabel(d) : ""}
                    className={cn(
                      "aspect-square w-full rounded-[2px]",
                      d ? LEVEL_CLASS[d.level] : "bg-transparent",
                    )}
                    disabled={!d}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <div className="min-h-[1.25rem]">
          {hover ? cellLabel(hover) : <span className="text-zinc-400">Hover a day for details</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={cn("h-[11px] w-[11px] rounded-[2px]", LEVEL_CLASS[l])} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

function shortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function cellLabel(d: CommitDay) {
  const bits: string[] = [];
  if (d.mobility) bits.push("mobility");
  if (d.workout) bits.push("workout");
  if (d.cardio) bits.push("cardio");
  if (d.weight) bits.push("weight");
  if (d.protein) bits.push("protein");
  return `${fmtDate(d.date)} — ${bits.length ? bits.join(", ") : "nothing logged"}`;
}

function buildWeeks(days: CommitDay[]): { weeks: Week[]; monthLabels: (string | null)[] } {
  if (days.length === 0) return { weeks: [], monthLabels: [] };
  const first = days[0];
  const firstDate = new Date(`${first.date}T00:00:00`);
  const firstDow = firstDate.getDay(); // 0 Sun .. 6 Sat
  const weeks: Week[] = [];
  let current: Week = Array(7).fill(null);
  for (let i = 0; i < firstDow; i++) current[i] = null;

  let dow = firstDow;
  for (const d of days) {
    current[dow] = d;
    dow++;
    if (dow === 7) {
      weeks.push(current);
      current = Array(7).fill(null);
      dow = 0;
    }
  }
  if (current.some((c) => c)) weeks.push(current);

  const monthLabels: (string | null)[] = weeks.map((wk, i) => {
    const first = wk.find((d) => d != null);
    if (!first) return null;
    const m = Number(first.date.slice(5, 7)) - 1;
    if (i === 0) return MONTHS[m];
    const prev = weeks[i - 1]?.find((d) => d != null);
    const prevM = prev ? Number(prev.date.slice(5, 7)) - 1 : -1;
    return m !== prevM ? MONTHS[m] : null;
  });

  return { weeks, monthLabels };
}
