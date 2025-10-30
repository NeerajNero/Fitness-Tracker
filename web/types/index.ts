// web/src/types/index.ts
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface Workout {
  id: string;
  name: string;
  date: string; // Dates come as strings from JSON
  exercises: Exercise[];
}

export interface UserGoals {
  calorieGoal: number | null;
  proteinGoal: number | null;
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  servingSize: string;
}

export interface MealEntry {
  id: string;
  date: string;
  mealType: string;
  quantity: number;
  calories: number;
  protein: number;
  food: Food; // The full food object is included
}

export interface ExerciseProgress {
  date: string;
  weight: number;
}

// For the nutrition summary chart
export interface DailySummary {
  date: string;
  calories: number;
  protein: number;
}