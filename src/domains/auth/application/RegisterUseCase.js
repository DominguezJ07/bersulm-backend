import { User } from '../domain/User.entity.js';
import { UserAlreadyExists } from '../domain/AuthErrors.js';

export class RegisterUseCase {
  /**
   * @param {import('../domain/IUserRepository').IUserRepository} userRepository
   * @param {import('../../../shared/infrastructure/bcrypt/BcryptService.js').BcryptService} bcryptService
   */
  constructor(userRepository, bcryptService) {
    this.userRepository = userRepository;
    this.bcryptService = bcryptService;
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
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new UserAlreadyExists();
    }

    const passwordHash = await this.bcryptService.hash(password);

    const user = User.create({
      name,
      email: normalizedEmail,
      phone,
      passwordHash
    });

    return await this.userRepository.save(user);
  }
}
