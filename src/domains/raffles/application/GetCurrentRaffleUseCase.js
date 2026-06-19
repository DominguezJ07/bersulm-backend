import { RaffleNotFound } from '../domain/RaffleErrors.js';
import env from '../../../config/env.js';

export class GetCurrentRaffleUseCase {
  /**
   * @param {import('../domain/IRaffleRepository').IRaffleRepository} raffleRepository
   * @param {import('../../rewards/domain/IRewardRepository').IRewardRepository} rewardRepository
   */
  constructor(raffleRepository, rewardRepository) {
    this.raffleRepository = raffleRepository;
    this.rewardRepository = rewardRepository;
  }

  /**
   * @param {string | null} [userId]
   * @returns {Promise<Object>}
   */
  async execute(userId = null) {
    const raffle = await this.raffleRepository.findCurrent();
    if (!raffle) {
      throw new RaffleNotFound();
    }

    const now = new Date();
    let countdown;
    const testMode = env.TEST_MODE === 'true';
    if (testMode) {
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const minutesUntilClose = 10 - (minutes % 10);
      const secondsUntilClose = minutesUntilClose * 60 - seconds;
      countdown = secondsUntilClose;
    } else {
      countdown = Math.max(0, raffle.raffleDate.getTime() - now.getTime());
    }

    /** @type {Object} */
    const result = {
      raffle,
      countdown,
      phase: raffle.status
    };

    if (userId) {
      const userVote = await this.raffleRepository.getUserVote(raffle._id, userId);
      result.userHasVoted = !!userVote;
    }

    if (raffle.status === 'voting') {
      result.votes = await this.raffleRepository.getAggregatedVotes(raffle._id);
    }

    if (raffle.status === 'active' || raffle.status === 'completed') {
      if (raffle.winnerReward) {
        const reward = await this.rewardRepository.findById(raffle.winnerReward);
        result.winnerReward = reward
          ? {
              _id: reward._id,
              name: reward.name,
              description: reward.description,
              icon: reward.icon,
              type: reward.type
            }
          : null;
      }
      result.participantCount = (raffle.participants || []).length;
      result.manualParticipants = raffle.manualParticipants || [];
    }

    if (raffle.status === 'completed') {
      result.winnerId = raffle.winnerId;
    }

    return result;
  }
}
