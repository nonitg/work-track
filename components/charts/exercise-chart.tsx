"use client";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type ExercisePoint = { date: string; e1rm: number | null; topSet: number | null };

export function ExerciseChart({ data }: { data: ExercisePoint[] }) {
  if (!data.length) {
    return <p className="text-sm text-zinc-500">No data yet. Log a set to see progress.</p>;
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }}
            formatter={(v, n) => [`${typeof v === "number" ? v.toFixed(1) : v} kg`, n === "e1rm" ? "e1RM" : "Top set"]}
          />
          <Line type="monotone" dataKey="topSet" stroke="#a1a1aa" strokeWidth={1.5} dot={{ r: 2 }} connectNulls />
          <Line type="monotone" dataKey="e1rm" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
