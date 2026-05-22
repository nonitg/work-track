import { Card, CardTitle } from "@/components/ui/card";
import { ProteinChart } from "@/components/charts/protein-chart";
import { getProteinSeries, getTodayNutrition } from "@/lib/queries";
import { NutritionForm } from "./nutrition-form";

export const dynamic = "force-dynamic";

export default async function NutritionPage() {
  const [today, series] = await Promise.all([getTodayNutrition(), getProteinSeries(14)]);
  const adherent = series.filter((s) => s.protein >= 100).length;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Nutrition</h1>
        <p className="text-sm text-zinc-500">Target 100–125 g protein. Rough kcal estimate optional.</p>
      </header>

      <Card>
        <CardTitle>Today</CardTitle>
        <NutritionForm initial={{ protein_g: today.protein_g ?? 0, kcal_estimate: today.kcal_estimate ?? null }} />
      </Card>

      <Card>
        <div className="flex items-baseline justify-between">
          <CardTitle>Protein (14d)</CardTitle>
          <span className="text-xs text-zinc-500">{adherent}/14 days on target</span>
        </div>
        <div className="mt-4">
          <ProteinChart data={series} />
        </div>
      </Card>
    </div>
  );
}
