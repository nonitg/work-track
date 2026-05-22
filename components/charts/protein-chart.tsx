"use client";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type ProteinPoint = { date: string; protein: number };

export function ProteinChart({ data, target = 100 }: { data: ProteinPoint[]; target?: number }) {
  if (!data.length) {
    return <p className="text-sm text-zinc-500">No nutrition data yet.</p>;
  }
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }}
            formatter={(v) => `${v} g`}
          />
          <ReferenceLine y={target} stroke="#10b981" strokeDasharray="4 4" />
          <Bar dataKey="protein" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <rect key={i} fill={d.protein >= target ? "#10b981" : "#a1a1aa"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
