// api/src/workouts/workouts.controller.ts
import { Controller, Get, Post, Body, UseGuards, Request, Param, Patch, Delete } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @UseGuards(AuthGuard('jwt')) // 🔐 Protect this route!
  @Post()
  create(@Request() req, @Body() createWorkoutDto: CreateWorkoutDto) {
    const userId = req.user.id; // Get user ID from the validated JWT payload
    return this.workoutsService.create(userId, createWorkoutDto);
  }

  @UseGuards(AuthGuard('jwt')) // 🔐 Protect this route too!
  @Get()
  findAll(@Request() req) {
    const userId = req.user.id; // Get user ID
    return this.workoutsService.findAllForUser(userId);
  }

  // --- ADD THIS NEW ROUTE (Read Detail) ---
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.workoutsService.findOne(id, req.user.id);
  }

  // --- ADD THIS NEW ROUTE (Update) ---
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateWorkoutDto: CreateWorkoutDto,
  ) {
    return this.workoutsService.update(id, req.user.id, updateWorkoutDto);
  }

  // --- ADD THIS NEW ROUTE (Delete) ---
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.workoutsService.remove(id, req.user.id);
  }
}