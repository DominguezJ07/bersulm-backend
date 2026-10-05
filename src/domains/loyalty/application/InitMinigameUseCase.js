import { LoyaltyCardNotFound, NoLoyaltyRewardsAvailable } from '../domain/LoyaltyErrors.js';

const REWARD_TYPE_WEIGHTS = {
  bebida: 30,
  descuento: 35,
  perfilado: 12,
  tratamiento: 10,
  kit: 5,
  corte: 8
};

const DEFAULT_WEIGHT = 5;

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

    const cards = [];
    for (let i = 0; i < 10; i++) {
      const reward = this._pickWeightedReward(loyaltyRewards);
      cards.push({
        position: i,
        rewardId: reward._id,
        rewardName: reward.name,
        isWinner: true,
        revealed: false
      });
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

  _pickWeightedReward(rewards) {
    const entries = rewards.map((reward) => ({
      reward,
      weight: REWARD_TYPE_WEIGHTS[reward.type] ?? DEFAULT_WEIGHT
    }));

    const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const entry of entries) {
      roll -= entry.weight;
      if (roll <= 0) return entry.reward;
    }

    return entries[entries.length - 1].reward;
  }

  _buildResponse(card) {
    const seen = new Set();
    const availableRewards = [];

    for (const c of card.minigameCards) {
      if (c.rewardId && !seen.has(c.rewardId)) {
        seen.add(c.rewardId);
        availableRewards.push({ rewardId: c.rewardId, name: c.rewardName });
      }
    }

    return {
      cardsCount: 10,
      availableRewards
    };
  }
}
