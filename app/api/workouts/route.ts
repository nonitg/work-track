import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { scheduleForDate } from "@/lib/schedule";
import { todayISO } from "@/lib/utils";

// Get-or-create the single workout for a given date.
//
// One workout per calendar day is the source of truth. Behaviour depends on
// whether the caller makes an explicit template choice:
//   - No `template_id` (home "Today's workout" card): resume the day's workout
//     if it exists, otherwise create one anchored to the weekly schedule.
//   - Explicit `template_id` (the Train picker, incl. `null` for freestyle):
//     override the day's workout to that template — switching an existing one
//     in place rather than creating a second — or create it if none exists.
// Either way there is never more than one workout per day.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    date?: unknown;
    template_id?: number | null;
  };
  const date =
    typeof body?.date === "string" && body.date.length === 10 ? body.date : todayISO();
  const explicitTemplate = !!body && "template_id" in body;
  const chosenTemplate = explicitTemplate ? body.template_id ?? null : scheduleForDate(date).templateId;

  // If a workout already exists for the day, resume it — or, for an explicit
  // pick from the Train picker, switch it to the chosen template in place.
  const existing = await supabase
    .from("workouts")
    .select("id,template_id")
    .eq("date", date)
    .order("id", { ascending: true })
    .limit(1);
  if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 500 });
  if (existing.data && existing.data.length > 0) {
    const row = existing.data[0];
    if (explicitTemplate && row.template_id !== chosenTemplate) {
      const upd = await supabase
        .from("workouts")
        .update({ template_id: chosenTemplate })
        .eq("id", row.id);
      if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });
      return NextResponse.json({ id: row.id, overridden: true });
    }
    return NextResponse.json({ id: row.id, resumed: true });
  }

  const { data, error } = await supabase
    .from("workouts")
    .insert({ date, template_id: chosenTemplate })
    .select("id")
    .single();

  if (error) {
    // Safety net for the unique(date) index: a concurrent request won the race.
    // Resume the now-existing workout, switching its template if one was picked.
    if ((error as { code?: string }).code === "23505") {
      const retry = await supabase
        .from("workouts")
        .select("id")
        .eq("date", date)
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (retry.data) {
        if (explicitTemplate) {
          await supabase.from("workouts").update({ template_id: chosenTemplate }).eq("id", retry.data.id);
          return NextResponse.json({ id: retry.data.id, overridden: true });
        }
        return NextResponse.json({ id: retry.data.id, resumed: true });
      }
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
