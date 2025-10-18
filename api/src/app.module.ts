import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { NutritionModule } from './nutrition/nutrition.module';

@Module({
  imports: [PrismaModule, AuthModule, WorkoutsModule, NutritionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
