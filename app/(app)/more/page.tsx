import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { getExercises } from "@/lib/queries";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

export default async function MorePage() {
  const exercises = await getExercises();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">More</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/history">
          <Card className="cursor-pointer transition hover:border-zinc-300">History</Card>
        </Link>
        <Link href="/mobility">
          <Card className="cursor-pointer transition hover:border-zinc-300">Mobility</Card>
        </Link>
        <Link href="/cardio">
          <Card className="cursor-pointer transition hover:border-zinc-300">Cardio</Card>
        </Link>
      </div>

      <Card>
        <CardTitle>Exercises</CardTitle>
        <ul className="mt-3 max-h-96 space-y-1 overflow-y-auto">
          {exercises.map((e) => (
            <li key={e.id}>
              <Link
                href={`/exercise/${e.id}`}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <span>{e.name}</span>
                <span className="text-xs text-zinc-400">{e.category}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <LogoutButton />
    </div>
  );
}
