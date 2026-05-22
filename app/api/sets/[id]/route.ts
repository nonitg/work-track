import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const body = await req.json().catch(() => null);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const patch: Record<string, number | null | boolean> = {};
  if ("weight_kg" in body) patch.weight_kg = body.weight_kg == null ? null : Number(body.weight_kg);
  if ("reps" in body) patch.reps = body.reps == null ? null : Number(body.reps);
  if ("rpe" in body) patch.rpe = body.rpe == null ? null : Number(body.rpe);
  if ("is_warmup" in body) patch.is_warmup = !!body.is_warmup;
  const { error } = await supabase.from("workout_sets").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const { error } = await supabase.from("workout_sets").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
