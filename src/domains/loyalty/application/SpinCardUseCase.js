export class SpinCardUseCase {
  /**
   * @param {import('../../rewards/domain/IRewardRepository').IRewardRepository} rewardRepository
   */
  constructor(rewardRepository) {
    this.rewardRepository = rewardRepository;
  }

  async execute() {
    const rewards = await this.rewardRepository.findAll();
    const activeRewards = rewards.filter(reward => reward.isActive);
    if (activeRewards.length === 0) {
      throw new Error('No active rewards available');
    }
    const reward = activeRewards[Math.floor(Math.random() * activeRewards.length)];
    return reward;
  }
}
