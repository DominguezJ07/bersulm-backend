import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:mm
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  notes: { type: String, default: '' },
  totalPrice: { type: Number, required: false, default: 0 },
  cancelledAt: { type: Date },
  cancelReason: { type: String }
}, {
  timestamps: true
});

// Index for quick search of availability
appointmentSchema.index({ date: 1, time: 1, status: 1 });

export const AppointmentModel = mongoose.model('Appointment', appointmentSchema);
