import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Built-in JWT guard
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('events')
export class EventsController {

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard) // 1. Check Token, 2. Check Role
  @Roles(UserRole.ADMIN) // Only Admins can invoke this
  createEvent(@Body() createEventDto: any) {
    return "This action adds a new event (Admin only)";
  }
}