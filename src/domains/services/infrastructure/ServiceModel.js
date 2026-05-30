import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  durationMin: { type: Number, required: true },
  icon: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['corte', 'barba', 'color', 'extra'], 
    required: true 
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const ServiceModel = mongoose.model('Service', serviceSchema);
