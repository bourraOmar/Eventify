import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Res 
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Response } from 'express';

@Controller('reservations')
@UseGuards(AuthGuard('jwt'), RolesGuard) 
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // Participant: Build a reservation request
  @Post()
  @Roles(UserRole.PARTICIPANT)
  create(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    @Request() req: any, 
    @Body() createReservationDto: CreateReservationDto
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return this.reservationsService.create(req.user.userId, createReservationDto);
  }

  // Participant: Get my history
  @Get('my')
  findMyReservations(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.reservationsService.findMyReservations(req.user.userId);
  }

  // Admin: Get all (can filter by ?eventId=...)
  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query('eventId') eventId?: string) {
    return this.reservationsService.findAll(eventId);
  }

  // Admin: Validate or Refuse
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() body: UpdateReservationStatusDto) {
    return this.reservationsService.updateStatus(id, body.status);
  }

  // Participant: Cancel own reservation
  @Delete(':id/cancel')
  @Roles(UserRole.PARTICIPANT)
  cancel(@Request() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.reservationsService.cancelMyReservation(req.user.userId, id);
  }

  // Participant: Download ticket
  @Get(':id/ticket')
  @Roles(UserRole.PARTICIPANT)
  async downloadTicket(
    @Request() req: any, 
    @Param('id') id: string,
    @Res() res: Response
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const buffer = await this.reservationsService.generateTicket(id, req.user.userId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
