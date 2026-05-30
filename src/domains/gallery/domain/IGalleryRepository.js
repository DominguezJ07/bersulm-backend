/**
 * @interface IGalleryRepository
 */
export class IGalleryRepository {
  /**
   * @returns {Promise<import('./GalleryItem.entity').GalleryItem[]>}
   */
  async findAll() { throw new Error('Not implemented'); }

  /**
   * @param {string} category
   * @returns {Promise<import('./GalleryItem.entity').GalleryItem[]>}
   */
  async findByCategory(category) { throw new Error('Not implemented'); }

  /**
   * @param {string} id
   * @returns {Promise<import('./GalleryItem.entity').GalleryItem | null>}
   */
  async findById(id) { throw new Error('Not implemented'); }

  /**
   * @param {import('./GalleryItem.entity').GalleryItem} galleryItem
   * @returns {Promise<import('./GalleryItem.entity').GalleryItem>}
   */
  async save(galleryItem) { throw new Error('Not implemented'); }

  /**
   * @param {import('./GalleryItem.entity').GalleryItem} galleryItem
   * @returns {Promise<import('./GalleryItem.entity').GalleryItem>}
   */
  async update(galleryItem) { throw new Error('Not implemented'); }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) { throw new Error('Not implemented'); }
}
