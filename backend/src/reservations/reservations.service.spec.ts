import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { getModelToken } from '@nestjs/mongoose';
import { Reservation, ReservationStatus } from './schemas/reservation.schema';
import { Event, EventStatus } from '../events/schemas/event.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockEvent = {
  _id: 'eventId',
  title: 'Test Event',
  capacity: 10,
  reservedPlaces: 0,
  status: EventStatus.PUBLISHED,
  save: jest.fn(),
};

const mockReservation = {
  _id: 'resId',
  user: 'userId',
  event: 'eventId',
  status: ReservationStatus.PENDING,
  save: jest.fn(),
};

describe('ReservationsService', () => {
  let service: ReservationsService;
  let eventModel: any;
  let reservationModel: any;

  const mockReservationModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    // Constructor mock
    constructor: jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockReservation),
    })),
  };

  // Class mock for "new this.reservationModel()"
  class MockResModel {
    constructor(public data: any) {}
    save = jest.fn().mockResolvedValue(mockReservation);
    static findOne = jest.fn();
    static find = jest.fn();
    static findById = jest.fn();
  }

  const mockEventModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getModelToken(Reservation.name),
          useValue: MockResModel,
        },
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    reservationModel = module.get(getModelToken(Reservation.name));
    eventModel = module.get(getModelToken(Event.name));
  });

  describe('create', () => {
    it('should create a reservation if rules are met', async () => {
      // Mock Event found and published
      eventModel.findById.mockResolvedValue(mockEvent);
      // Mock No existing reservation
      MockResModel.findOne.mockResolvedValue(null);

      const result = await service.create('userId', { eventId: 'eventId' });

      expect(result).toEqual(mockReservation);
      expect(eventModel.findById).toHaveBeenCalledWith('eventId');
    });

    it('should fail if event is full', async () => {
      eventModel.findById.mockResolvedValue({
        ...mockEvent,
        capacity: 10,
        reservedPlaces: 10,
      });

      await expect(
        service.create('userId', { eventId: 'eventId' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should fail if already reserved', async () => {
      eventModel.findById.mockResolvedValue(mockEvent);
      MockResModel.findOne.mockResolvedValue(mockReservation);

      await expect(
        service.create('userId', { eventId: 'eventId' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});