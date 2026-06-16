import { ValidationError, UnauthorizedError } from '../../../shared/domain/DomainError.js';

export class ChangePasswordUseCase {
  constructor(userRepository, bcryptService) {
    this.userRepository = userRepository;
    this.bcryptService = bcryptService;
  }

  async execute({ userId, currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Ambas contraseñas son requeridas');
    }
    if (newPassword.length < 6) {
      throw new ValidationError('La nueva contraseña debe tener al menos 6 caracteres');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    const isValid = await this.bcryptService.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('La contraseña actual es incorrecta');
    }

    const hashedPassword = await this.bcryptService.hash(newPassword);
    await this.userRepository.updatePassword(userId, hashedPassword);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
