import mongoose from 'mongoose';
import { RaffleModel } from './RaffleModel.js';
import { RewardVoteModel } from './RewardVoteModel.js';
import { Raffle } from '../domain/Raffle.entity.js';
import { RewardVote } from '../domain/RewardVote.entity.js';
import { IRaffleRepository } from '../domain/IRaffleRepository.js';

export class MongoRaffleRepository extends IRaffleRepository {
  async findCurrent() {
    const testMode = process.env.TEST_MODE === 'true';

    if (testMode) {
      // Modo prueba: buscar el sorteo más reciente
      // en voting o active sin importar el month
      const doc = await RaffleModel.findOne({
        status: { $in: ['voting', 'active'] }
      })
        .sort({ createdAt: -1 })
        .lean();
      return doc ? this._mapToRaffle(doc) : null;
    }

    // Modo normal: buscar por mes actual
    const now = new Date();
    const month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const doc = await RaffleModel.findOne({ month }).lean();
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
    if (entity instanceof RewardVote || entity.raffleId) {
      const doc = new RewardVoteModel({
        userId: entity.userId,
        rewardId: entity.rewardId,
        raffleId: entity.raffleId
      });
      const saved = await doc.save();
      return this._mapToVote(saved.toObject());
    }

    const raffle = new RaffleModel({
      month: entity.month,
      status: entity.status,
      raffleDate: entity.raffleDate,
      winnerId: entity.winnerId,
      winnerReward: entity.winnerReward,
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
        winnerReward: raffle.winnerReward,
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

  async addParticipant(raffleId, userId) {
    await RaffleModel.updateOne({ _id: raffleId, participants: { $ne: userId } }, { $push: { participants: userId } });
  }

  async getVotesByRaffle(raffleId) {
    const docs = await RewardVoteModel.find({ raffleId }).lean();
    return docs.map((doc) => this._mapToVote(doc));
  }

  async getUserVote(raffleId, userId) {
    const doc = await RewardVoteModel.findOne({ raffleId, userId }).lean();
    return doc ? this._mapToVote(doc) : null;
  }

  async getAggregatedVotes(raffleId) {
    const result = await RewardVoteModel.aggregate([
      { $match: { raffleId: new mongoose.Types.ObjectId(raffleId) } },
      { $group: { _id: '$rewardId', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'rewards',
          localField: '_id',
          foreignField: '_id',
          as: 'reward'
        }
      },
      { $unwind: { path: '$reward', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          rewardId: { $toString: '$_id' },
          name: { $ifNull: ['$reward.name', 'Desconocido'] },
          icon: { $ifNull: ['$reward.icon', ''] },
          type: { $ifNull: ['$reward.type', ''] },
          count: 1
        }
      }
    ]);

    const totalVotes = result.reduce((sum, r) => sum + r.count, 0);
    return result.map((r) => ({
      rewardId: r.rewardId,
      name: r.name,
      icon: r.icon,
      type: r.type,
      count: r.count,
      percentage: totalVotes > 0 ? Math.round((r.count / totalVotes) * 1000) / 10 : 0
    }));
  }

  _mapToRaffle(doc) {
    return new Raffle({
      _id: doc._id.toString(),
      month: doc.month,
      status: doc.status,
      raffleDate: doc.raffleDate,
      winnerId: doc.winnerId?.toString(),
      winnerReward: doc.winnerReward,
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

  _mapToVote(doc) {
    return new RewardVote({
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      rewardId: doc.rewardId.toString(),
      raffleId: doc.raffleId.toString(),
      createdAt: doc.createdAt
    });
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

  async create(raffleData) {
    const doc = new RaffleModel(raffleData);
    const saved = await doc.save();
    return saved.toObject();
  }

  async updateById(id, data) {
    const updated = await RaffleModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return updated;
  }

  async findCompleted({ skip = 0, limit = 10 } = {}) {
    const [docs, total] = await Promise.all([
      RaffleModel.find({ status: 'completed' }).sort({ raffleDate: -1 }).skip(skip).limit(limit).lean(),
      RaffleModel.countDocuments({ status: 'completed' })
    ]);
    return { raffles: docs, total };
  }
}
