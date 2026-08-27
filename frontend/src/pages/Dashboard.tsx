import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, DailySummary } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const [date, setDate] = useState(todayStr());
  const { logout } = useAuth();

  const { data, isLoading } = useQuery<DailySummary>({
    queryKey: ["daily-summary", date],
    queryFn: async () => {
      const res = await api.get("/nutrition/entries/daily_summary/", {
        params: { date },
      });
      return res.data;
    },
  });

  const macroData = data
    ? [
        { name: "Protein", value: data.total_protein_g },
        { name: "Carbs", value: data.total_carbs_g },
        { name: "Fat", value: data.total_fat_g },
      ]
    : [];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nutrition Dashboard</h1>
        <div className="flex gap-3 items-center">
          <Link to="/add" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Log food
          </Link>
          <button onClick={logout} className="text-sm text-gray-500">Log out</button>
        </div>
      </header>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border rounded-lg px-3 py-2"
      />

      {isLoading && <p>Loading…</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 shadow">
              <p className="text-sm text-gray-500">Calories</p>
              <p className="text-3xl font-bold">
                {data.total_calories} <span className="text-base text-gray-400">/ {data.calorie_goal} kcal</span>
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (data.total_calories / data.calorie_goal) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow flex items-center justify-center">
              {macroData.some((m) => m.value > 0) ? (
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={macroData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={60}>
                      {macroData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm">No macros logged yet</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <MacroCard label="Protein" value={data.total_protein_g} goal={data.protein_goal_g} unit="g" />
            <MacroCard label="Carbs" value={data.total_carbs_g} goal={data.carbs_goal_g} unit="g" />
            <MacroCard label="Fat" value={data.total_fat_g} goal={data.fat_goal_g} unit="g" />
          </div>

          <div className="bg-white rounded-xl shadow divide-y">
            {data.entries.length === 0 && (
              <p className="p-5 text-gray-400 text-sm">No entries for this day yet.</p>
            )}
            {data.entries.map((entry) => (
              <div key={entry.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{entry.food_item_detail.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {entry.meal_type} · {entry.servings}× {entry.food_item_detail.serving_size}
                  </p>
                </div>
                <p className="font-semibold">{entry.calories} kcal</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MacroCard({ label, value, goal, unit }: { label: string; value: number; goal: number; unit: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}{unit}</p>
      <p className="text-xs text-gray-400">of {goal}{unit}</p>
    </div>
  );
}
