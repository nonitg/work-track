"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fmtDate } from "@/lib/utils";

type TemplateItem = {
  id: number;
  position: number;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  exercise: { id: number; name: string } | null;
};
type LoggedSet = {
  id: number;
  exercise_id: number;
  exercise_name: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
};
type PrevSet = { weight_kg: number | null; reps: number | null; set_number: number };

export function WorkoutLogger({
  workoutId,
  date,
  templateName,
  items,
  sets: initialSets,
  previous,
  allExercises,
}: {
  workoutId: number;
  date: string;
  templateName: string | null;
  items: TemplateItem[];
  sets: LoggedSet[];
  previous: Record<number, PrevSet[]>;
  allExercises: { id: number; name: string; category: string }[];
}) {
  const router = useRouter();
  const [sets, setSets] = useState(initialSets);
  const [, start] = useTransition();
  const [addPickerOpen, setAddPickerOpen] = useState(false);

  const exerciseGroups = useMemo(() => {
    const fromTemplate = items
      .filter((i) => i.exercise)
      .map((i) => ({
        exerciseId: i.exercise!.id,
        name: i.exercise!.name,
        targetSets: i.target_sets,
        targetReps: `${i.target_reps_min}–${i.target_reps_max}`,
      }));
    const extras = new Set<number>();
    for (const s of sets) {
      if (!fromTemplate.find((g) => g.exerciseId === s.exercise_id)) extras.add(s.exercise_id);
    }
    const extraGroups = [...extras].map((id) => {
      const s = sets.find((x) => x.exercise_id === id)!;
      return { exerciseId: id, name: s.exercise_name, targetSets: 3, targetReps: "8–12" };
    });
    return [...fromTemplate, ...extraGroups];
  }, [items, sets]);

  function setsFor(exerciseId: number) {
    return sets.filter((s) => s.exercise_id === exerciseId).sort((a, b) => a.set_number - b.set_number);
  }

  async function addSet(exerciseId: number, exerciseName: string) {
    const existing = setsFor(exerciseId);
    const last = existing[existing.length - 1];
    const prev = previous[exerciseId] ?? [];
    const setNumber = (last?.set_number ?? 0) + 1;
    const prefill = last ?? prev[setNumber - 1] ?? prev[0] ?? { weight_kg: null, reps: null };
    const res = await fetch("/api/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workout_id: workoutId,
        exercise_id: exerciseId,
        set_number: setNumber,
        weight_kg: prefill.weight_kg,
        reps: prefill.reps,
      }),
    });
    if (!res.ok) return;
    const j = await res.json();
    setSets((s) => [
      ...s,
      {
        id: j.id,
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        set_number: setNumber,
        weight_kg: prefill.weight_kg,
        reps: prefill.reps,
      },
    ]);
  }

  async function updateSet(setId: number, patch: { weight_kg?: number | null; reps?: number | null }) {
    setSets((s) => s.map((x) => (x.id === setId ? { ...x, ...patch } : x)));
    await fetch(`/api/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function deleteSet(setId: number) {
    setSets((s) => s.filter((x) => x.id !== setId));
    await fetch(`/api/sets/${setId}`, { method: "DELETE" });
  }

  async function pickExercise(exerciseId: number) {
    setAddPickerOpen(false);
    const ex = allExercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    await addSet(exerciseId, ex.name);
  }

  async function finish() {
    start(() => router.push("/history"));
  }

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{templateName ?? "Workout"}</h1>
          <p className="text-sm text-zinc-500">{fmtDate(date)}</p>
        </div>
        <Button onClick={finish} size="sm">Finish</Button>
      </header>

      {exerciseGroups.map((g) => {
        const rows = setsFor(g.exerciseId);
        const prev = previous[g.exerciseId] ?? [];
        return (
          <Card key={g.exerciseId}>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="font-semibold">{g.name}</div>
                <div className="text-xs text-zinc-500">
                  Target {g.targetSets} × {g.targetReps}
                  {prev.length > 0 && (
                    <span className="ml-2">
                      · last: {prev.map((p) => `${p.weight_kg ?? "—"}×${p.reps ?? "—"}`).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {rows.map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <span className="w-6 text-xs text-zinc-500 tabular-nums">{s.set_number}</span>
                  <SetInput
                    value={s.weight_kg}
                    placeholder="kg"
                    onChange={(v) => updateSet(s.id, { weight_kg: v })}
                  />
                  <span className="text-zinc-400">×</span>
                  <SetInput
                    value={s.reps}
                    placeholder="reps"
                    onChange={(v) => updateSet(s.id, { reps: v })}
                  />
                  <button
                    onClick={() => deleteSet(s.id)}
                    aria-label="Delete set"
                    className="ml-1 text-zinc-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => addSet(g.exerciseId, g.name)}
            >
              + Add set
            </Button>
          </Card>
        );
      })}

      <Card>
        {!addPickerOpen ? (
          <Button variant="outline" className="w-full" onClick={() => setAddPickerOpen(true)}>
            + Add exercise
          </Button>
        ) : (
          <div>
            <CardTitle>Add exercise</CardTitle>
            <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto">
              {allExercises.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => pickExercise(e.id)}
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {e.name}
                    <span className="ml-2 text-xs text-zinc-400">{e.category}</span>
                  </button>
                </li>
              ))}
            </ul>
            <Button variant="ghost" className="mt-2 w-full" onClick={() => setAddPickerOpen(false)}>
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function SetInput({
  value,
  placeholder,
  onChange,
}: {
  value: number | null;
  placeholder: string;
  onChange: (v: number | null) => void;
}) {
  const [local, setLocal] = useState<string>(value != null ? String(value) : "");
  return (
    <Input
      type="number"
      inputMode="decimal"
      step="0.5"
      placeholder={placeholder}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const n = local === "" ? null : Number(local);
        onChange(Number.isFinite(n as number) || n === null ? n : null);
      }}
      className="h-10 flex-1 text-center"
    />
  );
}
