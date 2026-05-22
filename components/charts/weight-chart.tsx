"use client";
import { Area, AreaChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, ChartTooltip, chartAxis, chartGrid } from "./chart-style";

export type WeightPoint = { date: string; weight: number | null; avg7: number | null };

export function WeightChart({ data }: { data: WeightPoint[] }) {
  if (!data.length) {
    return <p className="text-sm text-zinc-500">No weight data yet.</p>;
  }
  const weights = data.map((d) => d.weight).filter((v): v is number => v != null);
  const min = weights.length ? Math.floor(Math.min(...weights) - 0.8) : 50;
  const max = weights.length ? Math.ceil(Math.max(...weights) + 0.8) : 100;
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="wt-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.32} />
              <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            width={32}
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
          <Area
            type="monotone"
            dataKey="weight"
            stroke={CHART_COLORS.primary}
            strokeWidth={1.5}
            strokeOpacity={0.55}
            fill="url(#wt-fill)"
            connectNulls
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: CHART_COLORS.primary }}
          />
          <Line
            type="monotone"
            dataKey="avg7"
            stroke={CHART_COLORS.primary}
            strokeWidth={2.25}
            dot={false}
            connectNulls
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-tooltip-bg)", fill: CHART_COLORS.primary }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
