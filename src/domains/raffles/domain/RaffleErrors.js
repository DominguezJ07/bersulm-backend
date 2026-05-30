export class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class RaffleNotFound extends DomainError {
  constructor() {
    super('Raffle not found', 404);
  }
}

export class AlreadyVoted extends DomainError {
  constructor() {
    super('You have already voted in this raffle', 409);
  }
}

export class RaffleNotInVotingPhase extends DomainError {
  constructor() {
    super('The raffle is not in voting phase', 400);
  }
}
