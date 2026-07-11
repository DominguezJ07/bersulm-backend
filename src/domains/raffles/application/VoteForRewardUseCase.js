import { RaffleNotFound, AlreadyVoted, RaffleNotInVotingPhase } from '../domain/RaffleErrors.js';
import { RewardNotFound } from '../../rewards/domain/RewardErrors.js';
import { RewardVote } from '../domain/RewardVote.entity.js';

export class VoteForRewardUseCase {
  /**
   * @param {import('../domain/IRaffleRepository').IRaffleRepository} raffleRepository
   * @param {import('../../rewards/domain/IRewardRepository').IRewardRepository} rewardRepository
   */
  constructor(raffleRepository, rewardRepository) {
    this.raffleRepository = raffleRepository;
    this.rewardRepository = rewardRepository;
  }

  /**
   * @param {Object} user
   * @param {string} user.id
   * @param {string} user._id
   * @param {string} raffleId
   * @param {string} rewardId
   * @returns {Promise<import('../domain/RewardVote.entity').RewardVote>}
   */
  async execute(user, raffleId, rewardId) {
    const userId = user.id || user._id;
    if (!userId) {
      throw new Error('User ID is required');
    }

    const raffle = await this.raffleRepository.findById(raffleId);
    if (!raffle) {
      throw new RaffleNotFound();
    }

    if (raffle.status !== 'voting') {
      throw new RaffleNotInVotingPhase();
    }

    const reward = await this.rewardRepository.findById(rewardId);
    if (!reward || !reward.isActive) {
      throw new RewardNotFound();
    }

    const existingVote = await this.raffleRepository.getUserVote(raffleId, userId);
    if (existingVote) {
      throw new AlreadyVoted();
    }

    await this.raffleRepository.addParticipant(raffleId, userId);

    const vote = RewardVote.create({
      userId,
      rewardId,
      raffleId
    });

    return await this.raffleRepository.save(vote);
  }
}
