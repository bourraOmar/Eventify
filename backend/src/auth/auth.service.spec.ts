import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole } from '../users/schemas/user.schema';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUser = {
  _id: 'someId',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  role: UserRole.PARTICIPANT,
};

import { Model } from 'mongoose';

describe('AuthService', () => {
  let service: AuthService;
  let model: Model<User>;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'test_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(model, 'create').mockResolvedValue(mockUser as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register({
        name: 'Test',
        email: 'new@example.com',
        password: 'password',
        role: UserRole.PARTICIPANT,
      });

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toEqual('test_token');
      expect(result.user).toEqual({
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(model.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(model, 'findOne').mockResolvedValue(mockUser as any);
      await expect(
        service.register({
          name: 'Test',
          email: 'test@example.com',
          password: 'password',
          role: UserRole.PARTICIPANT,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return a token if credentials are valid', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(model, 'findOne').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toEqual('test_token');
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(model, 'findOne').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
