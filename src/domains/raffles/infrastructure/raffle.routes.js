import { Router } from 'express';
import { RaffleController } from './RaffleController.js';
import { RaffleModel } from './RaffleModel.js';
import { RewardVoteModel } from './RewardVoteModel.js';
import { AppointmentModel } from '../../appointments/infrastructure/AppointmentModel.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';

const router = Router();
const controller = new RaffleController();

router.get('/current', controller.getCurrent);
router.get('/votes', authMiddleware, controller.getVotes);
router.post('/vote', authMiddleware, controller.vote);
router.post('/spin', authMiddleware, adminMiddleware, controller.spin);
router.post('/create-monthly', authMiddleware, adminMiddleware, controller.createMonthly);

router.post('/test-month-end', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const raffle = await RaffleModel.findOne({ month });
    if (!raffle) {
      return res.status(404).json({ success: false, message: 'No hay sorteo este mes' });
    }

    const votes = await RewardVoteModel.find({ raffleId: raffle._id });
    const voteCounts = {};
    votes.forEach(v => {
      const id = v.rewardId.toString();
      voteCounts[id] = (voteCounts[id] || 0) + 1;
    });

    const winnerRewardId = Object.entries(voteCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    const appointments = await AppointmentModel.find({
      status: 'confirmed',
      createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) }
    }).distinct('userId');

    await RaffleModel.findByIdAndUpdate(raffle._id, {
      status: 'active',
      winnerReward: winnerRewardId,
      participants: appointments.length > 0 ? appointments : raffle.participants
    });

    res.json({
      success: true,
      message: 'Fin de mes simulado',
      winnerReward: winnerRewardId,
      participants: appointments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
