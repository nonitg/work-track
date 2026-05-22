"use client";
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, ChartTooltip, chartAxis, chartGrid } from "./chart-style";

export type ProteinPoint = { date: string; protein: number };

export function ProteinChart({ data, target = 100 }: { data: ProteinPoint[]; target?: number }) {
  if (!data.length) {
    return <p className="text-sm text-zinc-500">No nutrition data yet.</p>;
  }
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }} barCategoryGap="22%">
          {chartGrid()}
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => v.slice(5).replace("-", "/")}
            interval="preserveStartEnd"
            minTickGap={16}
            {...chartAxis()}
          />
          <YAxis width={32} {...chartAxis()} />
          <Tooltip
            cursor={{ fill: "rgba(161,161,170,0.08)" }}
            content={<ChartTooltip format={(v) => `${typeof v === "number" ? Math.round(v) : v} g`} labelKey="Protein" />}
          />
          <ReferenceLine
            y={target}
            stroke={CHART_COLORS.good}
            strokeDasharray="4 4"
            strokeOpacity={0.7}
            label={{ value: `${target}g`, position: "insideTopRight", fill: CHART_COLORS.good, fontSize: 10 }}
          />
          <Bar dataKey="protein" radius={[6, 6, 0, 0]} maxBarSize={26}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.protein >= target ? CHART_COLORS.good : CHART_COLORS.muted} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
