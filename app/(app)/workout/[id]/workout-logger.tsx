"use client";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, fmtDate } from "@/lib/utils";

const BODYWEIGHT_CATEGORIES = new Set(["core", "mobility"]);

type TemplateItem = {
  id: number;
  position: number;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  notes: string | null;
  exercise: { id: number; name: string; category: string } | null;
};
type LoggedSet = {
  id: number;
  exercise_id: number;
  exercise_name: string;
  exercise_category: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
};
type PrevSet = { weight_kg: number | null; reps: number | null; set_number: number };

type Group = {
  exerciseId: number;
  name: string;
  category: string;
  targetSets: number;
  targetReps: string;
  targetMin: number;
  targetMax: number;
  notes: string | null;
};

export function WorkoutLogger({
  workoutId,
  date,
  templateName,
  warmup,
  warmupDone,
  items,
  sets: initialSets,
  previous,
  allExercises,
}: {
  workoutId: number;
  date: string;
  templateName: string | null;
  warmup: string | null;
  warmupDone: boolean;
  items: TemplateItem[];
  sets: LoggedSet[];
  previous: Record<number, PrevSet[]>;
  allExercises: { id: number; name: string; category: string }[];
}) {
  const router = useRouter();
  const [sets, setSets] = useState(initialSets);
  const [, start] = useTransition();
  const [addPickerOpen, setAddPickerOpen] = useState(false);

  const groups = useMemo<Group[]>(() => {
    const fromTemplate: Group[] = items
      .filter((i) => i.exercise)
      .map((i) => ({
        exerciseId: i.exercise!.id,
        name: i.exercise!.name,
        category: i.exercise!.category,
        targetSets: i.target_sets,
        targetReps: `${i.target_reps_min}–${i.target_reps_max}`,
        targetMin: i.target_reps_min,
        targetMax: i.target_reps_max,
        notes: i.notes ?? null,
      }));
    const known = new Set(fromTemplate.map((g) => g.exerciseId));
    const extras: Group[] = [];
    for (const s of sets) {
      if (known.has(s.exercise_id)) continue;
      known.add(s.exercise_id);
      extras.push({
        exerciseId: s.exercise_id,
        name: s.exercise_name,
        category: s.exercise_category,
        targetSets: 3,
        targetReps: "8–12",
        targetMin: 8,
        targetMax: 12,
        notes: null,
      });
    }
    return [...fromTemplate, ...extras];
  }, [items, sets]);

  function setsFor(exerciseId: number) {
    return sets
      .filter((s) => s.exercise_id === exerciseId)
      .sort((a, b) => a.set_number - b.set_number);
  }

  async function pickExercise(exerciseId: number) {
    setAddPickerOpen(false);
    const ex = allExercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    setSets((s) => [
      ...s,
      {
        id: -Date.now(),
        exercise_id: ex.id,
        exercise_name: ex.name,
        exercise_category: ex.category,
        set_number: 1,
        weight_kg: null,
        reps: null,
      },
    ]);
    await fetch("/api/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workout_id: workoutId,
        exercise_id: ex.id,
        set_number: 1,
        weight_kg: null,
        reps: null,
      }),
    });
    start(() => router.refresh());
  }

  function replaceExerciseSets(exerciseId: number, rows: LoggedSet[]) {
    setSets((all) => [...all.filter((s) => s.exercise_id !== exerciseId), ...rows]);
  }

  // Don't leave an empty workout behind: if nothing was logged, discard the
  // record on the way out so it never clutters history.
  async function finish() {
    if (sets.length === 0) {
      await fetch(`/api/workouts/${workoutId}`, { method: "DELETE" });
    }
    start(() => router.push("/history"));
  }

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{templateName ?? "Workout"}</h1>
          <p className="text-sm text-zinc-500">{fmtDate(date)}</p>
        </div>
        <Button onClick={finish} size="sm">
          Finish
        </Button>
      </header>

      <WarmupCard workoutId={workoutId} initialDone={warmupDone} text={warmup} />

      {groups.map((g) => (
        <ExerciseCard
          key={g.exerciseId}
          group={g}
          workoutId={workoutId}
          loggedSets={setsFor(g.exerciseId)}
          previous={previous[g.exerciseId] ?? []}
          onReplace={(rows) => replaceExerciseSets(g.exerciseId, rows)}
        />
      ))}

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

