"use client";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, ChartTooltip, chartAxis, chartGrid } from "./chart-style";

export type WeightPoint = { date: string; weight: number | null; avg7: number | null };

export function WeightChart({ data }: { data: WeightPoint[] }) {
  const weights = data.map((d) => d.weight).filter((v): v is number => v != null);
  if (!weights.length) {
    return <p className="text-sm text-zinc-500">No weight logged in this window.</p>;
  }
  const min = Math.floor(Math.min(...weights) - 0.8);
  const max = Math.ceil(Math.max(...weights) + 0.8);
  return (
    <div className="h-56 w-full">
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
          <YAxis
            domain={[min, max]}
            width={36}
            tickFormatter={(v: number) => v.toFixed(0)}
            {...chartAxis()}
          />
          <Tooltip
            cursor={{ stroke: CHART_COLORS.axis, strokeDasharray: "3 3" }}
            content={
              <ChartTooltip
                format={(v) => `${typeof v === "number" ? v.toFixed(1) : v} kg`}
                nameMap={{ weight: "Daily", avg7: "7-day avg" }}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={CHART_COLORS.muted}
            strokeWidth={1.25}
            strokeOpacity={0.7}
            connectNulls={false}
            dot={{ r: 2.5, strokeWidth: 0, fill: CHART_COLORS.muted }}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-tooltip-bg)", fill: CHART_COLORS.muted }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="avg7"
            stroke={CHART_COLORS.primary}
            strokeWidth={2.25}
            dot={false}
            connectNulls
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-tooltip-bg)", fill: CHART_COLORS.primary }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
