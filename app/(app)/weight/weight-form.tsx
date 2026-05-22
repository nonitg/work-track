"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WeightForm({ initial }: { initial: number | null }) {
  const router = useRouter();
  const [value, setValue] = useState<string>(initial != null ? String(initial) : "");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0 || n > 400) {
      setErr("Enter a valid weight in kg");
      return;
    }
    setErr(null);
    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight_kg: n }),
    });
    if (!res.ok) {
      setErr("Save failed");
      return;
    }
    start(() => router.refresh());
  }

  return (
    <div className="mt-3 flex gap-2">
      <Input
        type="number"
        inputMode="decimal"
        step="0.1"
        placeholder="kg"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1"
      />
      <Button onClick={save} disabled={pending}>Save</Button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
