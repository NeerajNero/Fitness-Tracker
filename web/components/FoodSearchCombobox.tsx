"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Food } from "@/types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// API function to search for foods
const searchFoods = async (query: string): Promise<Food[]> => {
  const { data } = await api.get(`/nutrition/food?q=${query}`);
  return data;
};

interface FoodSearchComboboxProps {
  selectedFood: Food | null;
  onSelectFood: (food: Food | null) => void;
}

export function FoodSearchCombobox({
  selectedFood,
  onSelectFood,
}: FoodSearchComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch search results
  const { data: foods, isLoading } = useQuery<Food[]>({
    queryKey: ["foods", searchQuery],
    queryFn: () => searchFoods(searchQuery),
    enabled: open, // Only fetch when the popover is open
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedFood
            ? selectedFood.name
            : "Select food..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search for a food..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No food found."}
            </CommandEmpty>
            <CommandGroup>
              {foods?.map((food) => (
                <CommandItem
                  key={food.id}
                  value={food.name}
                  onSelect={() => {
                    onSelectFood(food.id === selectedFood?.id ? null : food);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedFood?.id === food.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div>
                    <p>{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.calories} kcal, {food.protein}g protein ({food.servingSize})
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}