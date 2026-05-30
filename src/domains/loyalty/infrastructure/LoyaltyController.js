import { GetLoyaltyCardUseCase } from '../application/GetLoyaltyCardUseCase.js';
import { AddVisitUseCase } from '../application/AddVisitUseCase.js';
import { ClaimRewardUseCase } from '../application/ClaimRewardUseCase.js';
import { SpinCardUseCase } from '../application/SpinCardUseCase.js';
import { MongoLoyaltyRepository } from './MongoLoyaltyRepository.js';
import { MongoRewardRepository } from '../../rewards/infrastructure/MongoRewardRepository.js';

const loyaltyRepository = new MongoLoyaltyRepository();
const rewardRepository = new MongoRewardRepository();
const getLoyaltyCardUseCase = new GetLoyaltyCardUseCase(loyaltyRepository);
const addVisitUseCase = new AddVisitUseCase(loyaltyRepository, rewardRepository);
const claimRewardUseCase = new ClaimRewardUseCase(loyaltyRepository);
const spinCardUseCase = new SpinCardUseCase(rewardRepository);

export class LoyaltyController {
  async getCard(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const card = await getLoyaltyCardUseCase.execute(userId);
      res.json({ success: true, data: card });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async addVisit(req, res) {
    try {
      const user = req.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin privileges required' });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      const card = await addVisitUseCase.execute(userId);
      res.json({ success: true, data: card });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async claimReward(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const card = await claimRewardUseCase.execute(userId);
      res.json({ success: true, data: card });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async spinCard(req, res) {
    try {
      const reward = await spinCardUseCase.execute();
      res.json({ success: true, data: reward });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}
