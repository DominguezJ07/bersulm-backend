export class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class UserNotFound extends DomainError {
  constructor() {
    super('User not found', 404);
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
