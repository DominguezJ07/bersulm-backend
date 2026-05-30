/**
 * @typedef {Object} AppointmentProps
 * @property {string} [_id]
 * @property {string} userId
 * @property {string} serviceId
 * @property {string} date - Format YYYY-MM-DD
 * @property {string} time - Format HH:mm
 * @property {'pending' | 'confirmed' | 'cancelled' | 'completed'} [status]
 * @property {string} [notes]
 * @property {number} totalPrice
 * @property {Date} [createdAt]
 * @property {Date} [cancelledAt]
 * @property {string} [cancelReason]
 */

export class Appointment {
  /**
   * @param {AppointmentProps} props
   */
  constructor(props) {
    this._id = props._id;
    this.userId = props.userId;
    this.serviceId = props.serviceId;
    this.date = props.date;
    this.time = props.time;
    this.status = props.status || 'pending';
    this.notes = props.notes || '';
    this.totalPrice = props.totalPrice;
    this.createdAt = props.createdAt || new Date();
    this.cancelledAt = props.cancelledAt;
    this.cancelReason = props.cancelReason;
  }

  /**
   * @param {Omit<AppointmentProps, '_id' | 'createdAt' | 'status'>} props
   * @returns {Appointment}
   */
  static create(props) {
    return new Appointment({
      ...props,
      status: 'pending',
      createdAt: new Date()
    });
  }
}
