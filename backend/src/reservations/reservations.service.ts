import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
import PDFDocument from 'pdfkit';
import { User } from '../users/schemas/user.schema';

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
  update(id: string, _updateReservationDto: any) {
    return { id, message: 'Update reserved' };
  }

  // Admin: Remove reservation
  remove(id: string) {
    return { id, message: 'Remove reserved' };
  }

  // Admin: Update Status (Confirm / Refuse)
  async updateStatus(id: string, status: ReservationStatus) {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('event');
    if (!reservation) throw new NotFoundException('Reservation not found');
    const event = reservation.event as unknown as EventDocument;

    if (
      status === ReservationStatus.CONFIRMED &&
      reservation.status !== ReservationStatus.CONFIRMED
    ) {
      if (event.reservedPlaces >= event.capacity) {
        throw new ConflictException('Event reached capacity, cannot confirm');
      }
      await this.eventModel.findByIdAndUpdate(event._id, {
        $inc: { reservedPlaces: 1 },
      });
    }

    if (
      status === ReservationStatus.CANCELED &&
      reservation.status === ReservationStatus.CONFIRMED
    ) {
      await this.eventModel.findByIdAndUpdate(event._id, {
        $inc: { reservedPlaces: -1 },
      });
    }

    reservation.status = status;
    return reservation.save();
  }

  // Participant: Cancel own reservation
  async cancelMyReservation(userId: string, reservationId: string) {
    const reservation = await this.reservationModel
      .findOne({
        _id: reservationId,
        user: userId,
      })
      .populate('event');

    if (!reservation) {
      throw new NotFoundException(
        'Reservation not found or does not belong to you',
      );
    }

    if (reservation.status === ReservationStatus.CANCELED) {
      throw new BadRequestException('Reservation is already canceled');
    }

    // If it was confirmed, decrement the event's reserved places
    if (reservation.status === ReservationStatus.CONFIRMED) {
      const event = reservation.event as unknown as EventDocument;
      await this.eventModel.findByIdAndUpdate(event._id, {
        $inc: { reservedPlaces: -1 },
      });
    }

    reservation.status = ReservationStatus.CANCELED;
    return reservation.save();
  }

  // Logic to generate PDF
  // Logic to generate PDF
  async generateTicket(reservationId: string, userId: string): Promise<Buffer> {
    const reservation = await this.reservationModel
      .findOne({ _id: reservationId, user: userId })
      .populate('event')
      .populate('user')
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Cast explicitly to check status
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if ((reservation as any).status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Ticket is only available for CONFIRMED reservations',
      );
    }

    const event = reservation.event as unknown as Event;
    const user = reservation.user as unknown as User;

    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A5', margin: 30 }); // A5 size is better for tickets
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers)); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // --- COLORS ---
      const primaryColor = '#3b82f6'; // Blue-500
      const secondaryColor = '#1e293b'; // Slate-800
      const white = '#ffffff';

      // --- BACKGROUND & BORDER ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(white);
      doc
        .lineWidth(10)
        .rect(0, 0, doc.page.width, doc.page.height)
        .stroke(primaryColor);

      // --- HEADER ---
      doc.rect(20, 20, doc.page.width - 40, 80).fill(primaryColor);

      doc
        .fillColor(white)
        .fontSize(26)
        .font('Helvetica-Bold')
        .text('EVENT TICKET', 0, 45, {
          align: 'center',
          width: doc.page.width,
        });

      // --- EVENT DETAILS ---
      const contentStartY = 130;
      doc.fillColor(secondaryColor).fontSize(20).font('Helvetica-Bold');
      doc.text(event.title, 40, contentStartY, { width: 340, align: 'center' });

      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').fillColor('#64748b'); // Slate-500
      doc.text(
        event.description ? event.description.substring(0, 100) + '...' : '',
        { align: 'center' },
      );

      // Separator
      doc.moveDown(1.5);
      doc
        .moveTo(40, doc.y)
        .lineTo(380, doc.y)
        .lineWidth(1)
        .strokeColor('#e2e8f0')
        .stroke();
      doc.moveDown(1.5);

      // --- INFO GRID ---
      const leftColX = 50;
      const rightColX = 220;
      const rowHeight = 35;
      let currentY = doc.y;

      // Helper to draw rows
      const drawRow = (label: string, value: string, y: number) => {
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#94a3b8')
          .text(label.toUpperCase(), leftColX, y);
        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor(secondaryColor)
          .text(value, leftColX, y + 15);
      };

      const drawRowRight = (label: string, value: string, y: number) => {
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#94a3b8')
          .text(label.toUpperCase(), rightColX, y);
        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor(secondaryColor)
          .text(value, rightColX, y + 15);
      };

      drawRow('Date', new Date(event.date).toLocaleDateString(), currentY);
      drawRowRight(
        'Time',
        new Date(event.date).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        currentY,
      );

      currentY += rowHeight + 10;
      drawRow('Location', event.location || 'Online', currentY);
      drawRowRight('Attendee', user.name, currentY);

      currentY += rowHeight + 10;
      drawRow(
        'Reservation ID',
        String(reservation._id).substring(0, 8).toUpperCase(),
        currentY,
      );

      doc.end();
    });
  }
}
