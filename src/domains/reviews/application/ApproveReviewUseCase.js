import { NotFoundError } from '../../../shared/domain/DomainError.js';

export class ApproveReviewUseCase {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute({ reviewId, action }) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Reseña no encontrada');

    const status = action === 'approve' ? 'approved' : 'rejected';
    return this.reviewRepository.updateStatus(reviewId, status);
  }
}
