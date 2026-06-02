import {
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError
} from '../../src/shared/domain/DomainError.js';

describe('DomainError', () => {
  it('should set name from constructor', () => {
    const error = new DomainError('test', 400);
    expect(error.name).toBe('DomainError');
    expect(error.message).toBe('test');
    expect(error.statusCode).toBe(400);
  });

  it('should create NotFoundError with 404', () => {
    const error = new NotFoundError();
    expect(error.name).toBe('NotFoundError');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('should create UnauthorizedError with 401', () => {
    const error = new UnauthorizedError();
    expect(error.name).toBe('UnauthorizedError');
    expect(error.statusCode).toBe(401);
  });

  it('should create ForbiddenError with 403', () => {
    const error = new ForbiddenError();
    expect(error.name).toBe('ForbiddenError');
    expect(error.statusCode).toBe(403);
  });

  it('should create ConflictError with 409', () => {
    const error = new ConflictError();
    expect(error.name).toBe('ConflictError');
    expect(error.statusCode).toBe(409);
  });

  it('should create ValidationError with 400', () => {
    const error = new ValidationError();
    expect(error.name).toBe('ValidationError');
    expect(error.statusCode).toBe(400);
  });
});
