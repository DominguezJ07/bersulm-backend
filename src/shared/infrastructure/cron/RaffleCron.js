import cron from 'node-cron';
import pino from 'pino';
import { MongoRaffleRepository } from '../../../domains/raffles/infrastructure/MongoRaffleRepository.js';
import { MongoRewardRepository } from '../../../domains/rewards/infrastructure/MongoRewardRepository.js';
import { MongoAppointmentRepository } from '../../../domains/appointments/infrastructure/MongoAppointmentRepository.js';
import { MongoUserRepository } from '../../../domains/auth/infrastructure/MongoUserRepository.js';
import { CloseMonthlyVotingUseCase } from '../../application/CloseMonthlyVotingUseCase.js';
import { notifyVotingEnded, notifyRaffleUpdate } from '../socket/SocketManager.js';
import FirebaseService from '../firebase/FirebaseService.js';
import env from '../../../config/env.js';

const logger = pino({ name: 'raffle-cron' });

const raffleRepository = new MongoRaffleRepository();
const rewardRepository = new MongoRewardRepository();
const appointmentRepository = new MongoAppointmentRepository();
const userRepository = new MongoUserRepository();

const closeMonthlyVotingUseCase = new CloseMonthlyVotingUseCase(
  raffleRepository,
  rewardRepository,
  appointmentRepository,
  userRepository
);

const isLastDayOfMonth = (date) => {
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  return tomorrow.getDate() === 1;
};

const getMonthString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const getLastDayOfMonthDate = (date) => {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  return new Date(year, monthIndex + 1, 0);
};

// Lógica de cierre de sorteo — reutilizada en modo normal y prueba
const closeCurrentRaffle = async () => {
  try {
    const result = await closeMonthlyVotingUseCase.execute();

    if (!result) {
      logger.info('No hay sorteo en voting para procesar');
      return null;
    }

    notifyVotingEnded({
      raffleId: result.raffleId,
      month: result.month,
      winnerReward: result.winnerReward,
      winnerRewardName: result.winnerRewardName,
      status: 'active'
    });

    notifyRaffleUpdate(result.updatedRaffle);

    if (result.allFcmTokens?.length > 0) {
      FirebaseService.sendMulticast(result.allFcmTokens, {
        title: '🎉 ¡Votaciones cerradas!',
        body: `El premio ganador es: ${result.winnerRewardName}`,
        data: {
          type: 'raffle_voting_ended',
          raffleId: result.raffleId,
          month: result.month
        }
      }).catch((err) => logger.error(err, 'Error sending push notifications'));
    }

    logger.info(result, 'Sorteo cerrado y actualizado');
    return result;
  } catch (error) {
    logger.error(error, 'Error cerrando sorteo');
    return null;
  }
};

// Lógica de creación de nuevo sorteo
const createNewRaffle = async (customMonth = null) => {
  try {
    const now = new Date();
    const month = customMonth || getMonthString(now);
    const existing = await raffleRepository.findByMonth(month);

    if (existing) {
      logger.info('Ya existe sorteo para: %s', month);
      return existing;
    }

    const raffleDate = getLastDayOfMonthDate(now);
    const newRaffle = await raffleRepository.create({
      month,
      status: 'voting',
      raffleDate,
      participants: [],
      manualParticipants: []
    });

    logger.info({ month }, 'Nuevo sorteo creado');
    notifyRaffleUpdate(newRaffle);
    return newRaffle;
  } catch (error) {
    logger.error(error, 'Error creando nuevo sorteo');
    return null;
  }
};

export const initRaffleCrons = () => {
  const testMode = env.TEST_MODE === 'true' || env.TEST_MODE === true;

  if (testMode) {
    logger.info('🧪 MODO PRUEBA ACTIVADO — Ciclo cada 10 minutos');
    logger.info('  Minuto 0: crear sorteo');
    logger.info('  Minuto 5: cerrar votaciones');
    logger.info('  Minuto 10: crear nuevo sorteo');

    // Fase 1 — cada 10 minutos en el minuto 5 del intervalo:
    // cerrar sorteo actual
    // Ejecuta en los minutos: 0, 10, 20, 30, 40, 50
    cron.schedule('*/10 * * * *', async () => {
      logger.info('🧪 TEST: Cerrando sorteo actual...');
      await closeCurrentRaffle();
    });

    // Fase 2 — 5 minutos después del cierre: crear nuevo sorteo
    // Ejecuta en los minutos: 5, 15, 25, 35, 45, 55
    cron.schedule('5-59/10 * * * *', async () => {
      logger.info('🧪 TEST: Creando nuevo sorteo...');
      // Usar timestamp para que cada sorteo de prueba
      // tenga un mes único y no colisione
      const now = new Date();
      const testMonth = `TEST-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(Math.floor(now.getMinutes() / 10) * 10).padStart(2, '0')}`;
      await createNewRaffle(testMonth);
    });

    return;
  }

  // MODO NORMAL — crons mensuales
  logger.info('📅 Modo normal — Crons mensuales activados');

  // Cierre de votaciones — último día del mes a las 23:59
  cron.schedule('59 23 28-31 * *', async () => {
    const now = new Date();
    if (!isLastDayOfMonth(now)) return;
    logger.info('Ejecutando cierre mensual: %s', now.toISOString());
    await closeCurrentRaffle();
  });

  // Creación de nuevo sorteo — día 1 del mes a las 00:01
  cron.schedule('1 0 1 * *', async () => {
    const now = new Date();
    logger.info('Ejecutando creación sorteo nuevo mes: %s', now.toISOString());
    await createNewRaffle();
  });
};
