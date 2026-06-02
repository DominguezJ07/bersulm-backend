import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import env from '../../config/env.js';
import { UserModel } from '../../domains/auth/infrastructure/UserModel.js';
import { ServiceModel } from '../../domains/services/infrastructure/ServiceModel.js';
import { RewardModel } from '../../domains/rewards/infrastructure/RewardModel.js';
import { RaffleModel } from '../../domains/raffles/infrastructure/RaffleModel.js';
import BcryptService from '../../shared/infrastructure/bcrypt/BcryptService.js';

const adminUser = {
  name: 'Admin BERSULM',
  email: 'admin@bersulm.com',
  phone: '3001234567',
  password: 'Admin2026$',
  role: 'admin'
};

const testClientUser = {
  name: 'Julian Dominguez',
  email: 'julian@bersulm.com',
  phone: '3001234568',
  password: '123456',
  role: 'client'
};

const services = [
  {
    name: 'Corte Clásico',
    description: 'Corte clásico de cabello',
    price: 25,
    durationMin: 30,
    icon: 'corte',
    category: 'corte',
    order: 1
  },
  {
    name: 'Corte + Barba',
    description: 'Corte de cabello con arreglo de barba',
    price: 40,
    durationMin: 45,
    icon: 'barba',
    category: 'barba',
    order: 2
  },
  {
    name: 'Afeitado Clásico',
    description: 'Afeitado clásico con toalla caliente',
    price: 20,
    durationMin: 25,
    icon: 'barba',
    category: 'barba',
    order: 3
  },
  {
    name: 'Coloración',
    description: 'Coloración de cabello profesional',
    price: 50,
    durationMin: 60,
    icon: 'color',
    category: 'color',
    order: 4
  },
  {
    name: 'Diseño de Cejas',
    description: 'Diseño y arreglo de cejas',
    price: 15,
    durationMin: 15,
    icon: 'extra',
    category: 'extra',
    order: 5
  },
  {
    name: 'Tratamiento Capilar',
    description: 'Tratamiento intensivo capilar',
    price: 35,
    durationMin: 40,
    icon: 'extra',
    category: 'extra',
    order: 6
  }
];

const rewards = [
  { name: 'Corte Gratis', description: 'Gana un corte de cabello gratis', icon: 'corte', type: 'corte' },
  {
    name: '30% Descuento',
    description: 'Descuento del 30% en cualquier servicio',
    icon: 'descuento',
    type: 'descuento'
  },
  { name: 'Bebida Premium', description: 'Bebida premium gratuita', icon: 'bebida', type: 'bebida' },
  {
    name: 'Tratamiento Capilar',
    description: 'Tratamiento capilar gratuito',
    icon: 'tratamiento',
    type: 'tratamiento'
  },
  { name: 'Kit de Productos', description: 'Kit de productos para el cuidado del cabello', icon: 'kit', type: 'kit' },
  { name: 'Perfilado de Barba', description: 'Perfilado de barba profesional', icon: 'perfilado', type: 'perfilado' }
];

const loyaltyRewards = [
  {
    name: 'Bebida Gratis',
    description: 'Disfruta de una bebida gratis en tu visita',
    icon: 'bebida',
    type: 'bebida',
    isLoyaltyReward: true
  },
  {
    name: '30% Descuento Fidelidad',
    description: '30% de descuento en tu próximo servicio',
    icon: 'descuento',
    type: 'descuento',
    isLoyaltyReward: true
  },
  {
    name: '10% Descuento Fidelidad',
    description: '10% de descuento en tu próximo servicio',
    icon: 'descuento',
    type: 'descuento',
    isLoyaltyReward: true
  },
  {
    name: 'Perfilado de Cejas',
    description: 'Perfilado de cejas gratuito',
    icon: 'perfilado',
    type: 'perfilado',
    isLoyaltyReward: true
  }
];

const getCurrentMonthRaffle = () => {
  const today = new Date();
  const monthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const raffleDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  return {
    month: monthString,
    status: 'voting',
    raffleDate
  };
};

export const runSeed = async () => {
  try {
    console.log('Connecting to MongoDB:', env.MONGODB_URI);
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected');

    const existingAdmin = await UserModel.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      const passwordHash = await BcryptService.hash(adminUser.password);
      await UserModel.create({ ...adminUser, passwordHash });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists, skipping');
    }

    const existingClient = await UserModel.findOne({ email: testClientUser.email });
    if (!existingClient) {
      const passwordHash = await BcryptService.hash(testClientUser.password);
      await UserModel.create({ ...testClientUser, passwordHash });
      console.log('Test client user created');
    } else {
      console.log('Test client user already exists, skipping');
    }

    for (const service of services) {
      const existingService = await ServiceModel.findOne({ name: service.name });
      if (!existingService) {
        await ServiceModel.create(service);
        console.log(`Service created: ${service.name}`);
      } else {
        console.log(`Service already exists, skipping: ${service.name}`);
      }
    }

    for (const reward of rewards) {
      const existingReward = await RewardModel.findOne({ name: reward.name });
      if (!existingReward) {
        await RewardModel.create(reward);
        console.log(`Reward created: ${reward.name}`);
      } else {
        console.log(`Reward already exists, skipping: ${reward.name}`);
      }
    }

    for (const reward of loyaltyRewards) {
      const existingReward = await RewardModel.findOne({ name: reward.name });
      if (!existingReward) {
        await RewardModel.create(reward);
        console.log(`Loyalty reward created: ${reward.name}`);
      } else {
        console.log(`Loyalty reward already exists, skipping: ${reward.name}`);
      }
    }

    const raffleData = getCurrentMonthRaffle();
    const existingRaffle = await RaffleModel.findOne({ month: raffleData.month });
    if (!existingRaffle) {
      await RaffleModel.create(raffleData);
      console.log(`Raffle created for month: ${raffleData.month}`);
    } else {
      console.log(`Raffle already exists for month: ${raffleData.month}, skipping`);
    }

    console.log('Seed process completed');
  } catch (error) {
    console.error('Seed process failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
};

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1].endsWith('seed.js') || path.basename(__filename) === 'seed.js') {
  runSeed();
}
