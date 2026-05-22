"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NutritionForm({ initial }: { initial: { protein_g: number; kcal_estimate: number | null } }) {
  const router = useRouter();
  const [protein, setProtein] = useState<string>(String(initial.protein_g));
  const [kcal, setKcal] = useState<string>(initial.kcal_estimate ? String(initial.kcal_estimate) : "");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  async function save(deltaProtein?: number) {
    const newP =
      deltaProtein != null ? Math.max(0, (Number(protein) || 0) + deltaProtein) : Number(protein);
    const newK = kcal === "" ? null : Number(kcal);
    if (!Number.isFinite(newP) || newP < 0 || newP > 1000) {
      setErr("Invalid protein");
      return;
    }
    setErr(null);
    if (deltaProtein != null) setProtein(String(newP));
    const res = await fetch("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ protein_g: newP, kcal_estimate: newK }),
    });
    if (!res.ok) {
      setErr("Save failed");
      return;
    }
    start(() => router.refresh());
  }

  return (
    <div className="mt-3 space-y-3">
      <div>
        <Label>Protein (g)</Label>
        <div className="mt-1 flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => save(-10)}>−10</Button>
          <Input
            type="number"
            inputMode="numeric"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="flex-1 text-center text-lg"
          />
          <Button variant="outline" size="icon" onClick={() => save(10)}>+10</Button>
        </div>
      </div>
      <div>
        <Label>Estimated kcal (optional)</Label>
        <Input
          type="number"
          inputMode="numeric"
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
          placeholder="—"
          className="mt-1"
        />
      </div>
      <Button onClick={() => save()} disabled={pending} className="w-full">Save</Button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
