// web/src/app/dashboard/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Workout } from "@/types";
import { NutritionSummaryChart } from "@/components/NutritionSummaryChart";
import { WorkoutProgressChart } from "@/components/WorkoutProgressChart";

// API function to fetch workouts
const fetchWorkouts = async (): Promise<Workout[]> => {
  const { data } = await api.get("/workouts");
  return data;
};

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Effect to handle redirection if user is not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  // Query to get the user's workout history
  const { data: workouts, isLoading: isWorkoutsLoading } = useQuery<Workout[]>({
    queryKey: ["workouts"],
    queryFn: fetchWorkouts,
    enabled: !!user, // Only run the query if the user is loaded
  });

  // Show a loading state while checking authentication
  if (isAuthLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* --- Page Header --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome back, {user.email}!</h1>
        <Button asChild>
          <Link href="/workouts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Workout
          </Link>
        </Button>
      </div>

      {/* --- Chart Grid --- */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <NutritionSummaryChart />
        <WorkoutProgressChart />
      </div>

      {/* --- Workout History --- */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Workout History</h2>
        {isWorkoutsLoading && <p>Loading workouts...</p>}
        <div className="space-y-4">
          {workouts && workouts?.length > 0 ? (
            workouts?.map((workout) => (
              <Link href={`/workouts/${workout.id}`} key={workout.id}>
                <Card className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle>{workout.name}</CardTitle>
                    <CardDescription>
                      {new Date(workout.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside">
                      {workout.exercises.map((ex) => (
                        <li key={ex.id}>
                          <span className="font-semibold">{ex.name}:</span>{" "}
                          {ex.sets} sets of {ex.reps} reps @ {ex.weight}kg
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            !isWorkoutsLoading && (
              <p>You haven't logged any workouts yet. Get started!</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}