/**
 * @typedef {Object} RewardProps
 * @property {string} [_id]
 * @property {string} name
 * @property {string} description
 * @property {string} icon
 * @property {'corte' | 'descuento' | 'bebida' | 'tratamiento' | 'kit' | 'perfilado'} type
 * @property {boolean} [isActive]
 * @property {boolean} [isLoyaltyReward]
 * @property {Date} [createdAt]
 */

export class Reward {
  /**
   * @param {RewardProps} props
   */
  constructor(props) {
    this._id = props._id;
    this.name = props.name;
    this.description = props.description;
    this.icon = props.icon;
    this.type = props.type;
    this.isActive = props.isActive !== undefined ? props.isActive : true;
    this.isLoyaltyReward = props.isLoyaltyReward !== undefined ? props.isLoyaltyReward : false;
    this.createdAt = props.createdAt || new Date();
  }

  /**
   * @param {Omit<RewardProps, '_id' | 'createdAt'>} props
   * @returns {Reward}
   */
  static create(props) {
    return new Reward({
      ...props,
      isActive: props.isActive !== undefined ? props.isActive : true,
      isLoyaltyReward: props.isLoyaltyReward !== undefined ? props.isLoyaltyReward : false,
      createdAt: new Date()
    });
  }
}
