import { LoyaltyCard } from '../domain/LoyaltyCard.entity.js';

export class GetLoyaltyCardUseCase {
  /**
   * @param {import('../domain/ILoyaltyRepository').ILoyaltyRepository} loyaltyRepository
   */
  constructor(loyaltyRepository) {
    this.loyaltyRepository = loyaltyRepository;
  }

  /**
   * @param {Object} user
   * @param {string} user.id
   * @param {string} user.role
   * @returns {Promise<import('../domain/LoyaltyCard.entity').LoyaltyCard | null>}
   */
  async execute(user) {
    if (user.role === 'admin') return null;

    let card = await this.loyaltyRepository.findByUserId(user.id);
    if (!card) {
      card = LoyaltyCard.create({ userId: user.id, visits: 0, totalVisits: 0, status: 'active', currentCycle: 1 });
      card = await this.loyaltyRepository.save(card);
    }

    if (card.rewardWon && !card.claimedRewards.some((r) => r.rewardName === card.rewardWon)) {
      card.claimedRewards.push({
        rewardId: card.rewardId,
        rewardName: card.rewardWon,
        claimedAt: card.claimedAt || new Date(),
        usedAt: null
      });
      card = await this.loyaltyRepository.update(card);
    }

    return card;
  }
}
