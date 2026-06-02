import { Reward } from '../domain/Reward.entity.js';
import { ForbiddenError } from '../../../shared/domain/DomainError.js';

export class CreateRewardUseCase {
  /**
   * @param {import('../domain/IRewardRepository').IRewardRepository} rewardRepository
   */
  constructor(rewardRepository) {
    this.rewardRepository = rewardRepository;
  }

  /**
   * @param {Object} user
   * @param {'client' | 'admin'} user.role
   * @param {Object} rewardData
   * @param {string} rewardData.name
   * @param {string} rewardData.description
   * @param {string} rewardData.icon
   * @param {'corte' | 'descuento' | 'bebida' | 'tratamiento' | 'kit' | 'perfilado'} rewardData.type
   * @param {boolean} [rewardData.isActive]
   * @returns {Promise<import('../domain/Reward.entity').Reward>}
   */
  async execute(user, rewardData) {
    if (!user || user.role !== 'admin') {
      throw new ForbiddenError('Admin privileges required');
    }

    const reward = Reward.create({
      name: rewardData.name,
      description: rewardData.description,
      icon: rewardData.icon,
      type: rewardData.type,
      isActive: rewardData.isActive
    });

    return await this.rewardRepository.save(reward);
  }
}
