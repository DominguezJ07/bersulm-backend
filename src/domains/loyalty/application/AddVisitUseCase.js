import { LoyaltyCard } from '../domain/LoyaltyCard.entity.js';

export class AddVisitUseCase {
  constructor(loyaltyRepository) {
    this.loyaltyRepository = loyaltyRepository;
  }

  async execute(userId) {
    let card = await this.loyaltyRepository.findByUserId(userId);

    if (!card) {
      card = LoyaltyCard.create({
        userId,
        visits: 0,
        totalVisits: 0,
        status: 'active',
        currentCycle: 1
      });
      card = await this.loyaltyRepository.save(card);
    }

    card.visits += 1;
    card.totalVisits += 1;

    if (card.visits >= 5 && card.status !== 'reward_pending') {
      card.status = 'reward_pending';
      card.rewardId = undefined;
      card.rewardWon = undefined;
      card.minigameCards = undefined;
    }

    return await this.loyaltyRepository.update(card);
  }
}
