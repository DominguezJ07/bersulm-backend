import { AppointmentModel } from './AppointmentModel.js';
import { BlockedSlotModel } from './BlockedSlotModel.js';
import { Appointment } from '../domain/Appointment.entity.js';
import { IAppointmentRepository } from '../domain/IAppointmentRepository.js';

export class MongoAppointmentRepository extends IAppointmentRepository {
  async findById(id) {
    const doc = await AppointmentModel.findById(id).lean();
    return doc ? this._mapToEntity(doc) : null;
  }

  async findByUserId(userId) {
    const docs = await AppointmentModel.find({ userId }).sort({ date: -1, time: -1 }).lean();
    return docs.map(doc => this._mapToEntity(doc));
  }

  async findByDate(date) {
    const docs = await AppointmentModel.find({ date }).lean();
    return docs.map(doc => this._mapToEntity(doc));
  }

  async findBlockedSlots(date) {
    const docs = await BlockedSlotModel.find({ date }).lean();
    return docs.map(doc => doc.time);
  }

  async findAvailableSlots(date) {
    const allSlots = this._generateSlots();
    const appointments = await this.findByDate(date);
    const bookedSlots = appointments
      .filter(appointment => appointment.status !== 'cancelled')
      .map(appointment => appointment.time);
    const blockedSlots = await this.findBlockedSlots(date);

    return allSlots.filter(slot => !bookedSlots.includes(slot) && !blockedSlots.includes(slot));
  }

  async save(appointment) {
    const doc = new AppointmentModel({
      userId: appointment.userId,
      serviceId: appointment.serviceId,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes,
      totalPrice: appointment.totalPrice
    });
    const saved = await doc.save();
    return this._mapToEntity(saved.toObject());
  }

  async update(appointment) {
    const updated = await AppointmentModel.findByIdAndUpdate(
      appointment._id,
      {
        status: appointment.status,
        notes: appointment.notes,
        cancelledAt: appointment.cancelledAt,
        cancelReason: appointment.cancelReason
      },
      { new: true }
    ).lean();

    return updated ? this._mapToEntity(updated) : null;
  }

  async cancel(id, reason) {
    const cancelled = await AppointmentModel.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason
      },
      { new: true }
    ).lean();

    return cancelled ? this._mapToEntity(cancelled) : null;
  }

  _generateSlots() {
    const slots = [];
    let hour = 9;
    let min = 0;

    while (hour < 18 || (hour === 18 && min <= 30)) {
      const hStr = hour.toString().padStart(2, '0');
      const mStr = min.toString().padStart(2, '0');
      slots.push(`${hStr}:${mStr}`);

      min += 30;
      if (min === 60) {
        hour += 1;
        min = 0;
      }
    }

    return slots;
  }

  _mapToEntity(doc) {
    return new Appointment({
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      serviceId: doc.serviceId.toString(),
      date: doc.date,
      time: doc.time,
      status: doc.status,
      notes: doc.notes,
      totalPrice: doc.totalPrice,
      createdAt: doc.createdAt,
      cancelledAt: doc.cancelledAt,
      cancelReason: doc.cancelReason
    });
  }
}
