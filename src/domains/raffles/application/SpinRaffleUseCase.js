import { RaffleNotFound } from '../domain/RaffleErrors.js';

export class SpinRaffleUseCase {
  /**
   * @param {import('../domain/IRaffleRepository').IRaffleRepository} raffleRepository
   */
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  /**
   * @param {Object} user
   * @param {'client' | 'admin'} user.role
   * @param {string} raffleId
   * @returns {Promise<import('../domain/Raffle.entity').Raffle>}
   */
  async execute(user, raffleId) {
    if (!user || user.role !== 'admin') {
      throw new Error('Admin privileges required');
    }

    const raffle = await this.raffleRepository.findById(raffleId);
    if (!raffle) {
      throw new RaffleNotFound();
    }

    if (!raffle.participants || raffle.participants.length === 0) {
      raffle.status = 'completed';
      raffle.winnerId = null;
      raffle.winnerReward = null;
      return await this.raffleRepository.update(raffle);
    }

    const randomIndex = Math.floor(Math.random() * raffle.participants.length);
    const winnerId = raffle.participants[randomIndex];

    const votes = await this.raffleRepository.getVotesByRaffle(raffleId);
    const winnerVote = votes.find(vote => vote.userId === winnerId);

    raffle.winnerId = winnerId;
    raffle.winnerReward = winnerVote ? winnerVote.rewardId : null;
    raffle.status = 'completed';

    return await this.raffleRepository.update(raffle);
  }
}
