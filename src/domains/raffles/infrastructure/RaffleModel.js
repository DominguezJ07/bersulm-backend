import mongoose from 'mongoose';

const manualParticipantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    order: { type: Number, default: 0 }
  },
  { _id: true, timestamps: false }
);

const raffleSchema = new mongoose.Schema(
  {
    month: { type: String, required: true, unique: true },
    status: { type: String, enum: ['voting', 'scheduled', 'active', 'completed'], default: 'scheduled' },
    raffleDate: { type: Date, required: true },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    winnerReward: { type: String },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    manualParticipants: { type: [manualParticipantSchema], default: [] }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const RaffleModel = mongoose.model('Raffle', raffleSchema);
