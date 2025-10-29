"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Food } from "@/types";
import { useState } from "react";

const createFood = async (newFood: Omit<Food, "id">) => {
  const { data } = await api.post("/nutrition/food", newFood);
  return data;
};

export function AddFoodDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const mutation = useMutation({
    mutationFn: createFood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      reset();
      setIsOpen(false);
    },
  });

  // ✅ THIS LINE WAS FIXED.
  // It was 'const onSubmit = (formData)Storage) => { ... }'
  const onSubmit = (formData: any) => {
    // Convert string inputs to numbers
    const processedData = {
      ...formData,
      calories: parseInt(formData.calories, 10),
      protein: parseInt(formData.protein, 10),
    };
    mutation.mutate(processedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Food</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Food to Database</DialogTitle>
          <DialogDescription>
            Add a new food item to your personal database.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" {...register("name")} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calories" className="text-right">Calories</Label>
              <Input id="calories" type="number" {...register("calories")} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="protein" className="text-right">Protein (g)</Label>
              <Input id="protein" type="number" {...register("protein")} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="servingSize" className="text-right">Serving Size</Label>
              <Input id="servingSize" placeholder="e.g., 100g, 1 cup" {...register("servingSize")} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Food"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}