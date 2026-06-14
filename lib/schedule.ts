// Single source of truth for the weekly training split.
// Each calendar day maps to one scheduled template (or none for rest/cardio
// days). Both the Plan page and the home "Today's workout" card read from here
// so the day → workout mapping can never drift between them.

export type ScheduleKind = "lift" | "cardio" | "rest";

export type ScheduleEntry = {
  dow: number; // day of week, 0 = Sunday .. 6 = Saturday
  day: string;
  plan: string;
  templateId: number | null;
  kind: ScheduleKind;
};

// Displayed in Monday-first order on the Plan page.
export const WEEKLY_SCHEDULE: ScheduleEntry[] = [
  { dow: 1, day: "Monday", plan: "Lower A: squat strength", templateId: 1, kind: "lift" },
  { dow: 2, day: "Tuesday", plan: "Upper A: bench/row strength", templateId: 2, kind: "lift" },
  { dow: 3, day: "Wednesday", plan: "Hiking prep / cardio", templateId: null, kind: "cardio" },
  { dow: 4, day: "Thursday", plan: "Lower B: hinge + unilateral legs + knees", templateId: 3, kind: "lift" },
  { dow: 5, day: "Friday", plan: "Upper B: shoulders/back/arms/carries", templateId: 4, kind: "lift" },
  { dow: 6, day: "Saturday", plan: "Optional long walk, easy hike, sport, or rest", templateId: null, kind: "cardio" },
  { dow: 0, day: "Sunday", plan: "Rest + calf mobility", templateId: null, kind: "rest" },
];

// Day-of-week for a local "YYYY-MM-DD" string, parsed in local time to match
// how todayISO()/isoDaysAgo() build their dates.
export function dowOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function scheduleForDate(iso: string): ScheduleEntry {
  const dow = dowOf(iso);
  // The schedule covers all 7 weekdays, so a match always exists.
  return WEEKLY_SCHEDULE.find((e) => e.dow === dow) ?? WEEKLY_SCHEDULE[WEEKLY_SCHEDULE.length - 1];
}
