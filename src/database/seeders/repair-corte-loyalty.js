import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import env from '../../config/env.js';
import { RewardModel } from '../../domains/rewards/infrastructure/RewardModel.js';

const LEGACY_NAME = 'Corte Gratis';
const UNIQUE_NAME = 'Corte Gratis Fidelidad';

export const runRepair = async () => {
  try {
    console.log('Connecting to MongoDB:', env.MONGODB_URI);
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected');

    const existingUnique = await RewardModel.findOne({ name: UNIQUE_NAME, isLoyaltyReward: true });
    if (existingUnique) {
      console.log(`Loyalty reward "${UNIQUE_NAME}" already exists, nothing to do`);
      return;
    }

    const legacyLoyalty = await RewardModel.findOne({ name: LEGACY_NAME, isLoyaltyReward: true });
    if (legacyLoyalty) {
      legacyLoyalty.name = UNIQUE_NAME;
      await legacyLoyalty.save();
      console.log(`Renamed legacy loyalty reward "${LEGACY_NAME}" to "${UNIQUE_NAME}"`);
    } else {
      console.log(`No legacy loyalty reward "${LEGACY_NAME}" found, nothing to rename`);
    }
  } catch (error) {
    console.error('Repair process failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
};

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1].endsWith('repair-corte-loyalty.js') || path.basename(__filename) === 'repair-corte-loyalty.js') {
  runRepair();
}
