export class GetGalleryUseCase {
  /**
   * @param {import('../domain/IGalleryRepository').IGalleryRepository} galleryRepository
   */
  constructor(galleryRepository) {
    this.galleryRepository = galleryRepository;
  }

  /**
   * @param {string} [category]
   * @returns {Promise<import('../domain/GalleryItem.entity').GalleryItem[]>}
   */
  async execute(category) {
    const items = await this.galleryRepository.findAll();
    const activeItems = items.filter(item => item.isActive);

    const filtered = category && category !== 'todos'
      ? activeItems.filter(item => item.category === category)
      : activeItems;

    return filtered.sort((a, b) => a.order - b.order);
  }
}
