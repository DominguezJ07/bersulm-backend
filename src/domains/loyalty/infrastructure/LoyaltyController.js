import { useCases, repos } from '../../../shared/infrastructure/container.js';
import { LoyaltyCard } from '../domain/LoyaltyCard.entity.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';
import { notifyLoyaltyUpdate } from '../../../shared/infrastructure/socket/SocketManager.js';

export class LoyaltyController {
  constructor() {
    this.getLoyaltyCardUseCase = useCases.loyalty.getCard();
    this.addVisitUseCase = useCases.loyalty.addVisit();
    this.spinCardUseCase = useCases.loyalty.spinCard();
    this.initMinigameUseCase = useCases.loyalty.initMinigame();
    this.revealCardUseCase = useCases.loyalty.revealCard();
    this.loyaltyRepository = repos.loyalty();
  }

  async getCard(req, res) {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const card = await this.getLoyaltyCardUseCase.execute(user);
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

      const card = await this.addVisitUseCase.execute(userId);
      const { statusCode, body } = ApiResponse.success(card);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async spinCard(req, res) {
    try {
      const reward = await this.spinCardUseCase.execute();
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
      const data = await this.initMinigameUseCase.execute(userId);
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
      const result = await this.revealCardUseCase.execute(userId, cardIndex);
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

      let card = await this.loyaltyRepository.findByUserId(userId);
      if (!card) {
        card = LoyaltyCard.create({ userId, visits: 0, totalVisits: 0, status: 'active', currentCycle: 1 });
        card = await this.loyaltyRepository.save(card);
      }

      const { statusCode, body } = ApiResponse.success(card);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
