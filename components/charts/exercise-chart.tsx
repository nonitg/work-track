"use client";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, ChartTooltip, chartAxis, chartGrid } from "./chart-style";

export type ExercisePoint = { date: string; e1rm: number | null; topSet: number | null };

export function ExerciseChart({ data }: { data: ExercisePoint[] }) {
  if (!data.length) {
    return <p className="text-sm text-zinc-500">No data yet. Log a set to see progress.</p>;
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          {chartGrid()}
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => v.slice(5).replace("-", "/")}
            interval="preserveStartEnd"
            minTickGap={20}
            {...chartAxis()}
          />
          <YAxis width={36} {...chartAxis()} />
          <Tooltip
            cursor={{ stroke: CHART_COLORS.axis, strokeDasharray: "3 3" }}
            content={
              <ChartTooltip
                format={(v) => `${typeof v === "number" ? v.toFixed(1) : v} kg`}
                nameMap={{ e1rm: "e1RM", topSet: "Top set" }}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="topSet"
            stroke={CHART_COLORS.muted}
            strokeWidth={1.5}
            dot={{ r: 2, strokeWidth: 0, fill: CHART_COLORS.muted }}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-tooltip-bg)", fill: CHART_COLORS.muted }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="e1rm"
            stroke={CHART_COLORS.primary}
            strokeWidth={2.25}
            dot={{ r: 2, strokeWidth: 0, fill: CHART_COLORS.primary }}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-tooltip-bg)", fill: CHART_COLORS.primary }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
