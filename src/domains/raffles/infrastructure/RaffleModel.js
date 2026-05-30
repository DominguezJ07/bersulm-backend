import mongoose from 'mongoose';

const raffleSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true },
  status: { type: String, enum: ['voting', 'scheduled', 'active', 'completed'], default: 'scheduled' },
  raffleDate: { type: Date, required: true },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  winnerReward: { type: String },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

raffleSchema.index({ month: 1 });

export const RaffleModel = mongoose.model('Raffle', raffleSchema);
