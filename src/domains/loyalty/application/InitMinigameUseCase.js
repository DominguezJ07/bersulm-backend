import { LoyaltyCardNotFound, NoLoyaltyRewardsAvailable } from '../domain/LoyaltyErrors.js';

export class InitMinigameUseCase {
  constructor(loyaltyRepository, rewardRepository) {
    this.loyaltyRepository = loyaltyRepository;
    this.rewardRepository = rewardRepository;
  }

  async execute(userId) {
    const card = await this.loyaltyRepository.findByUserId(userId);
    if (!card) throw new LoyaltyCardNotFound();
    if (card.status !== 'reward_pending') throw new Error('No hay premio pendiente');
    if (card.minigameCards && card.minigameCards.length > 0) {
      return this._buildResponse(card);
    }

    const loyaltyRewards = await this.rewardRepository.findLoyaltyRewards();
    if (loyaltyRewards.length === 0) {
      throw new NoLoyaltyRewardsAvailable();
    }

    const winnerReward = loyaltyRewards[Math.floor(Math.random() * loyaltyRewards.length)];

    const cards = [];
    for (let i = 0; i < 10; i++) {
      cards.push({
        position: i,
        rewardId: null,
        rewardName: null,
        isWinner: false,
        revealed: false
      });
    }

    if (winnerReward) {
      const winIndex = Math.floor(Math.random() * 10);
      cards[winIndex] = {
        position: winIndex,
        rewardId: winnerReward._id,
        rewardName: winnerReward.name,
        isWinner: true,
        revealed: false
      };
    }

    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    cards.forEach((c, idx) => {
      c.position = idx;
    });

    card.minigameCards = cards;
    await this.loyaltyRepository.update(card);

    return this._buildResponse(card);
  }

  _buildResponse(card) {
    const winnerCard = card.minigameCards.find((c) => c.isWinner && c.rewardName);
    return {
      cardsCount: 10,
      availableRewards: winnerCard ? [{ rewardId: winnerCard.rewardId, name: winnerCard.rewardName }] : []
    };
  }
}
