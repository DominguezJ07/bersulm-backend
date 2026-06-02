import { GetCurrentRaffleUseCase } from '../application/GetCurrentRaffleUseCase.js';
import { VoteForRewardUseCase } from '../application/VoteForRewardUseCase.js';
import { SpinRaffleUseCase } from '../application/SpinRaffleUseCase.js';
import { GetVotesUseCase } from '../application/GetVotesUseCase.js';
import { MongoRaffleRepository } from './MongoRaffleRepository.js';
import { RaffleModel } from './RaffleModel.js';
import { RewardVoteModel } from './RewardVoteModel.js';

const raffleRepository = new MongoRaffleRepository();
const getCurrentRaffleUseCase = new GetCurrentRaffleUseCase(raffleRepository);
const voteForRewardUseCase = new VoteForRewardUseCase(raffleRepository);
const spinRaffleUseCase = new SpinRaffleUseCase(raffleRepository);
const getVotesUseCase = new GetVotesUseCase(raffleRepository);

export class RaffleController {
  async getCurrent(req, res) {
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const raffle = await RaffleModel.findOne({ month });

      if (!raffle) {
        return res.status(404).json({ success: false, message: 'No hay sorteo este mes' });
      }

      res.json({ success: true, data: raffle });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async vote(req, res) {
    try {
      const { rewardId, raffleId } = req.body;
      const userId = req.user.id;

      console.log('Votando - userId:', userId);
      console.log('Votando - raffleId:', raffleId);
      console.log('Votando - rewardId:', rewardId);

      const existingVote = await RewardVoteModel.findOne({
        userId,
        raffleId
      });

      console.log('Voto existente encontrado:', existingVote);

      if (existingVote) {
        return res.status(400).json({
          success: false,
          message: 'Ya votaste este mes'
        });
      }

      const vote = await RewardVoteModel.create({
        userId,
        rewardId,
        raffleId
      });

      res.status(201).json({ success: true, data: vote });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
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
        return res.json({ success: true, data: [] });
      }

      // Retornar TODOS los votos del sorteo, no filtrar por usuario
      const votes = await RewardVoteModel.find({ raffleId: raffle._id });

      console.log('Total votos encontrados:', votes.length);

      res.json({ success: true, data: votes });
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
        createdAt: new Date()
      });

      res.status(201).json({ success: true, data: raffle });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
