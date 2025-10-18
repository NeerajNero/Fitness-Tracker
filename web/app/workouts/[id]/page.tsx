// web/src/app/workouts/[id]/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Workout } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";
import { Pencil, Trash2, Calendar, Dumbbell } from "lucide-react";

// --- Data Fetching Functions ---
const fetchWorkout = async (id: string): Promise<Workout> => {
  const { data } = await api.get(`/workouts/${id}`);
  return data;
};

const deleteWorkout = async (id: string) => {
  const { data } = await api.delete(`/workouts/${id}`);
  return data;
};

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const id = typeof params.id === "string" ? params.id : "";

  // Check for auth
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Query to get the workout
  const { data: workout, isLoading } = useQuery({
    queryKey: ["workout", id],
    queryFn: () => fetchWorkout(id),
    enabled: !!id && !!user, // Only run if we have an ID and user
  });

  // Mutation to delete the workout
  const deleteMutation = useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => {
      // Refetch the main workouts list
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      // Go back to the dashboard
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Failed to delete workout:", error);
    },
  });

  if (isLoading || isAuthLoading) {
    return <div className="container p-8">Loading workout details...</div>;
  }

  if (!workout) {
    return <div className="container p-8">Workout not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{workout.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                {new Date(workout.date).toLocaleDateString("en-US", {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </CardDescription>
            </div>
            {/* --- Action Buttons --- */}
            <div className="flex gap-2">
              <Button asChild variant="outline" size="icon">
                <Link href={`/workouts/edit/${workout.id}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      workout and all its associated exercises.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(workout.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Exercises
          </h3>
          <ul className="list-disc list-inside space-y-2">
            {workout.exercises.map((ex) => (
              <li key={ex.id}>
                <span className="font-semibold">{ex.name}:</span> {ex.sets} sets
                of {ex.reps} reps @ {ex.weight}kg
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}