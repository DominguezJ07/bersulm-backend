import { GetCurrentRaffleUseCase } from '../application/GetCurrentRaffleUseCase.js';
import { VoteForRewardUseCase } from '../application/VoteForRewardUseCase.js';
import { SpinRaffleUseCase } from '../application/SpinRaffleUseCase.js';
import { GetVotesUseCase } from '../application/GetVotesUseCase.js';
import { MongoRaffleRepository } from './MongoRaffleRepository.js';

const raffleRepository = new MongoRaffleRepository();
const getCurrentRaffleUseCase = new GetCurrentRaffleUseCase(raffleRepository);
const voteForRewardUseCase = new VoteForRewardUseCase(raffleRepository);
const spinRaffleUseCase = new SpinRaffleUseCase(raffleRepository);
const getVotesUseCase = new GetVotesUseCase(raffleRepository);

export class RaffleController {
  async getCurrent(req, res) {
    try {
      const result = await getCurrentRaffleUseCase.execute();
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async vote(req, res) {
    try {
      const user = req.user;
      const { raffleId, rewardId } = req.body;

      if (!raffleId || !rewardId) {
        return res.status(400).json({ success: false, message: 'raffleId and rewardId are required' });
      }

      const vote = await voteForRewardUseCase.execute(user, raffleId, rewardId);
      res.status(201).json({ success: true, data: vote });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
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
      const { raffleId } = req.query;
      if (!raffleId) {
        return res.status(400).json({ success: false, message: 'raffleId is required' });
      }

      const votes = await getVotesUseCase.execute(raffleId);
      res.json({ success: true, data: votes });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}
