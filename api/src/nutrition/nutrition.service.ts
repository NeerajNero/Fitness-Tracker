// api/src/nutrition/nutrition.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// --- DTOs (Data Transfer Objects) ---
// We'll define these inline for simplicity, but you should create DTO files
export class CreateFoodDto {
  name: string;
  calories: number;
  protein: number;
  servingSize: string;
}

export class LogMealDto {
  foodId: string;
  date: Date;
  mealType: string;
  quantity: number;
}

export class UpdateGoalsDto {
  calorieGoal?: number;
  proteinGoal?: number;
}
// --- End of DTOs ---

@Injectable()
export class NutritionService {
  constructor(private prisma: PrismaService) {}

  // --- Goal Management ---
  async getGoals(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { calorieGoal: true, proteinGoal: true },
    });
    return user;
  }

  async updateGoals(userId: string, dto: UpdateGoalsDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        calorieGoal: dto.calorieGoal,
        proteinGoal: dto.proteinGoal,
      },
      select: { calorieGoal: true, proteinGoal: true },
    });
  }

  // --- Food Database Management ---
  async createFood(userId: string, dto: CreateFoodDto) {
    return this.prisma.food.create({
      data: {
        ...dto,
        creatorId: userId,
      },
    });
  }

  async searchFood(userId: string, query: string) {
    // Returns foods created by the user that match the query
    return this.prisma.food.findMany({
      where: {
        creatorId: userId,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
  }

  // --- Meal Logging ---
  async logMeal(userId: string, dto: LogMealDto) {
    // 1. Get the food item to calculate calories/protein
    const food = await this.prisma.food.findUnique({
      where: { id: dto.foodId },
    });

    // 2. Authorization check
    if (!food || food.creatorId !== userId) {
      throw new ForbiddenException('Cannot log food you did not create.');
    }

    // 3. Create the meal entry
    return this.prisma.mealEntry.create({
      data: {
        userId: userId,
        foodId: dto.foodId,
        date: dto.date,
        mealType: dto.mealType,
        quantity: dto.quantity,
        // Calculate the nutrition for this entry
        calories: Math.round(food.calories * dto.quantity),
        protein: Math.round(food.protein * dto.quantity),
      },
    });
  }

  async getDailyLog(userId: string, date: Date) {
    // This requires a bit of date logic
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.mealEntry.findMany({
      where: {
        userId: userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        food: true, // Include the food details
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}