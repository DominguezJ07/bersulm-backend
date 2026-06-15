import { NotFoundError, ConflictError } from '../../../shared/domain/DomainError.js';

export class ServiceNotFound extends NotFoundError {
  constructor() {
    super('Service not found');
  }
}

export class ServiceAlreadyExists extends ConflictError {
  constructor() {
    super('A service with this name already exists');
  }
}
