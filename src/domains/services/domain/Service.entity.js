/**
 * @typedef {Object} ServiceProps
 * @property {string} [_id]
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {number} durationMin
 * @property {string} icon
 * @property {'corte' | 'barba' | 'color' | 'extra'} category
 * @property {boolean} [isActive]
 * @property {number} [order]
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

export class Service {
  /**
   * @param {ServiceProps} props
   */
  constructor(props) {
    this._id = props._id;
    this.name = props.name;
    this.description = props.description;
    this.price = props.price;
    this.durationMin = props.durationMin;
    this.icon = props.icon;
    this.category = props.category;
    this.isActive = props.isActive !== undefined ? props.isActive : true;
    this.order = props.order || 0;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  /**
   * Factory method for creating a new service
   * @param {Omit<ServiceProps, '_id' | 'createdAt' | 'updatedAt'>} props
   * @returns {Service}
   */
  static create(props) {
    return new Service({
      ...props,
      isActive: props.isActive !== undefined ? props.isActive : true,
      order: props.order || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
