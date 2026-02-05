import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Reservation,
  ReservationDocument,
  ReservationStatus,
} from './schemas/reservation.schema';
import {
  Event,
  EventDocument,
  EventStatus,
} from '../events/schemas/event.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import * as PDFDocument from 'pdfkit'; // Add this import

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  // User: Make a request
  async create(userId: string, createReservationDto: CreateReservationDto) {
    const { eventId } = createReservationDto;

    // 1. Check if event exists
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');

    // 2. Check strict rules
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Cannot book an unpublished event');
    }

    if (event.reservedPlaces >= event.capacity) {
      throw new ConflictException('Event is fully booked');
    }

    // 3. Check for existing reservation (PENDING or CONFIRMED)
    const existingReservation = await this.reservationModel.findOne({
      user: userId,
      event: eventId,
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    });

    if (existingReservation) {
      throw new ConflictException(
        'You already have an active reservation for this event',
      );
    }

    // 4. Create Reservation
    const reservation = new this.reservationModel({
      user: userId,
      event: eventId,
      status: ReservationStatus.PENDING, // Default status
    });

    return reservation.save();
  }

  // User: See my reservations
  async findMyReservations(userId: string) {
    return this.reservationModel
      .find({ user: userId })
      .populate('event', 'title date location') // Show event details
      .exec();
  }

  // Admin: See all reservations (optionally filtered by event)
  async findAll(eventId?: string) {
    const filter = eventId ? { event: eventId } : {};
    return this.reservationModel
      .find(filter)
      .populate('user', 'name email')
      .populate('event', 'title')
      .exec();
  }

  // Admin: Update Status (Confirm / Refuse)
  async update(id: number, updateReservationDto: UpdateReservationDto) {
    return `This action updates a #${id} reservation`;
  }

  // Admin: Remove reservation
  async remove(id: number) {
    return `This action removes a #${id} reservation`;
  }

  // Logic to generate PDF
  async generateTicket(reservationId: string, userId: string): Promise<Buffer> {
    const reservation = await this.reservationModel
      .findOne({ _id: reservationId, user: userId })
      .populate('event')
      .populate('user')
      .exec();

    if (!reservation) throw new NotFoundException('Reservation not found');
    
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Ticket is only available for CONFIRMED reservations');
    }

    const event: any = reservation.event;
    const user: any = reservation.user;

    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // PDF Content
      doc.fontSize(25).text('EVENT TICKET', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(18).text(`Event: ${event.title}`);
      doc.fontSize(14).text(`Date: ${new Date(event.date).toLocaleDateString()}`);
      doc.text(`Location: ${event.location}`);
      doc.moveDown();
      
      doc.text(`Attendee: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Reservation ID: ${reservation._id}`);
      
      doc.moveDown();
      doc.fontSize(10).text('Scan this at the entrance.', { align: 'center' });

      doc.end();
    });
  }
}
