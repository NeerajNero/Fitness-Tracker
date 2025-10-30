// web/src/app/nutrition/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { UserGoals, MealEntry, Food } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { AddFoodDialog } from "@/components/AddFoodDialog";
import { LogMealForm } from "@/components/LogMealForm"; // Import the new form

// --- API Functions ---
const fetchGoals = async (): Promise<UserGoals> => {
  const { data } = await api.get("/nutrition/goals");
  return data;
};

const fetchDailyLog = async (date: Date): Promise<MealEntry[]> => {
  const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  const { data } = await api.get(`/nutrition/log?date=${dateString}`);
  return data;
};
// --- End API Functions ---

export default function NutritionPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- Auth Check ---
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // --- Data Queries ---
  const { data: goals } = useQuery<UserGoals>({
    queryKey: ["goals"],
    queryFn: fetchGoals,
    enabled: !!user,
  });

  const { data: dailyLog, isLoading: isLogLoading } = useQuery<MealEntry[]>({
    queryKey: ["dailyLog", selectedDate.toDateString()],
    queryFn: () => fetchDailyLog(selectedDate),
    enabled: !!user,
  });

  // --- Calculations ---
  const totals = useMemo(() => {
    const totalCalories = dailyLog?.reduce((acc, entry) => acc + entry.calories, 0) || 0;
    const totalProtein = dailyLog?.reduce((acc, entry) => acc + entry.protein, 0) || 0;
    return { totalCalories, totalProtein };
  }, [dailyLog]);

  const calorieProgress = goals?.calorieGoal ? (totals.totalCalories / goals.calorieGoal) * 100 : 0;
  const proteinProgress = goals?.proteinGoal ? (totals.totalProtein / goals.proteinGoal) * 100 : 0;

  if (isAuthLoading || !user) {
    return <div className="container p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Nutrition Tracker</h1>
        <div className="flex gap-4">
          <DatePicker value={selectedDate} onChange={(date) => setSelectedDate(date || new Date())} />
          <AddFoodDialog />
        </div>
      </div>

      {/* --- Daily Summary --- */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Today's Summary</CardTitle>
          <CardDescription>
            Your progress towards your daily goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Calories</span>
              <span>{totals.totalCalories} / {goals?.calorieGoal || 2000} kcal</span>
            </div>
            <Progress value={calorieProgress} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Protein</span>
              <span>{totals.totalProtein} / {goals?.proteinGoal || 150} g</span>
            </div>
            <Progress value={proteinProgress} />
          </div>
        </CardContent>
      </Card>

      {/* --- Meal Logging Section --- */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Log a Meal</h2>
        <LogMealForm selectedDate={selectedDate} />
      </div>

      {/* --- Daily Log --- */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Today's Log</h2>
        <Card>
          <CardContent className="p-6">
            {isLogLoading ? <p>Loading log...</p> : (
              <ul className="space-y-4">
                {dailyLog?.map(entry => (
                  <li key={entry.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{entry.food.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {entry.quantity} {entry.food.servingSize} ({entry.mealType})
                      </p>
                    </div>
                    <div>
                      <p>{entry.calories} kcal</p>
                      <p className="text-sm text-muted-foreground">{entry.protein} g protein</p>
                    </div>
                  </li>
                ))}
                {dailyLog?.length === 0 && <p>No meals logged for this day.</p>}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}