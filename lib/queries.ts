import { supabase } from "@/lib/supabase";
import { e1rm } from "@/lib/e1rm";
import { isoDaysAgo, todayISO } from "@/lib/utils";

export async function getRecentWeights(days = 30) {
  const since = isoDaysAgo(days);
  const { data, error } = await supabase
    .from("body_weight")
    .select("date,weight_kg")
    .gte("date", since)
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getWeightSeries(days = 30) {
  const rows = await getRecentWeights(days);
  const byDate = new Map(rows.map((r) => [r.date, Number(r.weight_kg)]));
  const series: { date: string; weight: number | null; avg7: number | null }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = isoDaysAgo(i);
    series.push({ date: d, weight: byDate.has(d) ? byDate.get(d)! : null, avg7: null });
  }
  for (let i = 0; i < series.length; i++) {
    const window: number[] = [];
    for (let j = Math.max(0, i - 6); j <= i; j++) {
      const w = series[j].weight;
      if (w != null) window.push(w);
    }
    series[i].avg7 = window.length ? window.reduce((a, b) => a + b, 0) / window.length : null;
  }
  return series;
}

export async function getProteinSeries(days = 14) {
  const since = isoDaysAgo(days - 1);
  const { data, error } = await supabase
    .from("nutrition_log")
    .select("date,protein_g")
    .gte("date", since)
    .order("date", { ascending: true });
  if (error) throw error;
  const byDate = new Map((data ?? []).map((r) => [r.date, r.protein_g]));
  const out: { date: string; protein: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = isoDaysAgo(i);
    out.push({ date: d, protein: byDate.get(d) ?? 0 });
  }
  return out;
}

export async function getTodayWeight() {
  const { data } = await supabase.from("body_weight").select("weight_kg").eq("date", todayISO()).maybeSingle();
  return data?.weight_kg ? Number(data.weight_kg) : null;
}

export async function getTodayNutrition() {
  const { data } = await supabase
    .from("nutrition_log")
    .select("protein_g,kcal_estimate")
    .eq("date", todayISO())
    .maybeSingle();
  return data ?? { protein_g: 0, kcal_estimate: null };
}

export async function getTemplates() {
  const { data, error } = await supabase
    .from("templates")
    .select("id,name,day_label,position")
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getTemplateWithItems(templateId: number) {
  const [tplRes, itemsRes] = await Promise.all([
    supabase.from("templates").select("id,name,day_label").eq("id", templateId).maybeSingle(),
    supabase
      .from("template_items")
      .select("id,position,target_sets,target_reps_min,target_reps_max,notes,exercise:exercises(id,name,bilateral,category)")
      .eq("template_id", templateId)
      .order("position", { ascending: true }),
  ]);
  if (tplRes.error) throw tplRes.error;
  if (itemsRes.error) throw itemsRes.error;
  return { template: tplRes.data, items: itemsRes.data ?? [] };
}

export async function getRecentWorkouts(limit = 20) {
  const { data, error } = await supabase
    .from("workouts")
    .select("id,date,notes,template:templates(name,day_label)")
    .order("date", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getWorkout(id: number) {
  const [w, sets] = await Promise.all([
    supabase
      .from("workouts")
      .select("id,date,notes,template:templates(id,name,day_label)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("workout_sets")
      .select("id,exercise_id,set_number,weight_kg,reps,rpe,is_warmup,notes,exercise:exercises(id,name,bilateral,category)")
      .eq("workout_id", id)
      .order("id", { ascending: true }),
  ]);
  if (w.error) throw w.error;
  if (sets.error) throw sets.error;
  return { workout: w.data, sets: sets.data ?? [] };
}

export async function getLastSetsForExercise(exerciseId: number, beforeWorkoutId?: number) {
  let q = supabase
    .from("workout_sets")
    .select("workout_id,set_number,weight_kg,reps,workouts!inner(date)")
    .eq("exercise_id", exerciseId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (beforeWorkoutId) q = q.neq("workout_id", beforeWorkoutId);
  const { data, error } = await q;
  if (error) throw error;
  if (!data?.length) return [];
  const mostRecentWorkoutId = data[0].workout_id;
  return data
    .filter((r) => r.workout_id === mostRecentWorkoutId)
    .sort((a, b) => a.set_number - b.set_number);
}

export async function getExerciseHistory(exerciseId: number, limit = 60) {
  const { data, error } = await supabase
    .from("workout_sets")
    .select("set_number,weight_kg,reps,workout_id,workouts!inner(date)")
    .eq("exercise_id", exerciseId)
    .order("created_at", { ascending: false })
    .limit(limit * 6);
  if (error) throw error;
  const byDate: Record<string, { weight: number; reps: number }[]> = {};
  for (const row of data ?? []) {
    type WithWorkout = { workouts: { date: string } | { date: string }[] };
    const w = (row as unknown as WithWorkout).workouts;
    const date = Array.isArray(w) ? w[0]?.date : w?.date;
    if (!date || row.weight_kg == null || row.reps == null) continue;
    (byDate[date] ||= []).push({ weight: Number(row.weight_kg), reps: row.reps });
  }
  const dates = Object.keys(byDate).sort();
  const series = dates.map((d) => {
    const sets = byDate[d];
    let bestTop = -Infinity;
    let bestE = -Infinity;
    for (const s of sets) {
      if (s.weight > bestTop) bestTop = s.weight;
      const e = e1rm(s.weight, s.reps);
      if (e != null && e > bestE) bestE = e;
    }
    return {
      date: d,
      topSet: Number.isFinite(bestTop) ? bestTop : null,
      e1rm: Number.isFinite(bestE) ? Number(bestE.toFixed(1)) : null,
    };
  });
  return series.slice(-limit);
}

export async function getKeyLiftSparkData() {
  const lifts = ["Back squat", "Bench press", "Trap-bar deadlift", "Overhead press"];
  const { data: ex } = await supabase.from("exercises").select("id,name").in("name", lifts);
  if (!ex?.length) return [];
  return Promise.all(
    ex.map(async (e) => {
      const series = await getExerciseHistory(e.id, 30);
      const latest = series[series.length - 1];
      const prev = series[series.length - 2];
      return {
        id: e.id,
        name: e.name,
        latestE1rm: latest?.e1rm ?? null,
        delta: latest && prev && latest.e1rm && prev.e1rm ? latest.e1rm - prev.e1rm : null,
        series,
      };
    }),
  );
}

export async function getExercises() {
  const { data } = await supabase.from("exercises").select("id,name,category").order("name");
  return data ?? [];
}
