import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { LoginUseCase } from '../../src/domains/auth/application/LoginUseCase.js';
import { InvalidCredentials } from '../../src/domains/auth/domain/AuthErrors.js';

const mockUserRepository = {
  findByEmail: jest.fn()
};

const mockTokenService = {
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn()
};

const mockBcryptService = {
  compare: jest.fn(),
  hash: jest.fn()
};

describe('LoginUseCase', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(mockUserRepository, mockTokenService, mockBcryptService);
  });

  it('should throw InvalidCredentials when user not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    await expect(useCase.execute({ email: 'test@test.com', password: '123456' })).rejects.toThrow(InvalidCredentials);
  });

  it('should throw InvalidCredentials when password is wrong', async () => {
    const hash = await bcrypt.hash('correct_password', 4);
    mockUserRepository.findByEmail.mockResolvedValue({
      _id: '123',
      email: 'test@test.com',
      passwordHash: hash,
      role: 'client'
    });
    mockBcryptService.compare.mockResolvedValue(false);
    await expect(useCase.execute({ email: 'test@test.com', password: 'wrong_password' })).rejects.toThrow(
      InvalidCredentials
    );
    expect(mockBcryptService.compare).toHaveBeenCalledWith('wrong_password', hash);
  });

  it('should return user and token on successful login', async () => {
    const hash = await bcrypt.hash('correct_password', 4);
    const mockUser = {
      _id: '123',
      email: 'test@test.com',
      passwordHash: hash,
      role: 'client',
      toString: () => '123'
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockBcryptService.compare.mockResolvedValue(true);
    mockTokenService.generateAccessToken.mockReturnValue('access_token');
    mockTokenService.generateRefreshToken.mockReturnValue('refresh_token');

    const result = await useCase.execute({ email: 'test@test.com', password: 'correct_password' });

    expect(result.user).toBe(mockUser);
    expect(result.token).toBe('access_token');
    expect(result.refreshToken).toBe('refresh_token');
    expect(mockBcryptService.compare).toHaveBeenCalledWith('correct_password', hash);
  });
});
