import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const body = await req.json().catch(() => null);
  const patch: Record<string, boolean | string | null> = {};
  if (body && "warmup_done" in body) patch.warmup_done = !!body.warmup_done;
  if (body && "notes" in body) patch.notes = body.notes ?? null;
  if (Object.keys(patch).length === 0) return NextResponse.json({ ok: true });
  const { error } = await supabase.from("workouts").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const delSets = await supabase.from("workout_sets").delete().eq("workout_id", id);
  if (delSets.error) return NextResponse.json({ error: delSets.error.message }, { status: 500 });
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
