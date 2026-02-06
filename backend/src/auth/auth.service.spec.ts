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

describe('AuthService', () => {
  let service: AuthService;
  let model: any;

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
    model = module.get(getModelToken(User.name));
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null);
      jest.spyOn(model, 'create').mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register({
        name: 'Test',
        email: 'new@example.com',
        password: 'password',
        role: UserRole.PARTICIPANT,
      });

      expect(result).toEqual({ message: 'User registered successfully' });
      expect(model.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(mockUser);
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
      jest.spyOn(model, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toEqual('test_token');
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