function isUniform(rows: LoggedSet[]) {
  if (rows.length === 0) return true;
  const first = rows[0];
  return rows.every((r) => r.weight_kg === first.weight_kg && r.reps === first.reps);
}

function ExerciseCard({
  group,
  workoutId,
  loggedSets,
  previous,
  onReplace,
}: {
  group: Group;
  workoutId: number;
  loggedSets: LoggedSet[];
  previous: PrevSet[];
  onReplace: (rows: LoggedSet[]) => void;
}) {
  const router = useRouter();
  const [, start] = useTransition();
  const isBodyweight = BODYWEIGHT_CATEGORIES.has(group.category);

  const prevWeight = previous.find((p) => p.weight_kg != null)?.weight_kg ?? null;
  const prevReps = previous.find((p) => p.reps != null)?.reps ?? null;
  const prevSetCount = previous.length || group.targetSets;
  const targetMid = Math.round((group.targetMin + group.targetMax) / 2);

  const hasLogged = loggedSets.length > 0;
  const uniformAuto = isUniform(loggedSets);
  const [varied, setVaried] = useState(!uniformAuto);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const uniformSets = hasLogged ? loggedSets.length : prevSetCount;
  const uniformReps = hasLogged ? loggedSets[0]?.reps ?? null : prevReps ?? targetMid;
  const uniformWeight = hasLogged
    ? loggedSets[0]?.weight_kg ?? null
    : isBodyweight
      ? null
      : prevWeight;

  // Only prefill the inputs with values that were actually logged this session.
  // When the exercise is still unlogged, leave the fields empty and surface last
  // session's numbers as placeholder hints (plus the "Same as last" shortcut
  // below) — so a filled field always means "logged", never just "suggested".
  const [setCount, setSetCount] = useState<number>(uniformSets);
  const [reps, setReps] = useState<string>(
    hasLogged && uniformReps != null ? String(uniformReps) : "",
  );
  const [weight, setWeight] = useState<string>(
    hasLogged && uniformWeight != null ? String(uniformWeight) : "",
  );

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveBulk = useCallback(
    async (count: number, repsVal: number | null, weightVal: number | null) => {
      setStatus("saving");
      const payload = {
        workout_id: workoutId,
        exercise_id: group.exerciseId,
        sets: Array.from({ length: Math.max(0, count) }, (_, i) => ({
          set_number: i + 1,
          weight_kg: isBodyweight ? null : weightVal,
          reps: repsVal,
        })),
      };
      const optimistic: LoggedSet[] = Array.from({ length: Math.max(0, count) }, (_, i) => ({
        id: -i - 1,
        exercise_id: group.exerciseId,
        exercise_name: group.name,
        exercise_category: group.category,
        set_number: i + 1,
        weight_kg: isBodyweight ? null : weightVal,
        reps: repsVal,
      }));
      onReplace(optimistic);
      const res = await fetch("/api/sets/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("saved");
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1200);
      start(() => router.refresh());
    },
    [workoutId, group.exerciseId, group.name, group.category, isBodyweight, onReplace, router],
  );

  function scheduleSave(count: number, repsStr: string, weightStr: string) {
    const repsVal = repsStr === "" ? null : Number(repsStr);
    const weightVal = weightStr === "" ? null : Number(weightStr);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveBulk(count, repsVal, weightVal);
    }, 400);
  }

  function changeSetCount(next: number) {
    const v = Math.max(0, Math.min(20, next));
    setSetCount(v);
    scheduleSave(v, reps, weight);
  }
  function changeReps(v: string) {
    setReps(v);
    scheduleSave(setCount, v, weight);
  }
  function changeWeight(v: string) {
    setWeight(v);
    scheduleSave(setCount, reps, v);
  }

  // One-tap log of last session's numbers (or the target/typed values when
  // there's no history). Fills the fields too so the logged values stay visible.
  function quickLog() {
    const count = previous.length ? prevSetCount : setCount;
    const repsVal = previous.length ? prevReps : reps === "" ? targetMid : Number(reps);
    const weightVal = isBodyweight
      ? null
      : previous.length
        ? prevWeight
        : weight === ""
          ? null
          : Number(weight);
    setSetCount(count);
    setReps(repsVal != null ? String(repsVal) : "");
    setWeight(weightVal != null ? String(weightVal) : "");
    saveBulk(count, repsVal, weightVal);
  }

  const prevSummary = previous.length
    ? previous
        .map((p) =>
          isBodyweight ? `${p.reps ?? "—"}` : `${p.weight_kg ?? "—"}×${p.reps ?? "—"}`,
        )
        .join(", ")
    : null;

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-semibold">{group.name}</div>
          <div className="text-xs text-zinc-500">
            Target {group.targetSets} × {group.targetReps}
            {prevSummary && <span className="ml-2">· last: {prevSummary}</span>}
          </div>
          {group.notes && (
            <div className="mt-1 text-xs italic text-zinc-500 dark:text-zinc-400">{group.notes}</div>
          )}
        </div>
        <StatusBadge status={status} unsaved={!hasLogged} />
      </div>

      {!varied ? (
        <div className="mt-3">
          <div className={cn("grid gap-2", isBodyweight ? "grid-cols-2" : "grid-cols-3")}>
            <Stepper label="Sets" value={setCount} onChange={changeSetCount} min={0} max={20} />
            <NumberCell
              label="Reps"
              value={reps}
              onChange={changeReps}
              placeholder={prevReps != null ? String(prevReps) : "reps"}
              step="1"
            />
            {!isBodyweight && (
              <NumberCell
                label="Weight (lbs)"
                value={weight}
                onChange={changeWeight}
                placeholder={prevWeight != null ? String(prevWeight) : "lbs"}
                step="0.5"
              />
            )}
          </div>
          {!hasLogged && (
            <button
              type="button"
              onClick={quickLog}
              className="mt-2 w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
            >
              {previous.length
                ? `Same as last → ${prevSetCount} × ${prevReps ?? "—"}${isBodyweight ? "" : ` @ ${prevWeight ?? "—"} lbs`}`
                : "Tap to log"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setVaried(true)}
            className="mt-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Vary by set →
          </button>
        </div>
      ) : (
        <VariedSets
          workoutId={workoutId}
          group={group}
          rows={loggedSets}
          isBodyweight={isBodyweight}
          onReplace={onReplace}
          onClose={() => {
            if (uniformAuto) setVaried(false);
          }}
          canCollapse={isUniform(loggedSets)}
        />
      )}
    </Card>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-11 w-8 shrink-0 rounded-lg border border-zinc-300 text-lg leading-none hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <Input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min);
          }}
          className="w-0 flex-1 px-1 text-center text-lg tabular-nums"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-11 w-8 shrink-0 rounded-lg border border-zinc-300 text-lg leading-none hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function NumberCell({
  label,
  value,
  onChange,
  placeholder,
  step = "1",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div>
      <div className="text-xs text-zinc-500">{label}</div>
      <Input
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 text-center text-lg tabular-nums"
      />
    </div>
  );
}

