import { GalleryItemNotFound, UnauthorizedGalleryAction } from '../domain/GalleryErrors.js';

export class DeleteGalleryItemUseCase {
  /**
   * @param {import('../domain/IGalleryRepository').IGalleryRepository} galleryRepository
   */
  constructor(galleryRepository) {
    this.galleryRepository = galleryRepository;
  }

  /**
   * @param {Object} user
   * @param {'client' | 'admin'} user.role
   * @param {string} id
   * @returns {Promise<import('../domain/GalleryItem.entity').GalleryItem>}
   */
  async execute(user, id) {
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedGalleryAction();
    }

    const galleryItem = await this.galleryRepository.findById(id);
    if (!galleryItem) {
      throw new GalleryItemNotFound();
    }

    await this.galleryRepository.delete(id);
    return galleryItem;
  }
}
