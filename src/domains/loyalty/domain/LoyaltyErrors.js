import { DomainError } from '../../../shared/domain/DomainError.js';

export class LoyaltyCardNotFound extends DomainError {
  constructor() {
    super('Loyalty card not found', 404);
  }
}

export class RewardAlreadyClaimed extends DomainError {
  constructor() {
    super('Reward has already been claimed', 409);
  }
}

export class MinigameNotStarted extends DomainError {
  constructor() {
    super('Minigame not started. Call GET /loyalty/minigame first', 400);
  }
}

export class CardAlreadyRevealed extends DomainError {
  constructor() {
    super('This card has already been revealed', 409);
  }
}

export class NoLoyaltyRewardsAvailable extends DomainError {
  constructor() {
    super('No loyalty rewards available', 400);
  }
}
