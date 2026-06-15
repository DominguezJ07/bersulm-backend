import mongoose from 'mongoose';

const blockedSlotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm
    reason: { type: String }
  },
  {
    timestamps: true,
    collection: 'blocked_slots'
  }
);

blockedSlotSchema.index({ date: 1, time: 1 }, { unique: true });

export const BlockedSlotModel = mongoose.model('BlockedSlot', blockedSlotSchema);
