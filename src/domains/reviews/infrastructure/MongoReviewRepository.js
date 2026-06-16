import { ReviewModel } from './ReviewModel.js';
import { Review } from '../domain/Review.entity.js';
import { IReviewRepository } from '../domain/IReviewRepository.js';

export class MongoReviewRepository extends IReviewRepository {
  _map(doc) {
    return new Review(doc);
  }

  async create(data) {
    const doc = new ReviewModel(data);
    const saved = await doc.save();
    return this._map(saved.toObject());
  }

  async findApproved({ limit = 10, skip = 0 } = {}) {
    const docs = await ReviewModel.find({ status: 'approved' }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    return docs.map((d) => this._map(d));
  }

  async findPending({ skip = 0, limit = 20 } = {}) {
    const [docs, total] = await Promise.all([
      ReviewModel.find({ status: 'pending' }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ReviewModel.countDocuments({ status: 'pending' })
    ]);
    return { reviews: docs.map((d) => this._map(d)), total };
  }

  async findById(id) {
    const doc = await ReviewModel.findById(id).lean();
    return doc ? this._map(doc) : null;
  }

  async updateStatus(id, status) {
    const doc = await ReviewModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    return doc ? this._map(doc) : null;
  }

  async delete(id) {
    await ReviewModel.findByIdAndDelete(id);
  }

  async findByUserAndAppointment(userId, appointmentId) {
    const doc = await ReviewModel.findOne({
      userId,
      appointmentId
    }).lean();
    return doc ? this._map(doc) : null;
  }

  async getAverageRating() {
    const result = await ReviewModel.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    return result[0]?.avg || 0;
  }
}
