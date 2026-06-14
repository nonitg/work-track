import { NextResponse } from "next/server";
import { cleanupWorkouts } from "@/lib/queries";

// Protected by proxy.ts (requires the auth cookie). Collapses any leftover
// duplicate/empty workouts to one-per-day. Idempotent.
export async function POST() {
  try {
    const result = await cleanupWorkouts();
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "cleanup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
