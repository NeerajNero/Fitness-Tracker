// web/src/app/workouts/edit/[id]/page.tsx
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Workout } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

// --- Data Fetching Functions ---
const fetchWorkout = async (id: string): Promise<Workout> => {
  const { data } = await api.get(`/workouts/${id}`);
  return data;
};

const updateWorkout = async ({ id, formData }: { id: string, formData: any }) => {
  const { data } = await api.patch(`/workouts/${id}`, formData);
  return data;
};

export default function EditWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();

  const id = typeof params.id === "string" ? params.id : "";

  // 1. Set up the form
  const { register, control, handleSubmit, reset } = useForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  // 2. Fetch the existing workout data
  const { data: workout, isLoading: isQueryLoading } = useQuery({
    queryKey: ["workout", id],
    queryFn: () => fetchWorkout(id),
    enabled: !!id && !!user,
  });

  // 3. Populate the form once the data is loaded
  useEffect(() => {
    if (workout) {
      reset({
        ...workout,
        date: new Date(workout.date), // Ensure date is a Date object
      });
    }
  }, [workout, reset]);

  // 4. Set up the mutation to update the data
  const mutation = useMutation({
    mutationFn: updateWorkout,
    onSuccess: (data) => {
      // Invalidate queries to refetch new data
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["workout", id] });
      // Go back to the detail page
      router.push(`/workouts/${id}`);
    },
  });

  // 5. Handle form submission
  const onSubmit = (formData: any) => {
    mutation.mutate({ id, formData });
  };

  if (isQueryLoading || isAuthLoading) {
    return <div className="container p-8">Loading workout form...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
        </CardHeader>
        <CardContent>
          {/* This form is identical to your 'new workout' form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Workout Name</Label>
              <Input {...register("name")} />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="space-y-4">
              <Label>Exercises</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <Input {...register(`exercises.${index}.name`)} />
                  </div>
                  <Input type="number" {...register(`exercises.${index}.sets`)} />
                  <Input type="number" {...register(`exercises.${index}.reps`)} />
                  <Input type="number" {...register(`exercises.${index}.weight`)} />
                  <Button type="button" variant="destructive" onClick={() => remove(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ name: "", sets: 3, reps: 10, weight: 0 })}>
                Add Exercise
              </Button>
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}