import { DomainError, NotFoundError } from '../../../shared/domain/DomainError.js';

export class UserNotFound extends NotFoundError {
  constructor() {
    super('User not found');
  }
}

export class InvalidCredentials extends DomainError {
  constructor() {
    super('Invalid email or password', 401);
  }
}

export class UserAlreadyExists extends DomainError {
  constructor() {
    super('A user with this email already exists', 409);
  }
}
