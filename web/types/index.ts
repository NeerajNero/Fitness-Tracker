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