export class CreateWorkoutDto {
  name: string;
  date: Date;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
}