import cron from 'node-cron';
import pino from 'pino';
import { MongoRaffleRepository } from '../../../domains/raffles/infrastructure/MongoRaffleRepository.js';
import { MongoRewardRepository } from '../../../domains/rewards/infrastructure/MongoRewardRepository.js';
import { MongoAppointmentRepository } from '../../../domains/appointments/infrastructure/MongoAppointmentRepository.js';
import { MongoUserRepository } from '../../../domains/auth/infrastructure/MongoUserRepository.js';
import { CloseMonthlyVotingUseCase } from '../../application/CloseMonthlyVotingUseCase.js';
import { notifyVotingEnded, notifyRaffleUpdate } from '../socket/SocketManager.js';
import FirebaseService from '../firebase/FirebaseService.js';

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
      }).catch((err) => logger.error(err, 'Error sending push'));
    }
    logger.info(result, 'Sorteo cerrado');
    return result;
  } catch (error) {
    logger.error(error, 'Error cerrando sorteo');
    return null;
  }
};

const createNewRaffle = async () => {
  try {
    const now = new Date();
    const testMode = process.env.TEST_MODE === 'true';

    const month = testMode ? `TEST-${Date.now()}` : getMonthString(now);

    const existing = await raffleRepository.findByMonth(month);
    if (existing) {
      logger.info('Ya existe sorteo para: %s', month);
      return existing;
    }

    const raffleDate = testMode ? new Date(Date.now() + 10 * 60 * 1000) : getLastDayOfMonthDate(now);

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
    logger.error(error, 'Error creando sorteo');
    return null;
  }
};

export const initRaffleCrons = () => {
  const testMode = process.env.TEST_MODE === 'true';

  if (testMode) {
    logger.info('🧪 MODO PRUEBA — ciclo cada 10 minutos');

    // Crear sorteo inicial si no hay ninguno activo
    setTimeout(async () => {
      try {
        const existing = await raffleRepository.findCurrent();
        if (!existing) {
          logger.info('🧪 Creando sorteo inicial...');
          await createNewRaffle();
        } else {
          logger.info('🧪 Sorteo existente encontrado: %s', existing.month);
        }
      } catch {
        logger.info('🧪 Creando sorteo inicial...');
        await createNewRaffle();
      }
    }, 2000);

    // Cada 10 minutos en minuto 0: cerrar sorteo actual
    cron.schedule('*/10 * * * *', async () => {
      logger.info('🧪 TEST: Cerrando sorteo...');
      await closeCurrentRaffle();
    });

    // Cada 10 minutos en minuto 5: crear nuevo sorteo
    cron.schedule('5-59/10 * * * *', async () => {
      logger.info('🧪 TEST: Creando nuevo sorteo...');
      await createNewRaffle();
    });

    return;
  }

  // MODO NORMAL — mensual
  logger.info('📅 Crons mensuales activados');

  cron.schedule('59 23 28-31 * *', async () => {
    const now = new Date();
    if (!isLastDayOfMonth(now)) return;
    logger.info('Cierre mensual: %s', now.toISOString());
    await closeCurrentRaffle();
  });

  cron.schedule('1 0 1 * *', async () => {
    const now = new Date();
    logger.info('Creando sorteo nuevo mes: %s', now.toISOString());
    await createNewRaffle();
  });
};
