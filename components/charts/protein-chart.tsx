"use client";
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, ChartTooltip, chartAxis, chartGrid } from "./chart-style";

export type ProteinPoint = { date: string; protein: number | null };

export function ProteinChart({ data, target = 100 }: { data: ProteinPoint[]; target?: number }) {
  const hasAny = data.some((d) => d.protein != null);
  if (!hasAny) {
    return <p className="text-sm text-zinc-500">No nutrition logged in this window.</p>;
  }
  const maxLogged = data.reduce((m, d) => (d.protein != null && d.protein > m ? d.protein : m), 0);
  const yMax = Math.max(target + 20, Math.ceil((maxLogged + 10) / 10) * 10);
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barCategoryGap="22%">
          {chartGrid()}
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => v.slice(5).replace("-", "/")}
            interval="preserveStartEnd"
            minTickGap={16}
            {...chartAxis()}
          />
          <YAxis width={36} domain={[0, yMax]} {...chartAxis()} />
          <Tooltip
            cursor={{ fill: "rgba(161,161,170,0.08)" }}
            content={
              <ChartTooltip
                format={(v) => (v == null ? "—" : `${typeof v === "number" ? Math.round(v) : v} g`)}
                labelKey="Protein"
              />
            }
          />
          <ReferenceLine
            y={target}
            stroke={CHART_COLORS.good}
            strokeDasharray="4 4"
            strokeOpacity={0.7}
            label={{ value: `${target}g`, position: "insideTopRight", fill: CHART_COLORS.good, fontSize: 10 }}
          />
          <Bar dataKey="protein" radius={[6, 6, 0, 0]} maxBarSize={26} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={
                  d.protein == null
                    ? "transparent"
                    : d.protein >= target
                      ? CHART_COLORS.good
                      : CHART_COLORS.muted
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
