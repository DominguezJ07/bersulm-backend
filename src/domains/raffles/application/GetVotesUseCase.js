export class GetVotesUseCase {
  /**
   * @param {import('../domain/IRaffleRepository').IRaffleRepository} raffleRepository
   */
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  /**
   * @param {string} raffleId
   * @returns {Promise<Array<{ rewardId: string, count: number }>>}
   */
  async execute(raffleId) {
    const votes = await this.raffleRepository.getVotesByRaffle(raffleId);
    const grouped = votes.reduce((acc, vote) => {
      const rewardId = vote.rewardId;
      acc[rewardId] = (acc[rewardId] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([rewardId, count]) => ({ rewardId, count }));
  }
}
