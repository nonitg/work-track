"use client";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type WeightPoint = { date: string; weight: number | null; avg7: number | null };

export function WeightChart({ data }: { data: WeightPoint[] }) {
  if (!data.length) {
    return <p className="text-sm text-zinc-500">No weight data yet.</p>;
  }
  const weights = data.map((d) => d.weight).filter((v): v is number => v != null);
  const min = weights.length ? Math.min(...weights) - 1 : 50;
  const max = weights.length ? Math.max(...weights) + 1 : 100;
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3f3f46" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3f3f46" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <YAxis domain={[min, max]} tick={{ fontSize: 11 }} stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }}
            formatter={(v) => `${typeof v === "number" ? v.toFixed(1) : v} kg`}
          />
          <Area type="monotone" dataKey="weight" stroke="#3f3f46" strokeWidth={1.5} fill="url(#wt)" connectNulls dot={false} />
          <Line type="monotone" dataKey="avg7" stroke="#0ea5e9" strokeWidth={2} dot={false} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
