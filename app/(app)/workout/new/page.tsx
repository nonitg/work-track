import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { getTemplates } from "@/lib/queries";
import { StartWorkoutButton } from "./start-workout-button";

export const dynamic = "force-dynamic";

export default async function NewWorkoutPage() {
  const templates = await getTemplates();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Start workout</h1>
        <p className="text-sm text-zinc-500">Pick a template. Sets are prefilled from last session.</p>
      </header>
      <div className="grid gap-3">
        {templates.map((t) => (
          <Card key={t.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-zinc-500">{t.day_label}</div>
            </div>
            <StartWorkoutButton templateId={t.id} />
          </Card>
        ))}
        <Card className="flex items-center justify-between">
          <div>
            <div className="font-medium">Freestyle</div>
            <div className="text-xs text-zinc-500">No template, add exercises ad hoc</div>
          </div>
          <StartWorkoutButton templateId={null} />
        </Card>
      </div>
      <div className="flex justify-center">
        <Link href="/history" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          View history →
        </Link>
      </div>
    </div>
  );
}
