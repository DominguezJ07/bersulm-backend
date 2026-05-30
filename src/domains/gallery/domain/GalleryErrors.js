export class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class GalleryItemNotFound extends DomainError {
  constructor() {
    super('Gallery item not found', 404);
  }
}

export class UnauthorizedGalleryAction extends DomainError {
  constructor() {
    super('Admin privileges required', 403);
  }
}
