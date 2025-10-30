// api/src/nutrition/nutrition.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  NutritionService,
  CreateFoodDto,
  LogMealDto,
  UpdateGoalsDto,
} from './nutrition.service';

import  {NutritionStatsDto}  from './dto/nutrition-stats.dto';

@UseGuards(AuthGuard('jwt')) // Protect all routes in this controller
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  // --- ADD THIS NEW ROUTE ---
  @Get('stats/summary')
  getDailySummary(@Request() req, @Query() dto: NutritionStatsDto) {
    // Set default date range (e.g., last 7 days)
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();
    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : new Date(new Date().setDate(endDate.getDate() - 6)); // 7 days ago

    // Set time to start and end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return this.nutritionService.getDailySummary(
      req.user.id,
      startDate,
      endDate,
    );
  }

  // --- Goals ---
  @Get('goals')
  getGoals(@Request() req) {
    return this.nutritionService.getGoals(req.user.id);
  }

  @Patch('goals')
  updateGoals(@Request() req, @Body() dto: UpdateGoalsDto) {
    return this.nutritionService.updateGoals(req.user.id, dto);
  }

  // --- Food Database ---
  @Post('food')
  createFood(@Request() req, @Body() dto: CreateFoodDto) {
    return this.nutritionService.createFood(req.user.id, dto);
  }

  @Get('food')
  searchFood(@Request() req, @Query('q') query: string) {
    return this.nutritionService.searchFood(req.user.id, query || '');
  }

  // --- Meal Logging ---
  @Post('meal')
  logMeal(@Request() req, @Body() dto: LogMealDto) {
    return this.nutritionService.logMeal(req.user.id, dto);
  }

  @Get('log')
  getDailyLog(@Request() req, @Query('date') date: string) {
    const logDate = date ? new Date(date) : new Date();
    return this.nutritionService.getDailyLog(req.user.id, logDate);
  }
}