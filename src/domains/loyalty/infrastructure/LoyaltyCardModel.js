import mongoose from 'mongoose';

const loyaltyCardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    visits: { type: Number, default: 0 },
    totalVisits: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'reward_pending', 'reward_claimed'], default: 'active' },
    currentCycle: { type: Number, default: 1 },
    rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },
    rewardWon: { type: String },
    claimedAt: { type: Date },
    minigameCards: [
      {
        position: { type: Number, required: true },
        rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', default: null },
        rewardName: { type: String, default: null },
        isWinner: { type: Boolean, default: false },
        revealed: { type: Boolean, default: false }
      }
    ]
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const LoyaltyCardModel = mongoose.model('LoyaltyCard', loyaltyCardSchema);
