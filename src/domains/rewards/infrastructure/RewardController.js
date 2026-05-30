import { GetRewardsUseCase } from '../application/GetRewardsUseCase.js';
import { CreateRewardUseCase } from '../application/CreateRewardUseCase.js';
import { RewardNotFound } from '../domain/RewardErrors.js';
import { MongoRewardRepository } from './MongoRewardRepository.js';

const rewardRepository = new MongoRewardRepository();
const getRewardsUseCase = new GetRewardsUseCase(rewardRepository);
const createRewardUseCase = new CreateRewardUseCase(rewardRepository);

export class RewardController {
  async getAll(req, res) {
    try {
      const rewards = await getRewardsUseCase.execute();
      res.json({ success: true, data: rewards });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const user = req.user;
      const { name, description, icon, type, isActive } = req.body;

      if (!name || !description || !icon || !type) {
        return res.status(400).json({
          success: false,
          message: 'name, description, icon and type are required'
        });
      }

      const reward = await createRewardUseCase.execute(user, {
        name,
        description,
        icon,
        type,
        isActive
      });

      res.status(201).json({ success: true, data: reward });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
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
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
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
      res.json({ success: true, data: reward });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}
