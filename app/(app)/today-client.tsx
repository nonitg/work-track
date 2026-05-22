"use client";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAutosave } from "@/lib/use-autosave";
import { cn } from "@/lib/utils";

const CARDIO_TYPES = ["Incline treadmill walk", "Stair machine", "Outdoor hill walk", "Easy hike"];
const CARDIO_SHORT: Record<string, string> = {
  "Incline treadmill walk": "Incline",
  "Stair machine": "Stairs",
  "Outdoor hill walk": "Hill walk",
  "Easy hike": "Hike",
};

type CardioRow = { id: number; type: string; duration_min: number; notes: string | null };

export function TodayClient(props: {
  weight: number | null;
  protein: number;
  kcal: number | null;
  cardio: CardioRow[];
  mobility: { daily_mobility_done: boolean; knee_to_wall_cm_left: number | null; knee_to_wall_cm_right: number | null };
  streak: number;
}) {
  return (
    <div className="space-y-4">
      <WeightRow initial={props.weight} />
      <ProteinRow initialProtein={props.protein} initialKcal={props.kcal} />
      <CardioRowGroup initial={props.cardio} />
      <MobilityRow initial={props.mobility} streak={props.streak} />
    </div>
  );
}

function SectionHeader({
  title,
  status,
  hint,
  right,
}: {
  title: string;
  status?: "idle" | "saving" | "saved" | "error";
  hint?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</h2>
        <StatusDot status={status} />
      </div>
      <div className="text-xs text-zinc-500">{right ?? hint}</div>
    </div>
  );
}

function StatusDot({ status }: { status?: "idle" | "saving" | "saved" | "error" }) {
  if (!status || status === "idle") return null;
  const label =
    status === "saving" ? "saving…" : status === "saved" ? "saved" : "save failed";
  const color =
    status === "error" ? "text-red-600" : status === "saved" ? "text-emerald-600" : "text-zinc-400";
  return <span className={cn("text-xs tabular-nums", color)}>{label}</span>;
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {children}
    </div>
  );
}

function WeightRow({ initial }: { initial: number | null }) {
  const router = useRouter();
  const [value, setValue] = useState<string>(initial != null ? String(initial) : "");
  const [saved, setSaved] = useState<boolean>(initial != null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, start] = useTransition();
  const dirty = value !== "" && (initial == null || Number(value) !== initial);

  async function log() {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0 || n > 400) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight_kg: n }),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setStatus("saved");
    setSaved(true);
    setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1500);
    start(() => router.refresh());
  }

  return (
    <Section>
      <SectionHeader
        title="Weight"
        status={status}
        right={
          saved && !dirty ? (
            <span className="text-emerald-600">Logged ✓</span>
          ) : (
            "kg, morning weigh-in"
          )
        }
      />
      <div className="mt-2 flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="—"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") log();
          }}
          className="flex-1 text-center text-lg tabular-nums"
        />
        <Button onClick={log} disabled={!value || status === "saving"}>
          {saved && !dirty ? "Update" : "Log"}
        </Button>
      </div>
    </Section>
  );
}

function ProteinRow({ initialProtein, initialKcal }: { initialProtein: number; initialKcal: number | null }) {
  const router = useRouter();
  const [protein, setProtein] = useState<number>(initialProtein);
  const [kcal, setKcal] = useState<string>(initialKcal != null ? String(initialKcal) : "");
  const [showKcal, setShowKcal] = useState(initialKcal != null);
  const [savedProtein, setSavedProtein] = useState<number>(initialProtein);
  const [savedKcal, setSavedKcal] = useState<number | null>(initialKcal);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, start] = useTransition();

  const kcalParsed = useMemo(() => (kcal === "" ? null : Number(kcal)), [kcal]);
  const dirty = protein !== savedProtein || kcalParsed !== savedKcal;

  const save = useCallback(
    async (proteinVal: number, kcalVal: number | null) => {
      setStatus("saving");
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protein_g: proteinVal, kcal_estimate: kcalVal }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("saved");
      setSavedProtein(proteinVal);
      setSavedKcal(kcalVal);
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1500);
      start(() => router.refresh());
    },
    [router],
  );

  function adjust(delta: number) {
    const next = Math.max(0, Math.min(1000, protein + delta));
    setProtein(next);
    save(next, kcalParsed);
  }

  return (
    <Section>
      <SectionHeader
        title="Protein"
        status={status}
        right={
          <span className="tabular-nums">
            {savedProtein} / 100 g{" "}
            {savedProtein >= 100 && <span className="text-emerald-600">✓</span>}
          </span>
        }
      />
      <div className="mt-2 flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => adjust(-10)} aria-label="-10g">−10</Button>
        <Input
          type="number"
          inputMode="numeric"
          value={protein}
          onChange={(e) => setProtein(Math.max(0, Math.min(1000, Number(e.target.value) || 0)))}
          onKeyDown={(e) => {
            if (e.key === "Enter") save(protein, kcalParsed);
          }}
          className="flex-1 text-center text-lg tabular-nums"
        />
        <Button variant="outline" size="icon" onClick={() => adjust(10)} aria-label="+10g">+10</Button>
      </div>
      {showKcal ? (
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
            placeholder="kcal estimate"
            className="flex-1 text-center text-sm tabular-nums"
          />
          <button
            type="button"
            onClick={() => {
              setKcal("");
              setShowKcal(false);
              save(protein, null);
            }}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            hide
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowKcal(true)}
          className="mt-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          + add kcal estimate
        </button>
      )}
      <Button
        onClick={() => save(protein, kcalParsed)}
        disabled={!dirty || status === "saving"}
        className="mt-3 w-full"
      >
        {dirty ? "Log" : "Logged ✓"}
      </Button>
    </Section>
  );
}

