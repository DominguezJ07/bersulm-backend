import bcrypt from 'bcryptjs';
import { User } from '../domain/User.entity.js';
import { UserAlreadyExists } from '../domain/AuthErrors.js';

export class RegisterUseCase {
  /**
   * @param {import('../domain/IUserRepository').IUserRepository} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * @param {Object} userData
   * @param {string} userData.name
   * @param {string} userData.email
   * @param {string} userData.phone
   * @param {string} userData.password
   * @returns {Promise<User>}
   */
  async execute({ name, email, phone, password }) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExists();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = User.create({
      name,
      email,
      phone,
      passwordHash
    });

    return await this.userRepository.save(user);
  }
}
