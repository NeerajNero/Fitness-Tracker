// web/src/components/WorkoutProgressChart.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { ExerciseProgress } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// API function
const fetchExerciseProgress = async (
  exerciseName: string
): Promise<ExerciseProgress[]> => {
  const { data } = await api.get(
    `/workouts/stats/progress?exerciseName=${encodeURIComponent(exerciseName)}`
  );
  return data;
};

// Function to format the date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export function WorkoutProgressChart() {
  const [exerciseName, setExerciseName] = useState("Bench Press");
  const [inputValue, setInputValue] = useState("Bench Press");

  const { data: chartData, isLoading } = useQuery({
    queryKey: ["exerciseProgress", exerciseName],
    queryFn: () => fetchExerciseProgress(exerciseName),
    enabled: !!exerciseName,
  });

  const handleSearch = () => {
    setExerciseName(inputValue);
  };

  // Format data for the chart
  const formattedData = chartData?.map((d) => ({
    ...d,
    date: formatDate(d.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Progress</CardTitle>
        <div className="flex gap-2 pt-2">
          <Input
            placeholder="Enter exercise name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#8884d8"
              name={`Weight (kg) - ${exerciseName}`}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}