export class GetVotesByMonthUseCase {
  /**
   * @param {import('../domain/IRaffleRepository').IRaffleRepository} raffleRepository
   */
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  /**
   * @param {string | null} [userId]
   * @returns {Promise<Object>}
   */
  async execute(userId = null) {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const raffle = await this.raffleRepository.findByMonth(month);

    if (!raffle) {
      return { votes: [], totalVotes: 0 };
    }

    const votes = await this.raffleRepository.getAggregatedVotes(raffle._id);
    const totalVotes = votes.reduce((sum, v) => sum + v.count, 0);

    /** @type {Object} */
    const result = {
      votes,
      totalVotes
    };

    if (userId) {
      const userVote = await this.raffleRepository.getUserVote(raffle._id, userId);
      result.userHasVoted = !!userVote;
    }

    return result;
  }
}
