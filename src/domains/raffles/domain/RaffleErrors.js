import { DomainError } from '../../../shared/domain/DomainError.js';

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
