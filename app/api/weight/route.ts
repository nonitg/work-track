import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const weight = Number(body?.weight_kg);
  if (!Number.isFinite(weight) || weight <= 0 || weight > 400) {
    return NextResponse.json({ error: "Invalid weight" }, { status: 400 });
  }
  const date = body?.date ?? todayISO();
  const { error } = await supabase.from("body_weight").upsert({ date, weight_kg: weight });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
