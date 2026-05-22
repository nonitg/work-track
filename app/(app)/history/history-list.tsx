"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { fmtDate } from "@/lib/utils";

export type HistoryEvent =
  | { date: string; kind: "workout"; id: number; name: string; sub?: string | null }
  | { date: string; kind: "weight"; weight_kg: number }
  | { date: string; kind: "cardio"; id: number; type: string; duration_min: number }
  | {
      date: string;
      kind: "mobility";
      done: boolean;
      left: number | null;
      right: number | null;
    };

type EventKey = string;

function keyOf(e: HistoryEvent): EventKey {
  if (e.kind === "workout") return `w:${e.id}`;
  if (e.kind === "cardio") return `c:${e.id}`;
  if (e.kind === "weight") return `bw:${e.date}`;
  return `m:${e.date}`;
}

export function HistoryList({ initialDates, initialByDate }: {
  initialDates: string[];
  initialByDate: Record<string, HistoryEvent[]>;
}) {
  const router = useRouter();
  const [byDate, setByDate] = useState<Record<string, HistoryEvent[]>>(initialByDate);
  const [dates, setDates] = useState<string[]>(initialDates);
  const [, start] = useTransition();
  const [confirming, setConfirming] = useState<EventKey | null>(null);

  async function remove(e: HistoryEvent) {
    const k = keyOf(e);
    const nextByDate = { ...byDate };
    nextByDate[e.date] = (nextByDate[e.date] ?? []).filter((x) => keyOf(x) !== k);
    let nextDates = dates;
    if (nextByDate[e.date].length === 0) {
      delete nextByDate[e.date];
      nextDates = dates.filter((d) => d !== e.date);
    }
    setByDate(nextByDate);
    setDates(nextDates);
    setConfirming(null);

    let url = "";
    if (e.kind === "workout") url = `/api/workouts/${e.id}`;
    else if (e.kind === "cardio") url = `/api/cardio/${e.id}`;
    else if (e.kind === "weight") url = `/api/weight/${e.date}`;
    else url = `/api/mobility/${e.date}`;

    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      router.refresh();
      return;
    }
    start(() => router.refresh());
  }

  if (dates.length === 0) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">Nothing logged yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {dates.map((d) => (
        <Card key={d}>
          <CardTitle>{fmtDate(d)}</CardTitle>
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {byDate[d].map((e) => {
              const k = keyOf(e);
              return (
                <li key={k} className="py-2">
                  <EventRow
                    event={e}
                    confirming={confirming === k}
                    onAskDelete={() => setConfirming(k)}
                    onCancel={() => setConfirming(null)}
                    onConfirm={() => remove(e)}
                  />
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
    </div>
  );
}

function EventRow({
  event,
  confirming,
  onAskDelete,
  onCancel,
  onConfirm,
}: {
  event: HistoryEvent;
  confirming: boolean;
  onAskDelete: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const label =
    event.kind === "workout"
      ? "Workout"
      : event.kind === "cardio"
        ? "Cardio"
        : event.kind === "weight"
          ? "Weight"
          : "Mobility";

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <Body event={event} />
      </div>
      {confirming ? (
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-2 py-1 text-white hover:bg-red-700"
            aria-label={`Confirm delete ${label}`}
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={onAskDelete}
          className="text-zinc-400 hover:text-red-600"
          aria-label={`Delete ${label}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

function Body({ event }: { event: HistoryEvent }) {
  const tag = (
    <span className="mr-2 inline-block w-16 text-xs uppercase tracking-wide text-zinc-400">
      {event.kind === "workout"
        ? "Workout"
        : event.kind === "cardio"
          ? "Cardio"
          : event.kind === "weight"
            ? "Weight"
            : "Mobility"}
    </span>
  );
  switch (event.kind) {
    case "workout":
      return (
        <Link href={`/workout/${event.id}`} className="block text-sm">
          {tag}
          <span className="font-medium">{event.name}</span>
          {event.sub && <span className="ml-2 text-xs text-zinc-500">{event.sub}</span>}
        </Link>
      );
    case "cardio":
      return (
        <div className="text-sm">
          {tag}
          <span className="font-medium">{event.type}</span>
          <span className="ml-2 text-xs text-zinc-500 tabular-nums">{event.duration_min} min</span>
        </div>
      );
    case "weight":
      return (
        <div className="text-sm">
          {tag}
          <span className="font-medium tabular-nums">{event.weight_kg.toFixed(1)} kg</span>
        </div>
      );
    case "mobility":
      return (
        <div className="text-sm">
          {tag}
          <span className="font-medium">{event.done ? "Daily done" : "Logged"}</span>
          {(event.left != null || event.right != null) && (
            <span className="ml-2 text-xs text-zinc-500 tabular-nums">
              KTW L {event.left ?? "—"} / R {event.right ?? "—"}
            </span>
          )}
        </div>
      );
  }
}
