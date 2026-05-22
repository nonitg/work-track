import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const date = body?.date ?? todayISO();
  const payload = {
    date,
    daily_mobility_done: !!body?.daily_mobility_done,
    knee_to_wall_cm_left: body?.knee_to_wall_cm_left == null ? null : Number(body.knee_to_wall_cm_left),
    knee_to_wall_cm_right: body?.knee_to_wall_cm_right == null ? null : Number(body.knee_to_wall_cm_right),
  };
  const { error } = await supabase.from("mobility_log").upsert(payload);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
