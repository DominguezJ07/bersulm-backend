export class GetRaffleHistoryUseCase {
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  async execute({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const { raffles, total } = await this.raffleRepository.findCompleted({ skip, limit });

    const enriched = raffles.map((raffle) => ({
      _id: raffle._id,
      month: raffle.month,
      status: raffle.status,
      raffleDate: raffle.raffleDate,
      prize: raffle.prize || null,
      winnerId: raffle.winnerId,
      participantCount: (raffle.participants?.length || 0) + (raffle.manualParticipants?.length || 0),
      createdAt: raffle.createdAt
    }));

    return { raffles: enriched, total, page, totalPages: Math.ceil(total / limit) };
  }
}
