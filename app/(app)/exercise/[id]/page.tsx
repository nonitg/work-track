import { notFound } from "next/navigation";
import { ExerciseChart } from "@/components/charts/exercise-chart";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { getExerciseHistory } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const [{ data: ex }, history] = await Promise.all([
    supabase.from("exercises").select("id,name,category").eq("id", id).maybeSingle(),
    getExerciseHistory(id, 90),
  ]);
  if (!ex) notFound();

  const latest = history[history.length - 1];
  const bestE1rm = history.reduce<number | null>((m, p) => (p.e1rm == null ? m : m == null || p.e1rm > m ? p.e1rm : m), null);
  const bestTop = history.reduce<number | null>(
    (m, p) => (p.topSet == null ? m : m == null || p.topSet > m ? p.topSet : m),
    null,
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{ex.name}</h1>
        <p className="text-sm text-zinc-500">{ex.category}</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardTitle>Latest e1RM</CardTitle>
          <CardValue className="text-2xl">{latest?.e1rm ? `${latest.e1rm.toFixed(1)}` : "—"}</CardValue>
        </Card>
        <Card>
          <CardTitle>Best e1RM</CardTitle>
          <CardValue className="text-2xl">{bestE1rm ? `${bestE1rm.toFixed(1)}` : "—"}</CardValue>
        </Card>
        <Card>
          <CardTitle>Top set</CardTitle>
          <CardValue className="text-2xl">{bestTop ? `${bestTop}` : "—"}</CardValue>
        </Card>
      </div>

      <Card>
        <CardTitle>Progression (lbs)</CardTitle>
        <div className="mt-4">
          <ExerciseChart data={history} />
        </div>
        <p className="mt-2 text-xs text-zinc-500">Blue: estimated 1RM (Epley). Grey: heaviest set of the day.</p>
      </Card>
    </div>
  );
}
