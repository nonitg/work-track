import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const type = String(body?.type ?? "").trim();
  const duration = Number(body?.duration_min);
  if (!type || !Number.isFinite(duration) || duration <= 0 || duration > 600) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const { error } = await supabase.from("cardio_log").insert({
    date: body?.date ?? todayISO(),
    type,
    duration_min: duration,
    notes: body?.notes ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
