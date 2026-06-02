import { LoyaltyCardNotFound, MinigameNotStarted, CardAlreadyRevealed } from '../domain/LoyaltyErrors.js';

export class RevealCardUseCase {
  constructor(loyaltyRepository) {
    this.loyaltyRepository = loyaltyRepository;
  }

  async execute(userId, cardIndex) {
    if (cardIndex < 0 || cardIndex > 9) {
      throw new Error('Índice de carta inválido');
    }

    const card = await this.loyaltyRepository.findByUserId(userId);
    if (!card) throw new LoyaltyCardNotFound();
    if (card.status !== 'reward_pending') throw new Error('No hay premio pendiente');
    if (!card.minigameCards || card.minigameCards.length === 0) {
      throw new MinigameNotStarted();
    }

    const selectedCard = card.minigameCards.find((c) => c.position === cardIndex);
    if (!selectedCard) throw new Error('Carta no encontrada');
    if (selectedCard.revealed) throw new CardAlreadyRevealed();

    selectedCard.revealed = true;

    if (selectedCard.isWinner && selectedCard.rewardId) {
      card.rewardId = selectedCard.rewardId;
      card.rewardWon = selectedCard.rewardName;
      card.status = 'reward_claimed';
      card.claimedAt = new Date();
      card.visits = 0;
      card.currentCycle += 1;
      card.minigameCards = undefined;
    } else {
      card.status = 'active';
      card.visits = 0;
      card.currentCycle += 1;
      card.minigameCards = undefined;
      card.rewardId = undefined;
      card.rewardWon = undefined;
    }

    await this.loyaltyRepository.update(card);

    return {
      won: selectedCard.isWinner,
      reward: selectedCard.isWinner ? { id: selectedCard.rewardId, name: selectedCard.rewardName } : null,
      cardStatus: card.status,
      currentCycle: card.currentCycle
    };
  }
}
