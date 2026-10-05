import { ValidationError, ForbiddenError } from '../../../shared/domain/DomainError.js';
import { RaffleAlreadyActive } from '../domain/RaffleErrors.js';

export class CreateRafflePrizeUseCase {
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  async execute(user, { name, description, images, raffleDate }) {
    if (!user || user.role !== 'admin') {
      throw new ForbiddenError('Admin privileges required');
    }
    if (!name || !name.trim()) {
      throw new ValidationError('El nombre del premio es requerido');
    }
    if (!Array.isArray(images) || images.length < 1 || images.length > 3) {
      throw new ValidationError('Debes agregar entre 1 y 3 imágenes del premio');
    }
    if (!raffleDate) {
      throw new ValidationError('raffleDate is required');
    }

    const current = await this.raffleRepository.findCurrent();
    if (current && current.status !== 'completed') {
      throw new RaffleAlreadyActive();
    }

    const identifier = `RAFFLE-${Date.now()}`;

    const raffleData = {
      month: identifier,
      status: 'active',
      raffleDate: new Date(raffleDate),
      participants: [],
      manualParticipants: [],
      prize: {
        name: name.trim(),
        description: description ? description.trim() : '',
        images
      },
      createdAt: new Date()
    };

    return await this.raffleRepository.create(raffleData);
  }
}
