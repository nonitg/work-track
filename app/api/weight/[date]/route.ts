import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(_req: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Bad date" }, { status: 400 });
  }
  const { error } = await supabase.from("body_weight").delete().eq("date", date);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
