export class GetVotesUseCase {
  /**
   * @param {import('../domain/IRaffleRepository').IRaffleRepository} raffleRepository
   */
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  /**
   * @param {string} raffleId
   * @param {string | null} [userId]
   * @returns {Promise<Object>}
   */
  async execute(raffleId, userId = null) {
    const votes = await this.raffleRepository.getAggregatedVotes(raffleId);
    const totalVotes = votes.reduce((sum, v) => sum + v.count, 0);

    /** @type {Object} */
    const result = {
      votes,
      totalVotes
    };

    if (userId) {
      const userVote = await this.raffleRepository.getUserVote(raffleId, userId);
      result.userHasVoted = !!userVote;
    }

    return result;
  }
}
