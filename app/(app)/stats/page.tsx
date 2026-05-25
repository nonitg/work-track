import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { CommitGraph } from "@/components/commit-graph";
import { WeightChart } from "@/components/charts/weight-chart";
import { ProteinChart } from "@/components/charts/protein-chart";
import {
  getCommitGraph,
  getKeyLiftSparkData,
  getProteinSeries,
  getRecentCardio,
  getRecentMobility,
  getWeightSeries,
} from "@/lib/queries";
import { isoDaysAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
        <p className="mt-1 text-sm text-zinc-500">Trends across everything you log.</p>
      </header>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsBody />
      </Suspense>
    </div>
  );
}

async function StatsBody() {
  const [weightSeries, proteinSeries, lifts, cardio, mobility, commit] = await Promise.all([
    getWeightSeries(30),
    getProteinSeries(14),
    getKeyLiftSparkData(),
    getRecentCardio(28),
    getRecentMobility(28),
    getCommitGraph(365),
  ]);

  const cardioMin7 = cardio
    .filter((c) => c.date >= isoDaysAgo(7))
    .reduce((a, c) => a + c.duration_min, 0);
  const cardioMin28 = cardio.reduce((a, c) => a + c.duration_min, 0);
  const mobilityDone28 = mobility.filter((m) => m.daily_mobility_done).length;
  const activeDays = commit.filter((d) => d.level > 0).length;
  const mobilityDoneYear = commit.filter((d) => d.mobility).length;
  const proteinLogged = proteinSeries.filter((p): p is { date: string; protein: number } => p.protein != null);
  const proteinHits14 = proteinLogged.filter((p) => p.protein >= 100).length;
  const proteinAvg14 = proteinLogged.length
    ? Math.round(proteinLogged.reduce((a, p) => a + p.protein, 0) / proteinLogged.length)
    : 0;
  const latestWeight = [...weightSeries].reverse().find((w) => w.weight != null)?.weight ?? null;
  const firstWeight = weightSeries.find((w) => w.weight != null)?.weight ?? null;
  const weightDelta = latestWeight != null && firstWeight != null ? latestWeight - firstWeight : null;

  let currentMobilityStreak = 0;
  for (let i = commit.length - 1; i >= 0; i--) {
    if (commit[i].mobility) currentMobilityStreak++;
    else break;
  }

  return (
    <>
      {/* Summary grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          label="Active days"
          value={`${activeDays}`}
          sub="last 365d"
          accent="primary"
        />
        <Metric
          label="Mobility streak"
          value={`${currentMobilityStreak}`}
          sub={currentMobilityStreak === 1 ? "day" : "days"}
          accent="good"
        />
        <Metric
          label="Protein hits"
          value={`${proteinHits14}/14`}
          sub={proteinLogged.length ? `avg ${proteinAvg14}g · ${proteinLogged.length}d logged` : "no logs yet"}
          accent={proteinHits14 >= 10 ? "good" : "muted"}
        />
        <Metric
          label="Cardio"
          value={`${cardioMin7}`}
          sub={`min · 7d · ${cardioMin28} in 28d`}
          accent={cardioMin7 > 0 ? "primary" : "muted"}
        />
      </div>

      <Card>
        <SectionHead
          title="Commitment"
          hint={`${activeDays} active · ${mobilityDoneYear} mobility days`}
        />
        <div className="mt-4">
          <CommitGraph data={commit} />
        </div>
      </Card>

      <Card>
        <SectionHead
          title="Body weight"
          hint={
            latestWeight != null
              ? `${latestWeight.toFixed(1)} kg today${
                  weightDelta != null && Math.abs(weightDelta) >= 0.1
                    ? ` · ${weightDelta >= 0 ? "+" : ""}${weightDelta.toFixed(1)} kg over 30d`
                    : ""
                }`
              : "30-day trend"
          }
        />
        <div className="mt-4">
          <WeightChart data={weightSeries} />
        </div>
      </Card>

      <Card>
        <SectionHead
          title="Protein"
          hint={
            proteinLogged.length
              ? `14d · target 100g · ${proteinHits14}/${proteinLogged.length} hit · avg ${proteinAvg14}g`
              : "14d · target 100g · nothing logged"
          }
        />
        <div className="mt-4">
          <ProteinChart data={proteinSeries} />
        </div>
      </Card>

      <Card>
        <SectionHead title="Key lifts" hint="estimated 1RM" />
        <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
          {lifts.map((l) => (
            <li key={l.id}>
              <Link
                href={`/exercise/${l.id}`}
                className="-mx-2 flex items-center justify-between rounded-lg px-2 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <span className="text-sm font-medium">{l.name}</span>
                <span className="flex items-center gap-2 text-sm tabular-nums">
                  <span className="text-zinc-600 dark:text-zinc-300">
                    {l.latestE1rm ? `${l.latestE1rm.toFixed(1)} kg` : "—"}
                  </span>
                  {l.delta != null && (
                    <span
                      className={
                        l.delta >= 0
                          ? "rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/60 dark:text-red-300"
                      }
                    >
                      {l.delta >= 0 ? "+" : ""}
                      {l.delta.toFixed(1)}
                    </span>
                  )}
                  <span className="text-zinc-300 dark:text-zinc-600">›</span>
                </span>
              </Link>
            </li>
          ))}
          {lifts.length === 0 && (
            <li className="py-3 text-sm text-zinc-500">No key lifts logged yet.</li>
          )}
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card>
          <SectionHead title="Cardio" hint="last 7 / 28 days" />
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums tracking-tight">{cardioMin7}</span>
            <span className="text-sm text-zinc-500">min · 7d</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 tabular-nums">{cardioMin28} min over last 28d</p>
        </Card>
        <Card>
          <SectionHead title="Mobility" hint="last 28 days" />
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums tracking-tight">{mobilityDone28}</span>
            <span className="text-sm text-zinc-500">/ 28 days</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 tabular-nums">{currentMobilityStreak}-day current streak</p>
        </Card>
      </div>
    </>
  );
}

function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h2>
      {hint && <p className="text-xs text-zinc-500 tabular-nums">{hint}</p>}
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "primary" | "good" | "muted";
}) {
  const accentClass =
    accent === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : accent === "primary"
        ? "text-sky-600 dark:text-sky-400"
        : "text-zinc-900 dark:text-zinc-100";
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold tabular-nums tracking-tight ${accentClass}`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-zinc-500 tabular-nums">{sub}</div>}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40"
          />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40"
        />
      ))}
    </div>
  );
}
