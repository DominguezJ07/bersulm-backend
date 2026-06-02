import { DomainError } from '../../../shared/domain/DomainError.js';

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
