"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Food } from "@/types";
import { FoodSearchCombobox } from "./FoodSearchCombobox";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "./ui/card";

// API function
const logMeal = async (formData: any) => {
  const { data } = await api.post("/nutrition/meal", formData);
  return data;
};

interface LogMealFormProps {
  selectedDate: Date;
}

export function LogMealForm({ selectedDate }: LogMealFormProps) {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, reset } = useForm();

  const mutation = useMutation({
    mutationFn: logMeal,
    onSuccess: () => {
      // Invalidate the daily log query to refetch data
      queryClient.invalidateQueries({
        queryKey: ["dailyLog", selectedDate.toDateString()],
      });
      // Reset the form
      reset({ quantity: "", mealType: "Breakfast" });
      setSelectedFood(null);
    },
    onError: (error) => {
      console.error("Failed to log meal:", error);
    },
  });

  const onSubmit = (formData: any) => {
    if (!selectedFood) {
      alert("Please select a food.");
      return;
    }

    mutation.mutate({
      ...formData,
      foodId: selectedFood.id,
      quantity: parseFloat(formData.quantity),
      date: selectedDate,
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FoodSearchCombobox
              selectedFood={selectedFood}
              onSelectFood={setSelectedFood}
            />
            <Input
              type="number"
              step="0.1"
              placeholder="Quantity (e.g., 1.5)"
              {...register("quantity", { required: true })}
            />
          </div>
          <Controller
            name="mealType"
            control={control}
            defaultValue="Breakfast"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Logging Meal..." : "Log Meal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}