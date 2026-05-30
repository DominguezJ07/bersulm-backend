import { RaffleNotFound, AlreadyVoted, RaffleNotInVotingPhase } from '../domain/RaffleErrors.js';
import { RewardVote } from '../domain/RewardVote.entity.js';

export class VoteForRewardUseCase {
  /**
   * @param {import('../domain/IRaffleRepository').IRaffleRepository} raffleRepository
   */
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  /**
   * @param {Object} user
   * @param {string} user._id
   * @param {string} raffleId
   * @param {string} rewardId
   * @returns {Promise<import('../domain/RewardVote.entity').RewardVote>}
   */
  async execute(user, raffleId, rewardId) {
    const raffle = await this.raffleRepository.findById(raffleId);
    if (!raffle) {
      throw new RaffleNotFound();
    }

    if (raffle.status !== 'voting') {
      throw new RaffleNotInVotingPhase();
    }

    const existingVote = await this.raffleRepository.getUserVote(raffleId, user._id || user.id);
    if (existingVote) {
      throw new AlreadyVoted();
    }

    await this.raffleRepository.addParticipant(raffleId, user._id || user.id);

    const vote = RewardVote.create({
      userId: user._id || user.id,
      rewardId,
      raffleId
    });

    return await this.raffleRepository.save(vote);
  }
}
