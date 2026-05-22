import Link from "next/link";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeightChart } from "@/components/charts/weight-chart";
import { ProteinChart } from "@/components/charts/protein-chart";
import {
  getKeyLiftSparkData,
  getProteinSeries,
  getRecentWorkouts,
  getTodayNutrition,
  getTodayWeight,
  getWeightSeries,
} from "@/lib/queries";
import { fmtDate, fmtKg, todayISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [weight, weightSeries, nutrition, proteinSeries, recent, lifts] = await Promise.all([
    getTodayWeight(),
    getWeightSeries(30),
    getTodayNutrition(),
    getProteinSeries(14),
    getRecentWorkouts(5),
    getKeyLiftSparkData(),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
          <p className="text-sm text-zinc-500">{fmtDate(todayISO())}</p>
        </div>
        <Link href="/workout/new">
          <Button size="sm">Start workout</Button>
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/weight">
          <Card className="cursor-pointer transition hover:border-zinc-300 dark:hover:border-zinc-700">
            <CardTitle>Weight</CardTitle>
            <CardValue>{fmtKg(weight)}</CardValue>
            <p className="mt-1 text-xs text-zinc-500">Tap to log today</p>
          </Card>
        </Link>
        <Link href="/nutrition">
          <Card className="cursor-pointer transition hover:border-zinc-300 dark:hover:border-zinc-700">
            <CardTitle>Protein</CardTitle>
            <CardValue>{nutrition.protein_g} g</CardValue>
            <p className="mt-1 text-xs text-zinc-500">
              {nutrition.kcal_estimate ? `${nutrition.kcal_estimate} kcal` : "Tap to log today"}
            </p>
          </Card>
        </Link>
      </div>

      <Card>
        <div className="flex items-baseline justify-between">
          <CardTitle>Body weight (30d)</CardTitle>
          <Link href="/weight" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            history →
          </Link>
        </div>
        <div className="mt-4">
          <WeightChart data={weightSeries} />
        </div>
      </Card>

      <Card>
        <div className="flex items-baseline justify-between">
          <CardTitle>Protein (14d, target 100 g)</CardTitle>
          <Link href="/nutrition" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            history →
          </Link>
        </div>
        <div className="mt-4">
          <ProteinChart data={proteinSeries} />
        </div>
      </Card>

      <Card>
        <CardTitle>Key lifts (estimated 1RM)</CardTitle>
        <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
          {lifts.map((l) => (
            <li key={l.id} className="py-3">
              <Link href={`/exercise/${l.id}`} className="flex items-center justify-between">
                <span className="text-sm font-medium">{l.name}</span>
                <span className="text-sm tabular-nums text-zinc-500">
                  {l.latestE1rm ? `${l.latestE1rm.toFixed(1)} kg` : "—"}
                  {l.delta != null && (
                    <span className={l.delta >= 0 ? "ml-2 text-emerald-600" : "ml-2 text-red-600"}>
                      {l.delta >= 0 ? "+" : ""}
                      {l.delta.toFixed(1)}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="flex items-baseline justify-between">
          <CardTitle>Recent workouts</CardTitle>
          <Link href="/history" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No workouts yet. Start one above.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {recent.map((w) => {
              const tpl = Array.isArray(w.template) ? w.template[0] : w.template;
              return (
                <li key={w.id} className="py-3">
                  <Link href={`/workout/${w.id}`} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{tpl?.name ?? "Workout"}</span>
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
