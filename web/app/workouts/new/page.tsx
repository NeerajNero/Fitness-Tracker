// web/src/app/workouts/new/page.tsx
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form"; // Import Controller
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker"; // Import our new component

export default function NewWorkoutPage() {

  const postWorkout = async (newWorkout:any) => {
  const { data } = await api.post("/workouts", newWorkout);
  return data;
};

  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      date: new Date(),
      exercises: [{ name: "", sets: 3, reps: 10, weight: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  const mutation = useMutation({
    mutationFn: postWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      router.push("/dashboard");

    },
    onError: (error) => {
      console.error("Failed to create workout:", error);
    },
  });

  const onSubmit = (formData:any) => {
        mutation.mutate(formData);
  };

  return (
    <>
        <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Log a New Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Workout Name</Label>
              <Input id="name" placeholder="e.g., Chest Day" {...register("name")} />
            </div>

            {/* ✅ UPDATED DATE PICKER IMPLEMENTATION */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <Label>Exercises</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <Input placeholder="Exercise Name" {...register(`exercises.${index}.name`)} />
                  </div>
                  <Input type="number" placeholder="Sets" {...register(`exercises.${index}.sets`, { valueAsNumber: true })} />
                  <Input type="number" placeholder="Reps" {...register(`exercises.${index}.reps`, { valueAsNumber: true })} />
                  <Input type="number" placeholder="Weight (kg)" {...register(`exercises.${index}.weight`, { valueAsNumber: true })} />
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
              {mutation.isPending ? "Saving..." : "Save Workout"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  );
}