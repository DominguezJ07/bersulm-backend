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
