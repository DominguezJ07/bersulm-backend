export class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

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
