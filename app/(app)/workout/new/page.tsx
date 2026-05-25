import { Card } from "@/components/ui/card";
import { getTemplates } from "@/lib/queries";
import { StartWorkoutButton } from "./start-workout-button";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ date?: string }>;

export default async function NewWorkoutPage({ searchParams }: { searchParams: SearchParams }) {
  const templates = await getTemplates();
  const params = await searchParams;
  const selectedDate = params.date && params.date.length === 10 ? params.date : undefined;

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
            <StartWorkoutButton templateId={t.id} date={selectedDate} />
          </Card>
        ))}
        <Card className="flex items-center justify-between">
          <div>
            <div className="font-medium">Freestyle</div>
            <div className="text-xs text-zinc-500">No template</div>
          </div>
          <StartWorkoutButton templateId={null} date={selectedDate} />
        </Card>
      </div>
    </div>
  );
}
