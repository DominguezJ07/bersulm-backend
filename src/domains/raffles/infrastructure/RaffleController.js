import { GetCurrentRaffleUseCase } from '../application/GetCurrentRaffleUseCase.js';
import { VoteForRewardUseCase } from '../application/VoteForRewardUseCase.js';
import { SpinRaffleUseCase } from '../application/SpinRaffleUseCase.js';
import { GetVotesUseCase } from '../application/GetVotesUseCase.js';
import { MongoRaffleRepository } from './MongoRaffleRepository.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';
import { notifyRaffleWinner, notifyRaffleUpdate } from '../../../shared/infrastructure/socket/SocketManager.js';

const raffleRepository = new MongoRaffleRepository();
const getCurrentRaffleUseCase = new GetCurrentRaffleUseCase(raffleRepository);
const voteForRewardUseCase = new VoteForRewardUseCase(raffleRepository);
const spinRaffleUseCase = new SpinRaffleUseCase(raffleRepository);
const getVotesUseCase = new GetVotesUseCase(raffleRepository);

export class RaffleController {
  async getCurrent(req, res) {
    try {
      const result = await getCurrentRaffleUseCase.execute();
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
      const user = req.user;

      const vote = await voteForRewardUseCase.execute(user, raffleId, rewardId);
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

      const { statusCode, body } = ApiResponse.success(raffle);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async getVotes(req, res) {
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const raffle = await raffleRepository.findByMonth(month);

      if (!raffle) {
        const { statusCode, body } = ApiResponse.success([]);
        return res.status(statusCode).json(body);
      }

      const votes = await getVotesUseCase.execute(raffle._id);
      const { statusCode, body } = ApiResponse.success(votes);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message);
      res.status(statusCode).json(body);
    }
  }

  async createMonthly(req, res) {
    try {
      const { month, status, raffleDate } = req.body;
      if (!month || !raffleDate) {
        return res.status(400).json({ success: false, message: 'month and raffleDate are required' });
      }

      const raffle = await raffleRepository.save({
        month,
        status: status || 'voting',
        raffleDate: new Date(raffleDate),
        participants: []
      });

      notifyRaffleUpdate(raffle);

      const { statusCode, body } = ApiResponse.created(raffle);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message);
      res.status(statusCode).json(body);
    }
  }
}
