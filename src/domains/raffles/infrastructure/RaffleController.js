import { useCases, repos } from '../../../shared/infrastructure/container.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';
import { notifyRaffleWinner } from '../../../shared/infrastructure/socket/SocketManager.js';
import { GetRaffleHistoryUseCase } from '../application/GetRaffleHistoryUseCase.js';

const raffleRepository = repos.raffle();
const getRaffleHistoryUseCase = new GetRaffleHistoryUseCase(raffleRepository);

export class RaffleController {
  constructor() {
    this.getCurrentRaffleUseCase = useCases.raffles.getCurrent();
    this.createRafflePrizeUseCase = useCases.raffles.createPrize();
    this.getAllRafflesUseCase = useCases.raffles.getAll();
    this.updateRafflePrizeUseCase = useCases.raffles.updatePrize();
    this.deleteRaffleUseCase = useCases.raffles.delete();
    this.spinRaffleUseCase = useCases.raffles.spin();
    this.addManualParticipantUseCase = useCases.raffles.addParticipant();
    this.removeManualParticipantUseCase = useCases.raffles.removeParticipant();
    this.updateRaffleDeadlineUseCase = useCases.raffles.updateDeadline();
    this.raffleRepository = repos.raffle();
  }

  async getCurrent(req, res) {
    try {
      const result = await this.getCurrentRaffleUseCase.execute();
      const { statusCode, body } = ApiResponse.success(result);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async createPrize(req, res) {
    try {
      const user = req.user;
      const { name, description, raffleDate } = req.body;
      const files = req.files || [];

      if (!files.length) {
        return res.status(400).json({ success: false, message: 'Debes subir entre 1 y 3 imágenes' });
      }

      const images = files.map((file) => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      });

      const raffle = await this.createRafflePrizeUseCase.execute(user, { name, description, images, raffleDate });
      const { statusCode, body } = ApiResponse.created(raffle);
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
      const participants = await this.raffleRepository.getParticipantPool(raffleId);
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

      const result = await getRaffleHistoryUseCase.execute({ page, limit });

      const { statusCode, body } = ApiResponse.success(result);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async updateDeadline(req, res) {
    try {
      const { raffleId } = req.params;
      const { durationMinutes } = req.body;
      const raffle = await this.updateRaffleDeadlineUseCase.execute(req.user, raffleId, durationMinutes);
      const { statusCode, body } = ApiResponse.success(raffle);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await this.getAllRafflesUseCase.execute(req.user, { page, limit });
      const { statusCode, body } = ApiResponse.success(result);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async updatePrize(req, res) {
    try {
      const { raffleId } = req.params;
      const { name, description, raffleDate } = req.body;
      const files = req.files || [];

      let images;
      if (files.length > 0) {
        images = files.map((file) => {
          const base64 = file.buffer.toString('base64');
          return `data:${file.mimetype};base64,${base64}`;
        });
      }

      const raffle = await this.updateRafflePrizeUseCase.execute(req.user, raffleId, {
        name,
        description,
        images,
        raffleDate
      });
      const { statusCode, body } = ApiResponse.success(raffle);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async delete(req, res) {
    try {
      const { raffleId } = req.params;
      await this.deleteRaffleUseCase.execute(req.user, raffleId);
      res.status(204).send();
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
