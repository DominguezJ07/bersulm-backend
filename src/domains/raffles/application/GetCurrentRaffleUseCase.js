import { RaffleNotFound } from '../domain/RaffleErrors.js';

export class GetCurrentRaffleUseCase {
  constructor(raffleRepository, rewardRepository) {
    this.raffleRepository = raffleRepository;
    this.rewardRepository = rewardRepository;
  }

  async execute(userId = null) {
    const raffle = await this.raffleRepository.findCurrent();
    if (!raffle) {
      throw new RaffleNotFound();
    }

    const now = new Date();

    // Calcular countdown en SEGUNDOS
    let countdown;
    const testMode = process.env.TEST_MODE === 'true';
    if (testMode) {
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const minutesUntilClose = 10 - (minutes % 10);
      countdown = minutesUntilClose * 60 - seconds;
    } else {
      countdown = Math.max(0, Math.floor((raffle.raffleDate.getTime() - now.getTime()) / 1000));
    }

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
        winnerReward: raffle.winnerReward
      },
      countdown,
      phase: raffle.status,
      userHasVoted: false,
      votedRewardId: null
    };

    if (userId) {
      const userVote = await this.raffleRepository.getUserVote(raffle._id, userId);
      result.userHasVoted = !!userVote;
      if (userVote) {
        result.votedRewardId = userVote.rewardId?.toString() || null;
      }
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
      result.participantCount = (raffle.participants?.length || 0) + (raffle.manualParticipants?.length || 0);
      result.manualParticipants = raffle.manualParticipants || [];
    }

    if (raffle.status === 'completed') {
      result.winnerId = raffle.winnerId;
    }

    return result;
  }
}
