export class UpdateAvatarUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ userId, buffer, mimetype }) {
    if (!buffer || buffer.length === 0) {
      throw new Error('No se recibió ninguna imagen');
    }

    // Verificar tamaño máximo — 2MB en Base64
    if (buffer.length > 2 * 1024 * 1024) {
      throw new Error('La imagen no puede superar 2MB');
    }

    // Convertir buffer a Base64 Data URL
    const base64 = buffer.toString('base64');
    const avatarDataUrl = `data:${mimetype};base64,${base64}`;

    // Guardar en MongoDB
    const updated = await this.userRepository.updateProfile(userId, { avatar: avatarDataUrl });

    const { passwordHash, ...userResponse } = updated;
    return userResponse;
  }
}
