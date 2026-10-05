import { RaffleNotFound } from '../domain/RaffleErrors.js';

export class GetCurrentRaffleUseCase {
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  async execute() {
    const raffle = await this.raffleRepository.findCurrent();
    if (!raffle) {
      throw new RaffleNotFound();
    }

    const now = new Date();
    const countdown = Math.max(0, Math.floor((raffle.raffleDate.getTime() - now.getTime()) / 1000));

    const result = {
      raffle: {
        _id: raffle._id,
        id: raffle._id,
        month: raffle.month,
        status: raffle.status,
        raffleDate: raffle.raffleDate,
        participants: raffle.participants || [],
        manualParticipants: raffle.manualParticipants || [],
        winnerId: raffle.winnerId,
        prize: raffle.prize
      },
      countdown,
      phase: raffle.status,
      prize: raffle.prize
    };

    if (raffle.status === 'active' || raffle.status === 'completed') {
      result.participantCount = (raffle.participants?.length || 0) + (raffle.manualParticipants?.length || 0);
      result.manualParticipants = raffle.manualParticipants || [];
    }

    if (raffle.status === 'completed') {
      result.winnerId = raffle.winnerId;
    }

    return result;
  }
}
