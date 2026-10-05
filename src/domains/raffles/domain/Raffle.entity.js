export class Raffle {
  constructor(props) {
    this._id = props._id;
    this.month = props.month;
    this.status = props.status || 'active';
    this.raffleDate = props.raffleDate;
    this.winnerId = props.winnerId;
    this.prize = props.prize || null;
    this.participants = props.participants || [];
    this.manualParticipants = props.manualParticipants || [];
    this.createdAt = props.createdAt || new Date();
  }

  static create(props) {
    return new Raffle({
      ...props,
      status: props.status || 'active',
      participants: props.participants || [],
      manualParticipants: props.manualParticipants || [],
      createdAt: new Date()
    });
  }
}
