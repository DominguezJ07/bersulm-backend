/**
 * @typedef {Object} RewardVoteProps
 * @property {string} [_id]
 * @property {string} userId
 * @property {string} rewardId
 * @property {string} raffleId
 * @property {Date} [createdAt]
 */

export class RewardVote {
  /**
   * @param {RewardVoteProps} props
   */
  constructor(props) {
    this._id = props._id;
    this.userId = props.userId;
    this.rewardId = props.rewardId;
    this.raffleId = props.raffleId;
    this.createdAt = props.createdAt || new Date();
  }

  /**
   * @param {Omit<RewardVoteProps, '_id' | 'createdAt'>} props
   * @returns {RewardVote}
   */
  static create(props) {
    return new RewardVote({
      ...props,
      createdAt: new Date()
    });
  }
}
