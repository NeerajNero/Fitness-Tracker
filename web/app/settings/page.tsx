"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "@/lib/axios";
import { UserGoals } from "@/types";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // ✅ 1. Import toast from sonner

// --- API Functions ---
const fetchGoals = async (): Promise<UserGoals> => {
  const { data } = await api.get("/nutrition/goals");
  return data;
};

const updateGoals = async (newGoals: UserGoals) => {
  const { data } = await api.patch("/nutrition/goals", newGoals);
  return data;
};
// --- End API Functions ---

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // 2. We no longer need the useToast hook
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const { register, handleSubmit, reset } = useForm<UserGoals>();

  // Auth check
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Query to get current goals
  const { data: goals, isLoading: isGoalsLoading } = useQuery<UserGoals>({
    queryKey: ["goals"],
    queryFn: fetchGoals,
    enabled: !!user,
  });

  // Effect to populate form when goals are loaded
  useEffect(() => {
    if (goals) {
      reset(goals);
    }
  }, [goals, reset]);

  // Mutation to update goals
  const mutation = useMutation({
    mutationFn: updateGoals,
    onSuccess: (updatedGoals) => {
      queryClient.setQueryData(["goals"], updatedGoals);
      // ✅ 3. Call toast.success()
      toast.success("Goals Saved!", {
        description: "Your nutrition goals have been updated.",
      });
    },
    onError: (error) => {
      // ✅ 4. Call toast.error()
      toast.error("Error", {
        description: "Could not save goals. Please try again.",
      });
    },
  });

  const onSubmit = (formData: UserGoals) => {
    const processedData = {
      calorieGoal: Number(formData.calorieGoal),
      proteinGoal: Number(formData.proteinGoal),
    };
    mutation.mutate(processedData);
  };

  if (isAuthLoading || isGoalsLoading) {
    return <div className="container p-8">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your personal settings and goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-lg font-medium">Nutrition Goals</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calorieGoal">Daily Calorie Goal (kcal)</Label>
                <Input
                  id="calorieGoal"
                  type="number"
                  {...register("calorieGoal")}
                  placeholder="e.g., 2000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proteinGoal">Daily Protein Goal (g)</Label>
                <Input
                  id="proteinGoal"
                  type="number"
                  {...register("proteinGoal")}
                  placeholder="e.g., 150"
                />
              </div>
            </div>
            
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Goals"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}