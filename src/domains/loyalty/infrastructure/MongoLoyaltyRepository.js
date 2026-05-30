import { LoyaltyCardModel } from './LoyaltyCardModel.js';
import { LoyaltyCard } from '../domain/LoyaltyCard.entity.js';
import { ILoyaltyRepository } from '../domain/ILoyaltyRepository.js';

export class MongoLoyaltyRepository extends ILoyaltyRepository {
  async findByUserId(userId) {
    const doc = await LoyaltyCardModel.findOne({ userId }).lean();
    return doc ? this._mapToEntity(doc) : null;
  }

  async findById(id) {
    const doc = await LoyaltyCardModel.findById(id).lean();
    return doc ? this._mapToEntity(doc) : null;
  }

  async save(card) {
    const doc = new LoyaltyCardModel({
      userId: card.userId,
      visits: card.visits,
      totalVisits: card.totalVisits,
      status: card.status,
      currentCycle: card.currentCycle,
      rewardId: card.rewardId,
      rewardWon: card.rewardWon,
      claimedAt: card.claimedAt
    });
    const saved = await doc.save();
    return this._mapToEntity(saved.toObject());
  }

  async update(card) {
    const updated = await LoyaltyCardModel.findByIdAndUpdate(
      card._id,
      {
        visits: card.visits,
        totalVisits: card.totalVisits,
        status: card.status,
        currentCycle: card.currentCycle,
        rewardId: card.rewardId,
        rewardWon: card.rewardWon,
        claimedAt: card.claimedAt
      },
      { new: true }
    ).lean();
    return updated ? this._mapToEntity(updated) : null;
  }

  async addVisit(userId) {
    const doc = await LoyaltyCardModel.findOneAndUpdate(
      { userId },
      { $inc: { visits: 1, totalVisits: 1 } },
      { new: true }
    ).lean();
    return doc ? this._mapToEntity(doc) : null;
  }

  async resetCard(userId) {
    const doc = await LoyaltyCardModel.findOneAndUpdate(
      { userId },
      { visits: 0, status: 'active', currentCycle: 1, rewardId: null, rewardWon: null, claimedAt: null },
      { new: true }
    ).lean();
    return doc ? this._mapToEntity(doc) : null;
  }

  _mapToEntity(doc) {
    return new LoyaltyCard({
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      visits: doc.visits,
      totalVisits: doc.totalVisits,
      status: doc.status,
      currentCycle: doc.currentCycle,
      rewardId: doc.rewardId?.toString(),
      rewardWon: doc.rewardWon,
      claimedAt: doc.claimedAt,
      createdAt: doc.createdAt
    });
  }
}
