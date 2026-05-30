import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  type: { type: String, enum: ['corte', 'descuento', 'bebida', 'tratamiento', 'kit', 'perfilado'], required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

rewardSchema.index({ type: 1, isActive: 1 });

export const RewardModel = mongoose.model('Reward', rewardSchema);
