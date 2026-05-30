export class GetRewardsUseCase {
  /**
   * @param {import('../domain/IRewardRepository').IRewardRepository} rewardRepository
   */
  constructor(rewardRepository) {
    this.rewardRepository = rewardRepository;
  }

  /**
   * @returns {Promise<import('../domain/Reward.entity').Reward[]>}
   */
  async execute() {
    const rewards = await this.rewardRepository.findAll();
    return rewards.filter(reward => reward.isActive);
  }
}
