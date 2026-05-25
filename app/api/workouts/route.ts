import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const templateId = body?.template_id ?? null;
  const selectedDate = typeof body?.date === "string" && body.date.length === 10 ? body.date : todayISO();

  const { data, error } = await supabase
    .from("workouts")
    .insert({ date: selectedDate, template_id: templateId })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
