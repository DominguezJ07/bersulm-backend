import { LoyaltyCardNotFound, RewardAlreadyClaimed } from '../domain/LoyaltyErrors.js';

export class ClaimRewardUseCase {
  /**
   * @param {import('../domain/ILoyaltyRepository').ILoyaltyRepository} loyaltyRepository
   */
  constructor(loyaltyRepository) {
    this.loyaltyRepository = loyaltyRepository;
  }

  /**
   * @param {string} userId
   * @returns {Promise<import('../domain/LoyaltyCard.entity').LoyaltyCard>}
   */
  async execute(userId) {
    const card = await this.loyaltyRepository.findByUserId(userId);
    if (!card) {
      throw new LoyaltyCardNotFound();
    }

    if (card.status === 'reward_claimed') {
      throw new RewardAlreadyClaimed();
    }

    if (card.status !== 'reward_pending') {
      throw new Error('No reward pending to claim');
    }

    card.status = 'reward_claimed';
    card.claimedAt = new Date();
    card.visits = 0;
    card.currentCycle += 1;

    return await this.loyaltyRepository.update(card);
  }
}
