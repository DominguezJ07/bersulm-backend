import cron from 'node-cron';
import pino from 'pino';
import { RaffleModel } from '../../../domains/raffles/infrastructure/RaffleModel.js';
import { RewardVoteModel } from '../../../domains/raffles/infrastructure/RewardVoteModel.js';
import { AppointmentModel } from '../../../domains/appointments/infrastructure/AppointmentModel.js';

const logger = pino({ name: 'raffle-cron' });

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
      const month = getMonthString(now);
      const raffle = await RaffleModel.findOne({ month, status: 'voting' });

      if (!raffle) {
        logger.info('No hay sorteo en voting para el mes %s', month);
        return;
      }

      const winnerVote = await RewardVoteModel.aggregate([
        { $match: { raffleId: raffle._id } },
        { $group: { _id: '$rewardId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);

      const winnerReward = winnerVote.length > 0 ? winnerVote[0]._id.toString() : null;

      const participants = await AppointmentModel.distinct('userId', {
        status: 'completed',
        date: { $regex: `^${month}-` }
      });

      await RaffleModel.findByIdAndUpdate(
        raffle._id,
        {
          status: 'active',
          winnerReward,
          participants
        },
        { new: true }
      );

      logger.info({ month, winnerReward, participantsCount: participants.length }, 'Sorteo actualizado');
    } catch (error) {
      logger.error(error, 'Error en cron último día del mes');
    }
  });

  cron.schedule('1 0 1 * *', async () => {
    const now = new Date();
    logger.info('Ejecutando creación de sorteo nuevo mes: %s', now.toISOString());

    try {
      const month = getMonthString(now);
      const existing = await RaffleModel.findOne({ month });

      if (existing) {
        logger.info('Ya existe el sorteo del mes: %s', month);
        return;
      }

      const raffleDate = getLastDayOfMonthDate(now);
      await RaffleModel.create({
        month,
        status: 'voting',
        raffleDate,
        participants: []
      });

      logger.info({ month, raffleDate: raffleDate.toISOString() }, 'Sorteo nuevo mes creado');
    } catch (error) {
      logger.error(error, 'Error en cron día 1 del mes');
    }
  });
};
