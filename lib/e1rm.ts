export type SetRow = {
  weight_kg: number | null;
  reps: number | null;
};

// Epley
export function e1rm(weight: number | null | undefined, reps: number | null | undefined): number | null {
  if (!weight || !reps || reps <= 0) return null;
  if (reps > 12) return null;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function topSet(sets: SetRow[]): SetRow | null {
  let best: SetRow | null = null;
  let bestE = -Infinity;
  for (const s of sets) {
    const v = e1rm(s.weight_kg, s.reps);
    if (v != null && v > bestE) {
      bestE = v;
      best = s;
    }
  }
  return best;
}

export function maxE1RM(sets: SetRow[]): number | null {
  let best = -Infinity;
  for (const s of sets) {
    const v = e1rm(s.weight_kg, s.reps);
    if (v != null && v > best) best = v;
  }
  return Number.isFinite(best) ? best : null;
}

export function totalVolume(sets: SetRow[]): number {
  let v = 0;
  for (const s of sets) {
    if (s.weight_kg != null && s.reps != null) v += s.weight_kg * s.reps;
  }
  return v;
}
