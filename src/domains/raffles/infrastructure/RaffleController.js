import { GetCurrentRaffleUseCase } from '../application/GetCurrentRaffleUseCase.js';
import { VoteForRewardUseCase } from '../application/VoteForRewardUseCase.js';
import { SpinRaffleUseCase } from '../application/SpinRaffleUseCase.js';
import { GetVotesUseCase } from '../application/GetVotesUseCase.js';
import { AddManualParticipantUseCase } from '../application/AddManualParticipantUseCase.js';
import { RemoveManualParticipantUseCase } from '../application/RemoveManualParticipantUseCase.js';
import { CreateMonthlyRaffleUseCase } from '../application/CreateMonthlyRaffleUseCase.js';
import { GetVotesByMonthUseCase } from '../application/GetVotesByMonthUseCase.js';
import { MongoRaffleRepository } from './MongoRaffleRepository.js';
import { MongoRewardRepository } from '../../rewards/infrastructure/MongoRewardRepository.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';
import { notifyRaffleWinner } from '../../../shared/infrastructure/socket/SocketManager.js';

const raffleRepository = new MongoRaffleRepository();
const rewardRepository = new MongoRewardRepository();
const getCurrentRaffleUseCase = new GetCurrentRaffleUseCase(raffleRepository, rewardRepository);
const voteForRewardUseCase = new VoteForRewardUseCase(raffleRepository);
const spinRaffleUseCase = new SpinRaffleUseCase(raffleRepository);
const getVotesUseCase = new GetVotesUseCase(raffleRepository);
const addManualParticipantUseCase = new AddManualParticipantUseCase(raffleRepository);
const removeManualParticipantUseCase = new RemoveManualParticipantUseCase(raffleRepository);
const createMonthlyRaffleUseCase = new CreateMonthlyRaffleUseCase(raffleRepository);
const getVotesByMonthUseCase = new GetVotesByMonthUseCase(raffleRepository);

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
      notifyRaffleWinner(raffle);
      res.json({ success: true, data: raffle });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async getVotes(req, res) {
    try {
      const userId = req.user?.id || null;
      const result = await getVotesByMonthUseCase.execute(userId);
      const { statusCode, body } = ApiResponse.success(result);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async createMonthly(req, res) {
    try {
      const { month, status, raffleDate } = req.body;
      const raffle = await createMonthlyRaffleUseCase.execute({ month, status, raffleDate });
      const { statusCode, body } = ApiResponse.created(raffle);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
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
