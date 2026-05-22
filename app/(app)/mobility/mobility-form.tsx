"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MobilityForm({
  initial,
}: {
  initial: { daily_mobility_done: boolean; knee_to_wall_cm_left: number | null; knee_to_wall_cm_right: number | null };
}) {
  const router = useRouter();
  const [done, setDone] = useState(initial.daily_mobility_done);
  const [left, setLeft] = useState(initial.knee_to_wall_cm_left != null ? String(initial.knee_to_wall_cm_left) : "");
  const [right, setRight] = useState(initial.knee_to_wall_cm_right != null ? String(initial.knee_to_wall_cm_right) : "");
  const [, start] = useTransition();

  async function save(patch?: { done?: boolean }) {
    const next = { done, left, right, ...patch };
    if (patch?.done != null) setDone(patch.done);
    const res = await fetch("/api/mobility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        daily_mobility_done: next.done,
        knee_to_wall_cm_left: next.left === "" ? null : Number(next.left),
        knee_to_wall_cm_right: next.right === "" ? null : Number(next.right),
      }),
    });
    if (res.ok) start(() => router.refresh());
  }

  return (
    <div className="mt-3 space-y-4">
      <button
        type="button"
        onClick={() => save({ done: !done })}
        className={`flex w-full items-center justify-between rounded-lg border p-4 transition ${
          done
            ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
      >
        <span className="font-medium">Daily calf/ankle mobility</span>
        <span className="text-xs">{done ? "Done ✓" : "Mark done"}</span>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Knee-to-wall L (cm)</Label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            onBlur={() => save()}
            placeholder="—"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Knee-to-wall R (cm)</Label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            onBlur={() => save()}
            placeholder="—"
            className="mt-1"
          />
        </div>
      </div>
      <p className="text-xs text-zinc-500">Lower is better (foot closer to wall while heel down).</p>
    </div>
  );
}
