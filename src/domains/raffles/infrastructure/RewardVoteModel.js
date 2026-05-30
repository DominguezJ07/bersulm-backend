import mongoose from 'mongoose';

const rewardVoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  raffleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Raffle', required: true }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

rewardVoteSchema.index({ userId: 1, raffleId: 1 }, { unique: true });

export const RewardVoteModel = mongoose.model('RewardVote', rewardVoteSchema);
