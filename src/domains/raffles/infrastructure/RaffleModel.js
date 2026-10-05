import mongoose from 'mongoose';

const manualParticipantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    order: { type: Number, default: 0 }
  },
  { _id: true, timestamps: false }
);

const prizeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1 && arr.length <= 3,
        message: 'El premio debe tener entre 1 y 3 imágenes'
      }
    }
  },
  { _id: false }
);

const raffleSchema = new mongoose.Schema(
  {
    month: { type: String, required: true, unique: true },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    raffleDate: { type: Date, required: true },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    prize: { type: prizeSchema, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    manualParticipants: { type: [manualParticipantSchema], default: [] }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const RaffleModel = mongoose.model('Raffle', raffleSchema);
