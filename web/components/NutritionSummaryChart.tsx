// web/src/components/NutritionSummaryChart.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { DailySummary } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// API function
const fetchNutritionSummary = async (): Promise<DailySummary[]> => {
  const { data } = await api.get("/nutrition/stats/summary");
  return data;
};

// Function to format the date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export function NutritionSummaryChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["nutritionSummary"],
    queryFn: fetchNutritionSummary,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Summary (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex justify-center items-center">
            Loading chart...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const formattedData = chartData?.map((d) => ({
    ...d,
    date: formatDate(d.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Summary (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="calories"
              fill="#8884d8"
              name="Calories"
            />
            <Bar
              yAxisId="right"
              dataKey="protein"
              fill="#82ca9d"
              name="Protein (g)"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}