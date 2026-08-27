import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, FoodItem } from "../api/client";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddEntry() {
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState("breakfast");
  const [date, setDate] = useState(todayStr());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: foods } = useQuery<FoodItem[]>({
    queryKey: ["foods", search],
    queryFn: async () => {
      const res = await api.get("/nutrition/foods/", { params: { search } });
      return res.data.results ?? res.data;
    },
  });

  const createFoodMutation = useMutation({
    mutationFn: async (food: Partial<FoodItem>) => {
      const res = await api.post("/nutrition/foods/", food);
      return res.data as FoodItem;
    },
    onSuccess: (food) => setSelectedFood(food),
  });

  const logEntryMutation = useMutation({
    mutationFn: async () => {
      return api.post("/nutrition/entries/", {
        food_item: selectedFood!.id,
        servings,
        meal_type: mealType,
        date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-summary"] });
      navigate("/");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (selectedFood) logEntryMutation.mutate();
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Log food</h1>

      {!selectedFood ? (
        <div className="space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Search food…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="bg-white rounded-xl shadow divide-y max-h-64 overflow-auto">
            {foods?.map((food) => (
              <button
                key={food.id}
                onClick={() => setSelectedFood(food)}
                className="w-full text-left p-3 hover:bg-gray-50 flex justify-between"
              >
                <span>{food.name}</span>
                <span className="text-gray-400 text-sm">{food.calories} kcal</span>
              </button>
            ))}
          </div>
          <details className="bg-white rounded-xl shadow p-4">
            <summary className="cursor-pointer font-medium">Can't find it? Add a new food</summary>
            <NewFoodForm onCreate={(f) => createFoodMutation.mutate(f)} />
          </details>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-5 space-y-4">
          <p className="font-medium">{selectedFood.name}</p>
          <label className="block text-sm">
            Servings
            <input
              type="number"
              step="0.1"
              min="0.1"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={servings}
              onChange={(e) => setServings(parseFloat(e.target.value))}
            />
          </label>
          <label className="block text-sm">
            Meal
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </label>
          <label className="block text-sm">
            Date
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setSelectedFood(null)} className="flex-1 border rounded-lg py-2">
              Back
            </button>
            <button type="submit" className="flex-1 bg-emerald-600 text-white rounded-lg py-2 font-medium">
              Log it
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function NewFoodForm({ onCreate }: { onCreate: (f: Partial<FoodItem>) => void }) {
  const [form, setForm] = useState({
    name: "", serving_size: "100g", calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0,
  });

  return (
    <div className="mt-3 space-y-2">
      <input className="w-full border rounded-lg px-3 py-2" placeholder="Name"
        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Calories"
          onChange={(e) => setForm({ ...form, calories: +e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="Serving size (e.g. 100g)"
          value={form.serving_size} onChange={(e) => setForm({ ...form, serving_size: e.target.value })} />
        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Protein (g)"
          onChange={(e) => setForm({ ...form, protein_g: +e.target.value })} />
        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Carbs (g)"
          onChange={(e) => setForm({ ...form, carbs_g: +e.target.value })} />
        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Fat (g)"
          onChange={(e) => setForm({ ...form, fat_g: +e.target.value })} />
      </div>
      <button
        type="button"
        onClick={() => onCreate(form)}
        className="w-full bg-gray-800 text-white rounded-lg py-2 text-sm"
      >
        Add food
      </button>
    </div>
  );
}
