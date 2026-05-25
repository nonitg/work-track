"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function StartWorkoutButton({ templateId, date }: { templateId: number | null; date?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  async function go() {
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: templateId, date }),
    });
    if (!res.ok) return;
    const j = await res.json();
    start(() => router.push(`/workout/${j.id}`));
  }
  return (
    <Button onClick={go} disabled={pending}>
      Start
    </Button>
  );
}
