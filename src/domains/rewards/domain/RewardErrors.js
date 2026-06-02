import { DomainError } from '../../../shared/domain/DomainError.js';

export class RewardNotFound extends DomainError {
  constructor() {
    super('Reward not found', 404);
  }
}
