import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['client', 'admin'], default: 'client' },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: null },
    fcmTokens: [{ type: String }]
  },
  {
    timestamps: true
  }
);

export const UserModel = mongoose.model('User', userSchema);
