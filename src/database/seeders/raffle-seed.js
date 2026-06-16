import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

const MONGODB_URI = process.env.MONGODB_URI;

const raffleSchema = new mongoose.Schema(
  {
    month: { type: String, required: true, unique: true },
    status: { type: String, default: 'voting' },
    raffleDate: { type: Date, required: true },
    participants: { type: Array, default: [] },
    manualParticipants: { type: Array, default: [] }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const RaffleModel = mongoose.models.Raffle || mongoose.model('Raffle', raffleSchema);

async function seedRaffle() {
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado a MongoDB');

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const existing = await RaffleModel.findOne({ month });
  if (existing) {
    console.log(`✓ Ya existe el sorteo del mes ${month} con status: ${existing.status}`);
    await mongoose.disconnect();
    return;
  }

  await RaffleModel.create({
    month,
    status: 'voting',
    raffleDate: lastDay,
    participants: [],
    manualParticipants: []
  });

  console.log(`✓ Sorteo del mes ${month} creado correctamente`);
  console.log(`  Estado: voting`);
  console.log(`  Fecha de sorteo: ${lastDay.toISOString()}`);
  await mongoose.disconnect();
}

seedRaffle().catch(console.error);
