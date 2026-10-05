import { NotFoundError, ConflictError, DomainError } from '../../../shared/domain/DomainError.js';

export class RaffleNotFound extends NotFoundError {
  constructor() {
    super('Raffle not found');
  }
}

export class RaffleAlreadyActive extends ConflictError {
  constructor() {
    super('Ya existe un sorteo activo. Complétalo antes de crear uno nuevo.');
  }
}

export class RaffleNotInActivePhase extends ConflictError {
  constructor() {
    super('Manual participants cannot be managed once the raffle is completed');
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

export class RaffleNotYetFinished extends DomainError {
  constructor() {
    super(
      'El sorteo aún no ha finalizado su tiempo. Espera a que termine la cuenta regresiva para girar la ruleta.',
      400
    );
  }
}
