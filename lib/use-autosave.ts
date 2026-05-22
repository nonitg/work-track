"use client";
import { useEffect, useRef, useState } from "react";

type Status = "idle" | "saving" | "saved" | "error";

export function useAutosave<T>(
  value: T,
  save: (v: T) => Promise<void>,
  { delay = 500, equals = Object.is }: { delay?: number; equals?: (a: T, b: T) => boolean } = {},
) {
  const [status, setStatus] = useState<Status>("idle");
  const lastSaved = useRef<T>(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (equals(value, lastSaved.current)) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const v = value;
      setStatus("saving");
      const p = save(v);
      inFlight.current = p;
      try {
        await p;
        if (inFlight.current === p) {
          lastSaved.current = v;
          setStatus("saved");
          setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1500);
        }
      } catch {
        setStatus("error");
      }
    }, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, save, delay, equals]);

  return status;
}
