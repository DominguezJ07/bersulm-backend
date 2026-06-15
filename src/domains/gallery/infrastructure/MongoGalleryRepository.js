import { GalleryModel } from './GalleryModel.js';
import { GalleryItem } from '../domain/GalleryItem.entity.js';
import { IGalleryRepository } from '../domain/IGalleryRepository.js';

export class MongoGalleryRepository extends IGalleryRepository {
  async findAll() {
    const docs = await GalleryModel.find().lean();
    return docs.map((doc) => this._mapToEntity(doc));
  }

  async findByCategory(category) {
    const query = category && category !== 'todos' ? { category } : {};
    const docs = await GalleryModel.find(query).lean();
    return docs.map((doc) => this._mapToEntity(doc));
  }

  async findById(id) {
    const doc = await GalleryModel.findById(id).lean();
    return doc ? this._mapToEntity(doc) : null;
  }

  async save(galleryItem) {
    const doc = new GalleryModel({
      imageUrl: galleryItem.imageUrl,
      title: galleryItem.title,
      category: galleryItem.category,
      isActive: galleryItem.isActive,
      order: galleryItem.order,
      uploadedBy: galleryItem.uploadedBy
    });
    const saved = await doc.save();
    return this._mapToEntity(saved.toObject());
  }

  async update(galleryItem) {
    const updated = await GalleryModel.findByIdAndUpdate(
      galleryItem._id,
      {
        imageUrl: galleryItem.imageUrl,
        title: galleryItem.title,
        category: galleryItem.category,
        isActive: galleryItem.isActive,
        order: galleryItem.order,
        uploadedBy: galleryItem.uploadedBy
      },
      { new: true }
    ).lean();
    return updated ? this._mapToEntity(updated) : null;
  }

  async delete(id) {
    await GalleryModel.findByIdAndDelete(id);
  }

  _mapToEntity(doc) {
    return new GalleryItem({
      _id: doc._id.toString(),
      imageUrl: doc.imageUrl,
      title: doc.title,
      category: doc.category,
      isActive: doc.isActive,
      order: doc.order,
      uploadedBy: doc.uploadedBy?.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }
}
