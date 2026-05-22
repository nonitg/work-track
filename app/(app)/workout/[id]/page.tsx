import { notFound } from "next/navigation";
import { getExercises, getLastSetsForExercise, getTemplateWithItems, getWorkout } from "@/lib/queries";
import { WorkoutLogger } from "./workout-logger";

export const dynamic = "force-dynamic";

type ExerciseRel = { id: number; name: string; bilateral: boolean; category: string };

function rel<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const { workout, sets } = await getWorkout(id);
  if (!workout) notFound();

  const tpl = rel(workout.template);
  const tplItems = tpl ? (await getTemplateWithItems(tpl.id)).items : [];

  const exerciseIds = new Set<number>();
  for (const it of tplItems) {
    const ex = rel(it.exercise) as ExerciseRel | null;
    if (ex) exerciseIds.add(ex.id);
  }
  for (const s of sets) exerciseIds.add(s.exercise_id);

  const previous: Record<number, { weight_kg: number | null; reps: number | null; set_number: number }[]> = {};
  await Promise.all(
    [...exerciseIds].map(async (eid) => {
      const rows = await getLastSetsForExercise(eid, id);
      previous[eid] = rows.map((r) => ({
        weight_kg: r.weight_kg != null ? Number(r.weight_kg) : null,
        reps: r.reps,
        set_number: r.set_number,
      }));
    }),
  );

  const allExercises = await getExercises();

  const itemsForUi = tplItems.map((it) => {
    const ex = rel(it.exercise) as ExerciseRel | null;
    return {
      id: it.id,
      position: it.position,
      target_sets: it.target_sets,
      target_reps_min: it.target_reps_min,
      target_reps_max: it.target_reps_max,
      exercise: ex ? { id: ex.id, name: ex.name } : null,
    };
  });

  const setsForUi = sets.map((s) => {
    const ex = rel(s.exercise) as ExerciseRel | null;
    return {
      id: s.id,
      exercise_id: s.exercise_id,
      exercise_name: ex?.name ?? "Exercise",
      set_number: s.set_number,
      weight_kg: s.weight_kg != null ? Number(s.weight_kg) : null,
      reps: s.reps,
    };
  });

  return (
    <WorkoutLogger
      workoutId={id}
      date={workout.date}
      templateName={tpl?.name ?? null}
      items={itemsForUi}
      sets={setsForUi}
      previous={previous}
      allExercises={allExercises}
    />
  );
}
