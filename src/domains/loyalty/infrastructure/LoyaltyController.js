import { GetLoyaltyCardUseCase } from '../application/GetLoyaltyCardUseCase.js';
import { AddVisitUseCase } from '../application/AddVisitUseCase.js';
import { SpinCardUseCase } from '../application/SpinCardUseCase.js';
import { InitMinigameUseCase } from '../application/InitMinigameUseCase.js';
import { RevealCardUseCase } from '../application/RevealCardUseCase.js';
import { MongoLoyaltyRepository } from './MongoLoyaltyRepository.js';
import { MongoRewardRepository } from '../../rewards/infrastructure/MongoRewardRepository.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';
import { notifyLoyaltyUpdate } from '../../../shared/infrastructure/socket/SocketManager.js';

const loyaltyRepository = new MongoLoyaltyRepository();
const rewardRepository = new MongoRewardRepository();
const getLoyaltyCardUseCase = new GetLoyaltyCardUseCase(loyaltyRepository);
const addVisitUseCase = new AddVisitUseCase(loyaltyRepository);
const spinCardUseCase = new SpinCardUseCase(rewardRepository);
const initMinigameUseCase = new InitMinigameUseCase(loyaltyRepository, rewardRepository);
const revealCardUseCase = new RevealCardUseCase(loyaltyRepository);

export class LoyaltyController {
  async getCard(req, res) {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const card = await getLoyaltyCardUseCase.execute(user);
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

  async initMinigame(req, res) {
    try {
      const userId = req.user.id;
      const data = await initMinigameUseCase.execute(userId);
      const { statusCode, body } = ApiResponse.success(data);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async revealCard(req, res) {
    try {
      const userId = req.user.id;
      const { cardIndex } = req.body;
      if (cardIndex === undefined || cardIndex === null) {
        return res.status(400).json({ success: false, message: 'cardIndex is required' });
      }
      const result = await revealCardUseCase.execute(userId, cardIndex);
      notifyLoyaltyUpdate(result);
      const { statusCode, body } = ApiResponse.success(result);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async getUserCard(req, res) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId param is required' });
      }

      const card = await loyaltyRepository.findByUserId(userId);
      if (!card) {
        return res.status(404).json({ success: false, message: 'User has no loyalty card' });
      }

      const { statusCode, body } = ApiResponse.success(card);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
