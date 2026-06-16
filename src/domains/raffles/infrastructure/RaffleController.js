import { useCases, repos } from '../../../shared/infrastructure/container.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';
import { notifyRaffleWinner } from '../../../shared/infrastructure/socket/SocketManager.js';
import { GetRaffleHistoryUseCase } from '../application/GetRaffleHistoryUseCase.js';

const raffleRepository = repos.raffle();
const rewardRepository = repos.reward();
const getRaffleHistoryUseCase = new GetRaffleHistoryUseCase(raffleRepository, rewardRepository);

export class RaffleController {
  constructor() {
    this.getCurrentRaffleUseCase = useCases.raffles.getCurrent();
    this.voteForRewardUseCase = useCases.raffles.vote();
    this.spinRaffleUseCase = useCases.raffles.spin();
    this.getVotesByMonthUseCase = useCases.raffles.getVotesByMonth();
    this.createMonthlyRaffleUseCase = useCases.raffles.createMonthly();
    this.addManualParticipantUseCase = useCases.raffles.addParticipant();
    this.removeManualParticipantUseCase = useCases.raffles.removeParticipant();
    this.raffleRepository = repos.raffle();
  }

  async getCurrent(req, res) {
    try {
      const userId = req.user?.id || null;
      const result = await this.getCurrentRaffleUseCase.execute(userId);
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
      const vote = await this.voteForRewardUseCase.execute(req.user, raffleId, rewardId);
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

      const raffle = await this.spinRaffleUseCase.execute(user, raffleId);
      notifyRaffleWinner(raffle);
      res.json({ success: true, data: raffle });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async getVotes(req, res) {
    try {
      const userId = req.user?.id || null;
      const result = await this.getVotesByMonthUseCase.execute(userId);
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
      const raffle = await this.createMonthlyRaffleUseCase.execute({ month, status, raffleDate });
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
      const raffle = await this.addManualParticipantUseCase.execute(req.user, raffleId, { name, userId });
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
      const raffle = await this.removeManualParticipantUseCase.execute(req.user, raffleId, participantId);
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
      const participants = await this.raffleRepository.getManualParticipants(raffleId);
      const { statusCode, body } = ApiResponse.success(participants);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async getHistory(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await getRaffleHistoryUseCase.execute({
        page,
        limit
      });

      const { statusCode, body } = ApiResponse.success(result);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
