import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getModelToken } from '@nestjs/mongoose';
import { Event, EventStatus } from './schemas/event.schema';
import { NotFoundException } from '@nestjs/common';

const mockEvent = {
  _id: 'eventId',
  title: 'Test Event',
  description: 'Desc',
  date: new Date(),
  location: 'Paris',
  capacity: 100,
  status: EventStatus.PUBLISHED,
};

describe('EventsService', () => {
  let service: EventsService;
  let model: any;

  const mockEventModel = {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    constructor: jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockEvent),
    })),
  };

  class MockModel {
    constructor(private data: any) {}
    save = jest.fn().mockResolvedValue(mockEvent);
    static find = jest.fn();
    static findById = jest.fn();
    static findByIdAndUpdate = jest.fn();
    static findByIdAndDelete = jest.fn();
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken(Event.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    model = module.get(getModelToken(Event.name));
  });

  describe('create', () => {
    it('should create an event', async () => {
      const result = await service.create(mockEvent as any);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findAllPublished', () => {
    it('should return published events', async () => {
      const exec = jest.fn().mockResolvedValue([mockEvent]);
      MockModel.find.mockReturnValue({ exec });

      const result = await service.findAllPublished();
      expect(result).toEqual([mockEvent]);
      expect(MockModel.find).toHaveBeenCalledWith({ status: EventStatus.PUBLISHED });
    });
  });

  describe('findOne', () => {
    it('should return an event if found', async () => {
      const exec = jest.fn().mockResolvedValue(mockEvent);
      MockModel.findById.mockReturnValue({ exec });

      const result = await service.findOne('eventId');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if not found', async () => {
      const exec = jest.fn().mockResolvedValue(null);
      MockModel.findById.mockReturnValue({ exec });

      await expect(service.findOne('eventId')).rejects.toThrow(NotFoundException);
    });
  });
});