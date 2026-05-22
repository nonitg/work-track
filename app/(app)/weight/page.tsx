import { Card, CardTitle } from "@/components/ui/card";
import { WeightChart } from "@/components/charts/weight-chart";
import { getRecentWeights, getTodayWeight, getWeightSeries } from "@/lib/queries";
import { fmtDate } from "@/lib/utils";
import { WeightForm } from "./weight-form";

export const dynamic = "force-dynamic";

export default async function WeightPage() {
  const [today, series, rows] = await Promise.all([
    getTodayWeight(),
    getWeightSeries(90),
    getRecentWeights(30),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Weight</h1>
        <p className="text-sm text-zinc-500">Weigh in every morning. Trend uses 7-day rolling average.</p>
      </header>

      <Card>
        <CardTitle>Today</CardTitle>
        <WeightForm initial={today} />
      </Card>

      <Card>
        <CardTitle>90 days</CardTitle>
        <div className="mt-4">
          <WeightChart data={series} />
        </div>
      </Card>

      <Card>
        <CardTitle>Log</CardTitle>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Nothing logged yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {[...rows].reverse().map((r) => (
              <li key={r.date} className="flex justify-between py-2 text-sm">
                <span className="text-zinc-500">{fmtDate(r.date)}</span>
                <span className="tabular-nums">{Number(r.weight_kg).toFixed(1)} kg</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
