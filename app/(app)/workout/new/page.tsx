import { Card } from "@/components/ui/card";
import { getTemplates, getWorkoutForDate } from "@/lib/queries";
import { todayISO } from "@/lib/utils";
import { StartWorkoutButton } from "./start-workout-button";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ date?: string }>;

export default async function NewWorkoutPage({ searchParams }: { searchParams: SearchParams }) {
  const templates = await getTemplates();
  const params = await searchParams;
  const selectedDate = params.date && params.date.length === 10 ? params.date : undefined;
  const lookupDate = selectedDate ?? todayISO();
  const existing = await getWorkoutForDate(lookupDate);

  // Label the action by what tapping it does to the day's single workout.
  function actionFor(templateId: number | null) {
    if (!existing) return "Start";
    return existing.templateId === templateId ? "Resume" : "Switch";
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Train</h1>
        <p className="text-sm text-zinc-500">
          {existing
            ? "Pick a template to switch today's workout to it. Still one workout per day — this replaces the current one in place."
            : "Pick a template. Sets are prefilled from last session."}
        </p>
      </header>
      <div className="grid gap-3">
        {templates.map((t) => {
          const current = existing?.templateId === t.id;
          return (
            <Card key={t.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.name}</span>
                  {current && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500">{t.day_label}</div>
              </div>
              <StartWorkoutButton templateId={t.id} date={selectedDate} label={actionFor(t.id)} />
            </Card>
          );
        })}
        <Card className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Freestyle</span>
              {existing && existing.templateId === null && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Current
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-500">No template</div>
          </div>
          <StartWorkoutButton templateId={null} date={selectedDate} label={actionFor(null)} />
        </Card>
      </div>
    </div>
  );
}
