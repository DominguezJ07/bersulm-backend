import { RaffleModel } from './RaffleModel.js';
import { RewardVoteModel } from './RewardVoteModel.js';
import { Raffle } from '../domain/Raffle.entity.js';
import { RewardVote } from '../domain/RewardVote.entity.js';
import { IRaffleRepository } from '../domain/IRaffleRepository.js';

export class MongoRaffleRepository extends IRaffleRepository {
  async findCurrent() {
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
      participants: entity.participants
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
        participants: raffle.participants
      },
      { new: true }
    ).lean();
    return updated ? this._mapToRaffle(updated) : null;
  }

  async addParticipant(raffleId, userId) {
    await RaffleModel.updateOne(
      { _id: raffleId, participants: { $ne: userId } },
      { $push: { participants: userId } }
    );
  }

  async getVotesByRaffle(raffleId) {
    const docs = await RewardVoteModel.find({ raffleId }).lean();
    return docs.map(doc => this._mapToVote(doc));
  }

  async getUserVote(raffleId, userId) {
    const doc = await RewardVoteModel.findOne({ raffleId, userId }).lean();
    return doc ? this._mapToVote(doc) : null;
  }

  _mapToRaffle(doc) {
    return new Raffle({
      _id: doc._id.toString(),
      month: doc.month,
      status: doc.status,
      raffleDate: doc.raffleDate,
      winnerId: doc.winnerId?.toString(),
      winnerReward: doc.winnerReward,
      participants: (doc.participants || []).map(id => id.toString()),
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
}
