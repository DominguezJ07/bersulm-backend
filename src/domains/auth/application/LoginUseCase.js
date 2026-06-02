import bcrypt from 'bcryptjs';
import JwtService from '../../../shared/infrastructure/jwt/JwtService.js';
import { InvalidCredentials } from '../domain/AuthErrors.js';

export class LoginUseCase {
  /**
   * @param {import('../domain/IUserRepository').IUserRepository} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @returns {Promise<{ user: import('../domain/User.entity').User, token: string }>}
   */
  async execute({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentials();
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentials();
    }

    const token = JwtService.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }
}
