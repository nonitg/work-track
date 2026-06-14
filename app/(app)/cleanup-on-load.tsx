"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Fires the one-per-day cleanup once per browser session when the app opens,
// so leftover duplicate/empty workouts get swept up with no action needed.
// Idempotent server-side; refreshes the view only if something was removed.
export function CleanupOnLoad() {
  const router = useRouter();
  useEffect(() => {
    const KEY = "wt_cleanup_done";
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
    fetch("/api/workouts/cleanup", { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && j.removed > 0) router.refresh();
      })
      .catch(() => {
        // Best-effort: clear the flag so a later load can retry.
        sessionStorage.removeItem(KEY);
      });
  }, [router]);
  return null;
}
