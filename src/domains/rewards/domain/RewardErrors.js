export class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class RewardNotFound extends DomainError {
  constructor() {
    super('Reward not found', 404);
  }
}
