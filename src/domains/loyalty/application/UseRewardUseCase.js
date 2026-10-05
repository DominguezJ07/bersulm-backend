import { LoyaltyCardNotFound, RewardNotAvailable } from '../domain/LoyaltyErrors.js';

export class UseRewardUseCase {
  /**
   * @param {import('../domain/ILoyaltyRepository').ILoyaltyRepository} loyaltyRepository
   */
  constructor(loyaltyRepository) {
    this.loyaltyRepository = loyaltyRepository;
  }

  /**
   * @param {string} userId
   * @param {string} rewardId
   * @returns {Promise<import('../domain/LoyaltyCard.entity').LoyaltyCard>}
   */
  async execute(userId, rewardId) {
    const card = await this.loyaltyRepository.findByUserId(userId);
    if (!card) throw new LoyaltyCardNotFound();

    const claimedReward = card.claimedRewards.find(
      (r) => r.rewardId && r.rewardId.toString() === rewardId.toString() && !r.usedAt
    );

    if (!claimedReward) {
      throw new RewardNotAvailable();
    }

    claimedReward.usedAt = new Date();

    return await this.loyaltyRepository.update(card);
  }
}
