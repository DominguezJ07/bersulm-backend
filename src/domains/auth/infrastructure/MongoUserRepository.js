import mongoose from 'mongoose';
import { UserModel } from './UserModel.js';
import { User } from '../domain/User.entity.js';
import { IUserRepository } from '../domain/IUserRepository.js';

export class MongoUserRepository extends IUserRepository {
  /**
   * @param {string} email
   * @returns {Promise<User | null>}
   */
  async findByEmail(email) {
    if (mongoose.connection.readyState !== 1) return null;
    const userDoc = await UserModel.findOne({ email: email.toLowerCase().trim() }).maxTimeMS(5000).lean();
    if (!userDoc) return null;
    return this._mapToEntity(userDoc);
  }

  /**
   * @param {string} id
   * @returns {Promise<User | null>}
   */
  async findById(id) {
    const userDoc = await UserModel.findById(id).lean();
    if (!userDoc) return null;
    return this._mapToEntity(userDoc);
  }

  /**
   * @param {User} user
   * @returns {Promise<User>}
   */
  async save(user) {
    const userDoc = new UserModel({
      name: user.name,
      email: user.email,
      phone: user.phone,
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive
    });
    const savedDoc = await userDoc.save();
    return this._mapToEntity(savedDoc.toObject());
  }

  /**
   * @param {User} user
   * @returns {Promise<User>}
   */
  async update(user) {
    const updatedDoc = await UserModel.findByIdAndUpdate(
      user._id,
      {
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      },
      { new: true }
    ).lean();
    return this._mapToEntity(updatedDoc);
  }

  async search(query, limit = 50) {
    const filter = { role: 'client' };
    if (query) {
      const regex = new RegExp(query, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }
    const docs = await UserModel.find(filter).limit(limit).lean();
    return docs.map((doc) => this._mapToEntity(doc));
  }

  async addFcmToken(userId, fcmToken) {
    const doc = await UserModel.findByIdAndUpdate(userId, { $addToSet: { fcmTokens: fcmToken } }, { new: true }).lean();
    return doc ? this._mapToEntity(doc) : null;
  }

  _mapToEntity(doc) {
    return new User({
      _id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      passwordHash: doc.passwordHash,
      role: doc.role,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }
}
