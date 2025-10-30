import { IsDateString, IsOptional } from 'class-validator';

export class NutritionStatsDto {
  @IsDateString()
  @IsOptional()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate: string;
}