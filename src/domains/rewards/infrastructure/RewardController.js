import { GetRewardsUseCase } from '../application/GetRewardsUseCase.js';
import { CreateRewardUseCase } from '../application/CreateRewardUseCase.js';
import { RewardNotFound } from '../domain/RewardErrors.js';
import { MongoRewardRepository } from './MongoRewardRepository.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';

const rewardRepository = new MongoRewardRepository();
const getRewardsUseCase = new GetRewardsUseCase(rewardRepository);
const createRewardUseCase = new CreateRewardUseCase(rewardRepository);

export class RewardController {
  async getAll(req, res) {
    try {
      const rewards = await getRewardsUseCase.execute();
      const { statusCode, body } = ApiResponse.success(rewards);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message);
      res.status(statusCode).json(body);
    }
  }

  async create(req, res) {
    try {
      const user = req.user;
      const { name, description, icon, type, isActive } = req.body;

      if (!name || !description || !icon || !type) {
        return res.status(400).json({ success: false, message: 'name, description, icon and type are required' });
      }

      const reward = await createRewardUseCase.execute(user, { name, description, icon, type, isActive });

      const { statusCode, body } = ApiResponse.created(reward);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const user = req.user;
      const { name, description, icon, type, isActive } = req.body;

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin privileges required' });
      }

      const existingReward = await rewardRepository.findById(id);
      if (!existingReward) {
        throw new RewardNotFound();
      }

      existingReward.name = name ?? existingReward.name;
      existingReward.description = description ?? existingReward.description;
      existingReward.icon = icon ?? existingReward.icon;
      existingReward.type = type ?? existingReward.type;
      existingReward.isActive = isActive ?? existingReward.isActive;

      const updated = await rewardRepository.update(existingReward);
      const { statusCode, body } = ApiResponse.success(updated);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      const user = req.user;

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin privileges required' });
      }

      const reward = await rewardRepository.findById(id);
      if (!reward) {
        throw new RewardNotFound();
      }

      await rewardRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
