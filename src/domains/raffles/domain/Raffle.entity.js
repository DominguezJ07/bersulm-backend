/**
 * @typedef {Object} RaffleProps
 * @property {string} [_id]
 * @property {string} month
 * @property {'voting' | 'scheduled' | 'active' | 'completed'} [status]
 * @property {Date} raffleDate
 * @property {string} [winnerId]
 * @property {string} [winnerReward]
 * @property {string[]} [participants]
 * @property {Date} [createdAt]
 */

export class Raffle {
  /**
   * @param {RaffleProps} props
   */
  constructor(props) {
    this._id = props._id;
    this.month = props.month;
    this.status = props.status || 'scheduled';
    this.raffleDate = props.raffleDate;
    this.winnerId = props.winnerId;
    this.winnerReward = props.winnerReward;
    this.participants = props.participants || [];
    this.createdAt = props.createdAt || new Date();
  }

  /**
   * @param {Omit<RaffleProps, '_id' | 'createdAt'>} props
   * @returns {Raffle}
   */
  static create(props) {
    return new Raffle({
      ...props,
      status: props.status || 'scheduled',
      participants: props.participants || [],
      createdAt: new Date()
    });
  }
}
