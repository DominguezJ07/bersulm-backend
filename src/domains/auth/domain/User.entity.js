/**
 * @typedef {Object} UserProps
 * @property {string} [_id]
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} passwordHash
 * @property {'client' | 'admin'} [role]
 * @property {boolean} [isActive]
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

export class User {
  /**
   * @param {UserProps} props
   */
  constructor(props) {
    this._id = props._id;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.passwordHash = props.passwordHash;
    this.role = props.role || 'client';
    this.isActive = props.isActive !== undefined ? props.isActive : true;
    this.avatar = props.avatar || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  /**
   * Factory method for creating a new user
   * @param {Omit<UserProps, '_id' | 'createdAt' | 'updatedAt'>} props
   * @returns {User}
   */
  static create(props) {
    return new User({
      ...props,
      role: props.role || 'client',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
