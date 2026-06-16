import { MongoReviewRepository } from './MongoReviewRepository.js';
import { MongoAppointmentRepository } from '../../appointments/infrastructure/MongoAppointmentRepository.js';
import { CreateReviewUseCase } from '../application/CreateReviewUseCase.js';
import { GetApprovedReviewsUseCase } from '../application/GetApprovedReviewsUseCase.js';
import { GetPendingReviewsUseCase } from '../application/GetPendingReviewsUseCase.js';
import { ApproveReviewUseCase } from '../application/ApproveReviewUseCase.js';
import { DeleteReviewUseCase } from '../application/DeleteReviewUseCase.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';

const reviewRepository = new MongoReviewRepository();
const appointmentRepository = new MongoAppointmentRepository();

const createReviewUseCase = new CreateReviewUseCase(reviewRepository, appointmentRepository);
const getApprovedReviewsUseCase = new GetApprovedReviewsUseCase(reviewRepository);
const getPendingReviewsUseCase = new GetPendingReviewsUseCase(reviewRepository);
const approveReviewUseCase = new ApproveReviewUseCase(reviewRepository);
const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository);

export class ReviewController {
  async getApproved(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const skip = parseInt(req.query.skip) || 0;
      const result = await getApprovedReviewsUseCase.execute({ limit, skip });
      const { statusCode, body } = ApiResponse.success(result);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async getPending(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await getPendingReviewsUseCase.execute({ page, limit });
      const { statusCode, body } = ApiResponse.success(result);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async create(req, res) {
    try {
      const userId = req.user.id;
      const { appointmentId, rating, comment } = req.body;
      const authorName = req.user.name || 'Cliente';
      const authorAvatar = req.user.avatar || null;

      const review = await createReviewUseCase.execute({
        userId,
        appointmentId,
        rating,
        comment,
        authorName,
        authorAvatar
      });

      const { statusCode, body } = ApiResponse.created(review);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async approve(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body;
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'action debe ser approve o reject'
        });
      }
      const review = await approveReviewUseCase.execute({ reviewId: id, action });
      const { statusCode, body } = ApiResponse.success(review);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await deleteReviewUseCase.execute(id);
      const { statusCode, body } = ApiResponse.success({
        message: 'Reseña eliminada'
      });
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
