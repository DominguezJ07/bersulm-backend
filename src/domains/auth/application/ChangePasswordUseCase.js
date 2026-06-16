export class ChangePasswordUseCase {
  constructor(userRepository, bcryptService) {
    this.userRepository = userRepository;
    this.bcryptService = bcryptService;
  }

  async execute({ userId, currentPassword, newPassword }) {
    if (newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const isValid = await this.bcryptService.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('La contraseña actual es incorrecta');
    }

    const hashed = await this.bcryptService.hash(newPassword);
    await this.userRepository.updatePassword(userId, hashed);
    return { message: 'Contraseña actualizada correctamente' };
  }
}
