import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type SetInput = {
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const workout_id = Number(body?.workout_id);
  const exercise_id = Number(body?.exercise_id);
  const sets: SetInput[] = Array.isArray(body?.sets) ? body.sets : [];
  if (!Number.isFinite(workout_id) || !Number.isFinite(exercise_id)) {
    return NextResponse.json({ error: "Bad ids" }, { status: 400 });
  }

  const del = await supabase
    .from("workout_sets")
    .delete()
    .eq("workout_id", workout_id)
    .eq("exercise_id", exercise_id);
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });

  if (sets.length === 0) return NextResponse.json({ ids: [] });

  const payload = sets
    .filter((s) => Number.isFinite(s.set_number))
    .map((s) => ({
      workout_id,
      exercise_id,
      set_number: Number(s.set_number),
      weight_kg: s.weight_kg == null ? null : Number(s.weight_kg),
      reps: s.reps == null ? null : Number(s.reps),
    }));

  const ins = await supabase.from("workout_sets").insert(payload).select("id,set_number");
  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  return NextResponse.json({ ids: ins.data ?? [] });
}
