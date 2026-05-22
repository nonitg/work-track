import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const { error } = await supabase.from("cardio_log").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