function StatusBadge({
  status,
  unsaved,
}: {
  status: "idle" | "saving" | "saved" | "error";
  unsaved: boolean;
}) {
  if (status === "saving") return <span className="text-xs text-zinc-400">saving…</span>;
  if (status === "saved") return <span className="text-xs text-emerald-600">saved ✓</span>;
  if (status === "error") return <span className="text-xs text-red-600">save failed</span>;
  if (unsaved) return <span className="text-xs text-zinc-400">unlogged</span>;
  return null;
}

function VariedSets({
  workoutId,
  group,
  rows,
  isBodyweight,
  onReplace,
  onClose,
  canCollapse,
}: {
  workoutId: number;
  group: Group;
  rows: LoggedSet[];
  isBodyweight: boolean;
  onReplace: (rows: LoggedSet[]) => void;
  onClose: () => void;
  canCollapse: boolean;
}) {
  const router = useRouter();
  const [, start] = useTransition();

  async function updateSet(setId: number, patch: Partial<Pick<LoggedSet, "weight_kg" | "reps">>) {
    const next = rows.map((r) => (r.id === setId ? { ...r, ...patch } : r));
    onReplace(next);
    // Negative IDs are optimistic placeholders — skip PATCH until the real ID arrives via refresh
    if (setId < 0) return;
    await fetch(`/api/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    start(() => router.refresh());
  }

  async function addSet() {
    const last = rows[rows.length - 1];
    const setNumber = (last?.set_number ?? 0) + 1;
    const tempId = -Date.now();
    const optimistic: LoggedSet = {
      id: tempId,
      exercise_id: group.exerciseId,
      exercise_name: group.name,
      exercise_category: group.category,
      set_number: setNumber,
      weight_kg: isBodyweight ? null : last?.weight_kg ?? null,
      reps: last?.reps ?? null,
    };
    onReplace([...rows, optimistic]);
    const res = await fetch("/api/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workout_id: workoutId,
        exercise_id: group.exerciseId,
        set_number: setNumber,
        weight_kg: optimistic.weight_kg,
        reps: optimistic.reps,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.id) {
        // Replace the temp ID with the real server ID so edits/deletes work immediately
        onReplace([...rows, { ...optimistic, id: data.id }]);
      }
    }
    start(() => router.refresh());
  }

  async function deleteSet(setId: number) {
    onReplace(rows.filter((r) => r.id !== setId));
    if (setId < 0) return; // optimistic placeholder, not yet saved
    await fetch(`/api/sets/${setId}`, { method: "DELETE" });
    start(() => router.refresh());
  }

  return (
    <div className="mt-3">
      <ul className="space-y-2">
        {rows.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <span className="w-6 text-xs text-zinc-500 tabular-nums">{s.set_number}</span>
            {!isBodyweight && (
              <>
                <SetCellInput
                  value={s.weight_kg}
                  placeholder="lbs"
                  step="0.5"
                  onChange={(v) => updateSet(s.id, { weight_kg: v })}
                />
                <span className="text-zinc-400">×</span>
              </>
            )}
            <SetCellInput
              value={s.reps}
              placeholder="reps"
              step="1"
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
      <Button variant="outline" size="sm" className="mt-3 w-full" onClick={addSet}>
        + Add set
      </Button>
      {canCollapse && (
        <button
          type="button"
          onClick={onClose}
          className="mt-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Collapse
        </button>
      )}
    </div>
  );
}

function WarmupCard({
  workoutId,
  initialDone,
  text,
}: {
  workoutId: number;
  initialDone: boolean;
  text: string | null;
}) {
  const router = useRouter();
  const [done, setDone] = useState(initialDone);
  const [open, setOpen] = useState(!initialDone);
  const [, start] = useTransition();

  async function toggle() {
    const next = !done;
    setDone(next);
    if (next) setOpen(false);
    const res = await fetch(`/api/workouts/${workoutId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warmup_done: next }),
    });
    if (!res.ok) {
      setDone(!next);
      return;
    }
    start(() => router.refresh());
  }

  const lines = text ? text.split("\n").map((l) => l.trim()).filter(Boolean) : [];

  return (
    <Card className={cn(done ? "border-emerald-300 dark:border-emerald-900" : undefined)}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-3 text-left"
          aria-pressed={done}
        >
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md border-2 transition",
              done
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-zinc-300 dark:border-zinc-600",
            )}
          >
            {done && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span>
            <span className="block font-semibold">Warm-up</span>
            <span className="block text-xs text-zinc-500">{done ? "Done" : "Tap to mark done"}</span>
          </span>
        </button>
        {lines.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {open ? "Hide" : "Show plan"}
          </button>
        )}
      </div>
      {open && lines.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
          {lines.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function SetCellInput({
  value,
  placeholder,
  step,
  onChange,
}: {
  value: number | null;
  placeholder: string;
  step: string;
  onChange: (v: number | null) => void;
}) {
  const [local, setLocal] = useState<string>(value != null ? String(value) : "");
  const [focused, setFocused] = useState(false);
  const prevValueRef = useRef(value);

  // Sync external value changes (after server refresh) only when not actively editing
  if (!focused && prevValueRef.current !== value) {
    prevValueRef.current = value;
    const next = value != null ? String(value) : "";
    if (next !== local) setLocal(next);
  }

  function commit() {
    const n = local === "" ? null : Number(local);
    onChange(Number.isFinite(n as number) || n === null ? n : null);
  }

  return (
    <Input
      type="number"
      inputMode="decimal"
      step={step}
      placeholder={placeholder}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        commit();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className="h-10 flex-1 text-center"
    />
  );
}
