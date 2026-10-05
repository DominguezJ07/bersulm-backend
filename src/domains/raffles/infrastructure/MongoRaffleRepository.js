import { RaffleModel } from './RaffleModel.js';
import { UserModel } from '../../auth/infrastructure/UserModel.js';
import { Raffle } from '../domain/Raffle.entity.js';
import { IRaffleRepository } from '../domain/IRaffleRepository.js';

export class MongoRaffleRepository extends IRaffleRepository {
  async findCurrent() {
    const doc = await RaffleModel.findOne({ status: { $ne: 'completed' } })
      .sort({ createdAt: -1 })
      .lean();
    return doc ? this._mapToRaffle(doc) : null;
  }

  async findByMonth(month) {
    const doc = await RaffleModel.findOne({ month }).lean();
    return doc ? this._mapToRaffle(doc) : null;
  }

  async findById(id) {
    const doc = await RaffleModel.findById(id).lean();
    return doc ? this._mapToRaffle(doc) : null;
  }

  async save(entity) {
    const raffle = new RaffleModel({
      month: entity.month,
      status: entity.status,
      raffleDate: entity.raffleDate,
      winnerId: entity.winnerId,
      prize: entity.prize,
      participants: entity.participants,
      manualParticipants: (entity.manualParticipants || []).map((mp) => ({
        name: mp.name,
        userId: mp.userId || null,
        order: mp.order || 0
      }))
    });
    const saved = await raffle.save();
    return this._mapToRaffle(saved.toObject());
  }

  async update(raffle) {
    const updated = await RaffleModel.findByIdAndUpdate(
      raffle._id,
      {
        month: raffle.month,
        status: raffle.status,
        raffleDate: raffle.raffleDate,
        winnerId: raffle.winnerId,
        prize: raffle.prize,
        participants: raffle.participants,
        manualParticipants: (raffle.manualParticipants || []).map((mp) => ({
          name: mp.name,
          userId: mp.userId || null,
          order: mp.order || 0
        }))
      },
      { new: true }
    ).lean();
    return updated ? this._mapToRaffle(updated) : null;
  }

  async addManualParticipant(raffleId, { name, userId = null }) {
    const manualParticipant = { name, userId, order: 0 };
    const updated = await RaffleModel.findByIdAndUpdate(
      raffleId,
      { $push: { manualParticipants: manualParticipant } },
      { new: true }
    ).lean();
    return updated ? this._mapToRaffle(updated) : null;
  }

  async removeManualParticipant(raffleId, participantId) {
    const updated = await RaffleModel.findByIdAndUpdate(
      raffleId,
      { $pull: { manualParticipants: { _id: participantId } } },
      { new: true }
    ).lean();
    return updated ? this._mapToRaffle(updated) : null;
  }

  async getManualParticipants(raffleId) {
    const doc = await RaffleModel.findById(raffleId).select('manualParticipants').lean();
    if (!doc || !doc.manualParticipants) return [];
    return doc.manualParticipants.map((mp) => ({
      _id: mp._id.toString(),
      name: mp.name,
      userId: mp.userId?.toString() || null,
      order: mp.order || 0
    }));
  }

  async findByIdWithParticipants(raffleId) {
    const doc = await RaffleModel.findById(raffleId).lean();
    return doc ? this._mapToRaffle(doc) : null;
  }

  async getParticipantPool(raffleId) {
    const doc = await RaffleModel.findById(raffleId).lean();
    if (!doc) return [];

    const manual = (doc.manualParticipants || []).map((mp) => ({
      _id: mp._id.toString(),
      name: mp.name,
      userId: mp.userId?.toString() || null,
      order: mp.order || 0
    }));

    const voterIds = (doc.participants || []).map((id) => id.toString());
    const voters = [];

    if (voterIds.length > 0) {
      const users = await UserModel.find({ _id: { $in: voterIds } }).lean();
      const userMap = new Map(users.map((u) => [u._id.toString(), u]));
      voterIds.forEach((id) => {
        const u = userMap.get(id);
        if (u) {
          voters.push({ _id: id, name: u.name, userId: id, order: 0 });
        }
      });
    }

    const seen = new Set();
    const pool = [...voters, ...manual].filter((p) => {
      const key = p.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return pool;
  }

  async create(raffleData) {
    const doc = new RaffleModel(raffleData);
    const saved = await doc.save();
    return this._mapToRaffle(saved.toObject());
  }

  async updateById(id, data) {
    const updated = await RaffleModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return updated ? this._mapToRaffle(updated) : null;
  }

  async findCompleted({ skip = 0, limit = 10 } = {}) {
    const [docs, total] = await Promise.all([
      RaffleModel.find({ status: 'completed' }).sort({ raffleDate: -1 }).skip(skip).limit(limit).lean(),
      RaffleModel.countDocuments({ status: 'completed' })
    ]);
    return { raffles: docs.map((doc) => this._mapToRaffle(doc)), total };
  }

  async findAll({ skip = 0, limit = 20 } = {}) {
    const [docs, total] = await Promise.all([
      RaffleModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      RaffleModel.countDocuments({})
    ]);
    return { raffles: docs.map((d) => this._mapToRaffle(d)), total };
  }

  async deleteById(id) {
    await RaffleModel.findByIdAndDelete(id);
  }

  _mapToRaffle(doc) {
    return new Raffle({
      _id: doc._id.toString(),
      month: doc.month,
      status: doc.status,
      raffleDate: doc.raffleDate,
      winnerId: doc.winnerId?.toString(),
      prize: doc.prize || null,
      participants: (doc.participants || []).map((id) => id.toString()),
      manualParticipants: (doc.manualParticipants || []).map((mp) => ({
        _id: mp._id.toString(),
        name: mp.name,
        userId: mp.userId?.toString() || null,
        order: mp.order || 0
      })),
      createdAt: doc.createdAt
    });
  }
}
