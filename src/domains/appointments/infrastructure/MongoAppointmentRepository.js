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
    return docs.map((doc) => this._mapToEntity(doc));
  }

  async findByDate(date) {
    const docs = await AppointmentModel.find({ date }).lean();
    return docs.map((doc) => this._mapToEntity(doc));
  }

  async findBlockedSlots(date) {
    const docs = await BlockedSlotModel.find({ date }).lean();
    return docs.map((doc) => doc.time);
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

  async findCompletedUsersByMonth(month) {
    const docs = await AppointmentModel.distinct('userId', {
      status: 'completed',
      date: { $regex: `^${month}-` }
    });
    return docs.map((id) => id.toString());
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
