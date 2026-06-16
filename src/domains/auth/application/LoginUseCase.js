import { InvalidCredentials } from '../domain/AuthErrors.js';

export class LoginUseCase {
  constructor(userRepository, tokenService, bcryptService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.bcryptService = bcryptService;
  }

  async execute({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new InvalidCredentials();
    }

    const isPasswordValid = await this.bcryptService.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentials();
    }

    const token = this.tokenService.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    });

    return { user, token, refreshToken };
  }
}
