import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.workout_id || !body?.exercise_id || !body?.set_number) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const payload = {
    workout_id: Number(body.workout_id),
    exercise_id: Number(body.exercise_id),
    set_number: Number(body.set_number),
    weight_kg: body.weight_kg == null ? null : Number(body.weight_kg),
    reps: body.reps == null ? null : Number(body.reps),
    rpe: body.rpe == null ? null : Number(body.rpe),
    is_warmup: !!body.is_warmup,
  };
  const { data, error } = await supabase.from("workout_sets").insert(payload).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
