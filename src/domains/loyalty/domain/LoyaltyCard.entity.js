/**
 * @typedef {Object} LoyaltyCardProps
 * @property {string} [_id]
 * @property {string} userId
 * @property {number} [visits]
 * @property {number} [totalVisits]
 * @property {'active' | 'reward_pending' | 'reward_claimed'} [status]
 * @property {number} [currentCycle]
 * @property {string} [rewardId]
 * @property {string} [rewardWon]
 * @property {Date} [claimedAt]
 * @property {Date} [createdAt]
 */

export class LoyaltyCard {
  /**
   * @param {LoyaltyCardProps} props
   */
  constructor(props) {
    this._id = props._id;
    this.userId = props.userId;
    this.visits = props.visits !== undefined ? props.visits : 0;
    this.totalVisits = props.totalVisits !== undefined ? props.totalVisits : 0;
    this.status = props.status || 'active';
    this.currentCycle = props.currentCycle !== undefined ? props.currentCycle : 1;
    this.rewardId = props.rewardId;
    this.rewardWon = props.rewardWon;
    this.claimedAt = props.claimedAt;
    this.createdAt = props.createdAt || new Date();
  }

  /**
   * @param {Omit<LoyaltyCardProps, '_id' | 'createdAt'>} props
   * @returns {LoyaltyCard}
   */
  static create(props) {
    return new LoyaltyCard({
      ...props,
      visits: props.visits !== undefined ? props.visits : 0,
      totalVisits: props.totalVisits !== undefined ? props.totalVisits : 0,
      status: props.status || 'active',
      currentCycle: props.currentCycle !== undefined ? props.currentCycle : 1,
      createdAt: new Date()
    });
  }
}
