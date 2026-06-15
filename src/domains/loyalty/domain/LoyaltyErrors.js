import { DomainError, NotFoundError, ConflictError } from '../../../shared/domain/DomainError.js';

export class LoyaltyCardNotFound extends NotFoundError {
  constructor() {
    super('Loyalty card not found');
  }
}

export class RewardAlreadyClaimed extends ConflictError {
  constructor() {
    super('Reward has already been claimed');
  }
}

export class MinigameNotStarted extends DomainError {
  constructor() {
    super('Minigame not started. Call GET /loyalty/minigame first', 400);
  }
}

export class CardAlreadyRevealed extends ConflictError {
  constructor() {
    super('This card has already been revealed');
  }
}

export class NoLoyaltyRewardsAvailable extends DomainError {
  constructor() {
    super('No loyalty rewards available', 400);
  }
}
