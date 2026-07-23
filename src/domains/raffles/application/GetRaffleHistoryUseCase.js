export class GetRaffleHistoryUseCase {
  /**
   * @param {import('../domain/IRaffleRepository').IRaffleRepository} raffleRepository
   * @param {import('../../rewards/domain/IRewardRepository').IRewardRepository} rewardRepository
   */
  constructor(raffleRepository, rewardRepository) {
    this.raffleRepository = raffleRepository;
    this.rewardRepository = rewardRepository;
  }

  /**
   * @param {{ page?: number, limit?: number }} options
   */
  async execute({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;

    const { raffles, total } = await this.raffleRepository.findCompleted({ skip, limit });

    const enriched = await Promise.all(
      raffles.map(async (raffle) => {
        let winnerRewardData = null;

        if (raffle.winnerReward) {
          try {
            const reward = await this.rewardRepository.findById(raffle.winnerReward);
            if (reward) {
              winnerRewardData = {
                _id: reward._id,
                name: reward.name,
                description: reward.description,
                icon: reward.icon,
                type: reward.type
              };
            }
          } catch {
            // Si el reward fue eliminado, continuar sin él
          }
        }

        return {
          _id: raffle._id,
          month: raffle.month,
          status: raffle.status,
          raffleDate: raffle.raffleDate,
          winnerReward: winnerRewardData,
          winnerId: raffle.winnerId,
          winnerName: raffle.winnerName || null,
          participantCount: (raffle.participants?.length || 0) + (raffle.manualParticipants?.length || 0),
          createdAt: raffle.createdAt
        };
      })
    );

    return { raffles: enriched, total, page, totalPages: Math.ceil(total / limit) };
  }
}
