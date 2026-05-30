import { ServiceModel } from './ServiceModel.js';
import { Service } from '../domain/Service.entity.js';
import { IServiceRepository } from '../domain/IServiceRepository.js';

export class MongoServiceRepository extends IServiceRepository {
  /**
   * @returns {Promise<Service[]>}
   */
  async findAll() {
    const docs = await ServiceModel.find().lean();
    return docs.map(doc => this._mapToEntity(doc));
  }

  /**
   * @param {string} id
   * @returns {Promise<Service | null>}
   */
  async findById(id) {
    const doc = await ServiceModel.findById(id).lean();
    if (!doc) return null;
    return this._mapToEntity(doc);
  }

  /**
   * @param {string} category
   * @returns {Promise<Service[]>}
   */
  async findByCategory(category) {
    const docs = await ServiceModel.find({ category }).lean();
    return docs.map(doc => this._mapToEntity(doc));
  }

  /**
   * @param {Service} service
   * @returns {Promise<Service>}
   */
  async save(service) {
    const doc = new ServiceModel({
      name: service.name,
      description: service.description,
      price: service.price,
      durationMin: service.durationMin,
      icon: service.icon,
      category: service.category,
      isActive: service.isActive,
      order: service.order
    });
    const savedDoc = await doc.save();
    return this._mapToEntity(savedDoc.toObject());
  }

  /**
   * @param {Service} service
   * @returns {Promise<Service>}
   */
  async update(service) {
    const updatedDoc = await ServiceModel.findByIdAndUpdate(
      service._id,
      {
        name: service.name,
        description: service.description,
        price: service.price,
        durationMin: service.durationMin,
        icon: service.icon,
        category: service.category,
        isActive: service.isActive,
        order: service.order
      },
      { new: true }
    ).lean();
    return this._mapToEntity(updatedDoc);
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    await ServiceModel.findByIdAndDelete(id);
  }

  _mapToEntity(doc) {
    return new Service({
      _id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      price: doc.price,
      durationMin: doc.durationMin,
      icon: doc.icon,
      category: doc.category,
      isActive: doc.isActive,
      order: doc.order,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }
}
