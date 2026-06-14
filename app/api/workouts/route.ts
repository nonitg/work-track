import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { scheduleForDate } from "@/lib/schedule";
import { todayISO } from "@/lib/utils";

// Get-or-create the single workout for a given date.
//
// One workout per calendar day is the source of truth: tapping "Start" again,
// or coming back after closing the app, resumes the same workout instead of
// piling up duplicates. The template is anchored to the weekly schedule for
// that weekday unless the caller passes an explicit `template_id` (the
// freestyle / pick-a-different-template escape hatch).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    date?: unknown;
    template_id?: number | null;
  };
  const date =
    typeof body?.date === "string" && body.date.length === 10 ? body.date : todayISO();

  // Resume an existing workout for the day if there is one.
  const existing = await supabase
    .from("workouts")
    .select("id")
    .eq("date", date)
    .order("id", { ascending: true })
    .limit(1);
  if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 500 });
  if (existing.data && existing.data.length > 0) {
    return NextResponse.json({ id: existing.data[0].id, resumed: true });
  }

  // Otherwise create it. Respect an explicit template choice (including an
  // explicit `null` for freestyle); fall back to the scheduled template.
  const templateId =
    body && "template_id" in body ? body.template_id ?? null : scheduleForDate(date).templateId;

  const { data, error } = await supabase
    .from("workouts")
    .insert({ date, template_id: templateId })
    .select("id")
    .single();

  if (error) {
    // Safety net for the unique(date) index: a concurrent request won the race,
    // so resume whatever now exists for the day.
    if ((error as { code?: string }).code === "23505") {
      const retry = await supabase
        .from("workouts")
        .select("id")
        .eq("date", date)
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (retry.data) return NextResponse.json({ id: retry.data.id, resumed: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
