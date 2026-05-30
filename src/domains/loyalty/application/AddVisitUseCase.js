import { LoyaltyCardNotFound } from '../domain/LoyaltyErrors.js';

export class AddVisitUseCase {
  /**
   * @param {import('../domain/ILoyaltyRepository').ILoyaltyRepository} loyaltyRepository
   * @param {import('../../rewards/domain/IRewardRepository').IRewardRepository} rewardRepository
   */
  constructor(loyaltyRepository, rewardRepository) {
    this.loyaltyRepository = loyaltyRepository;
    this.rewardRepository = rewardRepository;
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
      const rewards = await this.rewardRepository.findAll();
      const activeRewards = rewards.filter(reward => reward.isActive);
      const winnerReward = activeRewards.length > 0
        ? activeRewards[Math.floor(Math.random() * activeRewards.length)]
        : null;

      card.status = 'reward_pending';
      card.rewardId = winnerReward ? winnerReward._id : undefined;
      card.rewardWon = winnerReward ? winnerReward.name : undefined;
    }

    return await this.loyaltyRepository.update(card);
  }
}
