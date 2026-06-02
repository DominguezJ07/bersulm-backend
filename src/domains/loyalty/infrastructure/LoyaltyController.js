import { GetLoyaltyCardUseCase } from '../application/GetLoyaltyCardUseCase.js';
import { AddVisitUseCase } from '../application/AddVisitUseCase.js';
import { ClaimRewardUseCase } from '../application/ClaimRewardUseCase.js';
import { SpinCardUseCase } from '../application/SpinCardUseCase.js';
import { MongoLoyaltyRepository } from './MongoLoyaltyRepository.js';
import { MongoRewardRepository } from '../../rewards/infrastructure/MongoRewardRepository.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';

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
      const { statusCode, body } = ApiResponse.success(card);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async addVisit(req, res) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      const card = await addVisitUseCase.execute(userId);
      const { statusCode, body } = ApiResponse.success(card);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async claimReward(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const card = await claimRewardUseCase.execute(userId);
      const { statusCode, body } = ApiResponse.success(card);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async spinCard(req, res) {
    try {
      const reward = await spinCardUseCase.execute();
      const { statusCode, body } = ApiResponse.success(reward);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
