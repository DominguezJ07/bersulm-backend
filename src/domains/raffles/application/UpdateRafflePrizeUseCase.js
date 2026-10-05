import { ForbiddenError, ValidationError } from '../../../shared/domain/DomainError.js';
import { RaffleNotFound } from '../domain/RaffleErrors.js';

export class UpdateRafflePrizeUseCase {
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  async execute(user, raffleId, { name, description, images, raffleDate }) {
    if (!user || user.role !== 'admin') {
      throw new ForbiddenError('Admin privileges required');
    }

    const raffle = await this.raffleRepository.findById(raffleId);
    if (!raffle) {
      throw new RaffleNotFound();
    }

    if (images && (images.length < 1 || images.length > 3)) {
      throw new ValidationError('El premio debe tener entre 1 y 3 imágenes');
    }

    const updateData = {};
    if (name || description !== undefined || images) {
      updateData.prize = {
        name: name ? name.trim() : raffle.prize.name,
        description: description !== undefined ? description.trim() : raffle.prize.description,
        images: images && images.length > 0 ? images : raffle.prize.images
      };
    }
    if (raffleDate) {
      updateData.raffleDate = new Date(raffleDate);
    }

    return await this.raffleRepository.updateById(raffleId, updateData);
  }
}
