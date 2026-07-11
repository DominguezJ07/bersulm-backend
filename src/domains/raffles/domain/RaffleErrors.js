import { DomainError, NotFoundError, ConflictError } from '../../../shared/domain/DomainError.js';

export class RaffleNotFound extends NotFoundError {
  constructor() {
    super('Raffle not found');
  }
}

export class AlreadyVoted extends ConflictError {
  constructor() {
    super('You have already voted in this raffle');
  }
}

export class RaffleNotInVotingPhase extends DomainError {
  constructor() {
    super('The raffle is not in voting phase', 400);
  }
}

export class RaffleNotInActivePhase extends DomainError {
  constructor() {
    super('Manual participants cannot be managed once the raffle is completed', 400);
  }
}

export class ParticipantAlreadyExists extends ConflictError {
  constructor(name) {
    super(`A participant named "${name}" already exists in this raffle`);
  }
}

export class ParticipantNotFound extends NotFoundError {
  constructor() {
    super('Participant not found in this raffle');
  }
}
