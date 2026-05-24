"use client";

import { useRouter } from "next/navigation";

export function DateSelector({ date, today }: { date: string; today: string }) {
  const router = useRouter();
  const isToday = date === today;

  return (
    <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
      <input
        aria-label="Select dashboard date"
        type="date"
        value={date}
        max={today}
        onChange={(e) => {
          const nextDate = e.target.value;
          if (!nextDate) return;
          router.push(nextDate === today ? "/" : `/?date=${nextDate}`);
        }}
        className="rounded-md border border-transparent bg-transparent px-0 py-0 text-sm text-zinc-500 outline-none transition hover:border-zinc-300 focus:border-zinc-400 dark:hover:border-zinc-700"
      />
      {!isToday && (
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
        >
          Today
        </button>
      )}
    </div>
  );
}
