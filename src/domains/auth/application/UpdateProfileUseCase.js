export class UpdateProfileUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ userId, name, phone }) {
    if (!name || name.trim() === '') {
      throw new Error('El nombre es requerido');
    }
    const updated = await this.userRepository.updateProfile(userId, { name: name.trim(), phone: phone?.trim() || '' });
    const { passwordHash, ...userResponse } = updated;
    return userResponse;
  }
}
