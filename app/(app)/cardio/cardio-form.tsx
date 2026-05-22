"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TYPES = ["Incline treadmill walk", "Stair machine", "Outdoor hill walk", "Easy hike"];

export function CardioForm() {
  const router = useRouter();
  const [type, setType] = useState(TYPES[0]);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    const n = Number(duration);
    if (!Number.isFinite(n) || n <= 0 || n > 600) {
      setErr("Enter minutes");
      return;
    }
    setErr(null);
    const res = await fetch("/api/cardio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, duration_min: n, notes: notes || null }),
    });
    if (!res.ok) {
      setErr("Save failed");
      return;
    }
    setDuration("");
    setNotes("");
    start(() => router.refresh());
  }

  return (
    <div className="mt-3 space-y-3">
      <div>
        <Label>Type</Label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-lg border p-3 text-left text-sm ${
                type === t
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Duration (minutes)</Label>
        <Input
          type="number"
          inputMode="numeric"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="30"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Notes</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
      </div>
      <Button onClick={save} className="w-full">Save</Button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
