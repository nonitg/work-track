import { Card, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { fmtDate, isoDaysAgo, todayISO } from "@/lib/utils";
import { MobilityForm } from "./mobility-form";

export const dynamic = "force-dynamic";

export default async function MobilityPage() {
  const since = isoDaysAgo(90);
  const [todayRes, rowsRes] = await Promise.all([
    supabase.from("mobility_log").select("*").eq("date", todayISO()).maybeSingle(),
    supabase
      .from("mobility_log")
      .select("date,knee_to_wall_cm_left,knee_to_wall_cm_right,daily_mobility_done")
      .gte("date", since)
      .order("date", { ascending: false }),
  ]);
  const today = todayRes.data ?? {
    daily_mobility_done: false,
    knee_to_wall_cm_left: null,
    knee_to_wall_cm_right: null,
  };
  const rows = rowsRes.data ?? [];
  const streak = (() => {
    let s = 0;
    for (let i = 0; i < 365; i++) {
      const d = isoDaysAgo(i);
      const r = rows.find((x) => x.date === d);
      if (r?.daily_mobility_done) s++;
      else break;
    }
    return s;
  })();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mobility</h1>
        <p className="text-sm text-zinc-500">Daily calf/ankle work. Knee-to-wall once a week.</p>
      </header>

      <Card>
        <div className="flex items-baseline justify-between">
          <CardTitle>Today</CardTitle>
          <span className="text-xs text-zinc-500">{streak}-day streak</span>
        </div>
        <MobilityForm
          initial={{
            daily_mobility_done: !!today.daily_mobility_done,
            knee_to_wall_cm_left: today.knee_to_wall_cm_left != null ? Number(today.knee_to_wall_cm_left) : null,
            knee_to_wall_cm_right: today.knee_to_wall_cm_right != null ? Number(today.knee_to_wall_cm_right) : null,
          }}
        />
      </Card>

      <Card>
        <CardTitle>Knee-to-wall (cm)</CardTitle>
        <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows
            .filter((r) => r.knee_to_wall_cm_left != null || r.knee_to_wall_cm_right != null)
            .slice(0, 20)
            .map((r) => (
              <li key={r.date} className="flex justify-between py-2 text-sm">
                <span className="text-zinc-500">{fmtDate(r.date)}</span>
                <span className="tabular-nums">
                  L {r.knee_to_wall_cm_left ?? "—"} / R {r.knee_to_wall_cm_right ?? "—"}
                </span>
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}
