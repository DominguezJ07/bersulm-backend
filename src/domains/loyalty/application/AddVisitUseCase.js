import { LoyaltyCardNotFound } from '../domain/LoyaltyErrors.js';

export class AddVisitUseCase {
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

    card.visits += 1;
    card.totalVisits += 1;

    if (card.visits >= 5 && card.status !== 'reward_pending') {
      card.status = 'reward_pending';
      card.rewardId = undefined;
      card.rewardWon = undefined;
      card.minigameCards = undefined;
    }

    return await this.loyaltyRepository.update(card);
  }
}
