import { Card, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { fmtDate } from "@/lib/utils";
import { CardioForm } from "./cardio-form";

export const dynamic = "force-dynamic";

export default async function CardioPage() {
  const { data } = await supabase
    .from("cardio_log")
    .select("id,date,type,duration_min,notes")
    .order("date", { ascending: false })
    .limit(30);
  const rows = data ?? [];
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Cardio</h1>
        <p className="text-sm text-zinc-500">Hiking prep, hill walks, easy hikes.</p>
      </header>
      <Card>
        <CardTitle>Log a session</CardTitle>
        <CardioForm />
      </Card>
      <Card>
        <CardTitle>Recent</CardTitle>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Nothing yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((r) => (
              <li key={r.id} className="flex justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">{r.type}</div>
                  <div className="text-xs text-zinc-500">{fmtDate(r.date)}</div>
                </div>
                <div className="text-zinc-500 tabular-nums">{r.duration_min} min</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
