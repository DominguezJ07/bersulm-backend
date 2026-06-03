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

export class RaffleNotInActivePhase extends DomainError {
  constructor() {
    super('Manual participants can only be managed in the active phase', 400);
  }
}

export class ParticipantAlreadyExists extends DomainError {
  constructor(name) {
    super(`A participant named "${name}" already exists in this raffle`, 409);
  }
}

export class ParticipantNotFound extends DomainError {
  constructor() {
    super('Participant not found in this raffle', 404);
  }
}
