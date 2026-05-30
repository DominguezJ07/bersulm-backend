import { GalleryItem } from '../domain/GalleryItem.entity.js';
import { UnauthorizedGalleryAction } from '../domain/GalleryErrors.js';

export class CreateGalleryItemUseCase {
  /**
   * @param {import('../domain/IGalleryRepository').IGalleryRepository} galleryRepository
   */
  constructor(galleryRepository) {
    this.galleryRepository = galleryRepository;
  }

  /**
   * @param {Object} user
   * @param {string} user._id
   * @param {'client' | 'admin'} user.role
   * @param {Object} galleryData
   * @param {string} galleryData.imageUrl
   * @param {string} galleryData.title
   * @param {'todos' | 'cortes' | 'barba'} galleryData.category
   * @param {boolean} [galleryData.isActive]
   * @param {number} [galleryData.order]
   * @returns {Promise<import('../domain/GalleryItem.entity').GalleryItem>}
   */
  async execute(user, galleryData) {
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedGalleryAction();
    }

    const galleryItem = GalleryItem.create({
      imageUrl: galleryData.imageUrl,
      title: galleryData.title,
      category: galleryData.category,
      isActive: galleryData.isActive,
      order: galleryData.order,
      uploadedBy: user._id || user.id
    });

    return await this.galleryRepository.save(galleryItem);
  }
}
