import { DomainError } from '../../auth/domain/AuthErrors.js';

export class ServiceNotFound extends DomainError {
  constructor() {
    super('Service not found', 404);
  }
}

export class ServiceAlreadyExists extends DomainError {
  constructor() {
    super('A service with this name already exists', 409);
  }
}
