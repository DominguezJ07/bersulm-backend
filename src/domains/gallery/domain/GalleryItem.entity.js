/**
 * @typedef {Object} GalleryItemProps
 * @property {string} [_id]
 * @property {string} imageUrl
 * @property {string} title
 * @property {'todos' | 'cortes' | 'barba'} category
 * @property {boolean} [isActive]
 * @property {number} [order]
 * @property {string} uploadedBy
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

export class GalleryItem {
  /**
   * @param {GalleryItemProps} props
   */
  constructor(props) {
    this._id = props._id;
    this.imageUrl = props.imageUrl;
    this.title = props.title;
    this.category = props.category;
    this.isActive = props.isActive !== undefined ? props.isActive : true;
    this.order = props.order || 0;
    this.uploadedBy = props.uploadedBy;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  /**
   * @param {Omit<GalleryItemProps, '_id' | 'createdAt' | 'updatedAt'>} props
   * @returns {GalleryItem}
   */
  static create(props) {
    return new GalleryItem({
      ...props,
      isActive: props.isActive !== undefined ? props.isActive : true,
      order: props.order || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
