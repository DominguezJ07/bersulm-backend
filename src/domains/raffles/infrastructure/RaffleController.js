import { GetCurrentRaffleUseCase } from '../application/GetCurrentRaffleUseCase.js';
import { VoteForRewardUseCase } from '../application/VoteForRewardUseCase.js';
import { SpinRaffleUseCase } from '../application/SpinRaffleUseCase.js';
import { GetVotesUseCase } from '../application/GetVotesUseCase.js';
import { AddManualParticipantUseCase } from '../application/AddManualParticipantUseCase.js';
import { RemoveManualParticipantUseCase } from '../application/RemoveManualParticipantUseCase.js';
import { MongoRaffleRepository } from './MongoRaffleRepository.js';
import { MongoRewardRepository } from '../../rewards/infrastructure/MongoRewardRepository.js';
import { RaffleModel } from './RaffleModel.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';

const raffleRepository = new MongoRaffleRepository();
const rewardRepository = new MongoRewardRepository();
const getCurrentRaffleUseCase = new GetCurrentRaffleUseCase(raffleRepository, rewardRepository);
const voteForRewardUseCase = new VoteForRewardUseCase(raffleRepository);
const spinRaffleUseCase = new SpinRaffleUseCase(raffleRepository);
const getVotesUseCase = new GetVotesUseCase(raffleRepository);
const addManualParticipantUseCase = new AddManualParticipantUseCase(raffleRepository);
const removeManualParticipantUseCase = new RemoveManualParticipantUseCase(raffleRepository);

export class RaffleController {
  async getCurrent(req, res) {
    try {
      const userId = req.user?.id || null;
      const result = await getCurrentRaffleUseCase.execute(userId);
      const { statusCode, body } = ApiResponse.success(result);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async vote(req, res) {
    try {
      const { rewardId, raffleId } = req.body;
      const vote = await voteForRewardUseCase.execute(req.user, raffleId, rewardId);
      const { statusCode, body } = ApiResponse.created(vote);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async spin(req, res) {
    try {
      const user = req.user;
      const { raffleId } = req.body;

      if (!raffleId) {
        return res.status(400).json({ success: false, message: 'raffleId is required' });
      }

      const raffle = await spinRaffleUseCase.execute(user, raffleId);
      res.json({ success: true, data: raffle });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async getVotes(req, res) {
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const raffle = await RaffleModel.findOne({ month });

      if (!raffle) {
        return res.json({ success: true, data: { votes: [], totalVotes: 0 } });
      }

      const userId = req.user?.id || null;
      const result = await getVotesUseCase.execute(raffle._id.toString(), userId);

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createMonthly(req, res) {
    try {
      const { month, status, raffleDate } = req.body;
      if (!month || !raffleDate) {
        return res.status(400).json({ success: false, message: 'month and raffleDate are required' });
      }

      const raffle = await RaffleModel.create({
        month,
        status: status || 'voting',
        raffleDate: new Date(raffleDate),
        participants: [],
        manualParticipants: [],
        createdAt: new Date()
      });

      res.status(201).json({ success: true, data: raffle });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async addParticipant(req, res) {
    try {
      const { raffleId, name, userId } = req.body;
      const raffle = await addManualParticipantUseCase.execute(req.user, raffleId, { name, userId });
      const { statusCode, body } = ApiResponse.success(raffle);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async removeParticipant(req, res) {
    try {
      const { raffleId, participantId } = req.params;
      const raffle = await removeManualParticipantUseCase.execute(req.user, raffleId, participantId);
      const { statusCode, body } = ApiResponse.success(raffle);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async getParticipants(req, res) {
    try {
      const { raffleId } = req.params;
      const participants = await raffleRepository.getManualParticipants(raffleId);
      const { statusCode, body } = ApiResponse.success(participants);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
