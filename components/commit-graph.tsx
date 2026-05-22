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

type Week = (CommitDay | null)[]; // 7 entries, indexed by day-of-week (0=Sun)

export function CommitGraph({ data }: { data: CommitDay[] }) {
  const { weeks, monthLabels } = useMemo(() => buildWeeks(data), [data]);
  const [hover, setHover] = useState<CommitDay | null>(null);

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex w-fit gap-2">
        <div className="mt-5 flex flex-col gap-[3px] pr-1 text-[10px] text-zinc-400">
          <span className="h-[11px]" />
          <span className="h-[11px]">Mon</span>
          <span className="h-[11px]" />
          <span className="h-[11px]">Wed</span>
          <span className="h-[11px]" />
          <span className="h-[11px]">Fri</span>
          <span className="h-[11px]" />
        </div>
        <div>
          <div className="flex gap-[3px] pl-px text-[10px] text-zinc-400">
            {monthLabels.map((m, i) => (
              <span key={i} className="w-[11px] shrink-0 text-left">
                {m ?? ""}
              </span>
            ))}
          </div>
          <div className="mt-1 flex gap-[3px]">
            {weeks.map((week, wi) => (
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
                      "h-[11px] w-[11px] rounded-[2px]",
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
