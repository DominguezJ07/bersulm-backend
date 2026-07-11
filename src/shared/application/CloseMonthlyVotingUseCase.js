export class CloseMonthlyVotingUseCase {
  /**
   * @param {import('../../domains/raffles/domain/IRaffleRepository').IRaffleRepository} raffleRepository
   * @param {import('../../domains/rewards/domain/IRewardRepository').IRewardRepository} rewardRepository
   * @param {import('../../domains/appointments/domain/IAppointmentRepository').IAppointmentRepository} appointmentRepository
   * @param {import('../../domains/auth/domain/IUserRepository').IUserRepository} userRepository
   */
  constructor(raffleRepository, rewardRepository, appointmentRepository, userRepository) {
    this.raffleRepository = raffleRepository;
    this.rewardRepository = rewardRepository;
    this.appointmentRepository = appointmentRepository;
    this.userRepository = userRepository;
  }

  /**
   * @param {Object | null} [raffleOverride]
   * @returns {Promise<Object | null>}
   */
  async execute(raffleOverride = null) {
    let raffle = raffleOverride;
    const now = new Date();
    let month;

    if (!raffle) {
      month = this._getMonthString(now);
      raffle = await this.raffleRepository.findByMonth(month);
    } else {
      month = raffle.month;
    }

    if (!raffle || raffle.status !== 'voting') {
      return null;
    }

    const aggregatedVotes = await this.raffleRepository.getAggregatedVotes(raffle._id);
    const sortedVotes = [...aggregatedVotes].sort((a, b) => b.count - a.count);
    const winnerReward = sortedVotes[0]?.rewardId || null;

    let winnerRewardName = 'Sin premio';
    if (winnerReward) {
      const reward = await this.rewardRepository.findById(winnerReward);
      if (reward) {
        winnerRewardName = reward.name;
      }
    }

    const participants = await this.appointmentRepository.findCompletedUsersByMonth(month);

    const updatedRaffleData = {
      status: 'active',
      winnerReward,
      participants
    };

    const updatedRaffle = await this.raffleRepository.updateById(raffle._id, updatedRaffleData);

    const users = await this.userRepository.findAllWithFcmTokens();
    const allTokens = users.flatMap((u) => u.fcmTokens).filter(Boolean);

    return {
      raffleId: raffle._id,
      month,
      winnerReward,
      winnerRewardName,
      participantsCount: participants.length,
      allFcmTokens: allTokens,
      updatedRaffle
    };
  }

  /**
   * @param {Date} date
   * @returns {string}
   */
  _getMonthString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
