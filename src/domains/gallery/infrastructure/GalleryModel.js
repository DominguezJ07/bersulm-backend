import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['todos', 'cortes', 'barba'], default: 'todos' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

galleryItemSchema.index({ category: 1, order: 1 });

export const GalleryModel = mongoose.model('GalleryItem', galleryItemSchema);
