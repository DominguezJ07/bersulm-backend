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

export const initRaffleCrons = () => {
  cron.schedule('59 23 28-31 * *', async () => {
    const now = new Date();
    if (!isLastDayOfMonth(now)) {
      return;
    }

    logger.info('Ejecutando último día del mes: %s', now.toISOString());

    try {
      const result = await closeMonthlyVotingUseCase.execute();

      if (!result) {
        logger.info('No hay sorteo en voting para procesar');
        return;
      }

      notifyVotingEnded({
        raffleId: result.raffleId,
        month: result.month,
        winnerReward: result.winnerReward,
        winnerRewardName: result.winnerRewardName,
        status: 'active'
      });

      notifyRaffleUpdate(result.updatedRaffle);

      if (result.allFcmTokens.length > 0) {
        FirebaseService.sendMulticast(result.allFcmTokens, {
          title: 'Votaciones cerradas',
          body: `El premio ganador del sorteo mensual es: ${result.winnerRewardName}`,
          data: {
            type: 'raffle_voting_ended',
            raffleId: result.raffleId,
            month: result.month
          }
        }).catch((err) => logger.error(err, 'Error sending push notifications'));
      }

      logger.info(result, 'Sorteo cerrado y actualizado');
    } catch (error) {
      logger.error(error, 'Error en cron último día del mes');
    }
  });

  cron.schedule('1 0 1 * *', async () => {
    const now = new Date();
    logger.info('Ejecutando creación de sorteo nuevo mes: %s', now.toISOString());

    try {
      const month = getMonthString(now);
      const existing = await raffleRepository.findByMonth(month);

      if (existing) {
        logger.info('Ya existe el sorteo del mes: %s', month);
        return;
      }

      const raffleDate = getLastDayOfMonthDate(now);
      await raffleRepository.create({
        month,
        status: 'voting',
        raffleDate,
        participants: [],
        manualParticipants: []
      });

      logger.info({ month, raffleDate: raffleDate.toISOString() }, 'Sorteo nuevo mes creado');
    } catch (error) {
      logger.error(error, 'Error en cron día 1 del mes');
    }
  });
};
