import { RewardModel } from './RewardModel.js';
import { Reward } from '../domain/Reward.entity.js';
import { IRewardRepository } from '../domain/IRewardRepository.js';

export class MongoRewardRepository extends IRewardRepository {
  async findAll() {
    const docs = await RewardModel.find().lean();
    return docs.map(doc => this._mapToEntity(doc));
  }

  async findById(id) {
    const doc = await RewardModel.findById(id).lean();
    return doc ? this._mapToEntity(doc) : null;
  }

  async save(reward) {
    const doc = new RewardModel({
      name: reward.name,
      description: reward.description,
      icon: reward.icon,
      type: reward.type,
      isActive: reward.isActive
    });
    const saved = await doc.save();
    return this._mapToEntity(saved.toObject());
  }

  async update(reward) {
    const updated = await RewardModel.findByIdAndUpdate(
      reward._id,
      {
        name: reward.name,
        description: reward.description,
        icon: reward.icon,
        type: reward.type,
        isActive: reward.isActive
      },
      { new: true }
    ).lean();
    return updated ? this._mapToEntity(updated) : null;
  }

  async delete(id) {
    await RewardModel.findByIdAndDelete(id);
  }

  _mapToEntity(doc) {
    return new Reward({
      _id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      icon: doc.icon,
      type: doc.type,
      isActive: doc.isActive,
      createdAt: doc.createdAt
    });
  }
}
