export class UpdateAvatarUseCase {
  constructor(userRepository, cloudinaryService) {
    this.userRepository = userRepository;
    this.cloudinaryService = cloudinaryService;
  }

  async execute({ userId, buffer, mimetype }) {
    if (!buffer || buffer.length === 0) {
      throw new Error('No se recibió ninguna imagen');
    }

    // Subir a Cloudinary en la carpeta avatars
    const avatarUrl = await this.cloudinaryService.uploadBuffer(buffer, 'bersulm/avatars', `user_${userId}`);

    // Actualizar el campo avatar del usuario
    const updated = await this.userRepository.updateProfile(userId, { avatar: avatarUrl });

    const { passwordHash, ...userResponse } = updated;
    return userResponse;
  }
}
