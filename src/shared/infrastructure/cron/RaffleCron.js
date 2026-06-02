import cron from 'node-cron';
import { RaffleModel } from '../../../domains/raffles/infrastructure/RaffleModel.js';
import { RewardVoteModel } from '../../../domains/raffles/infrastructure/RewardVoteModel.js';
import { AppointmentModel } from '../../../domains/appointments/infrastructure/AppointmentModel.js';

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

    console.log('[RaffleCron] Ejecutando último día del mes:', now.toISOString());

    try {
      const month = getMonthString(now);
      const raffle = await RaffleModel.findOne({ month, status: 'voting' });

      if (!raffle) {
        console.log('[RaffleCron] No hay sorteo en voting para el mes', month);
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

      console.log('[RaffleCron] Sorteo actualizado:', {
        month,
        winnerReward,
        participantsCount: participants.length
      });
    } catch (error) {
      console.error('[RaffleCron] Error en cron último día del mes:', error);
    }
  });

  cron.schedule('1 0 1 * *', async () => {
    const now = new Date();
    console.log('[RaffleCron] Ejecutando creación de sorteo nuevo mes:', now.toISOString());

    try {
      const month = getMonthString(now);
      const existing = await RaffleModel.findOne({ month });

      if (existing) {
        console.log('[RaffleCron] Ya existe el sorteo del mes:', month);
        return;
      }

      const raffleDate = getLastDayOfMonthDate(now);
      await RaffleModel.create({
        month,
        status: 'voting',
        raffleDate,
        participants: []
      });

      console.log('[RaffleCron] Sorteo nuevo mes creado:', month, raffleDate.toISOString());
    } catch (error) {
      console.error('[RaffleCron] Error en cron día 1 del mes:', error);
    }
  });
};