function CardioRowGroup({ initial }: { initial: CardioRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<CardioRow[]>(initial);
  const [type, setType] = useState<string>(CARDIO_TYPES[0]);
  const [duration, setDuration] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [, start] = useTransition();
  const totalMin = rows.reduce((a, r) => a + r.duration_min, 0);

  async function logSession() {
    const n = Number(duration);
    if (!Number.isFinite(n) || n <= 0 || n > 600) return;
    setPending(true);
    const tempId = -Date.now();
    setRows((r) => [...r, { id: tempId, type, duration_min: n, notes: null }]);
    setDuration("");
    const res = await fetch("/api/cardio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, duration_min: n }),
    });
    if (!res.ok) {
      setRows((r) => r.filter((x) => x.id !== tempId));
    } else {
      start(() => router.refresh());
    }
    setPending(false);
  }

  async function remove(id: number) {
    setRows((r) => r.filter((x) => x.id !== id));
    await fetch(`/api/cardio/${id}`, { method: "DELETE" });
    start(() => router.refresh());
  }

  return (
    <Section>
      <SectionHeader
        title="Cardio"
        right={
          rows.length > 0 ? (
            <span className="tabular-nums">
              {rows.length} session{rows.length > 1 ? "s" : ""} · {totalMin} min
            </span>
          ) : (
            "log walks, hikes, stairs"
          )
        }
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CARDIO_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              type === t
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300",
            )}
          >
            {CARDIO_SHORT[t] ?? t}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          placeholder="minutes"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="flex-1 text-center tabular-nums"
        />
        <Button onClick={logSession} disabled={pending || !duration}>Log</Button>
      </div>
      {rows.length > 0 && (
        <ul className="mt-3 space-y-1">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-1.5 text-sm dark:bg-zinc-800/50"
            >
              <span>
                <span className="font-medium">{CARDIO_SHORT[r.type] ?? r.type}</span>
                <span className="ml-2 text-zinc-500 tabular-nums">{r.duration_min} min</span>
              </span>
              <button
                onClick={() => remove(r.id)}
                aria-label="Delete session"
                className="text-zinc-400 hover:text-red-600"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function MobilityRow({
  initial,
  streak,
}: {
  initial: { daily_mobility_done: boolean; knee_to_wall_cm_left: number | null; knee_to_wall_cm_right: number | null };
  streak: number;
}) {
  const router = useRouter();
  const [done, setDone] = useState(initial.daily_mobility_done);
  const [showKtw, setShowKtw] = useState(
    initial.knee_to_wall_cm_left != null || initial.knee_to_wall_cm_right != null,
  );
  const [left, setLeft] = useState<string>(
    initial.knee_to_wall_cm_left != null ? String(initial.knee_to_wall_cm_left) : "",
  );
  const [right, setRight] = useState<string>(
    initial.knee_to_wall_cm_right != null ? String(initial.knee_to_wall_cm_right) : "",
  );
  const [, start] = useTransition();

  const save = useCallback(
    async (payload: {
      daily_mobility_done: boolean;
      knee_to_wall_cm_left: number | null;
      knee_to_wall_cm_right: number | null;
    }) => {
      const res = await fetch("/api/mobility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
      start(() => router.refresh());
    },
    [router],
  );

  const combined = useMemo(
    () => ({
      daily_mobility_done: done,
      knee_to_wall_cm_left: left === "" ? null : Number(left),
      knee_to_wall_cm_right: right === "" ? null : Number(right),
    }),
    [done, left, right],
  );
  const equals = useCallback(
    (a: typeof combined, b: typeof combined) =>
      a.daily_mobility_done === b.daily_mobility_done &&
      a.knee_to_wall_cm_left === b.knee_to_wall_cm_left &&
      a.knee_to_wall_cm_right === b.knee_to_wall_cm_right,
    [],
  );
  const status = useAutosave(combined, save, { equals });

  const liveStreak = done ? Math.max(streak, initial.daily_mobility_done ? streak : streak + 1) : streak;

  return (
    <Section>
      <SectionHeader
        title="Mobility"
        status={status}
        right={liveStreak > 0 ? <span className="tabular-nums">{liveStreak}-day streak</span> : "daily calf/ankle"}
      />
      <button
        type="button"
        onClick={() => setDone((d) => !d)}
        className={cn(
          "mt-2 flex w-full items-center justify-between rounded-lg border p-3 transition",
          done
            ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            : "border-zinc-300 dark:border-zinc-700",
        )}
      >
        <span className="text-sm font-medium">Daily calf/ankle mobility</span>
        <span className="text-xs">{done ? "Done ✓" : "Tap to mark done"}</span>
      </button>
      {showKtw ? (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Knee-to-wall (cm)</span>
            <button
              type="button"
              onClick={() => {
                setShowKtw(false);
                setLeft("");
                setRight("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              hide
            </button>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <Input
              type="number"
              inputMode="decimal"
              step="0.5"
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              placeholder="L"
              className="text-center tabular-nums"
            />
            <Input
              type="number"
              inputMode="decimal"
              step="0.5"
              value={right}
              onChange={(e) => setRight(e.target.value)}
              placeholder="R"
              className="text-center tabular-nums"
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowKtw(true)}
          className="mt-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          + measure knee-to-wall (weekly)
        </button>
      )}
    </Section>
  );
}
