// web/src/app/dashboard/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Exercise, Workout } from "@/types";

const fetchWorkouts = async () => {
  const { data } = await api.get("/workouts");
  return data;
};

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const { data: workouts, isLoading: isWorkoutsLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: fetchWorkouts,
    enabled: !!user, // Only run the query if the user is loaded
  });

  if (isAuthLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div> {/* Or a spinner component */}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 px-4 lg:flex-row flex-col gap-4">
        <h1 className="text-2xl font-bold">Welcome back, {user.email}!</h1>
        <Button asChild>
          <Link href="/workouts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Workout
          </Link>
        </Button>
      </div>

      {/* --- Placeholder Stats Cards --- */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Workouts</CardTitle>
            <CardDescription>All-time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{workouts?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Heaviest Lift</CardTitle>
            <CardDescription>Bench Press</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">100 kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next Goal</CardTitle>
            <CardDescription>Run 5k</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">In 3 days</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Workout History --- */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Workout History</h2>
        {isWorkoutsLoading && <p>Loading workouts...</p>}
        <div className="space-y-4">
          {workouts?.length > 0 ? (
            workouts.map((workout: Workout) => (
              <Link href={`/workouts/${workout.id}`} key={workout.id}>
              <Card key={workout.id} className="hover:shadow-lg transition-shadow my-2">
                <CardHeader>
                  <CardTitle>{workout.name}</CardTitle>
                  <CardDescription>
                    {new Date(workout.date).toLocaleDateString("en-US", {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="list-disc list-inside">
                    {workout.exercises.map((ex: Exercise) => (
                      <li key={ex.id}>
                        <span className="font-semibold">{ex.name}:</span> {ex.sets} sets of {ex.reps} reps @ {ex.weight}kg
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              </Link>
            ))
          ) : (
            <p>You haven't logged any workouts yet. Get started!</p>
          )}
        </div>
      </div>
    </div>
  );
}