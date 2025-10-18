import { Injectable,ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  // Service to create a new workout for a specific user
  async create(userId: string, createWorkoutDto: CreateWorkoutDto) {
    return this.prisma.workout.create({
      data: {
        userId: userId,
        name: createWorkoutDto.name,
        date: createWorkoutDto.date,
        exercises: {
          create: createWorkoutDto.exercises, // Prisma handles creating related exercises
        },
      },
    });
  }

  // Service to find all workouts for a specific user
  async findAllForUser(userId: string) {
    return this.prisma.workout.findMany({
      where: { userId },
      include: {
        exercises: true, // Also include the exercises for each workout
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  private async checkWorkoutOwnership(workoutId: string, userId: string) {
    const workout = await this.prisma.workout.findUnique({
      where: { id: workoutId },
    });
    if (!workout || workout.userId !== userId) {
      throw new ForbiddenException('Access to this resource is denied.');
    }
    return workout;
  }

  // --- ADD THIS NEW METHOD (Read Detail) ---
  async findOne(workoutId: string, userId: string) {
    await this.checkWorkoutOwnership(workoutId, userId);
    return this.prisma.workout.findUnique({
      where: { id: workoutId },
      include: { exercises: true },
    });
  }

  // --- ADD THIS NEW METHOD (Update) ---
  async update(
    workoutId: string,
    userId: string,
    updateWorkoutDto: CreateWorkoutDto, // We can reuse the Create DTO
  ) {
    await this.checkWorkoutOwnership(workoutId, userId);

    // This is a complex update. We need to delete old exercises and create new ones.
    // This is best done in a transaction.
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete all existing exercises for this workout
      await tx.exercise.deleteMany({
        where: { workoutId: workoutId },
      });

      // 2. Update the workout and create the new exercises
      const updatedWorkout = await tx.workout.update({
        where: { id: workoutId },
        data: {
          name: updateWorkoutDto.name,
          date: updateWorkoutDto.date,
          exercises: {
            create: updateWorkoutDto.exercises,
          },
        },
        include: { exercises: true },
      });
      return updatedWorkout;
    });
  }

  // --- ADD THIS NEW METHOD (Delete) ---
  async remove(workoutId: string, userId: string) {
    // 1. Check if the user owns this workout
    await this.checkWorkoutOwnership(workoutId, userId);

    // 2. Use a transaction to delete exercises and then the workout
    return this.prisma.$transaction(async (tx) => {
      // First, delete all child exercises linked to this workout
      await tx.exercise.deleteMany({
        where: { workoutId: workoutId },
      });

      // Second, now that children are gone, delete the parent workout
      const deletedWorkout = await tx.workout.delete({
        where: { id: workoutId },
      });

      return deletedWorkout;
    });
  }
}