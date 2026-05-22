"use client";
import { CartesianGrid } from "recharts";

export const CHART_COLORS = {
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  axisText: "var(--chart-axis-text)",
  primary: "var(--chart-primary)",
  primarySoft: "var(--chart-primary-soft)",
  good: "var(--chart-good)",
  goodSoft: "var(--chart-good-soft)",
  muted: "var(--chart-muted)",
  mutedSoft: "var(--chart-muted-soft)",
} as const;

export function chartAxis() {
  return {
    tick: { fontSize: 11, fill: CHART_COLORS.axisText },
    stroke: CHART_COLORS.axis,
    tickLine: false,
    axisLine: false,
  } as const;
}

export function chartGrid() {
  return (
    <CartesianGrid
      stroke={CHART_COLORS.grid}
      strokeDasharray="3 3"
      vertical={false}
      strokeOpacity={0.7}
    />
  );
}

type TooltipPayloadItem = {
  value?: number | string;
  name?: string;
  dataKey?: string;
  color?: string;
};

export function ChartTooltip({
  active,
  payload,
  label,
  format,
  labelKey,
  nameMap,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  format?: (v: number | string | undefined, name?: string) => string;
  labelKey?: string;
  nameMap?: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  const valid = payload.filter((p) => p.value != null);
  if (!valid.length) return null;
  return (
    <div
      className="rounded-lg border px-2.5 py-1.5 shadow-sm"
      style={{
        background: "var(--chart-tooltip-bg)",
        borderColor: "var(--chart-tooltip-border)",
        color: "var(--chart-tooltip-text)",
        fontSize: 12,
      }}
    >
      {label && (
        <div className="mb-1 text-[10px] uppercase tracking-wide opacity-60">
          {formatLabel(label)}
        </div>
      )}
      {valid.map((p, i) => {
        const name = labelKey ?? nameMap?.[p.dataKey ?? p.name ?? ""] ?? p.name ?? "";
        const value = format ? format(p.value, p.dataKey ?? p.name) : String(p.value);
        return (
          <div key={i} className="flex items-center gap-2 tabular-nums">
            {p.color && (
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: p.color }}
              />
            )}
            {name && <span className="opacity-70">{name}</span>}
            <span className="font-medium">{value}</span>
          </div>
        );
      })}
    </div>
  );
}

function formatLabel(s: string) {
  // ISO date → "May 22"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00`);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return s;
}
