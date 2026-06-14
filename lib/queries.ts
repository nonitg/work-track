import { cache } from "react";
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
    if (series[i].weight == null) continue;
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
  const out: { date: string; protein: number | null }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = isoDaysAgo(i);
    out.push({ date: d, protein: byDate.has(d) ? Number(byDate.get(d) ?? 0) : null });
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

export async function getTodayCardio() {
  const { data } = await supabase
    .from("cardio_log")
    .select("id,type,duration_min,notes")
    .eq("date", todayISO())
    .order("id", { ascending: true });
  return data ?? [];
}

export async function getTodayMobility() {
  const { data } = await supabase
    .from("mobility_log")
    .select("daily_mobility_done,knee_to_wall_cm_left,knee_to_wall_cm_right")
    .eq("date", todayISO())
    .maybeSingle();
  return (
    data ?? {
      daily_mobility_done: false,
      knee_to_wall_cm_left: null,
      knee_to_wall_cm_right: null,
    }
  );
}

export async function getMobilityStreak() {
  const { data } = await supabase
    .from("mobility_log")
    .select("date,daily_mobility_done")
    .gte("date", isoDaysAgo(365))
    .order("date", { ascending: false });
  if (!data) return 0;
  const done = new Set(data.filter((r) => r.daily_mobility_done).map((r) => r.date));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    if (done.has(isoDaysAgo(i))) streak++;
    else break;
  }
  return streak;
}

export async function getRecentCardio(days = 90) {
  const { data } = await supabase
    .from("cardio_log")
    .select("id,date,type,duration_min")
    .gte("date", isoDaysAgo(days))
    .order("date", { ascending: false });
  return data ?? [];
}

export async function getRecentMobility(days = 90) {
  const { data } = await supabase
    .from("mobility_log")
    .select("date,daily_mobility_done,knee_to_wall_cm_left,knee_to_wall_cm_right")
    .gte("date", isoDaysAgo(days))
    .order("date", { ascending: false });
  return data ?? [];
}

export async function getTemplates() {
  const { data, error } = await supabase
    .from("templates")
    .select("id,name,day_label,position,warmup")
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getTemplateWithItems(templateId: number) {
  const [tplRes, itemsRes] = await Promise.all([
    supabase.from("templates").select("id,name,day_label,warmup").eq("id", templateId).maybeSingle(),
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

export async function getWorkoutForDate(date: string) {
  const { data, error } = await supabase
    .from("workouts")
    .select("id,template:templates(id,name,day_label)")
    .eq("date", date)
    .order("id", { ascending: true });
  if (error) throw error;
  const w = (data ?? [])[0];
  if (!w) return null;
  const { count } = await supabase
    .from("workout_sets")
    .select("id", { count: "exact", head: true })
    .eq("workout_id", w.id);
  const tpl = Array.isArray(w.template) ? w.template[0] : w.template;
  return {
    id: w.id as number,
    templateName: (tpl?.name ?? null) as string | null,
    dayLabel: (tpl?.day_label ?? null) as string | null,
    setCount: count ?? 0,
  };
}

export async function getWorkout(id: number) {
  const [w, sets] = await Promise.all([
    supabase
      .from("workouts")
      .select("id,date,notes,warmup_done,template:templates(id,name,day_label,warmup)")
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

export const getExercises = cache(async () => {
  const { data } = await supabase.from("exercises").select("id,name,category,bilateral").order("name");
  return data ?? [];
});

export type CommitDay = {
  date: string;
  mobility: boolean;
  workout: boolean;
  cardio: boolean;
  weight: boolean;
  protein: boolean;
  level: 0 | 1 | 2 | 3 | 4;
};

export async function getCommitGraph(days = 365): Promise<CommitDay[]> {
  const since = isoDaysAgo(days - 1);
  const [mobRes, woRes, caRes, bwRes, nuRes] = await Promise.all([
    supabase.from("mobility_log").select("date,daily_mobility_done").gte("date", since),
    supabase.from("workouts").select("date").gte("date", since),
    supabase.from("cardio_log").select("date").gte("date", since),
    supabase.from("body_weight").select("date").gte("date", since),
    supabase.from("nutrition_log").select("date,protein_g").gte("date", since),
  ]);
  const mobSet = new Set(
    (mobRes.data ?? []).filter((r) => r.daily_mobility_done).map((r) => r.date),
  );
  const woSet = new Set((woRes.data ?? []).map((r) => r.date));
  const caSet = new Set((caRes.data ?? []).map((r) => r.date));
  const bwSet = new Set((bwRes.data ?? []).map((r) => r.date));
  const nuSet = new Set(
    (nuRes.data ?? []).filter((r) => (r.protein_g ?? 0) > 0).map((r) => r.date),
  );

  const out: CommitDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = isoDaysAgo(i);
    const mobility = mobSet.has(d);
    const workout = woSet.has(d);
    const cardio = caSet.has(d);
    const weight = bwSet.has(d);
    const protein = nuSet.has(d);
    const count = (mobility ? 1 : 0) + (workout ? 1 : 0) + (cardio ? 1 : 0) + (weight ? 1 : 0) + (protein ? 1 : 0);
    const level = Math.min(4, count) as 0 | 1 | 2 | 3 | 4;
    out.push({ date: d, mobility, workout, cardio, weight, protein, level });
  }
  return out;
}
