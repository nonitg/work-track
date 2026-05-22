import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const protein = Number(body?.protein_g);
  if (!Number.isFinite(protein) || protein < 0 || protein > 1000) {
    return NextResponse.json({ error: "Invalid protein" }, { status: 400 });
  }
  const kcal = body?.kcal_estimate == null || body.kcal_estimate === "" ? null : Number(body.kcal_estimate);
  if (kcal != null && (!Number.isFinite(kcal) || kcal < 0 || kcal > 10000)) {
    return NextResponse.json({ error: "Invalid kcal" }, { status: 400 });
  }
  const date = body?.date ?? todayISO();
  const { error } = await supabase
    .from("nutrition_log")
    .upsert({ date, protein_g: protein, kcal_estimate: kcal });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
